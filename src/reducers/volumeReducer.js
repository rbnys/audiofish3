const INITIAL_STATE = {
	level: 50,
	muted: false
};

const volumeReducer = (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case 'SET_VOLUME':
			return { ...state, level: action.payload };
		case 'SET_MUTED':
			return { ...state, muted: action.payload };
		default:
			return state;
	}
};

export default volumeReducer;
