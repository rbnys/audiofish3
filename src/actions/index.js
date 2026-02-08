import axios from 'axios';
import React from 'react';
import {
    selectAuthHeader,
    selectCurrentPlaylist,
    selectSongById,
    selectSongQueue,
    selectIsSongQueued,
    selectSongs,
    selectSongsFromPlaylist,
    selectSpecificPlaylistIsBeingViewed,
} from '../reducers';

import serverIP from '../server';
import socket from '../socket';

export const signUp = (username, password) => {
    return async (dispatch) => {
        // setTimeout(() => {
        axios
            .post(`${serverIP}/user/sign-up`, {
                username,
                password,
            })
            .then((res) => {
                dispatch({ type: 'LOG_IN', payload: res.data });
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('userId', res.data.userId);
                localStorage.setItem('username', res.data.username);
                location.reload();
            })
            .catch((error) => {
                dispatch({ type: 'LOG_IN_ERROR', payload: error.response.data });
            });
        // }, 1000);
    };
};

export const signIn = (username, password) => {
    return async (dispatch) => {
        // setTimeout(() => {
        axios
            .post(`${serverIP}/user/sign-in`, {
                username,
                password,
            })
            .then((res) => {
                dispatch({ type: 'LOG_IN', payload: res.data });
                localStorage.setItem('token', res.data.token);
                localStorage.setItem('userId', res.data.userId);
                localStorage.setItem('username', res.data.username);
                location.reload();
            })
            .catch((error) => {
                dispatch({ type: 'LOG_IN_ERROR', payload: 'Incorrect username or password.' });
            });
        // }, 1000);
    };
};

export const signOut = () => {
    return async (dispatch, getState) => {
        axios.post(`${serverIP}/user/sign-out`, {}, { headers: selectAuthHeader(getState()) });

        dispatch({ type: 'LOG_OUT' });
        localStorage.removeItem('token');
        localStorage.removeItem('userId');
        localStorage.removeItem('username');
        location.reload();
    };
};

export const clearLogInError = () => {
    return {
        type: 'LOG_IN_ERROR',
        payload: null,
    };
};

export const setLoading = (isLoading) => {
    return {
        type: 'SET_LOADING',
        payload: isLoading,
    };
};

export const setModalComponent = (index, content) => {
    return {
        type: 'SET_MODAL_CONTENT',
        payload: {
            index,
            content: content && React.cloneElement(content, { ...content.props, handleClose: () => setModalComponent(index, null) }),
        },
    };
};

export const setLobby = (lobby) => {
    return {
        type: 'SET_LOBBY',
        payload: lobby,
    };
};

export const setUsersInLobby = (userList) => {
    return {
        type: 'SET_USERS_IN_LOBBY',
        payload: userList,
    };
};

export const addUserToLobby = (user) => {
    return {
        type: 'ADD_USER_TO_LOBBY',
        payload: user,
    };
};

export const removeUserFromLobby = (userId) => {
    return {
        type: 'REMOVE_USER_FROM_LOBBY',
        payload: userId,
    };
};

export const setLobbyGuests = (count) => {
    return {
        type: 'SET_LOBBY_GUESTS',
        payload: count,
    };
};

export const setDJQueue = (list) => {
    return {
        type: 'SET_DJ_QUEUE',
        payload: list,
    };
};

export const fetchPlaylistsAndSongs = () => {
    return async (dispatch, getState) => {
        axios
            .post(`${serverIP}/songs/playlists`, {}, { headers: selectAuthHeader(getState()) })
            .then((res) => {
                dispatch({ type: 'FETCH_PLAYLISTS', payload: res.data });
            })
            .catch((error) => console.error(`Error fetching list of playlists: ${error}`));
        axios
            .post(`${serverIP}/songs/user-songs`, {}, { headers: selectAuthHeader(getState()) })
            .then((res) => {
                dispatch({ type: 'FETCH_SONGS', payload: res.data });
                socket.emit('load_song_queue');

                /* TESTING */
                // const songs = selectSongs(getState());
                // if (songs.length) {
                // 	dispatch({
                // 		type: 'SET_CURRENT_SONG',
                // 		payload: songs[Math.floor(Math.random() * songs.length)]
                // 	});
                // }
                /* TESTING */
            })
            .catch((error) => console.error(`Error fetching user's songs: ${error}`));
    };
};

export const setCurrentPlaylist = (playlistId) => {
    return {
        type: 'SET_CURRENT_PLAYLIST',
        payload: playlistId,
    };
};

export const createPlaylist = (values, switchToNewPlaylist = true) => {
    return async (dispatch, getState) => {
        dispatch({ type: 'SET_SONG_TABLE_LOADING', payload: true });

        axios
            .post(
                `${serverIP}/songs/create-playlist`,
                {
                    name: values.name,
                },
                { headers: selectAuthHeader(getState()) }
            )
            .then((res) => {
                dispatch({ type: 'CREATE_PLAYLIST', payload: res.data });
                if (switchToNewPlaylist) dispatch({ type: 'SET_CURRENT_PLAYLIST', payload: res.data.playlist_id });
            })
            .catch((error) => console.error(`Error creating playlist: ${error}`))
            .finally(() => {
                dispatch({ type: 'SET_SONG_TABLE_LOADING', payload: false });
            });
    };
};

export const editPlaylist = (values) => {
    return async (dispatch, getState) => {
        dispatch({ type: 'SET_SONG_TABLE_LOADING', payload: true });

        axios
            .post(
                `${serverIP}/songs/edit-playlist`,
                {
                    playlist_id: values.playlistId,
                    name: values.name,
                },
                { headers: selectAuthHeader(getState()) }
            )
            .then((res) => {
                dispatch({ type: 'EDIT_PLAYLIST', payload: res.data });
            })
            .catch((error) => console.error(`Error editing playlist: ${error}`))
            .finally(() => {
                dispatch({ type: 'SET_SONG_TABLE_LOADING', payload: false });
            });
    };
};

export const deletePlaylist = (playlistId) => {
    return async (dispatch, getState) => {
        axios
            .post(
                `${serverIP}/songs/delete-playlist`,
                {
                    playlist_id: playlistId,
                },
                { headers: selectAuthHeader(getState()) }
            )
            .catch((error) => console.error(`Error deleting playlist: ${error}`));

        selectSongsFromPlaylist(getState(), playlistId).forEach((song) => {
            // Delete songs in the deleted playlist from the song queue
            if (selectIsSongQueued(getState(), song)) {
                dispatch({ type: 'DEQUEUE_SONG', payload: song.song_id });
            }
        });
        saveSongQueue(selectSongQueue(getState()));

        if (selectCurrentPlaylist(getState()) === playlistId) {
            // Switch back to "All Songs" view before deleting the playlist from the playlist selector
            dispatch({ type: 'SET_CURRENT_PLAYLIST', payload: -1 });
        }
        dispatch({ type: 'DELETE_PLAYLIST', payload: playlistId });
    };
};

export const addSong = (values) => {
    return async (dispatch, getState) => {
        dispatch({ type: 'SET_SONG_TABLE_LOADING', payload: true });

        const songs = selectSongs(getState());

        axios
            .post(
                `${serverIP}/songs/add-song`,
                {
                    playlist: values.playlist,
                    videoId: values.videoId,
                    title: values.title,
                    artist: values.artist,
                    length: values.length,
                    pos: songs.length ? songs[0].pos - 1 : 0,
                },
                { headers: selectAuthHeader(getState()) }
            )
            .then((res) => {
                dispatch({ type: 'ADD_SONG', payload: res.data });

                if (selectSpecificPlaylistIsBeingViewed(getState())) {
                    dispatch({ type: 'SET_CURRENT_PLAYLIST', payload: res.data.playlist_id });
                }
                dispatch({ type: 'SET_SONGS_FILTER', payload: '' });
            })
            .catch((error) => console.error(`Error adding song to playlist: ${error}`))
            .finally(() => {
                dispatch({ type: 'SET_SONG_TABLE_LOADING', payload: false });
            });
    };
};

export const addSongsFromYoutubePlaylist = (values) => {
    return async (dispatch, getState) => {
        dispatch({ type: 'SET_SONG_TABLE_LOADING', payload: true });

        const songs = selectSongs(getState());

        axios
            .post(
                `${serverIP}/songs/add-yt-playlist`,
                {
                    playlistId: values.playlist,
                    ytPlaylistId: values.ytPlaylistId,
                    ytPlaylistItemCount: values.ytPlaylistItemCount,
                    startingPos: songs.length ? songs[0].pos - 1 : 0,
                },
                { headers: selectAuthHeader(getState()) }
            )
            .then((res) => {
                console.log(res.data);
                res.data.songs.forEach((song) => {
                    dispatch({ type: 'ADD_SONG', payload: song });
                });

                if (selectSpecificPlaylistIsBeingViewed(getState())) {
                    dispatch({ type: 'SET_CURRENT_PLAYLIST', payload: values.playlist });
                }
                dispatch({ type: 'SET_SONGS_FILTER', payload: '' });
            })
            .catch((error) => console.error(`Error adding playlist of songs from YouTube: ${error}`))
            .finally(() => {
                dispatch({ type: 'SET_SONG_TABLE_LOADING', payload: false });
            });
    };
};

export const deleteSong = (songId) => {
    return async (dispatch, getState) => {
        axios
            .post(
                `${serverIP}/songs/delete-song`,
                {
                    song_id: songId,
                },
                { headers: selectAuthHeader(getState()) }
            )
            .catch((error) => console.error(`Error deleting song: ${error}`));

        if (selectSongQueue(getState()).indexOf(songId) >= 0) {
            // If song is queued, delete from queue before deleting the song itself
            dispatch({ type: 'DEQUEUE_SONG', payload: songId });
            saveSongQueue(selectSongQueue(getState()));
        }

        dispatch({ type: 'DELETE_SONG', payload: songId });
    };
};

export const editSong = (song, values) => {
    return async (dispatch, getState) => {
        dispatch({ type: 'SET_SONG_TABLE_LOADING', payload: true });

        let playlist = undefined;

        if (values.playlist !== undefined && values.playlist !== song.playlist_id) {
            // If playlist changed, move song to the top
            playlist = values.playlist;
            values.pos = selectSongs(getState())[0].pos - 1;
        }

        axios
            .post(
                `${serverIP}/songs/edit-song`,
                {
                    song_id: song.song_id,
                    playlist,
                    title: values.title,
                    artist: values.artist,
                    pos: values.pos,
                },
                { headers: selectAuthHeader(getState()) }
            )
            .then((res) => {
                dispatch({ type: 'EDIT_SONG', payload: { oldSong: song, newSong: res.data } });
            })
            .catch((error) => console.error(`Error editing song: ${error}`))
            .finally(() => {
                dispatch({ type: 'SET_SONG_TABLE_LOADING', payload: false });
            });
    };
};

const moveSong = (dispatch, getState, song, newPos) => {
    dispatch({ type: 'SET_SONG_TABLE_LOADING', payload: true });

    axios
        .post(
            `${serverIP}/songs/edit-song`,
            {
                song_id: song.song_id,
                pos: newPos,
            },
            { headers: selectAuthHeader(getState()) }
        )
        .then((res) => {
            dispatch({ type: 'EDIT_SONG', payload: { oldSong: song, newSong: res.data } });
        })
        .catch((error) => console.error(`Error moving song up/down: ${error}`))
        .finally(() => {
            dispatch({ type: 'SET_SONG_TABLE_LOADING', payload: false });
        });
};
export const moveSongUp = (song, songsTable) => {
    return async (dispatch, getState) => {
        moveSong(dispatch, getState, song, selectSongs(getState())[0].pos - 1, songsTable);
    };
};
export const moveSongDown = (song, songsTable) => {
    return async (dispatch, getState) => {
        moveSong(dispatch, getState, song, selectSongs(getState()).at(-1).pos + 1, songsTable);
    };
};

const saveSongQueue = (songQueue) => {
    socket.emit('save_song_queue', songQueue);
};
export const initSongQueue = (songQueue) => {
    // Only used on page load after song queue is fetched from server
    return async (dispatch, getState) => {
        songQueue = songQueue.filter((songId) => {
            // Remove song IDs from queue that have no matching song
            return selectSongById(getState(), songId);
        });
        dispatch({ type: 'SET_SONG_QUEUE', payload: songQueue });
        saveSongQueue(selectSongQueue(getState()));
    };
};
export const setSongQueue = (songQueue) => {
    // Used when user reorganizes song queue
    return async (dispatch, getState) => {
        dispatch({ type: 'SET_SONG_QUEUE', payload: songQueue });
        saveSongQueue(selectSongQueue(getState()));
    };
};
export const queueSong = (song) => {
    return async (dispatch, getState) => {
        dispatch({ type: 'QUEUE_SONG', payload: song.song_id });
        saveSongQueue(selectSongQueue(getState()));
    };
};
export const dequeueSong = (song) => {
    return async (dispatch, getState) => {
        // First, manually move the song to the bottom of list (so it happens instantly) and save that change in the DB
        song = selectSongById(getState(), song.song_id);
        const newPos = selectSongs(getState()).at(-1).pos + 1;

        dispatch({
            type: 'EDIT_SONG',
            payload: { oldSong: song, newSong: { ...song, pos: newPos } },
        });

        axios
            .post(
                `${serverIP}/songs/edit-song`,
                {
                    song_id: song.song_id,
                    pos: newPos,
                },
                { headers: selectAuthHeader(getState()) }
            )
            .then()
            .catch((error) => console.error(`Error moving song up/down: ${error}`));

        // Then, remove song from queue
        dispatch({ type: 'DEQUEUE_SONG', payload: song.song_id });
        saveSongQueue(selectSongQueue(getState()));
    };
};

export const setCurrentSong = (song) => {
    return async (dispatch, getState) => {
        dispatch({ type: 'SET_CURRENT_SONG', payload: song });

        if (song && selectSongQueue(getState()).find((s) => s.song_id === song.song_id)) {
            // If your song just started playing, remove it from queue
            dispatch({ type: 'DEQUEUE_SONG' });
        }
    };
};

export const setCurrentSongVotes = (votes) => {
    return {
        type: 'SET_CURRENT_SONG_VOTES',
        payload: votes,
    };
};

export const setSongsFilter = (filter) => {
    return {
        type: 'SET_SONGS_FILTER',
        payload: filter,
    };
};

export const openSongsWindow = () => {
    return (dispatch) => {
        dispatch({ type: 'SET_SONGS_FILTER', payload: '' });
        dispatch({ type: 'OPEN_SONGS_WINDOW' });
        // Tooltip.rebuild();
    };
};
export const closeSongsWindow = () => {
    return {
        type: 'CLOSE_SONGS_WINDOW',
    };
};

export const setVolume = (volume) => {
    return {
        type: 'SET_VOLUME',
        payload: volume,
    };
};
export const mute = () => {
    return {
        type: 'SET_MUTED',
        payload: true,
    };
};
export const unmute = () => {
    return {
        type: 'SET_MUTED',
        payload: false,
    };
};

export const addLobbyMessage = (msg) => {
    return {
        type: 'LOBBY_MESSAGE',
        payload: msg,
    };
};
