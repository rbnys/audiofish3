import React from 'react';
import ReactPlayer from 'react-player';

const BAR_COUNT = 96;
const BAR_GAP = 2;
const MIN_FREQUENCY = 30;
const MAX_FREQUENCY = 16000;

class AudioVisualizer extends React.Component {
    playerRef = React.createRef();
    canvasRef = React.createRef();

    state = {
        useCrossOrigin: true,
    };

    audioContext = null;
    analyser = null;
    sourceNode = null;
    sourceElement = null;
    frequencyData = null;
    smoothed = null;
    rafId = null;
    isDisposed = false;

    dpr = 1;
    cssWidth = 0;
    cssHeight = 0;
    barGradient = null;
    bgGradient = null;

    componentDidMount() {
        this.resizeCanvas();
        this.startAnimation();
        this.setupAudioGraph();

        window.addEventListener('resize', this.handleResize);
        window.addEventListener('pointerdown', this.handleUserGesture);
        window.addEventListener('keydown', this.handleUserGesture);
        window.addEventListener('touchstart', this.handleUserGesture);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.useCrossOrigin !== this.state.useCrossOrigin) {
            this.teardownAudioGraph();
            this.setupAudioGraph();
        }
    }

    componentWillUnmount() {
        this.isDisposed = true;
        this.stopAnimation();
        this.teardownAudioGraph();

        window.removeEventListener('resize', this.handleResize);
        window.removeEventListener('pointerdown', this.handleUserGesture);
        window.removeEventListener('keydown', this.handleUserGesture);
        window.removeEventListener('touchstart', this.handleUserGesture);
    }

    getMediaElement = () => {
        if (!this.playerRef.current) {
            return null;
        }

        const mediaElement = this.playerRef.current.getInternalPlayer();
        return mediaElement && mediaElement.nodeType === 1 ? mediaElement : null;
    };

    handleResize = () => {
        this.resizeCanvas();
    };

    handleUserGesture = () => {
        if (!this.audioContext) {
            if (window.AudioContext || window.webkitAudioContext) {
                this.setupAudioGraph();
            }
            return;
        }

        this.resumeContext();
    };

    handleContextStateChange = () => {
        if (this.isDisposed || !this.audioContext || this.audioContext.state !== 'running') {
            return;
        }

        const mediaElement = this.getMediaElement();
        if (mediaElement) {
            this.connectSource(mediaElement);
        }
    };

    resizeCanvas = () => {
        const canvas = this.canvasRef.current;
        if (!canvas) {
            return;
        }

        const dpr = window.devicePixelRatio || 1;
        const width = canvas.clientWidth || 560;
        const height = canvas.clientHeight || 315;

        this.dpr = dpr;
        this.cssWidth = width;
        this.cssHeight = height;

        canvas.width = Math.round(width * dpr);
        canvas.height = Math.round(height * dpr);

        const ctx = canvas.getContext('2d');
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

        const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
        bgGradient.addColorStop(0, '#1e1a2c');
        bgGradient.addColorStop(1, '#111318');
        this.bgGradient = bgGradient;

        const barGradient = ctx.createLinearGradient(0, 0, width, 0);
        barGradient.addColorStop(0, '#925aff');
        barGradient.addColorStop(0.5, '#af86ff');
        barGradient.addColorStop(1, '#4f3877');
        this.barGradient = barGradient;
    };

    setupAudioGraph = () => {
        if (this.isDisposed || !this.state.useCrossOrigin) {
            return;
        }

        const mediaElement = this.getMediaElement();
        if (!mediaElement) {
            return;
        }

        const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextCtor) {
            console.warn('AudioVisualizer: Web Audio API is not supported in this browser.');
            return;
        }

        if (!this.audioContext) {
            this.audioContext = new AudioContextCtor();
            this.audioContext.addEventListener('statechange', this.handleContextStateChange);
        }

        if (!this.analyser) {
            const analyser = this.audioContext.createAnalyser();
            analyser.fftSize = 2048;
            analyser.smoothingTimeConstant = 0.8;
            analyser.connect(this.audioContext.destination);
            this.analyser = analyser;
            this.frequencyData = new Uint8Array(analyser.frequencyBinCount);
            this.smoothed = new Float32Array(BAR_COUNT);
        }

        this.resumeContext();
        this.connectSource(mediaElement);
    };

    teardownAudioGraph = () => {
        if (this.sourceNode) {
            try {
                this.sourceNode.disconnect();
            } catch (err) {
                // Ignore
            }
            this.sourceNode = null;
        }

        this.sourceElement = null;

        if (this.analyser) {
            try {
                this.analyser.disconnect();
            } catch (err) {
                // Ignore
            }
            this.analyser = null;
        }

        this.frequencyData = null;
        this.smoothed = null;

        if (this.audioContext) {
            this.audioContext.removeEventListener('statechange', this.handleContextStateChange);
            const audioContext = this.audioContext;
            this.audioContext = null;

            if (typeof audioContext.close === 'function') {
                try {
                    audioContext.close();
                } catch (err) {
                    // Ignore
                }
            }
        }
    };

    resumeContext = () => {
        if (
            this.audioContext &&
            this.audioContext.state === 'suspended' &&
            typeof this.audioContext.resume === 'function'
        ) {
            const result = this.audioContext.resume();
            if (result && typeof result.catch === 'function') {
                result.catch(() => {});
            }
        }
    };

    connectSource = (mediaElement) => {
        if (
            this.isDisposed ||
            !this.state.useCrossOrigin ||
            !this.audioContext ||
            !this.analyser ||
            this.audioContext.state !== 'running'
        ) {
            return;
        }

        if (this.sourceElement === mediaElement) {
            return;
        }

        if (this.sourceNode) {
            try {
                this.sourceNode.disconnect();
            } catch (err) {
                // Ignore
            }
            this.sourceNode = null;
        }

        this.sourceElement = null;

        try {
            const source = this.audioContext.createMediaElementSource(mediaElement);
            source.connect(this.analyser);
            this.sourceNode = source;
            this.sourceElement = mediaElement;
        } catch (err) {
            console.warn('AudioVisualizer: could not attach analyser to the audio element.', err);
        }
    };

    startAnimation = () => {
        if (this.rafId != null || this.isDisposed) {
            return;
        }

        this.rafId = requestAnimationFrame(this.drawFrame);
    };

    stopAnimation = () => {
        if (this.rafId != null) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    };

    drawFrame = () => {
        this.rafId = null;

        if (this.isDisposed) {
            return;
        }

        const canvas = this.canvasRef.current;
        if (!canvas) {
            return;
        }

        const ctx = canvas.getContext('2d');
        const width = this.cssWidth;
        const height = this.cssHeight;

        if (!width || !height) {
            this.rafId = requestAnimationFrame(this.drawFrame);
            return;
        }

        ctx.clearRect(0, 0, width, height);

        if (!this.bgGradient) {
            const bgGradient = ctx.createLinearGradient(0, 0, 0, height);
            bgGradient.addColorStop(0, '#1e1a2c');
            bgGradient.addColorStop(1, '#111318');
            this.bgGradient = bgGradient;
        }

        ctx.fillStyle = this.bgGradient;
        ctx.fillRect(0, 0, width, height);

        this.drawSpectrum(ctx, width, height);

        this.rafId = requestAnimationFrame(this.drawFrame);
    };

    drawSpectrum = (ctx, width, height) => {
        let data = this.frequencyData;
        const analyser = this.analyser;

        if (analyser && data) {
            try {
                analyser.getByteFrequencyData(data);
            } catch (err) {
                data = null;
            }
        } else {
            data = null;
        }

        let hasSignal = false;
        if (data) {
            for (let i = 0; i < data.length; i += 1) {
                if (data[i] > 0) {
                    hasSignal = true;
                    break;
                }
            }
        }

        if (!this.smoothed || this.smoothed.length !== BAR_COUNT) {
            this.smoothed = new Float32Array(BAR_COUNT);
        }

        const nyquist = (this.audioContext ? this.audioContext.sampleRate : 44100) / 2;
        const binCount = data ? data.length : 1024;
        const minBin = Math.max(0, Math.floor((MIN_FREQUENCY / nyquist) * binCount));
        const maxBin = Math.min(binCount - 1, Math.floor((MAX_FREQUENCY / nyquist) * binCount));
        const now = performance.now() / 1000;

        const slot = width / BAR_COUNT;
        const barWidth = Math.max(slot - BAR_GAP, 1);
        const centerY = height / 2;

        ctx.fillStyle = this.barGradient || '#925aff';

        for (let i = 0; i < BAR_COUNT; i += 1) {
            let target = 0;

            if (hasSignal && data) {
                const position = i / (BAR_COUNT - 1);
                const bin = minBin + Math.floor(Math.pow(position, 2) * (maxBin - minBin));
                target = data[bin] / 255;
            } else {
                const wave = 0.5 + 0.5 * Math.sin(now * 2 + i * 0.35);
                target = 0.04 + 0.12 * wave * (0.3 + 0.7 * (0.5 + 0.5 * Math.sin(now * 1.3 + i * 0.15)));
            }

            const current = this.smoothed[i];

            if (target >= current) {
                this.smoothed[i] = target;
            } else {
                this.smoothed[i] = current + (target - current) * 0.25;
            }

            const value = this.smoothed[i];
            const barHeight = Math.max(value * (height / 2) * 0.94, 0);
            const x = i * slot + BAR_GAP / 2;

            ctx.fillRect(x, centerY - barHeight, barWidth, barHeight);
            ctx.fillRect(x, centerY, barWidth, barHeight);
        }
    };

    handleStart = () => {
        this.setupAudioGraph();

        if (this.playerRef.current && this.props.startSecs > 0) {
            this.playerRef.current.seekTo(this.props.startSecs, 'seconds');
        }

        if (this.props.onStart) {
            this.props.onStart();
        }
    };

    handleError = (error) => {
        if (this.state.useCrossOrigin) {
            // The MP3 may be hosted somewhere that doesn't send CORS headers. Retry
            // without crossOrigin so playback still works; the canvas falls back to
            // an idle animation instead of live frequency bars.
            this.setState({ useCrossOrigin: false });
        } else {
            console.error('AudioVisualizer: could not load audio.', error);
        }
    };

    render() {
        const { url, volume, onEnded, onProgress } = this.props;

        return (
            <div className="audio-visualizer-player">
                <ReactPlayer
                    key={this.state.useCrossOrigin ? 'cors' : 'no-cors'}
                    ref={this.playerRef}
                    url={url}
                    playing
                    volume={volume}
                    width="100%"
                    height="100%"
                    config={{
                        file: {
                            forceAudio: true,
                            attributes: this.state.useCrossOrigin ? { crossOrigin: 'anonymous' } : {},
                        },
                    }}
                    onStart={this.handleStart}
                    onEnded={onEnded}
                    onError={this.handleError}
                    onProgress={onProgress}
                    progressInterval={33}
                />
                <canvas ref={this.canvasRef} className="audio-visualizer" aria-hidden="true" />
            </div>
        );
    }
}

export default AudioVisualizer;
