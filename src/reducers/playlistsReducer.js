import _ from 'lodash';

const playlistsReducer = (state = [], action) => {
	switch (action.type) {
		case 'FETCH_PLAYLISTS':
			return action.payload;
		case 'CREATE_PLAYLIST':
			return _.sortBy([ ...state, action.payload ], [ (pl) => pl.name.toLowerCase() ]);
		case 'EDIT_PLAYLIST':
			const unsortedPlaylists = [
				..._.without(state, state.find((pl) => pl.playlist_id === action.payload.playlist_id)),
				action.payload
			];
			return _.sortBy(unsortedPlaylists, [ (pl) => pl.name.toLowerCase() ]);
		case 'DELETE_PLAYLIST':
			return _.without(state, state.find((pl) => pl.playlist_id === action.payload));
		default:
			return state;
	}
};

export default playlistsReducer;
