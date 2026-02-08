const isSongTableLoadingReducer = (state = false, action) => {
    switch (action.type) {
        case 'SET_SONG_TABLE_LOADING':
            return action.payload;
        default:
            return state;
    }
};

export default isSongTableLoadingReducer;
