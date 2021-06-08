import React, { Component } from "react";
import "./ToggleButton.css";
import classnames from "classnames";
// import ToggleButtonSVG from './ToggleButtonSVG';
// import ToggleButtonSVG2 from './ToggleButtonSVG2';
import NeonThemeText from "../SVGs/NeonThemeText/NeonThemeText";

class ToggleButton extends Component {
  constructor(props) {
    super(props);
    this.state = {};

    this.toggleFunc = this.props.toggleFunc;

    // refs
    this.switchRef = React.createRef();
  }

  componentDidMount() {
    this.setState({ active: this.props.toggleParameter.isOn });
  }

  render() {
    const { toggleParameter } = this.props;
    const { active, switchAnimEnded } = this.state;

    return (
      <div className="toggleBtnWrapper">
        <div
          className={classnames("toggleBtnInnerWrapper", {
            "active": active,
          })}
          onClick={() => {
            // console.log("toggle status", toggleParameter);
            if (toggleParameter.animEnded === false || switchAnimEnded === false) {
              // console.log("btn animEnded");
              return;
            }
            this.setState((prevState) => ({
              active: !prevState.active,
              switchAnimEnded: false,
            }));
          }}
        >
          <div className="border"></div>
          <div className="innerBorder"></div>
          <div className="buttonSpaceWrapper">
            <div className="buttonSpace">
              <div className="switchWrapper">
                <div
                  ref={this.switchRef}
                  className="switchDiv"
                  onTransitionEnd={(e) => {
                    // console.log("transition end");
                    if (e.target === this.switchRef.current) {
                      if (toggleParameter.isOn) this.props.toggleFunc({ isOn: false, animEnded: false });
                      else this.props.toggleFunc({ isOn: true, animEnded: false });
                    }
                    this.setState({ switchAnimEnded: true });
                  }}
                >
                  <div className="border"></div>
                  <div className="space"></div>
                </div>
              </div>

              <div className="toggleBtnDescriptionTextWrapper">
                <NeonThemeText index={0} toggledOn={active} />
                <NeonThemeText index={1} toggledOn={active} />
              </div>
            </div>
          </div>
        </div>

        {/* <button className={classnames("toggleBtn", {
                    "active": toggleParameter
                })} onClick={(e) => {
                    if (toggleParameter) this.props.toggleFunc(false);
                    else this.props.toggleFunc(true);
                }}></button>
                <p>{description}</p> */}
      </div>
    );
  }
}

export default ToggleButton;
