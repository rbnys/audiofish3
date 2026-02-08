import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import canAutoPlay from 'can-autoplay';
import { detect as detectBrowser } from 'detect-browser';
import { Tooltip as ReactTooltip } from 'react-tooltip';

import withRouter from './withRouter';
import socket from '../socket';
import { selectIsLobbyLoaded, selectIsLoggedIn, selectSongs, selectUserById, selectUserId } from '../reducers';
import SongsWindow from './SongsWindow';
import LobbyHeader from './LobbyHeader';
import {
    setLobby,
    setLoading,
    setCurrentSong,
    setCurrentSongVotes,
    setUsersInLobby,
    addUserToLobby,
    removeUserFromLobby,
    setLobbyGuests,
    setDJQueue,
    dequeueSong,
    addLobbyMessage,
} from '../actions';
import LobbySongBox from './LobbySongBox';
import LobbySidebar from './LobbySidebar';
import Icon from './Icon';
import Tooltip from './Tooltip';

import ffAutoplayTutorial1 from '../img/firefox_autoplay_tutorial_1.png';
import ffAutoplayTutorial2 from '../img/firefox_autoplay_tutorial_2.png';

const browser = detectBrowser();
const isFirefox = browser && browser.name === 'firefox';

class Lobby extends React.Component {
    state = {
        // Errors
        notFound: false,
        notAuthorized: false,
        prematureJoin: false,
        // misc.
        canAutoplay: false,
        startSecs: 0,
    };

    componentDidMount() {
        socket.on('ready_to_join_lobby', (connectionReadyToken) => {
            socket.emit('join_lobby', { pathname: this.props.params.lobby, connectionReadyToken });
        });

        socket.on('lobby_info', (lobby) => {
            if (lobby.notFound) {
                this.setState({ notFound: true });
            } else if (lobby.notAuthorized) {
                this.setState({ notAuthorized: true });
            } else if (lobby.prematureJoin) {
                this.setState({ prematureJoin: true });
            } else {
                this.props.setLobby({
                    pathname: lobby.pathname,
                    name: lobby.name,
                    owner: lobby.owner,
                    // startSecs: lobby.currentSong ? lobby.startSecs : 0
                });
                this.props.setUsersInLobby(lobby.users);
                this.props.setDJQueue(lobby.djQueue);
                // this.props.setCurrentSong(lobby.currentSong);
                this.props.setLobbyGuests(lobby.guests);

                // Only show the "Join Lobby" overlay if videos cannot yet be autoplayed (meaning interaction w/ document is required)
                canAutoPlay.video({ muted: false, timeout: 1000 }).then(({ result, error }) => {
                    if (result) {
                        this.setState({ canAutoplay: true });
                        socket.emit('get_initial_song');
                    } else {
                        // console.warn('Autoplay disabled:', error);
                    }
                    this.props.setLoading(false);
                });
            }
        });

        socket.on('current_song', (data) => {
            if (this.state.canAutoplay) {
                let { song } = data;

                if (song && data.startSecs) {
                    song.startSecs = data.startSecs;
                }

                if (song && this.props.userId === song.user_id) {
                    this.props.dequeueSong(song);
                }

                this.props.setCurrentSong(song);
            }
        });

        socket.on('current_song_votes', (votes) => {
            this.props.setCurrentSongVotes(votes);
        });

        socket.on('user_joined_lobby', (user) => {
            this.props.addUserToLobby(user);
        });

        socket.on('user_left_lobby', (userId) => {
            this.props.removeUserFromLobby(userId);
        });

        socket.on('lobby_guests', (count) => {
            this.props.setLobbyGuests(count);
        });

        socket.on('dj_queue', (queue) => {
            this.props.setDJQueue(queue);
        });

        socket.on('lobby_message', (chat) => {
            this.props.addLobbyMessage(chat);
        });
    }

    componentWillUnmount() {
        socket.off('ready_to_join_lobby');
        socket.off('lobby_info');
        socket.off('current_song');
        socket.off('current_song_votes');
        socket.off('user_joined_lobby');
        socket.off('user_left_lobby');
        socket.off('lobby_guests');
        socket.off('dj_queue');
        socket.off('lobby_message');
    }

    render() {
        if (this.state.notFound) {
            // No such lobby exists with the given pathname
            return <div>Lobby not found</div>;
        } else if (this.state.notAuthorized) {
            // Lobby is private and user hasn't been invited
            return <div>Private lobby</div>;
        } else if (this.state.prematureJoin) {
            // Use joined the lobby before user authentication check on server-side finished
            return null;
        } else if (!this.props.isLobbyLoaded) {
            // Still waiting to fetch lobby info
            return null;
        }

        // Used to block user from seeing the lobby until they have enabled autoplay
        // This is achieved when user manually enables autoplay (Firefox), or simply clicks anywhere on the document (other browsers)
        const autoplayWall = isFirefox ? (
            <div id="lobby-autoplay-wall">
                <div id="lobby-autoplay-ff-tutorial">
                    <span class="heading">Welcome!</span>
                    To join the lobby, you must enable autoplay for this website.
                    <br />
                    <img src={ffAutoplayTutorial1} height="125" class="first" alt="Firefox Menu Bar" />
                    <br />
                    <span class="step">
                        <span class="num">1</span>Click this button to the left of the web address on your browser's menu bar.
                    </span>
                    <br />
                    <span class="step">
                        <span class="num">2</span>Change the autoplay setting to "Allow Audio and Video":
                        <br />
                    </span>
                    <img src={ffAutoplayTutorial2} height="55" class="second" alt="Allow Audio and Video" />
                    <br />
                    <br />
                    <span class="step">
                        <span class="num">3</span>
                        <button onClick={() => location.reload()}>
                            <Icon name="refresh1" />
                            Refresh the page
                        </button>
                    </span>
                </div>
            </div>
        ) : (
            <div
                id="lobby-autoplay-wall"
                onClick={() => {
                    this.setState({ canAutoplay: true });
                    socket.emit('get_initial_song');
                }}
            >
                <div id="lobby-autoplay-click-anywhere">
                    <span className="heading">Welcome!</span>Click on the headphones to join the lobby.
                    <Icon name="headphones" />
                </div>
            </div>
        );

        return (
            <div id="lobby">
                <a id="bg-attribution" href="https://www.freepik.com/vectors/underwater">
                    Underwater vector created by brgfx - www.freepik.com
                </a>
                {this.props.isLoggedIn ? <SongsWindow /> : null}
                <LobbyHeader />
                <div id="lobby-body">
                    {this.state.canAutoplay ? null : autoplayWall}
                    <div id="lobby-stage">
                        <LobbySongBox />
                    </div>
                    <LobbySidebar />
                    {/* {this.state.canAutoplay ? (
						<Fragment>
							<div id="lobby-stage">
								<LobbySongBox />
							</div>
							<LobbySidebar />
						</Fragment>
					) : null} */}
                </div>
                <Tooltip
                    id="tt-btn-view-song-queue"
                    place="left"
                    overridePosition={({ left, top }) => {
                        return { left: left + 8, top };
                    }}
                >
                    You have no songs in your queue.
                    <br />
                    Click the{' '}
                    <div className="example-button">
                        <Icon name="plus-circle" />
                    </div>{' '}
                    button next to your songs to queue them.
                </Tooltip>
                <ReactTooltip
                    id="tt-pl-dropdown"
                    place="top"
                    effect="solid"
                    className="tool tip"
                    backgroundColor="var(--color-bg-5)"
                    overridePosition={({ left, top }) => {
                        return { left, top: top + 8 };
                    }}
                    getContent={(data) => {
                        return `Hello there, ${data}!`;
                    }}
                />
                {/* <a data-for="enrich" data-tip="sooooo cute">
                    (❂‿❂)
                </a>
                <a data-for="enrich" data-tip="really high">
                    (❂‿❂)
                </a>
                <ReactTooltip id="enrich" getContent={(dataTip) => `This little buddy is ${dataTip}`} /> */}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        isLoggedIn: selectIsLoggedIn(state),
        userId: selectUserId(state),
        isLobbyLoaded: selectIsLobbyLoaded(state),
        songs: selectSongs(state),
    };
};

export default connect(mapStateToProps, {
    setLobby,
    setLoading,
    setCurrentSong,
    setCurrentSongVotes,
    setUsersInLobby,
    addUserToLobby,
    removeUserFromLobby,
    setLobbyGuests,
    setDJQueue,
    dequeueSong,
    addLobbyMessage,
})(withRouter(Lobby));
