import React, { Component } from 'react';
import './SyncIcon.css';
import classnames from 'classnames';

class SyncIcon extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidUpdate() {
        const { animate } = this.props;
        const { mayStop } = this.state;
        if (animate && !this.state.animate) this.setState({ animate });
    }

    render() {

        const { animate } = this.state;

        return (
            <svg className={classnames("syncIconSVG", {
                "animate": animate
            })}
                onAnimationIterationCapture={() => {
                    if (animate) this.setState({ animate: false });
                }}
                version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 373 502" style={{ "enableBackground": "new 0 0 373 502" }}>
                <path className="syncIconPath0" d="M148,421.35c-77.32,0-140-74.86-140-167.2s62.68-167.2,140-167.2h24" />
                <polyline className="syncIconPath0" points="90.33,6.45 180.26,85.06 118.67,187.4 " />
                <path className="syncIconPath0" d="M224.6,85c77.32,0,140,74.86,140,167.2s-62.68,167.2-140,167.2H203" />
                <polyline className="syncIconPath0" points="291.05,494.73 199.37,418.17 258.63,314.46 " />
            </svg>
        );
    }
}

export default SyncIcon;