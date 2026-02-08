import React, { Fragment } from 'react';
import { connect } from 'react-redux';

import LogInOrSignUp from './LogInOrSignUp';
import { setModalComponent, signUp, signIn, signOut, setLoading, openSongsWindow } from '../actions';
import { selectIsLoggedIn, selectLobbyName, selectTotalUsersOnline, selectUsername } from '../reducers';
import Icon from './Icon';

import logoText from '../img/logo_text.png';
import chevron from '../img/header_chevron.png';

class LobbyHeader extends React.Component {
	handleSignIn = () => {
		this.props.setModalComponent(1, <LogInOrSignUp />);
	};

	handleSignOut = (event) => {
		event.preventDefault();
		this.props.setLoading(true);
		this.props.signOut();
	};

	renderUserContent() {
		if (this.props.isLoggedIn) {
			return (
				<Fragment>
					<div id="my-user-info-box">
						<div id="my-username-box">
							<div id="my-username">{this.props.username}</div>
							<a id="btn-sign-out" href="#" onClick={this.handleSignOut}>
								Log Out
							</a>
						</div>
						<div id="my-avatar" />
					</div>
					<img className="chevron" src={chevron} alt="" />
					<button id="btn-my-songs" onClick={() => this.props.openSongsWindow()}>
						<Icon name="folder-music" />
					</button>
				</Fragment>
			);
		} else {
			return (
				<button id="btn-sign-in" onClick={this.handleSignIn}>
					<Icon name="user" /> Sign In
				</button>
			);
		}
	}

	render() {
		return (
			<div id="lobby-header">
				<div id="lobby-header__left">
					<img id="logo-text" src={logoText} alt="AudioFish" />
					<img className="chevron" src={chevron} alt="" />
					<div id="lobby-name-box">
						<div id="lobby-name-box__name">
							<Icon name="link" />
							{this.props.lobbyName}
						</div>
						<div id="lobby-name-box__online">
							<div className="icon-online" />
							<span className="num">{this.props.totalUsersOnline}</span>&nbsp;{this.props.totalUsersOnline > 1 ? `people` : 'person'}{' '}
							online
						</div>
					</div>
				</div>
				<div id="lobby-header__right">{this.renderUserContent()}</div>
			</div>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		isLoggedIn: selectIsLoggedIn(state),
		username: selectUsername(state),
		lobbyName: selectLobbyName(state),
		totalUsersOnline: selectTotalUsersOnline(state)
	};
};

export default connect(mapStateToProps, { setModalComponent, signUp, signIn, signOut, setLoading, openSongsWindow })(
	LobbyHeader
);
