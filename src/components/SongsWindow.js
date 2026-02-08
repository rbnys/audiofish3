import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { Rnd } from 'react-rnd';
import Dropdown from 'react-dropdown';

import socket from '../socket';
import { setModalComponent, fetchPlaylistsAndSongs, setCurrentPlaylist, setSongsFilter, closeSongsWindow, initSongQueue } from '../actions';
import {
    selectCurrentPlaylist,
    selectCurrentPlaylistInfo,
    selectIsSongTableLoading,
    selectPlaylists,
    selectSongQueue,
    selectSongs,
    selectSongsFilter,
    selectSongsWindowIsOpen,
    selectSpecificPlaylistIsBeingViewed,
} from '../reducers';
import Icon from './Icon';
import AddSong from './AddSong';
import SongsTable from './SongsTable';
import SongQueue from './SongQueue';
import PlaylistForm from './forms/PlaylistForm';
import DeletePlaylistForm from './forms/DeletePlaylistForm';

import loadingGif from '../img/loading1.gif';
import { Tooltip as ReactTooltip } from 'react-tooltip';
import PlaylistDropdown from './PlaylistDropdown';

class SongsWindow extends React.Component {
    state = { fullscreen: false, isSongQueueOpen: false };

    // Keeps track of what the size & position of the window were before it was fullscreened
    restoredWindowSize = {
        // e.g. values of 0.5 means it takes up half the width/height of browser window
        widthPercent: 0.75,
        heightPercent: 0.75,
        // These values simply keep track of the current width/height for easy calculation
        width: 0,
        height: 0,
    };
    restoredWindowPosition = {
        // e.g. values of 0.5 means it's centered in the browser window
        xPercent: 0.5,
        yPercent: 0.5,
        // These values simply keep track of the current x/y for easy calculation
        x: 0,
        y: 0,
    };

    componentDidMount() {
        this.updateDimensions();
        window.addEventListener('resize', this.onResizeBrowserWindow);
        window.addEventListener('keydown', this.onKeyDown);
        this.props.fetchPlaylistsAndSongs();

        socket.on('load_song_queue', (res) => {
            const queue = [];

            res.forEach((songId) => {
                queue.push(songId);
            });

            this.props.initSongQueue(queue);
        });

        ReactTooltip.rebuild();
    }

    componentDidUpdate(prevProps) {
        if (prevProps.songQueueLength === 0 && this.props.songQueueLength > 0) {
            this.setState({ isSongQueueOpen: true });
        } else if (prevProps.songQueueLength > 0 && this.props.songQueueLength === 0) {
            this.setState({ isSongQueueOpen: false });
        }
    }

    componentWillUnmount() {
        window.removeEventListener('resize', this.onResizeBrowserWindow);
        socket.off('load_song_queue');
        if (this.resizeObserver) this.resizeObserver.disconnect();
    }

    onResizeBrowserWindow = () => {
        this.updateDimensions();
    };

    onKeyDown = (event) => {
        // Override "ctrl+F" shortcut to search for songs
        if (this.props.songsWindowIsOpen && (event.ctrlKey || event.metaKey) && event.which === 70) {
            event.preventDefault();
            document.getElementById('songs-filter').focus();
        }
    };

    toggleSongQueue = () => {
        const isSongQueueOpen = !this.state.isSongQueueOpen;
        this.setState({ isSongQueueOpen });
    };

    handleChangePlaylist(playlistId) {
        this.props.setCurrentPlaylist(parseInt(playlistId));
        this.props.setSongsFilter('');
    }

    renderPlaylistControlsMenu() {
        const options = [
            {
                value: 'add',
                label: (
                    <Fragment>
                        <Icon name="folder-plus" />
                        New playlist
                    </Fragment>
                ),
                className: 'option option--add',
            },
        ];
        if (this.props.isPlaylistSelected) {
            // If a specific playlist is selected, show other options as well
            options.push(
                {
                    value: 'edit',
                    label: (
                        <Fragment>
                            <Icon name="pencil" />
                            Edit playlist
                        </Fragment>
                    ),
                    className: 'option option--edit',
                },
                {
                    value: 'delete',
                    label: (
                        <Fragment>
                            <Icon name="trash" />
                            Delete playlist
                        </Fragment>
                    ),
                    className: 'option option--delete',
                }
            );
        }

        return (
            <Dropdown
                className="pl-controls-dropdown"
                placeholderClassName="pl-controls-dropdown__placeholder"
                arrowClassName="pl-controls-dropdown__arrow"
                menuClassName="pl-controls-dropdown__menu"
                options={options}
                onChange={(option) => {
                    switch (option.value) {
                        case 'add':
                            setTimeout(() => {
                                this.props.setModalComponent(0, <PlaylistForm isNewPlaylist={true} />);
                            });
                            break;
                        case 'edit':
                            setTimeout(() => {
                                const playlist = this.props.currentPlaylistInfo;
                                if (playlist) {
                                    this.props.setModalComponent(
                                        0,
                                        <PlaylistForm
                                            isNewPlaylist={false}
                                            initialValues={{ playlistId: playlist.playlist_id, name: playlist.name }}
                                        />
                                    );
                                }
                            });
                            break;
                        case 'delete':
                            setTimeout(() => {
                                const playlist = this.props.currentPlaylistInfo;
                                if (playlist) {
                                    this.props.setModalComponent(0, <DeletePlaylistForm playlist={playlist} />);
                                }
                            });
                            break;
                        default:
                    }
                }}
            />
        );
    }

    updateDimensions = (fullscreen = this.state.fullscreen) => {
        // Keep track of actual width/height for easy calculation when resizing
        this.restoredWindowSize.width = this.restoredWindowSize.widthPercent * window.innerWidth;
        this.restoredWindowSize.height = this.restoredWindowSize.heightPercent * window.innerHeight;

        // Keep track of actual x/y values for easy calculation when dragging
        this.restoredWindowPosition.x = this.restoredWindowPosition.xPercent * (window.innerWidth - this.restoredWindowSize.width);
        this.restoredWindowPosition.y = this.restoredWindowPosition.yPercent * (window.innerHeight - this.restoredWindowSize.height);

        // Update the window size & position
        if (fullscreen) {
            this.width = window.innerWidth;
            this.songsWindow.updateSize({ width: window.innerWidth, height: window.innerHeight });
            this.songsWindow.updatePosition({ x: 0, y: 0 });
        } else {
            this.width = this.restoredWindowSize.width;
            this.songsWindow.updateSize(this.restoredWindowSize);
            this.songsWindow.updatePosition(this.restoredWindowPosition);
        }

        // Update state to re-render window if necessary
        if (fullscreen != this.state.fullscreen) {
            this.setState({ fullscreen });
        }
    };

    toggleFullscreen = () => {
        this.updateDimensions(!this.state.fullscreen);
        ReactTooltip.rebuild();
    };

    updateRestoredWindowPercentages() {
        const { width, height } = this.restoredWindowSize;
        const { x, y } = this.restoredWindowPosition;

        this.restoredWindowSize.widthPercent = width / window.innerWidth;
        this.restoredWindowSize.heightPercent = height / window.innerHeight;

        this.restoredWindowPosition.xPercent = x / (window.innerWidth - width) || 0;
        this.restoredWindowPosition.yPercent = y / (window.innerHeight - height) || 0;
    }

    onResizeStop = (_event, _direction, ref, _delta, position) => {
        const width = parseInt(ref.style.width);
        const height = parseInt(ref.style.height);

        this.restoredWindowSize.width = width;
        this.restoredWindowSize.height = height;

        this.restoredWindowPosition.x = Math.max(position.x, 0);
        this.restoredWindowPosition.y = Math.max(position.y, 0);

        this.updateRestoredWindowPercentages();

        ReactTooltip.rebuild();
    };

    onDragStop = (_event, data) => {
        const { width, height } = this.restoredWindowSize;

        this.restoredWindowPosition.x = Math.max(data.x, 0);
        this.restoredWindowPosition.y = Math.max(data.y, 0);

        this.updateRestoredWindowPercentages();

        ReactTooltip.rebuild();
    };

    preventWindowDrag(event) {
        event.stopPropagation();
    }

    showAddSongModal() {
        this.props.setModalComponent(0, <AddSong />);
    }

    renderWindowContent() {
        if (this.props.playlists.length) {
            return (
                <Fragment>
                    <div className="song-list-header" onMouseDown={this.preventWindowDrag}>
                        <PlaylistDropdown onChange={(id) => this.handleChangePlaylist(id)} showAllOption defaultToCurrent />
                        {this.renderPlaylistControlsMenu()}
                        <button className="btn-add-song" onClick={() => this.showAddSongModal()}>
                            <Icon name="plus" />
                            Add Songs
                        </button>
                        <input
                            id="songs-filter"
                            className="search"
                            type="search"
                            placeholder="Search..."
                            size={8}
                            value={this.props.songsFilter}
                            onChange={(e) => this.props.setSongsFilter(e.target.value)}
                            onKeyDown={(e) => {
                                if (e.key === 'Escape') this.props.setSongsFilter('');
                            }}
                        />
                        <div
                            id="btn-view-song-queue-wrapper"
                            data-tip
                            data-tip-disable={!!this.props.songQueueLength}
                            data-for="tt-btn-view-song-queue"
                        >
                            <button
                                id="btn-view-song-queue"
                                className={this.state.isSongQueueOpen ? 'open' : ''}
                                onClick={() => this.toggleSongQueue()}
                                disabled={!this.props.songQueueLength}
                            >
                                <div id="btn-view-song-queue__text">
                                    <Icon name="music" />
                                    Queue
                                </div>
                            </button>
                        </div>
                    </div>

                    <div className="content" onMouseDown={this.preventWindowDrag}>
                        <div
                            id="song-collection-container"
                            className="song-list-container"
                            style={this.state.isSongQueueOpen ? { flexBasis: '50%' } : { flexBasis: '100%' }}
                        >
                            <SongsTable />
                        </div>
                        <div
                            id="song-queue-container"
                            className={`song-list-container ${this.state.isSongQueueOpen ? 'open' : ''}`}
                            style={this.state.isSongQueueOpen ? { flexBasis: '50%' } : { flexBasis: '0%' }}
                        >
                            <SongQueue />
                        </div>
                    </div>
                </Fragment>
            );
        } else {
            return (
                <div className="songs-window__no-playlists" onMouseDown={this.preventWindowDrag}>
                    <button
                        className="songs-window__no-playlists__btn-create"
                        onClick={() => this.props.setModalComponent(0, <PlaylistForm isNewPlaylist={true} />)}
                    >
                        <Icon name="folder-plus" />
                        Create your First Playlist!
                    </button>
                </div>
            );
        }
    }

    render() {
        const restoreOrMaximizeButton = this.state.fullscreen ? (
            <div className={`songs-window__header__controls__restore`} onClick={this.toggleFullscreen}>
                <Icon name="window-restore" />
            </div>
        ) : (
            <div className={`songs-window__header__controls__maximize`} onClick={this.toggleFullscreen}>
                <Icon name="window-maximize" />
            </div>
        );

        return (
            <Rnd
                ref={(c) => {
                    this.songsWindow = c;
                }}
                className={`songs-window ${this.props.songsWindowIsOpen ? '' : 'closed'}`}
                bounds="window"
                onResizeStart={this.onResizeStart}
                onResizeStop={this.onResizeStop}
                onDragStop={this.onDragStop}
                enableResizing={!this.state.fullscreen}
                disableDragging={this.state.fullscreen}
                minWidth={880}
                minHeight={350}
            >
                <div
                    className={`songs-window-content-wrapper ${this.props.songsWindowIsOpen ? '' : 'closed'} ${
                        this.props.isSongTableLoading ? 'loading' : ''
                    }`}
                >
                    {this.props.isSongTableLoading ? (
                        <div id="loading-song-table" onMouseDown={this.preventWindowDrag}>
                            <img src={loadingGif} alt="Loading..." />
                        </div>
                    ) : null}

                    <div className="songs-window__header">
                        <span className="songs-window__header__title">My Music</span>
                        <div className="songs-window__header__controls" onMouseDown={this.preventWindowDrag}>
                            {restoreOrMaximizeButton}
                            <div className="songs-window__header__controls__close" onClick={this.props.closeSongsWindow}>
                                <Icon name="cancel3" />
                            </div>
                        </div>
                    </div>

                    {this.renderWindowContent()}
                </div>
            </Rnd>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        songs: selectSongs(state),
        playlists: selectPlaylists(state),
        isPlaylistSelected: selectSpecificPlaylistIsBeingViewed(state),
        currentPlaylist: selectCurrentPlaylist(state),
        currentPlaylistInfo: selectCurrentPlaylistInfo(state),
        songsFilter: selectSongsFilter(state),
        songsWindowIsOpen: selectSongsWindowIsOpen(state),
        songQueueLength: selectSongQueue(state).length,
        isSongTableLoading: selectIsSongTableLoading(state),
    };
};

export default connect(mapStateToProps, {
    setModalComponent,
    fetchPlaylistsAndSongs,
    setCurrentPlaylist,
    setSongsFilter,
    closeSongsWindow,
    initSongQueue,
    setSongsFilter,
})(SongsWindow);
