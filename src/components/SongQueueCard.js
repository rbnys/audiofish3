import { connect } from 'react-redux';

import { setModalComponent, dequeueSong } from '../actions';
import { selectSongs } from '../reducers';
import Icon from './Icon';
import SongPreview from './SongPreview';
import Song from '../classes/Song';

const SongQueueCard = (props) => {
    const { provided, snapshot, small } = props;

    const songId = props.item;
    const song = props.songs.find((s) => s.song_id === songId);

    const titleCellStyle = small ? { flexGrow: '1', flexShrink: '1', flexBasis: '100%', paddingRight: '2.4rem' } : {};
    const titleTextStyle = small ? { marginRight: '0' } : {};
    const artistCellStyle = small ? { flexBasis: '0%' } : {};

    return (
        <div
            className="row"
            ref={provided.innerRef}
            snapshot={snapshot}
            {...provided.draggableProps}
            {...provided.dragHandleProps}
            title={`${song.artist} - ${song.title}`}
        >
            <div className="cell cell-btn">
                <div
                    className="thumbnail"
                    title="Preview"
                    style={{ backgroundImage: `url(http://i.ytimg.com/vi/${song.yt_id}/default.jpg)` }}
                >
                    <button
                        className="preview"
                        title="Preview song"
                        draggable={true}
                        onDragStart={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                        }}
                        onClick={() => {
                            props.setModalComponent(0, <SongPreview song={song} />);
                        }}
                    >
                        <Icon name="youtube" />
                    </button>
                </div>
            </div>
            <div className="cell cell-title" style={titleCellStyle}>
                <span className="title" style={titleTextStyle}>
                    {song.title}
                </span>
            </div>
            <div className="cell cell-artist" style={artistCellStyle}>
                <span className="artist">{song.artist}</span>
            </div>
            <div className="cell">
                <span className="length">{Song.readableLength(song)}</span>
                <button
                    className="btn-remove"
                    draggable={true}
                    onDragStart={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                    }}
                    onClick={() => {
                        props.dequeueSong(song);
                    }}
                >
                    <Icon className="icon-remove" name="cancel4" />
                    <Icon className="icon-remove-hover" name="cancel5" />
                </button>
            </div>
        </div>
    );
};

const mapStateToProps = (state) => {
    return {
        songs: selectSongs(state),
    };
};

export default connect(mapStateToProps, { setModalComponent, dequeueSong })(SongQueueCard);

//////////////////////////////////////////////
//////////////////////////////////////////////
//////////////////////////////////////////////

// import { connect } from 'react-redux';
// import { selectSongs } from '../reducers';

// const __SongQueueCard = (props) => {
// 	const { dnd } = props;

// 	const songId = props.item;
// 	const song = props.songs.find((s) => s.song_id === songId);

// 	const titleCellStyle = {};
// 	const titleTextStyle = {};
// 	const artistCellStyle = {};

// 	return (
// 		<div
// 			style={{ ...dnd.item.styles, ...dnd.handler.styles }}
// 			className={`${dnd.item.classes} row`}
// 			ref={dnd.item.ref}
// 			{...dnd.handler.listeners}
// 		>
// 			<div className="cell cell-btn">
// 				<div
// 					className="thumbnail"
// 					title="Preview"
// 					style={{ backgroundImage: `url(http://i.ytimg.com/vi/${song.yt_id}/default.jpg)` }}
// 				>
// 					<button
// 						className="preview"
// 						draggable={true}
// 						onDragStart={(e) => {
// 							e.preventDefault();
// 							e.stopPropagation();
// 						}}
// 						onClick={() => {
// 							props.setModalComponent(0, <SongPreview song={song} />);
// 						}}
// 					/>
// 				</div>
// 			</div>
// 			<div className="cell cell-title" style={titleCellStyle}>
// 				<span className="title" style={titleTextStyle}>
// 					{song.title}
// 				</span>
// 			</div>
// 			<div className="cell cell-artist" style={artistCellStyle}>
// 				<span className="artist">{song.artist}</span>
// 			</div>
// 			<div className="cell">
// 				<span className="length">{song.length}</span>
// 				<button
// 					className="btn-remove"
// 					draggable={true}
// 					onDragStart={(e) => {
// 						e.preventDefault();
// 						e.stopPropagation();
// 					}}
// 					onClick={() => {
// 						props.dequeueSong(song);
// 					}}
// 				>
// 					&#128473;&#xFE0E;
// 				</button>
// 			</div>
// 		</div>
// 	);
// };

// const mapStateToProps = (state) => {
// 	return {
// 		songs: selectSongs(state)
// 	};
// };

// export default connect(mapStateToProps, {})(__SongQueueCard);
