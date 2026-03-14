import React from 'react';
import { connect } from 'react-redux';

import socket from '../socket';
import Icon from './Icon';
import LobbyHeader from './LobbyHeader';
import SongsWindow from './SongsWindow';
import LobbyForm from './forms/LobbyForm';
import LogInOrSignUp from './LogInOrSignUp';
import { setLoading, setModalComponent } from '../actions';
import { selectIsLoggedIn, selectUserId } from '../reducers';

import placeholderImage from '../img/lobby_placeholder.png';
import songPlayingGif from '../img/song_playing.gif';

class Home extends React.Component {
    state = {
        searchTerm: '',
        lobbies: [],
    };

    componentDidMount() {
        this.props.setLoading(false);

        socket.on('ready_to_join_lobby', () => {
            socket.emit('get_home_lobbies');
        });

        socket.on('home_lobbies', (lobbies) => {
            this.setState({ lobbies: Array.isArray(lobbies) ? lobbies : [] });
        });

        socket.emit('get_home_lobbies');
    }

    componentWillUnmount() {
        socket.off('ready_to_join_lobby');
        socket.off('home_lobbies');
    }

    // resizeAllGridItems = () => {
    //     const allItems = document.querySelectorAll('#home__body__lobbies__list > .item');
    //     console.log(allItems);

    //     for (let i = 0; i < allItems.length; i++) {
    //         this.resizeGridItem(allItems[i]);
    //     }
    // };

    // resizeGridItem = (item) => {
    //     const grid = document.getElementById('home__body__lobbies__list');
    //     const rowHeight = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-auto-rows'));
    //     const rowGap = parseInt(window.getComputedStyle(grid).getPropertyValue('grid-row-gap'));
    //     const rowSpan = Math.ceil((item.querySelector('.content').getBoundingClientRect().height + rowGap) / (rowHeight + rowGap));
    //     item.style.gridRowEnd = 'span ' + rowSpan;
    // };

    showEditSongModal = () => {
        const modalContent = this.props.isLoggedIn ? (<LobbyForm />) : (<LogInOrSignUp />);
        this.props.setModalComponent(0, modalContent);
    };

    goToLobby = (pathname) => {
        if (!pathname) {
            return;
        }

        const normalizedPath = String(pathname).replace(/^\/+/, '');
        window.location.href = `/${normalizedPath}`;
    };

    onLobbyCardKeyDown = (event, pathname) => {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.goToLobby(pathname);
        }
    };

    getThumbnailUrl = (song) => {
        if (!song || !song.yt_id) {
            return placeholderImage;
        }

        return `https://i3.ytimg.com/vi/${song.yt_id}/hqdefault.jpg`;
    };

    getSongLabel = (song) => {
        if (!song) {
            return 'No song currently playing';
        }

        return `${song.artist || 'Unknown Artist'} - ${song.title || 'Unknown Song'}`;
    };

    renderLobbies() {
        const filteredLobbies = this.state.lobbies.filter((lobby) => {
            if (!this.state.searchTerm) {
                return true;
            }

            const query = this.state.searchTerm.toLowerCase();
            const searchableText = [lobby.name, lobby.description, ...(lobby.tags || [])].join(' ').toLowerCase();
            return searchableText.includes(query);
        });

        if (!filteredLobbies.length) {
            return <div className="item">No public lobbies found.</div>;
        }

        return filteredLobbies.map((lobby) => {
            const tags = Array.isArray(lobby.tags) ? lobby.tags : [];
            const currentSong = lobby.currentSong || null;

            return (
                <div
                    className="item"
                    key={lobby.pathname}
                    role="button"
                    tabIndex={0}
                    onClick={() => this.goToLobby(lobby.pathname)}
                    onKeyDown={(event) => this.onLobbyCardKeyDown(event, lobby.pathname)}
                >
                    <div className="lobby-icon" style={{ backgroundImage: `url('${this.getThumbnailUrl(currentSong)}')` }}></div>
                    <div className="content">
                        <div className="header">
                            <div className="title-and-song">
                                <div className="title">{lobby.name}</div>
                                <div className="song">
                                    {currentSong ? <img src={songPlayingGif} alt="Now playing" /> : null}
                                    {this.getSongLabel(currentSong)}
                                </div>
                            </div>
                            <div className="user-stats">
                                <div className="online-count">
                                    <div className="icon-online" />
                                    {lobby.onlineCount || 0} online
                                </div>
                                <div className="dj-count">
                                    <Icon name="disk" />
                                    {(lobby.djQueue || []).length} DJ's
                                </div>
                            </div>
                        </div>
                        <div className="body">
                            <div className="tags">
                                {tags.length
                                    ? tags.map((tag) => (
                                          <span className="tag" key={`${lobby.pathname}-${tag}`}>
                                              {tag}
                                          </span>
                                      ))
                                    : <span className="tag">No tags</span>}
                            </div>
                            <div className="description">{lobby.description || 'No description provided.'}</div>
                        </div>
                    </div>
                </div>
            );
        });
    }

    render() {
        return (
            <div id="home">
                <div id="home__header">
                    {this.props.isLoggedIn ? <SongsWindow /> : null}
                    <LobbyHeader hideLobbyMeta />
                </div>
                <div id="home__body">
                    <div id="home__body__fish">
                        <div id="home__body__fish__title">
                            Audio<small>.</small>Fish
                            <div id="home__body__fish__subtitle">
                                Play music with your friends &amp; everyone around the world.
                                <br />
                                Join a lobby below, or create your own!
                            </div>
                        </div>
                        <div id="home__body__fish__addlobby">
                            <button className="btn-add-lobby" onClick={this.showEditSongModal}>
                                <Icon name="plus" />
                                Create Your Lobby
                            </button>
                        </div>
                    </div>
                    <div id="home__body__lobbies">
                        <div id="home__body__lobbies__search">
                            <input
                                type="search"
                                placeholder="Search for lobbies"
                                value={this.state.searchTerm}
                                onChange={(e) => this.setState({ searchTerm: e.target.value })}
                            />
                        </div>
                        <div id="home__body__lobbies__list">{this.renderLobbies()}</div>
                    </div>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        isLoggedIn: selectIsLoggedIn(state),
        userId: selectUserId(state),
    };
};

export default connect(mapStateToProps, {
    setLoading,
    setModalComponent,
})(Home);
