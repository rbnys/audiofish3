const currentSongReducer = (state = null, action) => {
	switch (action.type) {
		case 'SET_CURRENT_SONG':
			return action.payload;
		default:
			return state;
	}
};

export default currentSongReducer;
