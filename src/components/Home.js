import React, { Fragment } from 'react';
import { connect } from 'react-redux';

import socket from '../socket';
import Icon from './Icon';
import LobbyHeader from './LobbyHeader';
import SongsWindow from './SongsWindow';
import LobbyForm from './forms/LobbyForm';
import LogInOrSignUp from './LogInOrSignUp';
import { setLoading, setModalComponent } from '../actions';
import { selectIsLoggedIn, selectUserId } from '../reducers';

import placeholderImage from '../img/uyuyuy99.png';
import songPlayingGif from '../img/song_playing.gif';

import { faker } from '@faker-js/faker';

class Home extends React.Component {
    state = {
        searchTerm: '',
    };

    componentDidMount() {
        this.props.setLoading(false);
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

    getFakeThumbnail = (index) => {
        if (index % 3 === 0) {
            return "https://i3.ytimg.com/vi/DPGOe4O_tJg/maxresdefault.jpg";
        } if (index % 3 === 1) {
            return "https://i3.ytimg.com/vi/pwHuEDCM7xs/hqdefault.jpg";
        }
        return "https://i3.ytimg.com/vi/fB63ztKnGvo/maxresdefault.jpg";
    }

    renderLobbies() {
        const lobbyComponents = [];

        for (let i = 0; i < 10; i++) {
            lobbyComponents.push(
                <div className="item" key={i}>
                    <div className="lobby-icon" style={{ backgroundImage: `url('${this.getFakeThumbnail(i)}')` }}></div>
                    <div className="content">
                        <div className="header">
                            <div className="title-and-song">
                                <div className="title">The Big Pig's Lobby {i}</div>
                                <div className="song">
                                    <img src={songPlayingGif} alt="" />
                                    Darude - Sandstorm (Official Video)
                                </div>
                            </div>
                            <div className="user-stats">
                                <div className="online-count">
                                    <div className="icon-online" />3 online
                                </div>
                                <div className="dj-count">
                                    <Icon name="disk" />2 DJ's
                                </div>
                            </div>
                        </div>
                        <div className="body">
                            <div className="tags">
                                <span className="tag">Rock</span>
                                <span className="tag">Pop</span>
                                <span className="tag">Rap/Hip Hop</span>
                            </div>
                            <div className="description">{faker.lorem.paragraphs(Math.floor(Math.random() * 5) + 1, '\r\n\r\n')}</div>
                        </div>
                    </div>
                </div>
            );
        }

        return lobbyComponents;
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
