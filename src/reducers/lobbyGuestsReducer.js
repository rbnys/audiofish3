const lobbyGuestsReducer = (state = 0, action) => {
	switch (action.type) {
		case 'SET_LOBBY_GUESTS':
			return action.payload;
		default:
			return state;
	}
};

export default lobbyGuestsReducer;
