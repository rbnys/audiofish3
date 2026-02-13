import React, { Fragment } from 'react';
import { connect } from 'react-redux';

import socket from '../socket';
import Icon from './Icon';
import { setLoading } from '../actions';

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

    renderLobbies() {
        const lobbyComponents = [];

        for (let i = 0; i < 10; i++) {
            lobbyComponents.push(
                <div className="item" key={i}>
                    <img className="lobby-icon" src={faker.image.avatar()} width="256" height="256" alt="" />
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
                <div id="home__header">header</div>
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

export default connect(null, { setLoading })(Home);
