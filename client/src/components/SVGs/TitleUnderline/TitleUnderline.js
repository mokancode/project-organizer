import React, { Component } from 'react';
import './TitleUnderline.css';
import TitleUnderlineSVG from './TitleUnderlineSVG';

class TitleUnderline extends Component {
    render() {

        const { mWidth } = this.props;

        return (
            <div className="titleUnderline">
                <TitleUnderlineSVG mWidth={mWidth} />
                <div className="dot"></div>
                <TitleUnderlineSVG mWidth={mWidth} />
            </div>
        );
    }
}

export default TitleUnderline;