const modalComponentsReducer = (state = [], action) => {
	switch (action.type) {
		case 'SET_MODAL_CONTENT':
			const { index, content } = action.payload;
			const newState = state.slice();
			newState[index] = content;
			return newState;
		default:
			return state;
	}
};

export default modalComponentsReducer;
