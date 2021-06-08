import React, { Component } from 'react'
import './TrashcanIcon.css';

export class TrashcanIcon extends Component {
    render() {
        return (
            <svg className="trashcanIconSVG" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlnsXlink="http://www.w3.org/1999/xlink" x="0px" y="0px"
            viewBox="0 0 595.28 841.89" style={{"enableBackground":"new 0 0 595.28 841.89"}} xmlSpace="preserve">
            <g id="Layer_1">
            <path className="trashcanIconPath0" d="M400.79,796H195.51c-37,0-89.87-40.15-89.87-77.15L71,333.5c0-10.22,8.28-18.5,18.5-18.5h414
            c10.22,0,18.5,8.28,18.5,18.5L474.32,726C474.32,754.44,429.23,796,400.79,796z"/>
            </g>
            <g id="cap">
            <path className="trashcanIconPath1" d="M244.5,253.53v-17.51c0-8.82,7.15-15.96,15.96-15.96h83.07c8.82,0,15.96,7.15,15.96,15.96v16.99"/>
            <path className="trashcanIconPath1" d="M515,305.53H78c-14.36,0-26-11.64-26-26v0c0-14.36,11.64-26,26-26h437c14.36,0,26,11.64,26,26v0
            C541,293.89,529.36,305.53,515,305.53z"/>
            </g>
            <g id="canLines">
            <line className="trashcanIconPath0" x1="147.9" y1="338.94" x2="195.51" y2="700.47"/>
            <line className="trashcanIconPath0" x1="300" y1="338.94" x2="300" y2="700.47"/>
            <line className="trashcanIconPath0" x1="436.78" y1="338.94" x2="408.29" y2="692.3"/>
            </g>
            </svg>
            )
        }
    }
    
    export default TrashcanIcon;