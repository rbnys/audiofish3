import React from 'react';
import { connect } from 'react-redux';

import SongForm from './forms/SongForm';
import { selectCurrentPlaylist, selectPlaylists } from '../reducers';

class GrabSong extends React.Component {
    render() {
        const { song } = this.props;

        return (
            <SongForm
                onSubmit={this.props.onSubmit}
                handleClose={this.props.handleClose}
                initialValues={{
                    songId: song.song_id,
                    playlist: this.props.playlists.length === 1 ? this.props.playlists[0].playlist_id : this.props.currentPlaylist,
                    videoId: song.yt_id,
                    length: song.length,
                    title: song.title,
                    artist: song.artist,
                }}
                isNewSong={true}
                isGrabbing={true}
            />
        );
    }
}

const mapStateToProps = (state) => {
    return {
        playlists: selectPlaylists(state),
        currentPlaylist: selectCurrentPlaylist(state),
    };
};

export default connect(mapStateToProps, {})(GrabSong);
