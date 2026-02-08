import _ from 'lodash';

const lobbyMessagesReducer = (state = [], action) => {
	switch (action.type) {
		case 'LOBBY_MESSAGE':
			const { type, userId, text, time } = action.payload;

			switch (type) {
				case 'CHAT':
					if (
						!state.length ||
						state.at(-1).type !== type ||
						state.at(-1).userId !== userId ||
						time - state.at(-1).lines.at(-1).time > 1000 * 60
					) {
						// If the last chat was sent awhile ago or was from another user, don't combine them
						return [ ...state, { type, userId, lines: [ { text, time } ] } ];
					}

					// Otherwise, combine this chat with the last one
					const lines = [ ...state.at(-1).lines, { text, time } ];
					return [ ..._.initial(state), { type, userId, lines } ];
			}
		default:
			return state;
	}
};

export default lobbyMessagesReducer;
