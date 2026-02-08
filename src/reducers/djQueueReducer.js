const djQueueReducer = (state = [], action) => {
	switch (action.type) {
		case 'SET_DJ_QUEUE':
			return action.payload;
		default:
			return state;
	}
};

export default djQueueReducer;
