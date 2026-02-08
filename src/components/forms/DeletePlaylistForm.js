import React from 'react';
import { connect } from 'react-redux';

import { deletePlaylist } from '../../actions';
import Icon from '../Icon';

class DeletePlaylistForm extends React.Component {
	handleSubmit = (event) => {
		event.preventDefault();
		this.props.deletePlaylist(this.props.playlist.playlist_id);
		this.props.handleClose();
	};

	render() {
		return (
			<form className="yes-no-dialog" onSubmit={this.handleSubmit}>
				{/* <input name="playlistId" type="hidden" value={this.props.playlist.playlist_id} /> */}

				<div className="content">
					<div className="question">Are you sure you want to delete this playlist?</div>
					<div className="subject">{this.props.playlist.name}</div>
				</div>

				<div className="btns">
					<button className="btn-close" type="button" onClick={this.props.handleClose}>
						Cancel
					</button>
					<button className="btn-submit red" type="submit">
						<Icon name="trash" />
						Delete
					</button>
				</div>
			</form>
		);
	}
}

export default connect(null, { deletePlaylist })(DeletePlaylistForm);
