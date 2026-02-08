export function parseYoutubeVideoIdFromURL(url) {
    var regEx = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    var match = url.match(regEx);
    return match && match[7].length == 11 ? match[7] : false;
}

export function parseYoutubePlaylistIdFromURL(url) {
    var regEx = /[&?]list=([^#&?]+)/;
    var match = url.match(regEx);
    return match ? match[1] : false;
}

export function readableTime(time) {
    try {
        const secs = time % 60;
        const mins = Math.floor(time / 60);

        return `${mins}:${secs < 10 ? `0${secs}` : secs}`;
    } catch {
        return '';
    }
}
