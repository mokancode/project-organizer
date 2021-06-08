import React, { Component } from 'react';

class TitleUnderlineSVG extends Component {
    constructor(props) {
        super(props);
        this.state = {};

        this.underlineWrapperRef = React.createRef();
        this.underlineSVGRef = React.createRef();
    }

    render() {

        const { mWidth } = this.props;

        return (
            <div className="titleUnderlineSVGWrapper" ref={this.underlineWrapperRef}>
                <svg className="titleUnderlineSVG" version="1.1" x="0px" y="0px" viewBox="0 0 333 25" preserveAspectRatio="none"
                    style={{ "enableBackground": "new 0 0 333 25", width: `${mWidth}px` }}>

                    <defs>
                        <radialGradient id="titleUnderlineRadialGradient">
                            <stop offset="10%" stopColor="var(--color-stop-1)" />
                            <stop offset="95%" stopColor="var(--color-stop-2)" />
                        </radialGradient>

                        {/* <linearGradient id="titleUnderlineRadialGradient" gradientTransform="rotate(90)">
                            <stop offset="5%" stopColor="gold" />
                            <stop offset="95%" stopColor="red" />
                        </linearGradient> */}
                    </defs>

                    <path className="titleUnderlinePath0" d="M0.5,12.59c0,0,243-0.09,305.53,10.41c12.29,2.06,25.47-2.38,25.47-6.99V9.18c0-4.61-8-10.68-25.47-6.99
                    C288.11,5.97,0.5,12.59,0.5,12.59z"/>
                </svg>
            </div>
        );
    }
}

export default TitleUnderlineSVG;