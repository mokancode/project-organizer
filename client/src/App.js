import React, { Component } from "react";
import "./App.css";
import jwt_decode from "jwt-decode";
import setAuthToken from "./utils/setAuthToken";
import { setCurrentUser, logoutUser, setServerResponseMsg } from "./actions/authActions";
import { createStorageListener } from "./middleware/storageMiddleware";
import PropTypes from "prop-types";
import Login from "./components/Login/Login";
import "react-app-polyfill/ie11";
import { connect } from "react-redux";
import Controller from "./Controller";
import store from "./store";
import isEmpty from "./validation/is-empty";
import axios from "axios";

// Check for token
if (localStorage.jwtToken) {
  // console.log("jwtToken not empty, setting current user", localStorage.jwtToken);
  try {
    // Set auth token header 'Authorization'
    setAuthToken(localStorage.jwtToken);
    // Decode token and get user info and exp
    const decoded = jwt_decode(localStorage.jwtToken);

    // console.log("decoded:", decoded);

    // Set user and isAuthenticated
    store.dispatch(setCurrentUser(decoded));

    // console.log("store after setting jwt token: ", store.getState());

    // Check for expired token
    const currentTime = Date.now() / 1000;
    if (decoded.exp < currentTime) {
      // console.log("jwt token expired, logging out");
      // Logout user
      store.dispatch(logoutUser());

      // // Redirect to login page
      // window.location.href = '/login';
    }
  } catch (err) {
    // console.log("jwt error: ", err);
  }
}

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      appVer: "1.0.0.2",
    };
  }

  componentDidMount() {
    // localStorage.clear();
    window.addEventListener("storage", createStorageListener(this.props.store));

    var regex = new RegExp(/confirm\/(.+)/);
    var match = window.location.pathname.match(regex);
    if (!isEmpty(match)) {
      const token = match[1];
      axios
        .get(`/api/users/confirm/${token}`)
        .then((res) => {
          if (res.data.success) {
            this.props.setServerResponseMsg("Account activated");
          }
        })
        .catch((err) => {
          // console.log("account activation error", err.response.data.verified);
          if (err.response.data.verified) this.props.setServerResponseMsg(err.response.data.verified);
        });
    }
  }

  render() {
    const { appVer } = this.state;

    return (
      <div className="appContainer">
        <Controller />
        <Login />

        <div id="appVerWrapper">
          <p id="appVer">v{appVer}</p>
        </div>
      </div>
    );
  }
}

App.propTypes = {
  styles: PropTypes.object,
  auth: PropTypes.object.isRequired,
};

function mapStateToProps(state) {
  return {
    styles: state.styles,
    auth: state.auth,
  };
}

export default connect(mapStateToProps, { setCurrentUser, logoutUser, setServerResponseMsg })(App);
