import loadingGif from '../img/loading1.gif';

const Loading = (props) => {
    return (
        <div className={`page-loading ${props.opaque ? 'opaque' : ''}`}>
            <img src={loadingGif} alt="Loading..." />
        </div>
    );
};

export default Loading;
