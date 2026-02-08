const { youtube, YOUTUBE_KEY } = require('../apis/youtube');
const { parse, toSeconds } = require('iso8601-duration');
const { decode } = require('html-entities');

exports.searchVideos = async (req, res) => {
    youtube
        .get('/search', {
            params: {
                key: YOUTUBE_KEY,
                part: 'snippet',
                type: 'video',
                videoEmbeddable: true,
                maxResults: 40,
                q: req.body.query,
            },
        })
        .then((ytRes) => {
            ytRes.data.items.forEach((video) => {
                video.snippet.title = decode(video.snippet.title);
            });

            const videoIds = ytRes.data.items
                .filter((video) => video.snippet.liveBroadcastContent !== 'live')
                .map((video) => video.id.videoId)
                .join(',');

            youtube
                .get('/videos', {
                    params: {
                        key: YOUTUBE_KEY,
                        id: videoIds,
                        part: 'snippet,contentDetails',
                    },
                })
                .then((ytRes) => {
                    ytRes.data.items.forEach((video) => {
                        video.duration = toSeconds(parse(video.contentDetails.duration));
                    });

                    res.json({ videos: ytRes.data.items });
                })
                .catch((err) => {
                    console.error(err);
                    res.end();
                });
        })
        .catch((err) => {
            console.error(err);
            res.end();
        });
};

exports.searchPlaylists = async (req, res) => {
    youtube
        .get('/search', {
            params: {
                key: YOUTUBE_KEY,
                part: 'snippet',
                type: 'playlist',
                maxResults: 40,
                q: req.body.query,
            },
        })
        .then((ytRes) => {
            ytRes.data.items.forEach((playlist) => {
                playlist.snippet.title = decode(playlist.snippet.title);
            });

            const playlistIds = ytRes.data.items.map((playlist) => playlist.id.playlistId).join(',');

            youtube
                .get('/playlists', {
                    params: {
                        key: YOUTUBE_KEY,
                        id: playlistIds,
                        part: 'snippet,contentDetails',
                    },
                })
                .then((ytRes) => {
                    res.json({ playlists: ytRes.data.items });
                })
                .catch((err) => {
                    console.error(err);
                    res.end();
                });
        })
        .catch((err) => {
            console.error(err);
            res.end();
        });
};

exports.getVideoFromId = async (req, res) => {
    youtube
        .get('/videos', {
            params: {
                key: YOUTUBE_KEY,
                id: req.body.videoId,
                part: 'snippet,contentDetails',
            },
        })
        .then((ytRes) => {
            const video = ytRes.data.items[0];

            if (!video) {
                res.end();
                return;
            }

            video.duration = toSeconds(parse(video.contentDetails.duration));
            res.json({ video });
        })
        .catch((err) => {
            console.error(err);
            res.end();
        });
};

exports.getPlaylistFromId = async (req, res) => {
    youtube
        .get('/playlists', {
            params: {
                key: YOUTUBE_KEY,
                id: req.body.playlistId,
                part: 'snippet,contentDetails',
            },
        })
        .then((ytRes) => {
            const playlist = ytRes.data.items[0];

            if (!playlist) {
                res.end();
                return;
            }

            res.json({ playlist });
        })
        .catch((err) => {
            console.error(err);
            res.end();
        });
};
