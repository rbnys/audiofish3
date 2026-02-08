const songsWindowIsOpenReducer = (state = false, action) => {
	switch (action.type) {
		case 'OPEN_SONGS_WINDOW':
			return true;
		case 'CLOSE_SONGS_WINDOW':
			return false;
		default:
			return state;
	}
};

export default songsWindowIsOpenReducer;
