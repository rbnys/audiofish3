const INITIAL_STATE = {
    ups: [],
    downs: [],
    grabs: []
};

const currentSongVotesReducer = (state = INITIAL_STATE, action) => {
    switch (action.type) {
        case 'SET_CURRENT_SONG_VOTES':
            return action.payload;
        default:
            return state;
    }
};

export default currentSongVotesReducer;