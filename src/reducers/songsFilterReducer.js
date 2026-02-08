const songsFilterReducer = (state = '', action) => {
	switch (action.type) {
		case 'SET_SONGS_FILTER':
			return action.payload;
		default:
			return state;
	}
};

export default songsFilterReducer;
