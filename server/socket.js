const knex = require('./db');
const jwt = require('jwt-simple');
const config = require('./config');
const _ = require('lodash');

async function initSocket(http) {
    const lobbies = new Map();
    const songQueues = new Map();

    const lobbyRows = await knex('user_lobbies')
        .select(['lobby_id AS id', 'pathname', 'name', 'privacy', 'users.user_id', 'username'])
        .innerJoin('users', 'users.user_id', 'user_lobbies.user_id');
    lobbyRows.forEach((lobby) => {
        lobbies.set(lobby.pathname, {
            ..._.pick(lobby, ['id', 'pathname', 'name', 'privacy']),
            owner: { id: lobby.user_id, username: lobby.username },
            guests: 0,
            djQueue: [],
            currentSong: null,
            songStartedAt: 0,
            songVotes: {
                ups: [],
                downs: [],
                grabs: [],
            },
        });
    });

    const io = require('socket.io')(http, {
        cors: {
            origins: ['http://localhost'],
        },
    });

    io.on('connection', function (socket) {
        const token = socket.handshake.auth.token;

        // Use JWT to determine user info. If none was provided, consider the user a guest
        if (token) {
            const userId = jwt.decode(token, config.secret).sub;

            knex('users')
                .where('user_id', userId)
                .then((user) => {
                    if (user.length > 0) {
                        setSocketUserData(socket, userId, user[0].username);
                    } else {
                        setSocketUserData(socket);
                    }
                });
        } else {
            setSocketUserData(socket);
        }

        socket.on('join_lobby', ({ pathname, connectionReadyToken }) => {
            if (!lobbies.has(pathname)) {
                // No lobby with given pathname exists
                socket.emit('lobby_info', { notFound: true });
            } else if (connectionReadyToken === undefined || connectionReadyToken !== socket.data.connectionReadyToken) {
                // Client tried to join lobby before user authentication was checked
                console.log(connectionReadyToken, socket.data.connectionReadyToken);
                socket.emit('lobby_info', { prematureJoin: true });
            } else {
                // Lobby was found, and is joinable!
                const lobby = lobbies.get(pathname);

                socket.data.lobby = lobby;
                socket.join(pathname);

                // Wait to fetch all users in lobby, then send lobby info
                getUsersInLobby(lobby).then((users) => {
                    socket.emit('lobby_info', { ..._.pick(lobby, ['pathname', 'name', 'owner', 'guests', 'djQueue']), users });
                    // socket.emit('start_secs', Math.floor((new Date().getTime() - lobby.songStartedAt) / 1000));
                });

                if (isAuthed(socket)) {
                    io.to(lobby.pathname).emit('user_joined_lobby', socket.data.user);
                } else {
                    io.to(lobby.pathname).emit('lobby_guests', ++lobby.guests);
                }
            }
        });

        socket.on('lobby_chat', (text) => {
            if (isAuthed(socket)) {
                emitToLobby(socket, 'lobby_message', {
                    type: 'CHAT',
                    userId: socket.data.user.id,
                    text,
                    time: new Date().getTime(),
                });
            }
        });

        // When lobby info is loaded on client-side and the "join lobby" button is clicked, this request is sent.
        // Making the user click that button allows the songs to be "autoplayed" on all browsers.
        socket.on('get_initial_song', () => {
            if (isInLobby(socket)) {
                const { lobby } = socket.data;

                socket.emit('current_song', {
                    song: lobby.currentSong,
                    startSecs: Math.floor((new Date().getTime() - lobby.songStartedAt) / 1000),
                });
                socket.emit('current_song_votes', lobby.songVotes);
            }
        });

        socket.on('load_song_queue', function () {
            if (isAuthed(socket)) {
                const userId = uid(socket);

                if (songQueues.has(userId)) {
                    socket.emit('load_song_queue', songQueues.get(userId));
                } else {
                    knex('user_song_queue')
                        .select('song_id')
                        .where({ user_id: userId })
                        .orderBy('pos', 'asc')
                        .then((queue) => {
                            if (queue.length) {
                                queue = queue.map((s) => s.song_id);
                                songQueues.set(userId, queue);
                                socket.emit('load_song_queue', queue);
                            }
                        });
                }
            }
        });

        socket.on('save_song_queue', (queue) => {
            if (isAuthed(socket)) {
                const userId = uid(socket);

                songQueues.set(userId, queue);

                const songQueueRows = queue.map((s, i) => {
                    return { user_id: userId, pos: i, song_id: s };
                });

                knex('user_song_queue')
                    .where('user_id', userId)
                    .del()
                    .then(() => {
                        if (songQueueRows.length) {
                            knex('user_song_queue')
                                .insert(songQueueRows)
                                .onConflict(['user_id', 'pos'])
                                .ignore()
                                .catch((err) => console.error(err));
                        }
                    })
                    .catch((err) => console.error(err));
            }
        });

        socket.on('join_dj_queue', () => {
            if (isDJ(socket)) {
                // If user is already a DJ, ignore event
                return;
            }
            if (isAuthed(socket) && isInLobby(socket)) {
                // User is authenticated, in a lobby, and not already a DJ, so let's add them!
                const { user, lobby } = socket.data;

                lobby.djQueue.push(user.id);

                io.to(lobby.pathname).emit('dj_queue', lobby.djQueue);

                if (lobby.djQueue.length === 1) {
                    // If user joined an empty DJ queue, immediately start playing a song
                    playNextSong(lobby);
                }
            }
        });

        socket.on('leave_dj_queue', () => {
            if (!isDJ(socket)) {
                // If user isn't a DJ, ignore event
                return;
            }
            quitDJing(socket);
        });

        socket.on('grab_song', () => {
            if (isAuthed(socket) && isInLobby(socket)) {
                const lobby = socket.data.lobby;
                const userId = uid(socket);

                if (lobby.currentSong && lobby.currentSong.user_id !== userId) {
                    const grabs = lobby.songVotes.grabs;

                    if (!grabs.includes(userId)) {
                        // Add the grab
                        grabs.push(userId);

                        // Automatically upvote the song
                        const upvotes = lobby.songVotes.ups;
                        if (!upvotes.includes(userId)) upvotes.push(userId);

                        // Remove the downvote if there was one
                        const downvotes = lobby.songVotes.downs;
                        const index = downvotes.indexOf(userId);
                        if (index > -1) downvotes.splice(index, 1);

                        // Send the new votes out to everyone
                        io.to(lobby.pathname).emit('current_song_votes', lobby.songVotes);
                    }
                }
            }
        });

        socket.on('upvote_song', () => {
            if (isAuthed(socket) && isInLobby(socket)) {
                const lobby = socket.data.lobby;
                const userId = uid(socket);

                if (lobby.currentSong && lobby.currentSong.user_id !== userId) {
                    const upvotes = lobby.songVotes.ups;

                    if (!upvotes.includes(userId)) {
                        // Add the upvote
                        upvotes.push(userId);

                        // Remove the downvote if there was one
                        const downvotes = lobby.songVotes.downs;
                        const index = downvotes.indexOf(userId);
                        if (index > -1) downvotes.splice(index, 1);

                        // Send the new votes out to everyone
                        io.to(lobby.pathname).emit('current_song_votes', lobby.songVotes);
                    }
                }
            }
        });

        socket.on('downvote_song', () => {
            if (isAuthed(socket) && isInLobby(socket)) {
                const lobby = socket.data.lobby;
                const userId = uid(socket);

                if (lobby.currentSong && lobby.currentSong.user_id !== userId) {
                    const downvotes = lobby.songVotes.downs;

                    if (!downvotes.includes(userId)) {
                        // Add the downvote
                        downvotes.push(userId);

                        // Remove the upvote if there was one
                        const upvotes = lobby.songVotes.ups;
                        const index = upvotes.indexOf(userId);
                        if (index > -1) upvotes.splice(index, 1);

                        // Send the new votes out to everyone
                        io.to(lobby.pathname).emit('current_song_votes', lobby.songVotes);
                    }
                }
            }
        });

        socket.on('disconnect', function () {
            const { lobby } = socket.data;

            if (lobby && lobby.pathname) {
                // Let the other users in the lobby know he's left
                if (isAuthed(socket)) {
                    io.to(lobby.pathname).emit('user_left_lobby', uid(socket));
                } else {
                    io.to(lobby.pathname).emit('lobby_guests', --lobby.guests);
                }

                // If user was in the DJ queue, make him leave the queue, and skip his song if he's the one DJ'ing
                quitDJing(socket);
            }
        });
    });

    // Stops playing the current song (if any), and the next DJ in the queue starts playing
    async function playNextSong(lobby) {
        if (lobby.playNextSongTimeout) clearTimeout(lobby.playNextSongTimeout);

        lobby.songVotes.ups = [];
        lobby.songVotes.downs = [];
        lobby.songVotes.grabs = [];

        let nextSong = null;

        while (lobby.djQueue.length) {
            // Sequentially kick DJs out of the queue until we find one who has a song queued
            const userId = lobby.djQueue[0];

            if (songQueues.has(userId)) {
                const songQueue = songQueues.get(userId);

                if (songQueue.length) {
                    nextSong = await knex('playlist_songs')
                        .innerJoin('user_playlists', 'playlist_songs.playlist_id', 'user_playlists.playlist_id')
                        .where({ song_id: songQueue.shift() })
                        .first();

                    if (nextSong) break;
                }
            }

            lobby.djQueue.shift();
        }

        if (nextSong) {
            // If there is a next song, start a timer in order to start the next song after this one is finished
            lobby.playNextSongTimeout = setTimeout(() => {
                lobby.djQueue.push(lobby.djQueue.shift()); // Rotate the DJ queue
                playNextSong(lobby);
            }, nextSong.length * 1000 + 5000); // Add a few seconds as a buffer so the song doesn't get cut off

            // Keep track of when the song started so when others join the lobby, the song will start at the proper time
            lobby.songStartedAt = new Date().getTime();
        }

        // Make everyone in the lobby start playing the song (or stop playing songs if nextSong is null)
        lobby.currentSong = nextSong;
        io.to(lobby.pathname).emit('current_song', { song: lobby.currentSong });
        io.to(lobby.pathname).emit('current_song_votes', lobby.songVotes);
        io.to(lobby.pathname).emit('dj_queue', lobby.djQueue);
    }

    // Make socket quit the DJ queue (if he was in one), and skips the song he was playing (if he was playing one)
    function quitDJing(socket) {
        if (isDJ(socket)) {
            const lobby = socket.data.lobby;

            lobby.djQueue.splice(lobby.djQueue.indexOf(uid(socket)), 1);

            io.to(lobby.pathname).emit('dj_queue', lobby.djQueue);

            // If user was currently playing a song, skip the song
            if (lobby.currentSong.user_id === uid(socket)) {
                playNextSong(lobby);
            }
        }
    }

    // Returns TRUE if user is currently in the DJ queue
    function isDJ(socket) {
        return isAuthed(socket) && isInLobby(socket) && socket.data.lobby.djQueue.includes(uid(socket));
    }

    // Returns TRUE if user is currently playing a song
    function isCurrentDJ(socket) {
        return isAuthed(socket) && isInLobby(socket) && socket.data.lobby.djQueue[0] === uid(socket);
    }

    // Returns TRUE if socket is connected to a signed-in user, FALSE if guest
    function isAuthed(socket) {
        return socket.data.user && socket.data.user.id >= 0;
    }
    // Returns the user_id attached to the given socket. *Always* check isAuthed() first!
    function uid(socket) {
        return socket.data.user.id;
    }

    // Returns TRUE if socket is in an AudioFish lobby
    function isInLobby(socket) {
        return !!socket.data.lobby;
    }
    // Returns the lobby_id attached to the given socket. *Always* check isInLobby() first!
    function lid(socket) {
        return socket.data.lobby.id;
    }

    // Emits event to all users in the given socket's current lobby
    function emitToLobby(socket, event, data) {
        if (socket.data.lobby && socket.data.lobby.pathname) {
            io.to(socket.data.lobby.pathname).emit(event, data);
        }
    }

    // Sets the user data for a given socket. If user is a guest, simply provide the socket
    function setSocketUserData(socket, id = -1, username = 'Guest', logInTimestamp = null) {
        socket.data.user = {
            id,
            username,
            logInTimestamp: logInTimestamp || new Date().getTime(),
        };

        // Make client wait until the user authentication has been checked to join the lobby
        socket.data.connectionReadyToken = Math.floor(Math.random() * 9001);
        socket.emit('ready_to_join_lobby', socket.data.connectionReadyToken);
    }

    // function emitOnlineUsers(lobby) {
    // 	getUsersInLobby(lobby).then((usersInLobby) => {
    // 		usersInLobby.forEach((user) => {
    // 			user.djQueuePos = lobby.djQueue.indexOf(user.id);
    // 		});
    // 		io.to(lobby.pathname).emit('users_in_lobby', usersInLobby);
    // 	});
    // }

    // Get all the user data objects for all authenticated clients. Takes either a lobby pathname or lobby object as an argument
    async function getUsersInLobby(lobby) {
        lobbyName = typeof lobby === 'object' ? lobby.pathname : lobby;
        const sockets = await io.in(lobbyName).fetchSockets();
        return sockets.filter((s) => isAuthed(s)).map((s) => s.data.user);
    }

    // Get the total number of online users for the entire site
    function getOnlineUserCount() {
        return Array.from(io.of('/').sockets.values()).map((s) => s.data.user);
    }
}

module.exports = initSocket;
