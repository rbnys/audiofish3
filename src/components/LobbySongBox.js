import React from 'react';
import { connect } from 'react-redux';
import ReactPlayer from 'react-player';
import ReactSlider from 'react-slider';
import Marquee from 'react-fast-marquee';

import songPlayingGif from '../img/song_playing.gif';

import Song from '../classes/Song';
import { setModalComponent, openSongsWindow, setVolume, addSong } from '../actions';
import {
    selectCurrentSong,
    selectCurrentSongUpvotes,
    selectCurrentSongDownvotes,
    selectCurrentSongGrabs,
    selectIsMuted,
    selectVolume,
    selectUserId,
    selectIsLoggedIn,
    selectPlaylists,
    selectCurrentPlaylist,
    selectUserById,
} from '../reducers';
import socket from '../socket';
import Icon from './Icon';
import SongForm from './forms/SongForm';
import GrabSong from './GrabSong';

class LobbySongBox extends React.Component {
    state = { songEnded: false, marqueeSongTitle: null, progress: 0, progressSecs: 0 };

    componentDidUpdate(prevProps) {
        if (this.props.currentSong && prevProps.currentSong !== this.props.currentSong) {
            // If song has changed, see if song artist + title is too long and needs to be marquee'd
            const songTitleEl = document.getElementById('song-info__title');

            if (songTitleEl.offsetWidth < songTitleEl.scrollWidth) {
                this.setState({ marqueeSongTitle: this.props.currentSong.song_id });
            } else {
                this.setState({ marqueeSongTitle: null });
            }
        }
    }

    handleGrabSongSubmit = (values) => {
        this.props.addSong(values);
        this.props.openSongsWindow();

        if (this.props.currentSong && this.props.currentSong.song_id === values.songId) {
            socket.emit('grab_song');
        }
    };

    grabSong = () => {
        if (this.props.currentSong) {
            this.props.setModalComponent(0, <GrabSong song={this.props.currentSong} onSubmit={this.handleGrabSongSubmit} />);
        }
    };

    upvoteSong = () => {
        socket.emit('upvote_song');
    };

    downvoteSong = () => {
        socket.emit('downvote_song');
    };

    renderThumb = (props) => {
        const { key, ...restProps } = props;
        return <div key={key} {...restProps} />;
    };

    renderVolumeSlider() {
        if (!this.props.currentSong) {
            return null;
        }
        return (
            <div id="player-volume">
                <div id="player-volume__icon-wrapper">{this.renderVolumeIcon()}</div>
                <ReactSlider
                    className="slider"
                    thumbClassName="slider__thumb"
                    trackClassName="slider__track"
                    renderThumb={this.renderThumb}
                    orientation="vertical"
                    invert
                    onChange={(v) => this.props.setVolume(v)}
                    defaultValue={this.props.volume}
                />
            </div>
        );
    }
    renderVolumeIcon() {
        if (this.props.volume > 66) {
            return <Icon name="volume-high" />;
        }
        if (this.props.volume > 33) {
            return <Icon name="volume-medium" />;
        }
        if (this.props.volume > 0) {
            return <Icon name="volume-low" />;
        }
        return <Icon name="volume-mute2" />;
    }

    renderVoteButtons() {
        if (!this.props.currentSong) {
            return null;
        }

        const { upvotes, downvotes, grabs, iveUpvoted, iveDownvoted, iveGrabbed, imTheDJ } = this.props;

        return (
            <div id="player-votes-wrapper">
                <div id="player-votes">
                    <button id="player-votes__grab" onClick={this.grabSong} disabled={imTheDJ || iveGrabbed}>
                        <div className={`icon-box ${iveGrabbed ? 'pressed' : ''}`}>
                            <Icon name={iveGrabbed || imTheDJ ? 'star-full' : 'star-empty'} />
                        </div>
                        <div className={`count ${grabs ? 'nonzero' : ''}`}>{grabs}</div>
                    </button>
                    <button id="player-votes__up" onClick={this.upvoteSong} disabled={imTheDJ || iveUpvoted}>
                        <div className={`icon-box ${iveUpvoted ? 'pressed' : ''}`}>
                            <Icon name="thumbs-up" />
                        </div>
                        <div className={`count ${upvotes ? 'nonzero' : ''}`}>{upvotes}</div>
                    </button>
                    <button id="player-votes__down" onClick={this.downvoteSong} disabled={imTheDJ || iveDownvoted}>
                        <div className={`icon-box ${iveDownvoted ? 'pressed' : ''}`}>
                            <Icon name="thumbs-down" />
                        </div>
                        <div className={`count ${downvotes ? 'nonzero' : ''}`}>{downvotes}</div>
                    </button>
                </div>
            </div>
        );
    }

    renderSongInfo() {
        const song = this.props.currentSong;
        const dj = this.props.currentDJ;

        if (song === null) return <div id="song-info" />;

        const titleEl =
            this.state.marqueeSongTitle === song.song_id ? (
                <div id="song-info__title" className="extended">
                    <Marquee className="marquee" gradient={false} speed={30} delay={5}>
                        <div id="song-info__title__marquee-padding-front" />
                        {song.artist} - {song.title}
                        <div id="song-info__title__marquee-padding-back" />
                    </Marquee>
                </div>
            ) : (
                <div id="song-info__title">
                    {song.artist} - {song.title}
                </div>
            );

        const timeEl = this.state.songEnded ? null : (
            <div id="song-info__time-and-dj">
                <div id="song-info__time-and-dj__dj">
                    current dj: <span className="username">{dj ? dj.username : null}</span>
                </div>
                <div id="song-info__time-and-dj__time">
                    <Icon name="clock" /> {Song.readableLengthLeft(song, this.state.progressSecs)}
                </div>
            </div>
        );

        return (
            <div id="song-info">
                <img id="song-info__record" src={songPlayingGif} alt="" />
                {titleEl}
                {timeEl}
            </div>
        );
    }

    renderPlayer() {
        if (!this.props.currentSong) {
            return null;
        }
        return (
            <ReactPlayer
                id="player"
                ref={(player) => (this.player = player)}
                src={`https://www.youtube.com/watch?v=${this.props.currentSong.yt_id}`}
                playing={true}
                volume={this.props.volume / 100}
                width="560px"
                height="315px"
                config={{
                    youtube: {
                        playerVars: {
                            modestBranding: 1,
                            start: 0,
                        },
                    },
                }}
                onReady={(player) => {
                    if (this.props.currentSong.startSecs) {
                        player.seekTo(this.props.currentSong.startSecs + 1, 'seconds');
                    } else {
                        player.seekTo(0, 'seconds');
                    }
                }}
                onStart={() => this.setState({ songEnded: false })}
                onEnded={() => this.setState({ songEnded: true })}
                progressInterval={33}
                onProgress={(progress) => this.setState({ progress: progress.played, progressSecs: progress.playedSeconds })}
            />
        );
    }

    renderPlayerOverlay() {
        const content =
            this.props.currentSong && !this.state.songEnded ? (
                <div id="song-progress-bar" style={{ width: `${Math.ceil(this.state.progress * 560)}px` }} />
            ) : null;

        if (!this.props.currentSong) {
            return (
                <div id="player-overlay" className="dark">
                    {content}
                </div>
            );
        } else if (this.state.songEnded) {
            return (
                <div id="player-overlay" className="dark loading">
                    {content}
                </div>
            );
        } else {
            return <div id="player-overlay">{content}</div>;
        }
    }

    render() {
        return (
            <div id="lobby-song-box">
                {this.renderVolumeSlider()}
                <div id="player-wrapper">
                    {this.renderPlayer()}
                    {this.renderPlayerOverlay()}
                </div>
                {this.renderVoteButtons()}
                {this.renderSongInfo()}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    const isLoggedIn = selectIsLoggedIn(state);
    const userId = selectUserId(state);
    const currentSong = selectCurrentSong(state);
    const upvotes = selectCurrentSongUpvotes(state);
    const downvotes = selectCurrentSongDownvotes(state);
    const grabs = selectCurrentSongGrabs(state);

    return {
        currentSong,
        currentDJ: currentSong ? selectUserById(state, currentSong.user_id) : null,
        imTheDJ: currentSong && isLoggedIn && userId === currentSong.user_id,
        upvotes: upvotes.length,
        downvotes: downvotes.length,
        grabs: grabs.length,
        iveUpvoted: isLoggedIn && upvotes.includes(userId),
        iveDownvoted: isLoggedIn && downvotes.includes(userId),
        iveGrabbed: isLoggedIn && grabs.includes(userId),
        volume: selectIsMuted(state) ? 0 : selectVolume(state),
        playlists: selectPlaylists(state),
        currentPlaylist: selectCurrentPlaylist(state),
    };
};

export default connect(mapStateToProps, { setModalComponent, openSongsWindow, setVolume, addSong })(LobbySongBox);
