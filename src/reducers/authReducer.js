export const INITIAL_STATE = {
	token: null,
	userId: null,
	username: null,
	errorMessage: null
};

const authReducer = (state = INITIAL_STATE, action) => {
	switch (action.type) {
		case 'LOG_IN':
			return { ...INITIAL_STATE, ...action.payload };
		case 'LOG_IN_ERROR':
			return { ...INITIAL_STATE, errorMessage: action.payload };
		case 'LOG_OUT':
			return INITIAL_STATE;
		default:
			return state;
	}
};

export default authReducer;
