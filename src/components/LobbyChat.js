import React, { Fragment } from 'react';
import { connect } from 'react-redux';
import TimeAgo from 'react-timeago';

import socket from '../socket';
import Icon from './Icon';
import { addLobbyMessage } from '../actions';
import { selectIsLoggedIn, selectLobbyMessages, selectUserById } from '../reducers';

class LobbyChat extends React.Component {
    state = {
        currentText: '',
        chats: [],
    };

    componentDidMount() {
        // socket.on('lobby_message', () => {
        //     this.scrollToBottom();
        // });
        this.scrollToBottom('auto');
    }

    componentDidUpdate(prevProps) {
        if (prevProps.messageComponents !== this.props.messageComponents) {
            this.scrollToBottom();
        }
    }

    componentWillUnmount() {
        // socket.off('lobby_message');
    }

    scrollToBottom = (behavior = 'smooth') => {
        if (this.endOfChats) this.endOfChats.scrollIntoView({ behavior });
    };

    handleSubmitChat = (event) => {
        event.preventDefault();
        socket.emit('lobby_chat', this.state.currentText);
        this.setState({ currentText: '' });
    };

    render() {
        return (
            <div id="lobby-chat">
                <div id="lobby-chat__list">
                    {this.props.messageComponents}
                    <div
                        ref={(el) => {
                            this.endOfChats = el;
                        }}
                    />
                </div>
                {this.props.isLoggedIn ? (
                    <form id="lobby-chat__form" onSubmit={this.handleSubmitChat}>
                        <input
                            type="text"
                            name="chat"
                            placeholder="Click to join the conversation..."
                            maxLength="255"
                            autoComplete="off"
                            value={this.state.currentText}
                            onChange={(e) => this.setState({ currentText: e.target.value })}
                        />
                        <button type="submit" disabled={!this.state.currentText}>
                            <Icon name="paper-plane" />
                        </button>
                    </form>
                ) : null}
            </div>
        );
    }
}

const mapStateToProps = (state) => {
    function chatTimeFormatter(value, unit) {
        switch (unit) {
            case 'second':
                return 'now';
            case 'minute':
                return `${value}m`;
            case 'hour':
                return `${value}h`;
            case 'day':
                return `${value}d`;
            case 'week':
                return `${value}w`;
            default:
                return '';
        }
    }

    function combineChatLines(lines) {
        return lines.map((line, i) => {
            const isLast = lines.length === i + 1;
            return isLast ? (
                line.text
            ) : (
                <Fragment key={i}>
                    {line.text}
                    <br />
                </Fragment>
            );
        });
    }

    const messageComponents = selectLobbyMessages(state).map((msg, i) => {
        const user = selectUserById(state, msg.userId);

        return (
            <div className="chat" key={i}>
                <div className="header">
                    <span className="username">{user ? user.username : null}</span>
                    <span className="time">
                        <TimeAgo date={msg.lines[0].time} formatter={chatTimeFormatter} />
                    </span>
                </div>
                <span className="text">{combineChatLines(msg.lines)}</span>
            </div>
        );
    });

    return {
        isLoggedIn: selectIsLoggedIn(state),
        messageComponents,
    };
};

export default connect(mapStateToProps, { addLobbyMessage })(LobbyChat);
