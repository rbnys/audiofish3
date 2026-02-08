const songsReducer = (state = [], action) => {
    let songs;
    switch (action.type) {
        case 'FETCH_SONGS':
            songs = [];
            action.payload.forEach((song) => {
                addSong(song, songs);
            });
            return songs;
        case 'ADD_SONG':
            songs = [...state];
            addSong(action.payload, songs);
            return songs;
        case 'EDIT_SONG':
            const { oldSong, newSong } = action.payload;
            songs = _.without(state, oldSong);
            addSong(newSong, songs);
            return songs;
        case 'DELETE_SONG':
            const songToDelete = state.find((s) => s.song_id === action.payload);
            if (songToDelete) return _.without(state, songToDelete);
            else return state;
        case 'DELETE_PLAYLIST':
            return state.filter((song) => song.playlist_id !== action.payload);
        default:
            return state;
    }

    // Adds song object to the correct (sorted) position in an existing list of songs
    function addSong(song, list) {
        if (!list.length || song.pos >= list.at(-1).pos) {
            list.push(song);
        } else {
            let insertIndex = 0;
            list.forEach((s, i) => {
                if (song.pos > s.pos) {
                    insertIndex = i + 1;
                } else {
                    return;
                }
            });
            list.splice(insertIndex, 0, song);
        }
    }
};

export default songsReducer;
