import React from 'react';

import { Tooltip as ReactTooltip } from 'react-tooltip';

export default class Tooltip extends React.Component {
    render() {
        const { children, showInitial, className, ...props } = this.props;
        if (!children) return null;

        return (
            <ReactTooltip
                {...props}
                className={`tool tip ${className || ''}`}
                style={{ backgroundColor: 'var(--color-bg-5)' }}
                render={() => children}
                {...(showInitial ? { isOpen: true } : {})}
            />
        );
    }
}
