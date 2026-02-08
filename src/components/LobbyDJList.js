import React from 'react';
import { connect } from 'react-redux';

import socket from '../socket';
import {
	selectDJQueue,
	selectDJQueuePosition,
	selectIsLoggedIn,
	selectSongQueue,
	selectUserById,
	selectUsersInLobby
} from '../reducers';
import Icon from './Icon';

class LobbyDJList extends React.Component {
	joinDJQueue = () => {
		socket.emit('join_dj_queue');
	};

	leaveDJQueue = () => {
		socket.emit('leave_dj_queue');
	};

	renderHeading() {
		if (this.props.isLoggedIn) {
			const { songQueueLength } = this.props;

			if (songQueueLength) {
				return <span>{`You have ${songQueueLength} song${songQueueLength > 1 ? 's' : ''} queued.`}</span>;
			}

			// If user has no songs queued, remind them how to queue songs
			return (
				<span>
					You have no songs in your queue.<br />
					Click the <Icon id="mini-my-songs-icon" name="folder-music" /> button above to queue songs, then
					join the DJ waitlist.
				</span>
			);
		}

		// If user is not logged in, remind them to create an account
		return <span>To join the DJ list, sign in or create an AudioFish account using the button above.</span>;
	}

	renderDJs() {
		return this.props.djs.map((user, i) => {
			return (
				<div className={`item ${!i ? 'current-dj' : ''}`} key={user.id}>
					<span className="username">{user.username}</span>
					<span className="order">{i + 1}</span>
				</div>
			);
		});
	}

	renderListeners() {
		return this.props.listeners.map((user) => {
			return (
				<div className="item" key={user.id}>
					<span className="username">{user.username}</span>
				</div>
			);
		});
	}

	render() {
		return (
			<div id="lobby-dj-list">
				<div id="lobby-dj-list__heading">{this.renderHeading()}</div>
				<hr />
				<div id="lobby-dj-list__djs">
					<div id="lobby-dj-list__djs__heading">
						<span>DJ Waitlist</span>
						{this.props.isDJ ? (
							<button className="btn-leave-dj-list" onClick={this.leaveDJQueue}>
								<Icon name="vynil" />
								Leave
							</button>
						) : (
							<button
								className="btn-join-dj-list"
								onClick={this.joinDJQueue}
								disabled={!this.props.songQueueLength}
							>
								<Icon name="vynil" />
								Join
							</button>
						)}
					</div>
					<div id="lobby-dj-list__djs__list">{this.renderDJs()}</div>
				</div>
				<hr />
				<div id="lobby-dj-list__listeners">
					<div id="lobby-dj-list__listeners__heading">
						<span>Listeners</span>
						<Icon name="headphones" />
					</div>
					<div id="lobby-dj-list__listeners__list">{this.renderListeners()}</div>
				</div>
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	const listeners = [...selectUsersInLobby(state)];
	const djs = [];

	selectDJQueue(state).forEach((uid) => {
		// Add user to DJ list
		const u = selectUserById(state, uid);
		djs.push(u);

		// Remove DJ from listeners list
		const index = listeners.indexOf(u);
		if (index > -1) listeners.splice(index, 1);
	});

	return {
		isLoggedIn: selectIsLoggedIn(state),
		songQueueLength: selectSongQueue(state).length,
		listeners,
		djs,
		isDJ: selectDJQueuePosition(state) >= 0
	};
};

export default connect(mapStateToProps, {})(LobbyDJList);
