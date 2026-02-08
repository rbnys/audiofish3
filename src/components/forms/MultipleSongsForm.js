import React from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';

import Icon from '../Icon';
import PlaylistForm from './PlaylistForm';
import { selectPlaylists } from '../../reducers';
import { setModalComponent } from '../../actions';
import PlaylistDropdown from '../PlaylistDropdown';

class SongForm extends React.Component {
    renderHiddenInput = ({ input, type }) => {
        return <input {...input} type={type} />;
    };

    renderPlaylistSelector = ({ input, label, meta }) => {
        return (
            <div className="field">
                <label className="label">{label}</label>
                <div className="input playlist">
                    <PlaylistDropdown onChange={(id) => input.onChange(id)} value={input.value} error={meta.error && meta.touched} />
                    <button
                        className="btn-create-playlist"
                        onClick={() => this.props.setModalComponent(1, <PlaylistForm isNewPlaylist={true} />)}
                        type="button"
                    ></button>
                </div>
                <input {...input} type="hidden" />
            </div>
        );
    };

    onSubmit = (values) => {
        this.props.onSubmit(values);
        this.props.handleClose();
    };

    render() {
        return (
            <form className="song-form multiple-songs" onSubmit={this.props.handleSubmit(this.onSubmit)}>
                <div className="heading">You will be importing all of the videos from this YouTube playlist:</div>
                <div className="title">{this.props.playlistTitle}</div>

                <div className="fields">
                    <Field
                        name="playlist"
                        label={`Add these ${this.props.playlistItemCount} songs to:`}
                        component={this.renderPlaylistSelector}
                        data-playlists={this.props.playlists.length}
                    />
                    <Field name="ytPlaylistId" type="hidden" component={this.renderHiddenInput} />
                    <Field name="ytPlaylistItemCount" type="hidden" component={this.renderHiddenInput} />
                </div>

                <div className="btns">
                    <button className="btn-close" type="button" onClick={this.props.goBack || this.props.handleClose}>
                        <Icon name="chevron-small-left" /> Back
                    </button>
                    <button className="btn-submit" type="submit">
                        <Icon name="plus" /> Import Playlist
                    </button>
                </div>
            </form>
        );
    }
}

const validate = (values, props) => {
    const errors = {};

    if (props.playlists.find(({ playlist_id }) => playlist_id === values.playlist) === undefined) {
        errors.playlist = 'Please select a playlist.';
    }

    return errors;
};

const mapStateToProps = (state) => {
    return {
        playlists: selectPlaylists(state),
    };
};

export default connect(mapStateToProps, { setModalComponent })(
    reduxForm({
        form: 'songForm',
        enableReinitialize: true,
        validate,
    })(SongForm)
);
