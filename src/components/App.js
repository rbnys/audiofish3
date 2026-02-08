import React from 'react';
import { connect } from 'react-redux';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import Modal from './Modal';
import Lobby from './Lobby';
import { setModalComponent, fetchPlaylistsAndSongs } from '../actions';
import { selectIsLoading, selectModalComponents } from '../reducers';

import loadingGif from '../img/loading1.gif';
import Home from './Home';

const App = (props) => {
    // Auto-refresh
    if (module.hot) {
        module.hot.accept();
    }

    const renderModals = () => {
        return props.modalComponents.map((modalComponent, i) => {
            if (!modalComponent) {
                return null;
            }
            return (
                <Modal key={i} z={i} handleClose={() => props.setModalComponent(i, null)}>
                    {modalComponent}
                </Modal>
            );
        });
    };

    return (
        <Router>
            <div className={`page-loading opaque ${props.isLoading ? '' : 'disabled'}`}>
                <img src={loadingGif} alt="Loading..." />
            </div>
            {renderModals()}
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/:lobby" element={<Lobby />} />
            </Routes>
        </Router>
    );
};

const mapStateToProps = (state) => {
    return {
        isLoading: selectIsLoading(state),
        modalComponents: selectModalComponents(state),
    };
};

export default connect(mapStateToProps, { setModalComponent, fetchPlaylistsAndSongs })(App);
