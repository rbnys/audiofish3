const axios = require('axios');
const net = require('net');
const dns = require('dns').promises;
const { URL } = require('url');
const mm = require('music-metadata');

const BROWSER_UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36';
const HEAD_BYTES = 128 * 1024;
const MAX_AUDIO_BYTES = 200 * 1024 * 1024;

function isPrivateIp(ip) {
    if (net.isIP(ip) === 6) {
        const lower = ip.toLowerCase();

        if (lower === '::' || lower === '::1' || lower.startsWith('fc') || lower.startsWith('fd') || lower.startsWith('fe80')) {
            return true;
        }

        const mapped = lower.match(/^::ffff:(\d+\.\d+\.\d+\.\d+)$/);
        return mapped ? isPrivateIp(mapped[1]) : false;
    }

    if (net.isIP(ip) !== 4) {
        return false;
    }

    const parts = ip.split('.').map(Number);

    if (parts[0] === 0 || parts[0] === 10 || parts[0] === 127) return true;
    if (parts[0] === 169 && parts[1] === 254) return true;
    if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
    if (parts[0] === 192 && parts[1] === 168) return true;
    if (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127) return true;

    return false;
}

async function validateAudioUrl(rawUrl) {
    let parsed;

    try {
        parsed = new URL(String(rawUrl).trim());
    } catch (err) {
        return { valid: false, errorMsg: 'The URL is not valid.' };
    }

    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
        return { valid: false, errorMsg: 'Only http:// and https:// URLs are supported.' };
    }

    const host = parsed.hostname;

    if (!host) {
        return { valid: false, errorMsg: 'The URL is not valid.' };
    }

    if (net.isIP(host)) {
        if (isPrivateIp(host)) {
            return { valid: false, errorMsg: 'This URL points to a private or local network address.' };
        }
    } else {
        try {
            const addresses = await dns.lookup(host, { all: true });

            if (!addresses.length) {
                return { valid: false, errorMsg: 'Could not resolve this URL.' };
            }

            if (addresses.some((entry) => isPrivateIp(entry.address))) {
                return { valid: false, errorMsg: 'This URL points to a private or local network address.' };
            }
        } catch (err) {
            return { valid: false, errorMsg: 'Could not resolve this URL.' };
        }
    }

    return { valid: true, parsed };
}

function sniffAudioFormat(buffer) {
    if (!buffer || buffer.length < 12) {
        return false;
    }

    const matches = (offset, signature) => {
        if (offset + signature.length > buffer.length) {
            return false;
        }

        for (let i = 0; i < signature.length; i += 1) {
            if (buffer[offset + i] !== signature[i]) {
                return false;
            }
        }

        return true;
    };

    // MP3 (ID3v2 header or MPEG/ADTS frame sync)
    if (matches(0, [0x49, 0x44, 0x33])) return true;
    if (buffer[0] === 0xff && (buffer[1] & 0xe0) === 0xe0) return true;

    // WAV
    if (matches(0, [0x52, 0x49, 0x46, 0x46]) && matches(8, [0x57, 0x41, 0x56, 0x45])) return true;

    // FLAC
    if (matches(0, [0x66, 0x4c, 0x61, 0x43])) return true;

    // Ogg
    if (matches(0, [0x4f, 0x67, 0x67, 0x53])) return true;

    // MP4 / M4A
    if (matches(4, [0x66, 0x74, 0x79, 0x70])) return true;

    return false;
}

function evaluateHeaders(status, contentType, contentDisposition) {
    if (status !== 200 && status !== 206) {
        return 'This URL did not return a playable file.';
    }

    const type = String(contentType || '').split(';')[0].trim().toLowerCase();

    if (type === 'text/html') {
        return 'This URL leads to a webpage, not a raw audio file.';
    }

    if (String(contentDisposition || '').toLowerCase().includes('attachment')) {
        return 'This URL downloads the file instead of streaming it.';
    }

    return null;
}

function readFirstChunk(stream, maxBytes) {
    return new Promise((resolve, reject) => {
        const chunks = [];
        let total = 0;
        let settled = false;

        const finish = (err, buffer) => {
            if (settled) return;
            settled = true;

            if (err) {
                reject(err);
            } else {
                resolve(buffer);
            }
        };

        stream.on('data', (chunk) => {
            chunks.push(chunk);
            total += chunk.length;

            if (total >= maxBytes) {
                stream.destroy();
                finish(null, Buffer.concat(chunks).slice(0, maxBytes));
            }
        });

        stream.on('end', () => finish(null, Buffer.concat(chunks)));
        stream.on('error', (err) => finish(err));
    });
}

async function fetchHead(url) {
    const response = await axios.get(url, {
        responseType: 'stream',
        headers: {
            Range: `bytes=0-${HEAD_BYTES - 1}`,
            'User-Agent': BROWSER_UA,
        },
        timeout: 15000,
        maxRedirects: 5,
        validateStatus: (status) => status >= 200 && status < 400,
    });

    const chunk = await readFirstChunk(response.data, HEAD_BYTES);

    return {
        status: response.status,
        contentType: response.headers['content-type'] || '',
        contentDisposition: response.headers['content-disposition'] || '',
        chunk,
    };
}

async function verifyAudioFileUrl(rawUrl) {
    const urlCheck = await validateAudioUrl(rawUrl);

    if (!urlCheck.valid) {
        return { success: false, errorMsg: urlCheck.errorMsg };
    }

    let head;

    try {
        head = await fetchHead(urlCheck.parsed.href);
    } catch (err) {
        return { success: false, errorMsg: 'Could not reach this URL. Make sure it is publicly accessible.' };
    }

    const headerError = evaluateHeaders(head.status, head.contentType, head.contentDisposition);

    if (headerError) {
        return { success: false, errorMsg: headerError };
    }

    const type = head.contentType.split(';')[0].trim().toLowerCase();
    const isAudioContentType = type.startsWith('audio/') || type === 'application/ogg';

    if (isAudioContentType || sniffAudioFormat(head.chunk)) {
        return { success: true, errorMsg: null };
    }

    return { success: false, errorMsg: 'This URL does not appear to contain a supported audio file.' };
}

async function fetchAudioFileMetadata(rawUrl) {
    const urlCheck = await validateAudioUrl(rawUrl);

    if (!urlCheck.valid) {
        return { success: false, errorMsg: urlCheck.errorMsg };
    }

    let response;

    try {
        response = await axios.get(urlCheck.parsed.href, {
            responseType: 'arraybuffer',
            headers: { 'User-Agent': BROWSER_UA },
            timeout: 60000,
            maxRedirects: 5,
            maxContentLength: MAX_AUDIO_BYTES,
            validateStatus: (status) => status >= 200 && status < 300,
        });
    } catch (err) {
        return { success: false, errorMsg: 'Could not download this audio file.' };
    }

    const headerError = evaluateHeaders(
        response.status,
        response.headers['content-type'] || '',
        response.headers['content-disposition'] || ''
    );

    if (headerError) {
        return { success: false, errorMsg: headerError };
    }

    const buffer = Buffer.from(response.data);

    if (!buffer.length) {
        return { success: false, errorMsg: 'This audio file is empty.' };
    }

    try {
        const metadata = await mm.parseBuffer(
            buffer,
            {
                mimeType: response.headers['content-type'] || undefined,
                size: buffer.length,
            },
            { duration: true, skipCovers: true }
        );

        const duration = metadata && metadata.format && metadata.format.duration;

        if (!duration || !Number.isFinite(duration) || duration <= 0) {
            return { success: false, errorMsg: 'Could not determine the length of this audio file.' };
        }

        return { success: true, errorMsg: null, duration: Math.round(duration) };
    } catch (err) {
        return { success: false, errorMsg: 'This URL does not appear to contain a supported audio file.' };
    }
}

module.exports = {
    verifyAudioFileUrl,
    fetchAudioFileMetadata,
};
