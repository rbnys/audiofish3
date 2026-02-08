const axios = require('axios');

const YOUTUBE_KEY = process.env.YOUTUBE_KEY;

const youtube = axios.create({
    baseURL: 'https://www.googleapis.com/youtube/v3',
});

module.exports = {
    YOUTUBE_KEY,
    youtube,
};
