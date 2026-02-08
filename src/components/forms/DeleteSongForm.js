import React from 'react';
import { connect } from 'react-redux';

import { deleteSong } from '../../actions';
import Icon from '../Icon';

class DeleteSongForm extends React.Component {
    handleSubmit = (event) => {
        event.preventDefault();
        this.props.deleteSong(this.props.song.song_id);
        this.props.handleClose();
    };

    render() {
        return (
            <form className="yes-no-dialog" onSubmit={this.handleSubmit}>
                <div className="content">
                    <div className="question">Are you sure you want to delete this song?</div>
                    <div className="subject">
                        {this.props.song.artist} - {this.props.song.title}
                    </div>
                </div>

                <div className="btns">
                    <button className="btn-close" type="button" onClick={this.props.handleClose}>
                        Cancel
                    </button>
                    <button className="btn-submit red" type="submit">
                        <Icon name="trash" />
                        Delete
                    </button>
                </div>
            </form>
        );
    }
}

export default connect(null, { deleteSong })(DeleteSongForm);
