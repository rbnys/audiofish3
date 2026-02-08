import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';

import Icon from '../Icon';
import PlaylistForm from './PlaylistForm';
import { selectPlaylists } from '../../reducers';
import { setModalComponent } from '../../actions';
import PlaylistDropdown from '../PlaylistDropdown';

class SongForm extends React.Component {
    renderInput = ({ input, label, type, meta }) => {
        if (type === 'hidden') {
            return <input {...input} type={type} />;
        }

        const inputClassName = `input ${meta.error ? 'error' : ''}`;
        // const autoComplete = input.name === "artist" ? "on" : "off";
        const errorMessage = meta.error ? <div className="error-msg">{meta.error}</div> : null;

        return (
            <div className="field">
                <label className="label">{label}</label>
                <input className={inputClassName} {...input} type={type} autoComplete="off" />
                {errorMessage}
            </div>
        );
    };

    renderPlaylistSelector = ({ input, label, meta }) => {
        return (
            <div className="field">
                <label className="label">{label}</label>
                <div className="input playlist">
                    <PlaylistDropdown onChange={(id) => input.onChange(id)} value={input.value} error={meta.error && meta.touched} />
                    <button
                        className="btn-create-playlist"
                        onClick={() =>
                            this.props.setModalComponent(
                                1,
                                <PlaylistForm isNewPlaylist={true} dontSwitchToNewPlaylist={!this.props.isNewSong} />
                            )
                        }
                        type="button"
                    ></button>
                </div>
                {/* <div className="input">
                        <button
                            className={`btn-create-playlist ${errorClassName}`}
                            onClick={() => this.props.setModalComponent(1, <PlaylistForm isNewPlaylist={true} />)}
                        >
                            <Icon name="folder-plus" />
                            New Playlist
                        </button>
                    </div> */}
                <input {...input} type="hidden" />
            </div>
        );
    };

    renderCancelButtonContent() {
        if (this.props.isNewSong && !this.props.isGrabbing) {
            return (
                <Fragment>
                    <Icon name="chevron-small-left" /> Back
                </Fragment>
            );
        } else {
            return 'Cancel';
        }
    }

    renderSubmitButtonContent() {
        if (this.props.isNewSong) {
            if (this.props.isGrabbing) {
                return (
                    <Fragment>
                        <Icon name="plus" /> Add Song
                    </Fragment>
                );
            } else {
                return (
                    <Fragment>
                        <Icon name="plus" /> Add Song
                    </Fragment>
                );
            }
        } else {
            return (
                <Fragment>
                    <Icon name="pencil" /> Edit Song
                </Fragment>
            );
        }
    }

    onSubmit = (values) => {
        this.props.onSubmit(values);
        this.props.handleClose();
    };

    render() {
        return (
            <form className="song-form" onSubmit={this.props.handleSubmit(this.onSubmit)}>
                <div className="fields">
                    <Field
                        name="playlist"
                        label="Playlist:"
                        component={this.renderPlaylistSelector}
                        data-playlists={this.props.playlists.length}
                    />
                    <Field name="title" type="text" label="Song Title:" component={this.renderInput} />
                    <Field name="artist" type="text" label="Artist:" component={this.renderInput} />
                    <Field name="videoId" type="hidden" component={this.renderInput} />
                    <Field name="length" type="hidden" component={this.renderInput} />
                    <Field name="songId" type="hidden" component={this.renderInput} />
                </div>

                <div className="btns">
                    <button className="btn-close" type="button" onClick={this.props.goBack || this.props.handleClose}>
                        {this.renderCancelButtonContent()}
                    </button>
                    <button className="btn-submit" type="submit">
                        {this.renderSubmitButtonContent()}
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

    if (!values.title) {
        errors.title = 'Please enter a song title.';
    } else if (values.title.length > 100) {
        errors.title = 'Song title must not exceed 100 characters.';
    }

    if (values.artist && values.artist.length > 100) {
        errors.artist = 'Artist name cannot exceed 100 characters.';
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
