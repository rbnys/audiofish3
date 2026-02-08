const knex = require('../db');
const { youtube, YOUTUBE_KEY } = require('../apis/youtube');
const { parse, toSeconds } = require('iso8601-duration');

exports.getPlaylistsFromUser = async (req, res) => {
    knex('user_playlists')
        .where('user_id', req.user.user_id)
        .andWhere('deletion_time', null)
        .orderBy('name', 'asc')
        .then((data) => {
            res.json(data);
        })
        .catch((err) => {
            console.error(err);
        });
};

exports.getSongsFromUser = async (req, res) => {
    knex.select('songs.*')
        .from('playlist_songs AS songs')
        .innerJoin('user_playlists AS playlists', 'playlists.playlist_id', 'songs.playlist_id')
        .innerJoin('users', 'users.user_id', 'playlists.user_id')
        .where('users.user_id', req.user.user_id)
        .andWhere('deletion_time', null)
        .then((data) => {
            res.json(data);
        })
        .catch((err) => {
            console.error(err);
        });
};

exports.createPlaylist = async (req, res) => {
    knex('user_playlists')
        .insert({
            user_id: req.user.user_id,
            name: req.body.name,
        })
        .then((insertedPlaylist) => {
            knex('user_playlists')
                .where('playlist_id', insertedPlaylist[0])
                .then((playlist) => {
                    res.json(playlist[0]);
                })
                .catch((err) => {
                    console.error(err);
                });
        })
        .catch((err) => {
            console.error(err);
        });
};

exports.editPlaylist = async (req, res) => {
    knex('user_playlists')
        .where('playlist_id', req.body.playlist_id)
        .update({ name: req.body.name })
        .then(() => {
            knex('user_playlists')
                .where('playlist_id', req.body.playlist_id)
                .then((playlist) => {
                    res.json(playlist[0]);
                })
                .catch((err) => {
                    console.error(err);
                });
        })
        .catch((err) => {
            console.error(err);
        });
};

exports.deletePlaylist = async (req) => {
    knex('user_playlists')
        .where('playlist_id', req.body.playlist_id)
        .update({ deletion_time: new Date().getTime() })
        .catch((err) => {
            console.error(err);
        });
};

exports.addSongToPlaylist = async (req, res) => {
    knex('playlist_songs')
        .insert({
            playlist_id: req.body.playlist,
            yt_id: req.body.videoId,
            artist: req.body.artist,
            title: req.body.title,
            length: req.body.length,
            pos: req.body.pos,
        })
        .then((insertedSong) => {
            knex('playlist_songs')
                .where('song_id', insertedSong[0])
                .then((song) => {
                    res.json(song[0]);
                })
                .catch((err) => {
                    console.error(err);
                });
        })
        .catch((err) => {
            console.error(err);
        });
};

exports.addSongsFromYoutubePlaylist = async (req, res) => {
    let songsToInsert = [];
    let nextPageToken = null;
    let pos = req.body.startingPos - req.body.ytPlaylistItemCount;

    while (true) {
        // First, get the list of video id's from YT playlist
        const params = {
            key: YOUTUBE_KEY,
            playlistId: req.body.ytPlaylistId,
            part: 'snippet,contentDetails',
            maxResults: 50,
        };
        if (nextPageToken) params.pageToken = nextPageToken;

        const videoIdsResult = await youtube.get('/playlistItems', {
            params,
        });
        const videoIds = videoIdsResult.data.items
            .filter((item) => item.contentDetails.videoId !== undefined)
            .map((item) => item.contentDetails.videoId);

        // Next, get the details for each of these vids
        const videoDetailsResult = await youtube.get('/videos', {
            params: {
                key: YOUTUBE_KEY,
                id: videoIds.join(','),
                part: 'snippet,contentDetails',
            },
        });

        songsToInsert = [
            ...songsToInsert,
            ...videoDetailsResult.data.items.map((item) => {
                let title = item.snippet.title;
                let artist = '';

                title = title.split(' - ');
                if (title.length === 1) title = title[0].split(' -- ');
                if (title.length === 1) title = title[0].split('- ');

                if (title.length === 1) {
                    title = title[0];
                } else {
                    [artist, ...title] = title;
                    title = title.join(' - ');
                }

                if (artist.length === 0) {
                    artist = item.snippet.channelTitle;
                }

                const length = toSeconds(parse(item.contentDetails.duration));

                return {
                    playlist_id: req.body.playlistId,
                    yt_id: item.id,
                    title,
                    artist,
                    length,
                    pos: pos++,
                };
            }),
        ];

        // Repeat for each 50 videos until we're through the entire playlist
        if (videoIdsResult.data.nextPageToken) {
            nextPageToken = videoIdsResult.data.nextPageToken;
        } else {
            break;
        }
    }

    // If none of the videos were valid for some reason, don't run an empty insert query
    if (!songsToInsert.length) {
        res.json({ songs: [] });
        return;
    }

    // Finally, load song details into DB and return result to client
    knex('playlist_songs')
        .insert(songsToInsert)
        .then((insertedSongs) => {
            knex('playlist_songs')
                .where('song_id', '>', insertedSongs[0] - 1)
                .andWhere('playlist_id', req.body.playlistId)
                .then((songs) => {
                    res.json({ songs });
                })
                .catch((err) => {
                    console.error(err);
                });
        })
        .catch((err) => {
            console.error(err);
        });

    // const videoIds = [];
    // let nextPageToken = null;

    // // First, get the list of video id's from YT playlist
    // while (true) {
    //     const params = {
    //         key: YOUTUBE_KEY,
    //         playlistId: req.body.ytPlaylistId,
    //         part: 'snippet,contentDetails',
    //         maxResults: 50,
    //     };
    //     if (nextPageToken) params.pageToken = nextPageToken;

    //     const ytRes = await youtube.get('/playlistItems', {
    //         params,
    //     });
    //     videoIds.push(
    //         ...ytRes.data.items.filter((item) => item.contentDetails.videoId !== undefined).map((item) => item.contentDetails.videoId)
    //     );

    //     if (ytRes.data.nextPageToken) {
    //         nextPageToken = ytRes.data.nextPageToken;
    //     } else {
    //         break;
    //     }
    // }

    // // Next, get the details for each of these vids
    // youtube
    //     .get('/videos', {
    //         params: {
    //             key: YOUTUBE_KEY,
    //             id: videoIds.join(','),
    //             part: 'snippet,contentDetails',
    //         },
    //     })
    //     .then((youtubeResult) => {
    //         let pos = req.body.startingPos - youtubeResult.data.items.length;

    //         const songsToInsert = youtubeResult.data.items.map((item) => {
    //             let title = item.snippet.title;
    //             let artist = '';

    //             title = title.split(' - ');
    //             if (title.length === 1) title = title[0].split(' -- ');
    //             if (title.length === 1) title = title[0].split('- ');

    //             if (title.length === 1) {
    //                 title = title[0];
    //             } else {
    //                 [artist, ...title] = title;
    //                 title = title.join(' - ');
    //             }

    //             if (artist.length === 0) {
    //                 artist = item.snippet.channelTitle;
    //             }

    //             const length = toSeconds(parse(item.contentDetails.duration));

    //             return {
    //                 playlist_id: req.body.playlistId,
    //                 yt_id: item.id,
    //                 title,
    //                 artist,
    //                 length,
    //                 pos: pos++,
    //             };
    //         });

    //         if (!songsToInsert.length) {
    //             res.json({ songs: [] });
    //             return;
    //         }

    //         // Finally, load song details into DB and return result to client
    //         knex('playlist_songs')
    //             .insert(songsToInsert)
    //             .then((insertedSongs) => {
    //                 knex('playlist_songs')
    //                     .where('song_id', '>', insertedSongs[0] - 1)
    //                     .andWhere('playlist_id', req.body.playlistId)
    //                     .then((songs) => {
    //                         res.json({ songs });
    //                     })
    //                     .catch((err) => {
    //                         console.error(err);
    //                     });
    //             })
    //             .catch((err) => {
    //                 console.error(err);
    //             });
    //     })
    //     .catch((err) => console.error(err));
};

exports.editSong = async (req, res) => {
    let newValues = {};

    if (req.body.playlist !== undefined) {
        newValues['playlist_songs.playlist_id'] = req.body.playlist;
    }
    if (req.body.artist !== undefined) {
        newValues.artist = req.body.artist;
    }
    if (req.body.title !== undefined) {
        newValues.title = req.body.title;
    }
    if (req.body.pos !== undefined) {
        newValues.pos = req.body.pos;
    }

    knex('playlist_songs')
        .innerJoin('user_playlists', 'user_playlists.playlist_id', 'playlist_songs.playlist_id')
        .where('song_id', req.body.song_id)
        .andWhere('user_id', req.user.user_id)
        .update(newValues)
        .then(() => {
            knex('playlist_songs')
                .where('song_id', req.body.song_id)
                .then((song) => {
                    res.json(song[0]);
                })
                .catch((err) => {
                    console.error(err);
                });
        })
        .catch((err) => {
            console.error(err);
        });
};

exports.deleteSong = async (req) => {
    knex('playlist_songs')
        .innerJoin('user_playlists', 'user_playlists.playlist_id', 'playlist_songs.playlist_id')
        .where('song_id', req.body.song_id)
        .andWhere('user_id', req.user.user_id)
        .del()
        .catch((err) => {
            console.error(err);
        });
};

// exports.scrapeYoutubeVideoData = async (req, res) => {
// 	axios
// 		.get('https://www.youtube.com/watch?v=vx2u5uUu3DE')
// 		.then((data) => {
// 			res.json(util.inspect(data));
// 		})
// 		.catch((err) => {
// 			console.error(err);
// 		});
// };
