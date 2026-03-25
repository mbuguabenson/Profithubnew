import React from 'react';
import PropTypes from 'prop-types';
import ErrorComponent from './index';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false };
    }

    componentDidCatch = (error, info) => {
        if (window.TrackJS) window.TrackJS.console.log(this.props.root_store);

        // Handle ChunkLoadError - often caused by redeployments
        if (error.name === 'ChunkLoadError' || (error.message && error.message.includes('Loading chunk'))) {
            const has_reloaded = sessionStorage.getItem('chunk_load_error_reload');
            if (!has_reloaded) {
                sessionStorage.setItem('chunk_load_error_reload', 'true');
                window.location.reload();
                return;
            }
        }

        this.setState({
            hasError: true,
            error,
            info,
        });

        // Clear the reload flag if we've successfully reached this point after a reload
        // or if it was another error
        setTimeout(() => sessionStorage.removeItem('chunk_load_error_reload'), 5000);
    };
    render = () => (this.state.hasError ? <ErrorComponent should_show_refresh={true} /> : this.props.children);
}

ErrorBoundary.propTypes = {
    root_store: PropTypes.object,
    children: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
};

export default ErrorBoundary;
