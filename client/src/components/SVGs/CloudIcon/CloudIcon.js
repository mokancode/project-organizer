import React, { Component } from 'react';
import './CloudIcon.css';
import classnames from 'classnames';
import { connect } from 'react-redux';

class CloudIcon extends Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    componentDidUpdate() {
        if (this.props.styles.animateCloudIcon && !this.state.animate) this.setState({ animate: true });
        if (!this.props.styles.animateCloudIcon && this.state.animate) this.setState({ animate: false });
    }

    render() {

        const { animate } = this.state;

        return (
            <svg className={classnames("cloudIconSVG", {
                "animate": animate
            })} version="1.1" id="Layer_1" x="0px" y="0px" viewBox="0 0 775 481" style={{ "enableBackground": "new 0 0 775 481" }}>
                <path className="cloudIconPath0" d="M192.5,456.5c-92.78,0-168-49.96-168-133.91s75.22-133.91,168-133.91C192.5,87.23,278.95,24,411.5,24
	s210,97.62,210,199.06H621c71.24,0,129,52.26,129,116.72S692.24,456.5,621,456.5H192"/>
                <g>
                    <line className="cloudIconPath1" x1="396" y1="146" x2="298" y2="281" />
                    <line className="cloudIconPath1" x1="496" y1="281" x2="396" y2="146" />
                    <line className="cloudIconPath1" x1="396" y1="146" x2="396" y2="386" />
                </g>
            </svg>
        );
    }
}

function mapStateToProps(state) {
    return {
        styles: state.styles
    }
}

export default connect(mapStateToProps, {})(CloudIcon);