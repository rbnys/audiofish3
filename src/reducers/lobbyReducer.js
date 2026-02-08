const INITIAL_STATE = {
	pathname: null,
	name: null,
	owner: null
};

const lobbyReducer = (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case 'SET_LOBBY':
			return action.payload;
		default:
			return state;
	}
};

export default lobbyReducer;
