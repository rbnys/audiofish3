import Icon from './Icon';

const ErrorModal = (props) => {
    return (
        <div className="error">
            <div className="header">
                Sorry!
                <Icon className="icon-error" name="emoji-sad" />
            </div>
            <div className="text">{props.message}</div>
            <button className="btn-x" onClick={props.handleClose}>
                <Icon name="cancel3" />
            </button>
        </div>
    );
};

export default ErrorModal;
