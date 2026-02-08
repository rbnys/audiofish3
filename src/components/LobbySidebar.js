import React from 'react';

import Icon from './Icon';
import LobbyChat from './LobbyChat';
import LobbyDJList from './LobbyDJList';

class LobbySidebar extends React.Component {
	state = { chatView: true };

	render() {
		return (
			<div id="lobby-sidebar">
				<div id="lobby-sidebar__controls">
					<div
						id="lobby-sidebar__controls__chat"
						className={`${this.state.chatView ? 'selected' : ''}`}
						onMouseDown={() => this.setState({ chatView: true })}
					>
						<Icon name="comments" />Chat
					</div>
					<div
						id="lobby-sidebar__controls__users"
						className={`${this.state.chatView ? '' : 'selected'}`}
						onMouseDown={() => this.setState({ chatView: false })}
					>
						<Icon name="vynil" />DJ's
					</div>
				</div>
				{this.state.chatView ? <LobbyChat /> : <LobbyDJList />}
			</div>
		);
	}
}

export default LobbySidebar;
