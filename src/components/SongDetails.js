import React from 'react';
import { connect } from 'react-redux';

import { setModalComponent, queueSong, editSong, moveSongUp, moveSongDown } from '../actions';
import Icon from './Icon';
import SongPreview from './SongPreview';
import SongForm from './forms/SongForm';
import Song from '../classes/Song';
import { selectSongQueue } from '../reducers';
import DeleteSongForm from './forms/DeleteSongForm';

const SongDetails = (props) => {
    const { song, style, small } = props;

    const previewSong = () => {
        props.setModalComponent(0, <SongPreview song={song} />);
    };

    const handleEditSongSubmit = (values) => {
        props.editSong(song, values);
    };
    const showEditSongModal = () => {
        const modalContent = (
            <SongForm
                onSubmit={handleEditSongSubmit}
                initialValues={{
                    playlist: song.playlist_id,
                    videoId: song.yt_id,
                    length: song.length,
                    title: song.title,
                    artist: song.artist,
                }}
                isNewSong={false}
            />
        );
        props.setModalComponent(0, modalContent);
    };

    const showDeleteSongModal = () => {
        props.setModalComponent(0, <DeleteSongForm song={song} />);
    };

    const titleCellStyle = small ? { flexGrow: '1', flexShrink: '1', flexBasis: '100%', paddingRight: '2.4rem' } : {};
    const titleTextStyle = small ? { marginRight: '0' } : {};
    const artistCellStyle = small ? { flexBasis: '0%', marginRight: '0' } : {};

    const queued = props.songQueue.indexOf(song.song_id) + 1;

    return (
        <div className={`row ${queued ? 'queued' : ''}`} style={style} title={`${song.artist} - ${song.title}`}>
            <div className="cell cell-btn">
                {queued ? (
                    <div className="queued-position">{queued}</div>
                ) : (
                    <button className="btn-queue-song" onClick={() => props.queueSong(song)} title="">
                        <span className="text">Queue</span>
                        <Icon name="plus-circle" />
                    </button>
                )}
            </div>
            <div className="cell cell-btn">
                <div
                    className="thumbnail"
                    title="Preview"
                    style={{ backgroundImage: `url(http://i.ytimg.com/vi/${song.yt_id}/default.jpg)` }}
                >
                    <button className="preview" onClick={previewSong}>
                        <Icon name="youtube" />
                    </button>
                </div>
            </div>
            <div className="cell cell-title" style={titleCellStyle}>
                <span className="title" style={titleTextStyle}>
                    {song.title}
                </span>
                <div className="controls">
                    <Icon
                        className="icon-edit"
                        name="pencil"
                        onClick={() => {
                            showEditSongModal();
                        }}
                    />
                    <Icon
                        className="icon-up"
                        name="arrow-bold-up"
                        onClick={() => {
                            props.moveSongUp(song);
                        }}
                    />
                    <Icon
                        className="icon-down"
                        name="arrow-bold-down"
                        onClick={() => {
                            props.moveSongDown(song);
                        }}
                    />
                    <Icon
                        className="icon-delete"
                        name="trash"
                        onClick={() => {
                            showDeleteSongModal();
                        }}
                    />
                </div>
            </div>
            <div className="cell cell-artist" style={artistCellStyle}>
                <span className="artist">{song.artist}</span>
            </div>
            <div className="cell">
                <span className="length">{Song.readableLength(song)}</span>
            </div>
        </div>
    );
};

const mapStateToProps = (state) => {
    return {
        songQueue: selectSongQueue(state),
    };
};

export default connect(mapStateToProps, { setModalComponent, queueSong, editSong, moveSongUp, moveSongDown })(SongDetails);
