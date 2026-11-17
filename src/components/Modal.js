import React, { Fragment, useEffect, useRef } from 'react';

let openModalCount = 0;
let previousBodyOverflow = '';
let previousHtmlOverflow = '';

const lockPageScroll = () => {
    openModalCount += 1;

    if (openModalCount === 1) {
        previousBodyOverflow = document.body.style.overflow;
        previousHtmlOverflow = document.documentElement.style.overflow;

        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
    }
};

const unlockPageScroll = () => {
    openModalCount -= 1;

    if (openModalCount <= 0) {
        openModalCount = 0;
        document.body.style.overflow = previousBodyOverflow;
        document.documentElement.style.overflow = previousHtmlOverflow;
    }
};

const Modal = (props) => {
    const { handleClose, z } = props;

    const ref = useRef();

    useEffect(() => {
        lockPageScroll();
        return unlockPageScroll;
    }, []);

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
