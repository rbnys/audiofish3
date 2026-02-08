import _ from 'lodash';

const songQueueReducer = (state = [], action) => {
	switch (action.type) {
		case 'SET_SONG_QUEUE':
			return action.payload;
		case 'QUEUE_SONG':
			if (state.includes(action.payload)) {
				return state;
			}
			return [ ...state, action.payload ];
		case 'DEQUEUE_SONG':
			if (!action.payload) {
				return _.without(state, state[0]);
			}
			return _.without(state, action.payload);
		default:
			return state;
	}
};

export default songQueueReducer;
