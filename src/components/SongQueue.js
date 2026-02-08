import React, { useState, useRef, useEffect, Fragment } from 'react';
import { connect } from 'react-redux';
import { createPortal } from 'react-dom';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';

import SongQueueCard from './SongQueueCard';
import { setSongQueue } from '../actions';
import { selectSongQueue } from '../reducers';

const _dragEl = document.getElementById('draggable-song-queue');

const SongQueue = (props) => {
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
        resizeObserver.current.observe(document.getElementById('song-queue'));
        return () => {
            resizeObserver.current.disconnect();
        };
    });

    const onDragEnd = (result) => {
        if (result.destination) {
            const newItems = Array.from(props.songQueue);
            const [removed] = newItems.splice(result.source.index, 1);
            newItems.splice(result.destination.index, 0, removed);
            props.setSongQueue(newItems);
        }
    };

    function optionalPortal(styles, element) {
        if (styles.position === 'fixed') {
            return createPortal(element, _dragEl);
        }
        return element;
    }

    return (
        <DragDropContext onDragEnd={onDragEnd}>
            <Droppable droppableId="droppable">
                {(provided) => (
                    <Fragment>
                        <div id="song-queue" className="song-list" {...provided.droppableProps} ref={provided.innerRef}>
                            {props.songQueue.map((item, index) => (
                                <Draggable key={item} draggableId={`${item}`} index={index}>
                                    {(provided, snapshot) => {
                                        return (
                                            <div>
                                                {optionalPortal(
                                                    provided.draggableProps.style,
                                                    <SongQueueCard provided={provided} snapshot={snapshot} item={item} small={small} />
                                                )}
                                            </div>
                                        );
                                    }}
                                </Draggable>
                            ))}
                        </div>
                        {provided.placeholder}
                    </Fragment>
                )}
            </Droppable>
        </DragDropContext>
    );
};

const mapStateToProps = (state) => {
    return {
        songQueue: selectSongQueue(state),
    };
};

export default connect(mapStateToProps, { setSongQueue })(SongQueue);
