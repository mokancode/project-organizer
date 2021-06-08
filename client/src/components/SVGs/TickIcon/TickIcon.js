import React, { Component } from 'react'
import classnames from 'classnames';
import './TickIcon.css';

export class TickIcon extends Component {
    constructor(props) {
        super(props);
        
        this.state={};
    }
    
    render() {
        
        const {isClickable}=this.props;
        
        return (
            <svg className={classnames("tickIconSVG", {
                "tickIconSVGClickable": isClickable
            })} version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
            viewBox="0 0 458.04 396.77" style={{"enableBackground":"new 0 0 458.04 396.77"}} xmlSpace="preserve">
            <path className="tickIconPath0" d="M376.09,26.04h56.68c0,0-186.13,187.66-250.47,351.57c0,0-46.72-117.96-155.49-182.3h76.6
            c0,0,47.34,32.8,78.13,60.51c3.57,3.22,35.23-58.54,79.66-112.6C311.97,81.44,376.09,26.04,376.09,26.04z"/>
            </svg>
            )
        }
    }
    
    export default TickIcon;