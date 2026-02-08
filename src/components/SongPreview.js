import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import ReactPlayer from 'react-player';

import { mute, unmute } from '../actions';

class SongPreview extends React.Component {
    componentDidMount() {
        this.props.mute(); // Mute the song that's currently playing while previewing song
    }

    componentWillUnmount() {
        this.props.unmute(); // When user stops previewing a song, resume audio of song currently being played
    }

    render() {
        const { handleClose, song, type } = this.props;

        let content = null;

        switch (type) {
            case 'yt':
                content = (
                    <ReactPlayer url={`https://www.youtube.com/watch?v=${song.id.videoId || song.id}`} playing={true} controls={true} />
                );
                break;
            default:
                content = <ReactPlayer url={`https://www.youtube.com/watch?v=${song.yt_id}`} playing={true} controls={true} />;
        }

        return (
            <Fragment>
                {content}
                <div className="btns">
                    <button className="btn-close" onClick={handleClose}>
                        Close
                    </button>
                </div>
            </Fragment>
        );
    }
}

export default connect(null, { mute, unmute })(SongPreview);
