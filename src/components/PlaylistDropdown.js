import { Fragment } from 'react';
import { connect } from 'react-redux';
import Dropdown from 'react-dropdown';
import _ from 'lodash';

import { selectCurrentPlaylist, selectNumSongsInEachPlaylist, selectPlaylists } from '../reducers';

const PlaylistDropdown = (props) => {
    const options = props.playlists.map((playlist) => {
        return {
            value: playlist.playlist_id,
            label: (
                <Fragment>
                    {playlist.name}
                    <span className="count">{(props.numSongsInEach[playlist.playlist_id] || 0).toLocaleString()}</span>
                </Fragment>
            ),
            className: 'pl-dropdown__item',
        };
    });

    if (props.showAllOption) {
        const total = _.sum(Object.values(props.numSongsInEach)).toLocaleString();

        options.unshift({
            value: -1,
            label: (
                <Fragment>
                    {`🎵  All Songs `}
                    <span className="count">{total}</span>
                </Fragment>
            ),
            className: 'pl-dropdown__item all',
        });
    }

    let currentSelection;

    if (props.defaultToCurrent) {
        currentSelection = options.find(({ value }) => value === props.currentPlaylist);
    } else if (options.length === 1) {
        currentSelection = options[0];
    } else if (props.value !== undefined) {
        currentSelection = options.find(({ value }) => value === props.value);
    }

    return (
        <Dropdown
            className="pl-dropdown"
            placeholderClassName={`pl-dropdown__placeholder ${currentSelection && currentSelection.value === -1 ? 'all' : ''} ${
                props.error ? 'error' : ''
            }`}
            menuClassName="pl-dropdown__menu"
            options={options}
            value={currentSelection}
            onChange={(option) => props.onChange(option.value)}
            disabled={!props.playlists.length}
        />
    );
};

const mapStateToProps = (state) => {
    return {
        playlists: selectPlaylists(state),
        currentPlaylist: selectCurrentPlaylist(state),
        numSongsInEach: selectNumSongsInEachPlaylist(state),
    };
};

export default connect(mapStateToProps, {})(PlaylistDropdown);
