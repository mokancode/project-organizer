import React, { Component } from "react";
import "./NeonThemeText.css";
import Lottie from "react-lottie";
import data from "./data.json";
import classnames from "classnames";

// var initialStrokeAnimEnded = false;
export class NeonThemeText extends Component {
  constructor(props) {
    super(props);

    this.state = {
      pause: true,
    };

    // refs
    this.NeonThemeTextRef = React.createRef();
  }

  componentDidMount() {
    // 62 frames total
    // stop on frame 28

    const { toggledOn, index } = this.props;
    if (toggledOn === true) {
      if (index === 0) {
        this.NeonThemeTextRef.current.anim.playSegments([31.99, 32], true);
      }
    } else if (toggledOn === false) {
      if (index === 1) {
        this.NeonThemeTextRef.current.anim.playSegments([31.99, 32], true);
      }
    }
  }

  componentDidUpdate() {
    const { index } = this.props;
    const { toggledOn, direction, pause } = this.state;
    if ((toggledOn === true || toggledOn === false) && pause !== false) {
      this.setState({ pause: false });
    }

    // Index 0:
    // Hide
    if (toggledOn === false && index === 0 && direction !== -1) {
      // console.log("1");
      setTimeout(() => {
        this.setState({ direction: -1 });
        this.NeonThemeTextRef.current.anim.playSegments([32, 0], true);
      }, 200);
    }

    // Show
    else if (toggledOn === true && index === 0 && direction !== 1) {
      // console.log("2");
      this.setState({ direction: 1 });
      this.NeonThemeTextRef.current.anim.playSegments([0, 32], true);
    }

    // Index 1:
    // Show
    if (toggledOn === false && index === 1 && direction !== -1) {
      // console.log("1 index 1");
      this.setState({ direction: -1 });
      this.NeonThemeTextRef.current.anim.playSegments([62, 30], true);
    }

    // Hide
    else if (toggledOn === true && index === 1 && direction !== 1) {
      // console.log("2 index 1");
      setTimeout(() => {
        this.setState({ direction: 1 });
        this.NeonThemeTextRef.current.anim.playSegments([32, 62], true);
      }, 200);
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.toggledOn !== prevState.toggledOn) {
      // console.log("3");
      return {
        toggledOn: nextProps.toggledOn,
      };
    }

    return null;
  }

  render() {
    const { pause, direction } = this.state;

    const defaultOptions = {
      loop: false,
      autoplay: false,
      animationData: data,
      rendererSettings: {
        preserveAspectRatio: "none",
      },
    };

    return (
      <div className={classnames("neonThemeTextDivWrapper", {})}>
        <Lottie
          options={defaultOptions}
          ref={this.NeonThemeTextRef}
          // eventListeners={[
          //     {
          //         eventName: "enterFrame",
          //         callback: (e) => {
          //             // this.NeonThemeTextRef.current.anim.playSegments([59, 59], true);
          //             console.log("frame: ", e.currentTime, this.state.direction);
          //             const { direction } = this.state;
          //             const { index } = this.props;
          //             const currentFrame = e.currentTime;
          //             if (index === 0 && direction === true && currentFrame >= 28.9) {
          //                 console.log("paused");
          //                 this.NeonThemeTextRef.current.anim.pause();
          //                 this.setState({ pause: true });
          //             }

          //         }
          //     },
          //     {
          //         eventName: "complete",
          //         callback: async function () {
          //         }.bind(this)
          //     }
          // ]}

          direction={direction}
          isStopped={false}
          isPaused={pause}
        />
      </div>
    );
  }
}

export default NeonThemeText;
