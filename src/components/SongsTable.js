import React, { useEffect, useRef, useState } from 'react';
import { connect } from 'react-redux';
import _ from 'lodash';

import { selectSongQueue, selectSongsFilter, selectSongsFromCurrentPlaylist } from '../reducers';
import SongDetails from './SongDetails';
import { AutoSizer } from 'react-virtualized-auto-sizer';
import { List } from 'react-window';

const SongsTable = (props) => {
    let filteredSongs = [];

    const ref = useRef(null);

    const [small, setSmall] = useState(false); // Reformat the layout if window is small
    const resizeObserver = useRef(null);

    useEffect(() => {
        resizeObserver.current = new ResizeObserver((songTable) => {
            if (songTable && songTable.length) {
                const width = songTable[0].target.offsetWidth;
                if (width < 560 && !small) {
                    setSmall(true);
                } else if (width >= 580 && small) {
                    setSmall(false);
                }
            }
        });
        resizeObserver.current.observe(document.getElementById('song-collection-container'));
        return () => {
            resizeObserver.current.disconnect();
        };
    });

    useEffect(() => {
        if (ref.current) ref.current.scrollTo(0);
    }, [/*props.songs,*/ props.songsFilter]);

    const Row = ({ index, style, songs, small }) => {
        const song = songs[index];
        // const queuePosition = props.songQueue.indexOf(song.song_id) + 1;

        if (!song) {
            return null;
        }

        return <SongDetails key={song.song_id} song={song} /*queued={queuePosition}*/ style={style} small={small} />;
    };

    const filters = props.songsFilter.match(/[^ ]+/g);
    filteredSongs = [];

    props.songs.forEach((song) => {
        if (props.songQueue.indexOf(song.song_id) < 0) {
            if (filters) {
                let match = true;

                filters.forEach((term) => {
                    if (term && !song.title.toLowerCase().includes(term) && !song.artist.toLowerCase().includes(term)) {
                        match = false;
                        return;
                    }
                });

                if (match) {
                    filteredSongs.push(song);
                }
            } else {
                filteredSongs.push(song);
            }
        }
    });

    // const filters = props.songsFilter.toLowerCase().split(' ');
    // filteredSongs = [];

    // props.songs.forEach((song, i) => {
    // 	let match = true;

    // 	console.log(filters);
    // 	if (!filters.length && props.songQueue.indexOf(song.song_id) >= 0) {
    // 		match = false;
    // 	}

    // 	filters.forEach((term) => {
    // 		if (term && !song.title.toLowerCase().includes(term) && !song.artist.toLowerCase().includes(term)) {
    // 			match = false;
    // 			return;
    // 		}
    // 	});

    // 	if (match) {
    // 		filteredSongs.push(song);
    // 	}
    // });

    // console.log("props.songs", props.songs);
    // function SongListChildComponent({ height = 300, width = 300 }) {
    //     console.log(props);
    //     console.log(filteredSongs);
    //     return (
    //         <List
    //             id="song-collection"
    //             className="song-list"
    //             width={width}
    //             height={height}
    //             itemSize={62}
    //             itemCount={filteredSongs.length}
    //             overscanCount={4}
    //             initialScrollOffset={0}
    //             itemData={props.songs}
    //         >
    //             {Row}
    //         </List>
    //     );
    // }

    console.log("props.songs", props.songs);
    if (props.songs.length === 0 || filteredSongs.length === 0) {
        return (
            <div id="song-collection" className="song-list empty">
                <h2>No songs in this playlist yet!</h2>
            </div>
        );
    }
    return (
        <AutoSizer
            key={props.songs}
            renderProp={({ width, height = 100 }) => (
                <List
                    id="song-collection"
                    className="song-list"
                    style={{ height, width }}
                    rowComponent={Row}
                    rowCount={filteredSongs.length}
                    rowHeight={62}
                    rowProps={{ songs: filteredSongs, small }}
                    overscanCount={4}
                    listRef={ref}
                />
            )}
        />
    );
};

const mapStateToProps = (state) => {
    return {
        songs: selectSongsFromCurrentPlaylist(state),
        songsFilter: selectSongsFilter(state),
        songQueue: selectSongQueue(state),
    };
};

export default connect(mapStateToProps, {})(SongsTable);
