import React from 'react';

import { Tooltip as ReactTooltip } from 'react-tooltip';

const defaultProps = {
    effect: 'solid',
    // backgroundColor: 'var(--color-primary-light)',
    backgroundColor: 'var(--color-bg-5)',
    // arrowColor: 'red',
};

export default class Tooltip extends React.Component {
    componentDidMount() {
        if (this.props.showInitial) {
            this.showTooltip();
        }
    }

    showTooltip() {
        const tooltip = document.querySelectorAll(`[data-tip][data-for="${this.props.id}"]`)[0];
        ReactTooltip.show(tooltip);
    }

    render() {
        const { children, showInitial, ...props } = this.props;
        if (!children) return null;

        return (
            <ReactTooltip {...defaultProps} {...props} className={`tool tip ${this.props.className ? this.props.className : ''}`}>
                {children}
            </ReactTooltip>
        );
    }
}
