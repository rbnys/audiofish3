import _ from 'lodash';

const usersReducer = (state = [], action) => {
	switch (action.type) {
		case 'SET_USERS_IN_LOBBY':
			const users = [];
			action.payload.forEach((u) => {
				users.push({ ...u, isInLobby: true, isOnline: true });
			});
			return users;
		case 'ADD_USER_TO_LOBBY':
		case 'REMOVE_USER_FROM_LOBBY':
			const adding = action.type === 'ADD_USER_TO_LOBBY';
			const userId = adding ? action.payload.id : action.payload;

			const oldUser = state.find((u) => u.id === userId);
			const userData = adding ? action.payload : oldUser;
			const newUser = { ...userData, isInLobby: adding, isOnline: true };

			if (oldUser) {
				return [ ..._.without(state, oldUser), newUser ];
			} else {
				return adding ? [ ...state, newUser ] : state;
			}
		default:
			return state;
	}
};

export default usersReducer;
