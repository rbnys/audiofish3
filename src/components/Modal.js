import React, { Fragment, useRef } from 'react';

const Modal = (props) => {
    const { handleClose, z } = props;

    const ref = useRef();

    const onOverlayClick = (event) => {
        if (!ref.current.contains(event.target)) {
            handleClose();
        }
    };

    return (
        <Fragment>
            <div
                className="modal-overlay"
                style={{ zIndex: 20 + z * 2 }}
                onClick={onOverlayClick}
                onMouseDown={(e) => e.preventDefault()}
            />
            <div className="modal-wrapper" style={{ zIndex: 20 + z * 2 + 1 }}>
                <div className="modal" ref={ref}>
                    {React.cloneElement(props.children, { handleClose })}
                </div>
            </div>
        </Fragment>
    );
};

export default Modal;
