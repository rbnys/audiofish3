import { combineReducers } from 'redux';
import { reducer as formReducer } from 'redux-form';
import { createSelector } from 'reselect';

import authReducer from './authReducer';
import isLoadingReducer from './isLoadingReducer';
import isSongTableLoadingReducer from './isSongTableLoadingReducer';
import modalComponentsReducer from './modalComponentsReducer';
import lobbyReducer from './lobbyReducer';
import usersReducer from './usersReducer';
import lobbyGuestsReducer from './lobbyGuestsReducer';
import songsReducer from './songsReducer';
import playlistsReducer from './playlistsReducer';
import currentPlaylistReducer from './currentPlaylistReducer';
import songQueueReducer from './songQueueReducer';
import currentSongReducer from './currentSongReducer';
import currentSongVotesReducer from './currentSongVotesReducer';
import djQueueReducer from './djQueueReducer';
import songsFilterReducer from './songsFilterReducer';
import songsWindowIsOpenReducer from './songsWindowIsOpenReducer';
import volumeReducer from './volumeReducer';
import lobbyMessagesReducer from './lobbyMessagesReducer';

export default combineReducers({
    form: formReducer,
    auth: authReducer,
    isLoading: isLoadingReducer,
    isSongTableLoading: isSongTableLoadingReducer,
    modalComponents: modalComponentsReducer,
    lobby: lobbyReducer,
    users: usersReducer,
    lobbyGuests: lobbyGuestsReducer,
    songs: songsReducer,
    playlists: playlistsReducer,
    currentPlaylist: currentPlaylistReducer,
    songQueue: songQueueReducer,
    currentSong: currentSongReducer,
    currentSongVotes: currentSongVotesReducer,
    djQueue: djQueueReducer,
    songsFilter: songsFilterReducer,
    songsWindowIsOpen: songsWindowIsOpenReducer,
    volume: volumeReducer,
    lobbyMessages: lobbyMessagesReducer,
});

export const selectIsLoggedIn = (state) => !!state.auth.token;
export const selectUserToken = (state) => state.auth.token;
export const selectUserId = (state) => state.auth.userId;
export const selectUsername = (state) => state.auth.username;
export const selectAuthErrorMessage = (state) => state.auth.errorMessage;
export const selectIsLoading = (state) => state.isLoading;
export const selectIsSongTableLoading = (state) => state.isSongTableLoading;
export const selectModalComponents = (state) => state.modalComponents;
export const selectIsLobbyLoaded = (state) => !!state.lobby.pathname;
export const selectLobbyName = (state) => state.lobby.name;
export const selectUsers = (state) => state.users;
export const selectLobbyGuests = (state) => state.lobbyGuests;
export const selectSongs = (state) => state.songs;
export const selectPlaylists = (state) => state.playlists;
export const selectCurrentPlaylist = (state) => state.currentPlaylist;
export const selectSongQueue = (state) => state.songQueue;
export const selectCurrentSong = (state) => state.currentSong;
export const selectCurrentSongUpvotes = (state) => state.currentSongVotes.ups;
export const selectCurrentSongDownvotes = (state) => state.currentSongVotes.downs;
export const selectCurrentSongGrabs = (state) => state.currentSongVotes.grabs;
export const selectDJQueue = (state) => state.djQueue;
export const selectDJQueuePosition = (state) => state.djQueue.indexOf(state.auth.userId);
export const selectSongsFilter = (state) => state.songsFilter;
export const selectSongsWindowIsOpen = (state) => state.songsWindowIsOpen;
export const selectVolume = (state) => state.volume.level;
export const selectIsMuted = (state) => state.volume.muted;
export const selectLobbyMessages = (state) => state.lobbyMessages;

export const selectAuthHeader = createSelector(selectUserToken, (token) => {
    return { authorization: token };
});

export const selectUserById = createSelector([selectUsers, (_state, userId) => userId], (users, userId) => {
    return users.find((u) => u.id === userId);
});

export const selectUsersInLobby = createSelector(selectUsers, (users) => users.filter((u) => u.isInLobby));

export const selectTotalUsersOnline = createSelector([selectUsersInLobby, selectLobbyGuests], (users, guests) => users.length + guests);

export const selectSpecificPlaylistIsBeingViewed = createSelector(selectCurrentPlaylist, (playlistId) => playlistId >= 0);

export const selectSongById = createSelector([selectSongs, (_state, songId) => songId], (songs, songId) => {
    return songs.find((s) => s.song_id === songId);
});

export const selectSongsFromPlaylist = createSelector([selectSongs, (_state, playlistId) => playlistId], (songs, playlistId) => {
    return songs.filter((song) => song.playlist_id === playlistId);
});

export const selectSongsFromCurrentPlaylist = createSelector([selectSongs, selectCurrentPlaylist], (songs, playlistId) => {
    if (playlistId < 0) {
        return songs;
    } else {
        return songs.filter((song) => song.playlist_id === playlistId);
    }
});

export const selectNumSongsInEachPlaylist = createSelector(selectSongs, (songs) => {
    const counts = {};

    songs.forEach((s) => {
        if (counts[s.playlist_id]) {
            counts[s.playlist_id]++;
        } else {
            counts[s.playlist_id] = 1;
        }
    });

    return counts;
});

export const selectCurrentPlaylistInfo = createSelector([selectPlaylists, selectCurrentPlaylist], (playlists, currentPlaylist) => {
    return playlists.find(({ playlist_id }) => playlist_id === currentPlaylist);
});

export const selectIsSongQueued = createSelector([selectSongQueue, (_state, song) => song], (songQueue, song) => {
    return songQueue.indexOf(song.song_id) >= 0;
});

export const selectHasUpvotedSong = createSelector([selectCurrentSongUpvotes, selectUserId], (upvotes, userId) => {
    return upvotes.find((uid) => uid === userId);
});
export const selectHasDownvotedSong = createSelector([selectCurrentSongDownvotes, selectUserId], (downvotes, userId) => {
    return downvotes.find((uid) => uid === userId);
});
export const selectHasGrabbedSong = createSelector([selectCurrentSongGrabs, selectUserId], (grabs, userId) => {
    return grabs.find((uid) => uid === userId);
});

// export const selectLobbyMessages = createSelector([(state) => state.lobbyMessages, selectUsers], (messages, users))
