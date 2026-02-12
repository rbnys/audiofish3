import React, { createRef, Fragment } from 'react';
import { connect } from 'react-redux';
import Dropdown from 'react-dropdown';
import axios from 'axios';

import serverIP from '../server';
import ErrorModal from './ErrorModal';
import { setModalComponent, addSong, addSongsFromYoutubePlaylist } from '../actions';
import SongPreview from './SongPreview';
import SongForm from './forms/SongForm';
import Icon from './Icon';
import Loading from './Loading';
import { selectAuthHeader, selectCurrentPlaylist, selectPlaylists } from '../reducers';
import MultipleSongsForm from './forms/MultipleSongsForm';
import { parseYoutubeVideoIdFromURL, parseYoutubePlaylistIdFromURL, readableTime } from '../classes/Util';

class AddSong extends React.Component {
    state = {
        searchTerm: '',
        searchType: 'video',
        videos: [],
        playlists: [],
        videoSelected: null,
        playlistSelected: null,
        loading: false,
    };

    textInputRef = createRef();

    onSearchSubmit = (event) => {
        event.preventDefault();

        this.setState({ loading: true });

        if (this.state.searchType === 'video') {
            axios
                .post(`${serverIP}/youtube/search-videos`, { query: this.state.searchTerm }, this.props.authHeader)
                .then((res) => {
                    // console.log(res.data.videos);
                    if (res.data.videos) {
                        this.setState({ videos: res.data.videos });
                    }
                })
                .catch((err) => console.error(err))
                .finally(() => this.setState({ loading: false }));
        } else if (this.state.searchType === 'playlist') {
            axios
                .post(`${serverIP}/youtube/search-playlists`, { query: this.state.searchTerm }, this.props.authHeader)
                .then((res) => {
                    console.log(res.data.playlists);
                    if (res.data.playlists) {
                        this.setState({ playlists: res.data.playlists });
                        res.data.playlists.forEach((pl) => {
                            console.log(pl.id.length);
                        });
                    }
                })
                .catch((err) => console.error(err))
                .finally(() => this.setState({ loading: false }));
        }
    };

    selectVideo = (video) => {
        this.setState({ videoSelected: video });
    };

    selectPlaylist = async (playlist) => {
        this.setState({ playlistSelected: playlist });
    };

    onSearchTermChange = (event) => {
        this.setState({ searchTerm: event.target.value });
    };

    parseURLForId = (event) => {
        const url = (event.clipboardData || window.clipboardData).getData('text');

        // If the user pasted a video/playlist URL, immediately load the video/playlist without searching
        if (this.state.searchType === 'video') {
            const videoId = parseYoutubeVideoIdFromURL(url);

            if (videoId) {
                event.preventDefault();
                this.setState({ loading: true });

                axios
                    .post(`${serverIP}/youtube/video-from-id`, { videoId }, this.props.authHeader)
                    .then((res) => {
                        if (res.data.video) {
                            this.setState({ videoSelected: res.data.video });
                        } else {
                            this.props.setModalComponent(
                                2,
                                <ErrorModal
                                    message="The video you provided could not be found. 
										Double-check the URL you pasted and make sure the video isn't set to private."
                                />
                            );
                        }
                    })
                    .catch((err) => console.error(err))
                    .finally(() => this.setState({ loading: false }));
            }
        } else if (this.state.searchType === 'playlist') {
            const playlistId = parseYoutubePlaylistIdFromURL(url);

            if (playlistId) {
                event.preventDefault();
                this.setState({ loading: true });

                axios
                    .post(`${serverIP}/youtube/playlist-from-id`, { playlistId }, this.props.authHeader)
                    .then((res) => {
                        if (res.data.playlist) {
                            this.setState({ playlistSelected: res.data.playlist });
                        } else {
                            this.props.setModalComponent(
                                2,
                                <ErrorModal
                                    message="The playlist you provided could not be found. 
										Double-check the URL you pasted and make sure the playlist isn't set to private."
                                />
                            );
                        }
                    })
                    .catch((err) => console.error(err))
                    .finally(() => this.setState({ loading: false }));
            }
        }
    };

    renderSearchTypeDropdown() {
        const options = [
            { value: 'video', label: 'Videos' },
            { value: 'playlist', label: 'Playlists' },
        ];

        return (
            <Dropdown
                className="pl-or-video-dropdown"
                placeholderClassName="pl-or-video-dropdown__placeholder"
                options={options}
                value={this.state.searchType}
                onChange={(option) => {
                    if (this.state.searchType !== option.value) {
                        this.setState({ searchType: option.value, searchTerm: '', videos: [], playlists: [] });
                    }

                    setTimeout(() => {
                        if (this.textInputRef.current) this.textInputRef.current.focus();
                    });
                }}
            />
        );
    }

    renderSearchResults() {
        if (this.state.searchType === 'video') {
            // if (this.state.videos.length === 0) {
            //     return null;
            // }
            return (
                <div className={`results ${this.state.videos.length === 0 ? 'closed' : ''}`}>
                    <div className="song-list">
                        {this.state.videos.map((video) => {
                            return (
                                <div className="row" title={video.snippet.title} key={video.id}>
                                    <div className="cell cell-btn">
                                        <div
                                            className="thumbnail"
                                            title="Preview"
                                            style={{ backgroundImage: `url(${video.snippet.thumbnails.default.url})` }}
                                        >
                                            <button
                                                className="preview"
                                                onClick={() => this.props.setModalComponent(1, <SongPreview song={video} type="yt" />)}
                                            >
                                                <Icon name="youtube" />
                                            </button>
                                        </div>
                                    </div>
                                    <div className="cell cell-title">
                                        <span className="title">{video.snippet.title}</span>
                                    </div>
                                    <div className="cell">
                                        <span className="length">{readableTime(video.duration)}</span>
                                        <button className="btn-add" onClick={() => this.selectVideo(video)}>
                                            <Icon name="plus" />
                                            Add Song
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        } else if (this.state.searchType === 'playlist') {
            // if (this.state.playlists.length === 0) {
            //     return null;
            // }
            return (
                <div className={`results ${this.state.playlists.length === 0 ? 'closed' : ''}`}>
                    <div className="song-list">
                        {this.state.playlists.map((playlist) => {
                            return (
                                <div className="row" title={playlist.snippet.title} key={playlist.id}>
                                    <div className="cell cell-btn">
                                        <div
                                            className="thumbnail"
                                            style={{ backgroundImage: `url(${playlist.snippet.thumbnails.default.url})` }}
                                        />
                                    </div>
                                    <div className="cell cell-title">
                                        <span className="title">{playlist.snippet.title}</span>
                                    </div>
                                    <div className="cell">
                                        <span className="count">
                                            {playlist.contentDetails.itemCount} <span className="count__text">videos</span>
                                        </span>
                                        <button className="btn-add" onClick={() => this.selectPlaylist(playlist)}>
                                            <Icon name="plus" />
                                            Import Playlist
                                        </button>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            );
        }
    }

    handleSubmit = (values) => {
        this.props.addSong(values);
    };

    handleSubmitMultiple = (values) => {
        this.props.addSongsFromYoutubePlaylist(values);
    };

    // When the "back" button on the next page is pressed, return to search results
    goBack = () => {
        this.setState({ videoSelected: null, playlistSelected: null });
    };

    render() {
        // If user has selected a video already, show form to edit song details
        if (this.state.videoSelected) {
            let title = this.state.videoSelected.snippet.title;
            let artist = '';

            title = title.split(' - ');
            if (title.length === 1) title = title[0].split(' -- ');
            if (title.length === 1) title = title[0].split('- ');

            if (title.length === 1) {
                title = title[0];
            } else {
                [artist, ...title] = title;
                title = title.join(' - ');
            }

            if (artist.length === 0) {
                artist = this.state.videoSelected.snippet.channelTitle;
            }

            return (
                <div>
                    <SongForm
                        onSubmit={this.handleSubmit}
                        initialValues={{
                            playlist: this.props.playlists.length === 1 ? this.props.playlists[0].playlist_id : this.props.currentPlaylist,
                            videoId: this.state.videoSelected.id,
                            length: this.state.videoSelected.duration,
                            title,
                            artist,
                        }}
                        goBack={this.goBack}
                        handleClose={this.props.handleClose}
                        isNewSong={true}
                    />
                </div>
            );
        }

        // If user has selected a playlist, show form to add all the songs from that playlist
        if (this.state.playlistSelected) {
            return (
                <div>
                    <MultipleSongsForm
                        onSubmit={this.handleSubmitMultiple}
                        initialValues={{
                            playlist: this.props.playlists.length === 1 ? this.props.playlists[0].playlist_id : this.props.currentPlaylist,
                            ytPlaylistId: this.state.playlistSelected.id,
                            ytPlaylistItemCount: this.state.playlistSelected.contentDetails.itemCount,
                            // videoIdList: this.state.playlistSelected.join(','),
                        }}
                        playlistTitle={this.state.playlistSelected.snippet.title}
                        playlistItemCount={this.state.playlistSelected.contentDetails.itemCount}
                        goBack={this.goBack}
                        handleClose={this.props.handleClose}
                    />
                </div>
            );
        }

        // Else, let user search for videos
        return (
            <Fragment>
                <div className="add-song">
                    <form onSubmit={(e) => this.onSearchSubmit(e)}>
                        {this.renderSearchTypeDropdown()}
                        <input
                            ref={this.textInputRef}
                            placeholder="Search YouTube or paste URL..."
                            type="text"
                            value={this.state.searchTerm}
                            onChange={(e) => this.onSearchTermChange(e)}
                            onPaste={(e) => this.parseURLForId(e)}
                            autoFocus
                        />
                        <button type="submit">
                            <Icon name="search" />
                            Search
                        </button>
                    </form>
                    {this.renderSearchResults()}
                </div>
                <div className="btns">
                    <button className="btn-close" onClick={this.props.handleClose}>
                        Cancel
                    </button>
                </div>
                {this.state.loading ? <Loading /> : null}
            </Fragment>
        );
    }
}

const mapStateToProps = (state) => {
    return {
        playlists: selectPlaylists(state),
        currentPlaylist: selectCurrentPlaylist(state),
        authHeader: { headers: selectAuthHeader(state) },
    };
};

export default connect(mapStateToProps, { setModalComponent, addSong, addSongsFromYoutubePlaylist })(AddSong);
