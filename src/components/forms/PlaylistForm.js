import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import { reduxForm, Field } from 'redux-form';

import Icon from '../Icon';
import { createPlaylist, editPlaylist } from '../../actions';
import { selectPlaylists } from '../../reducers';

class PlaylistForm extends React.Component {
    renderInput = ({ input, label, type, meta, maxLength }) => {
        if (type === 'hidden') {
            return <input {...input} type={type} />;
        }

        const inputClassName = `input ${meta.error && meta.touched ? 'error' : ''}`;
        const errorMessage = meta.error && meta.touched ? <div className="error-msg">{meta.error}</div> : null;

        return (
            <div className="field">
                <label className="label">{label}</label>
                <input className={inputClassName} {...input} type={type} autoComplete="off" autoFocus={true} maxLength={maxLength} />
                {errorMessage}
            </div>
        );
    };

    onSubmit = (values) => {
        if (this.props.isNewPlaylist) {
            this.props.createPlaylist(values, !this.props.dontSwitchToNewPlaylist);
        } else {
            this.props.editPlaylist(values);
        }
        this.props.handleClose();
    };

    render() {
        const submitButtonContent = this.props.isNewPlaylist ? (
            <Fragment>
                <Icon name="plus" /> Create Playlist
            </Fragment>
        ) : (
            <Fragment>
                <Icon name="pencil" /> Edit Playlist
            </Fragment>
        );

        return (
            <form className="playlist-form" onSubmit={this.props.handleSubmit(this.onSubmit)}>
                <div className="fields">
                    <Field name="name" type="text" label="Playlist Name:" maxLength="24" component={this.renderInput} />
                    <Field name="playlistId" type="hidden" component={this.renderInput} />
                </div>

                <div className="btns">
                    <button className="btn-close" type="button" onClick={this.props.goBack || this.props.handleClose}>
                        Cancel
                    </button>
                    <button className="btn-submit" type="submit">
                        {submitButtonContent}
                    </button>
                </div>
            </form>
        );
    }
}

const validate = (values, props) => {
    const errors = {};

    if (props.isNewPlaylist && props.playlists.find(({ name }) => name === values.name)) {
        errors.name = 'You already have a playlist with that name!';
    }

    if (!values.name) {
        errors.name = 'Your playlist must have a name.';
    } else if (values.name.length > 24) {
        errors.name = 'Playlist name must not exceed 24 characters.';
    }

    return errors;
};

const mapStateToProps = (state) => {
    return {
        playlists: selectPlaylists(state),
    };
};

export default connect(mapStateToProps, { createPlaylist, editPlaylist })(
    reduxForm({
        form: 'playlistForm',
        enableReinitialize: true,
        validate,
    })(PlaylistForm)
);
