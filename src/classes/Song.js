import { readableTime } from './Util';

export const Song = {
    isSame: (song1, song2) => {
        return song1.yt_id === song2.yt_id;
    },

    readableLength: ({ length }) => {
        return readableTime(length);
    },

    readableLengthLeft: ({ length }, progressSecs) => {
        length = Math.max(length - Math.floor(progressSecs), 0);

        const secs = length % 60;
        const mins = Math.floor(length / 60);

        return `${mins}:${secs < 10 ? `0${secs}` : secs}`;
    },
};

export default Song;
