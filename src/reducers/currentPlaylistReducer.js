const currentPlaylistReducer = (state = -1, action) => {
	switch (action.type) {
		case 'SET_CURRENT_PLAYLIST':
			return action.payload;
		default:
			return state;
	}
};

export default currentPlaylistReducer;
