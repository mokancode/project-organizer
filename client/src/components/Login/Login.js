import React, { Component } from "react";
import { connect } from "react-redux";
import "./Login.css";
import classnames from "classnames";
import {
  loginUser,
  registerUser,
  logoutUser,
  clearState,
  updateNotes,
  setLastNotes,
  setServerResponseMsg,
  setNotesOrigin,
} from "../../actions/authActions";
// import SyncIcon from "../SVGs/SyncIcon/SyncIcon";
import isEmpty from "../../validation/is-empty";
import CloudIcon from "../SVGs/CloudIcon/CloudIcon";
import { v4 as generateUniqueID } from "uuid";
import { GoogleLogin, GoogleLogout } from "react-google-login";
import axios from "axios";

class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      loginUsername: "",
      loginPassword: "",
      registerUsername: "",
      registerPassword: "",
      errors: {},
    };
  }

  handleSubmit() {
    this.setState({ isLoading: true, errors: {}, serverResponse: null, registrationSuccessful: null });

    const { isRegisterForm, loginUsername, loginPassword, registerPassword2, registerEmail } = this.state;
    var loginData = {
      username: loginUsername,
      password: loginPassword,
    };

    var registerData = {
      username: loginUsername,
      password: loginPassword,
      password2: registerPassword2,
      email: registerEmail,
    };

    var formData = isRegisterForm ? registerData : loginData;
    const loginUserFunction = isRegisterForm ? this.props.registerUser : this.props.loginUser;
    var mPromise = (formData) => {
      loginUserFunction(formData)
        .then((fulfilled) => {
          this.setState({ isLoading: false, showLogin: false });

          if (isRegisterForm) {
            this.props.setServerResponseMsg(fulfilled.success);
            this.setState({ registrationSuccessful: fulfilled.success });
          } else {
            // console.log("login", fulfilled);
            var todoData = { list: fulfilled, uid: generateUniqueID() };
            this.props.updateNotes(todoData);
            this.props.setLastNotes(todoData);

            this.props.setNotesOrigin("login");
          }
        })
        .catch((errors) => {
          this.setState({ isLoading: false, errors });
        });
    };
    mPromise(formData);
  }

  // syncBtn() {
  //     const { notes } = this.props.auth;
  //     const { user } = this.props.auth;

  //     this.setState({ isLoading: true, serverResponse: null, errors: {} });

  //     axios.post('/api/users/updatenotes', { username: user.username, userId: user.id, notes })
  //         .then((res) =>{
  //             this.setState({ serverResponse: res.data, isLoading: false, syncAvailable: false });
  //             // this.props.lastNotes(res.data);
  //             console.log("res: ", res.data);
  //         })
  //         .catch((error) =>{
  //             this.setState({ isLoading: false });
  //             console.log("err: ", error.response.data);
  //             try {
  //                 this.setState({ errors: error.response.data.errors });
  //             }
  //             catch (err) { }
  //             // this.setState({ errors: error.response.data, isLoading: false });
  //         })
  // }

  componentDidUpdate() {
    const {
      serverResponse,
      //  lastNotes, notes
    } = this.props.auth;
    if (!isEmpty(serverResponse) && serverResponse !== this.state.serverResponse) {
      this.setState({ serverResponse }, () => {
        // console.log("server", this.state.serverResponse);
      });
      this.props.setServerResponseMsg(null);
    }

    // const { syncAvailable } = this.state;
    // if (JSON.stringify(lastNotes) !== JSON.stringify(notes) && !syncAvailable) this.setState({ syncAvailable: true });
    // else if (JSON.stringify(lastNotes) === JSON.stringify(notes) && syncAvailable) this.setState({ syncAvailable: false });
  }

  responseGoogle = (response) => {
    // if (response.error && response.error === "idpiframe_initialization_failed") return;

    this.setState({ isLoading: true, errors: {}, serverResponse: null });
    // console.log("google response", response);

    if (response.error) {
      var errors = { registration: "Login error" };
      return this.setState({ isLoading: false, errors });
    }

    const gmail = response.profileObj.email;

    const { isRegisterForm } = this.state;

    var formData = {
      username: gmail,
      email: gmail,
      isGoogleAccount: true,
    };

    const loginUserFunction = isRegisterForm ? this.props.registerUser : this.props.loginUser;
    var mPromise = (formData) => {
      loginUserFunction(formData)
        .then((fulfilled) => {
          this.setState({ isLoading: false, showLogin: false });
          if (fulfilled && !isRegisterForm) {
            // console.log("login", fulfilled);
            var todoData = { list: fulfilled, uid: generateUniqueID() };
            this.props.updateNotes(todoData);
            this.props.setLastNotes(todoData);
            this.props.setNotesOrigin("login");
          }
        })
        .catch((errors) => {
          console.log("errors", errors);
          this.setState({ isLoading: false, errors });
        });
    };
    mPromise(formData);
  };

  render() {
    const { user, isAuthenticated } = this.props.auth;
    const {
      showLogin,
      isLoading,
      serverResponse,
      errors,
      isRegisterForm,
      registrationSuccessful,
      // , syncAvailable
    } = this.state;

    return (
      <div className="loginDiv">
        {/* <div className="debuggingBtn"
                    onClick={() => {
                        axios.get(`/api/users/debug`)
                            .then((res) => {
                                // this.setState({ serverResponse: res.data, isLoading: false });
                                console.log("debugging res: ", res.data);
                            })
                            .catch((error) => {
                                console.log("debugging err: ", error);
                            });
                    }}
                >debuggingBtn</div> */}
        <div className="loginButtons">
          <div className="syncMessageWrapper">
            <p
              className={classnames("syncMessage", {
                animate: !isEmpty(serverResponse) || (!isEmpty(errors) && (!isEmpty(errors.updatenotes) || !isEmpty(errors.getnotes))),
              })}
            >
              {serverResponse || errors.updatenotes || errors.getnotes}
            </p>
          </div>
          {isAuthenticated ? (
            <div className="loggedInWrapper">
              {/* <div className={classnames("syncBtn", {
                            "syncAvailable": syncAvailable
                        })} title="Sync" onClick={() => {
                            if (!syncAvailable) return;
                            this.syncBtn();
                        }}><SyncIcon animate={isLoading} />
                        </div> */}

              <CloudIcon />

              <p className="displayName">{user.username}</p>
              <div
                className="logoutButton"
                title="Log out"
                onClick={async () => {
                  this.props.logoutUser();
                  this.props.clearState(true);
                  axios
                    .post("/api/users/logout", { id: user.id })
                    .then((res) => {
                      console.log("Logged out successfully");
                    })
                    .catch((err) => {
                      console.log("logout error: ", err.response.data);
                    });
                }}
              >
                <div className="exitArrow"></div>
              </div>
            </div>
          ) : (
            <p
              className="loginBtn"
              onClick={(e) => {
                this.setState({ showLogin: true });
              }}
            >
              Login
            </p>
          )}
        </div>

        <div
          className={classnames("loginFormWrapper", {
            show: showLogin,
            isLoginForm: !isRegisterForm,
            errors: !isEmpty(errors),
          })}
        >
          <div className="loginHeadersWrapper">
            <p
              className={classnames("loginHeader", {
                enter: !isRegisterForm,
                leave: isRegisterForm,
              })}
            >
              Log in
            </p>

            <p
              className={classnames("loginHeader", {
                enter: isRegisterForm,
                leave: !isRegisterForm,
              })}
            >
              Register
            </p>
          </div>

          <form
            className="loginFormElements"
            // action=""
            onSubmit={(e) => {
              e.preventDefault();
              this.handleSubmit(e);
            }}
          >
            <input
              tabIndex={1}
              type="text"
              placeholder="Username"
              name="loginUsername"
              onChange={(e) => {
                this.setState({ [e.target.name]: e.target.value });
              }}
            ></input>
            <p
              className={classnames("loginErrorMsg", {
                show: errors.username,
              })}
            >
              {errors.username}
            </p>
            <input
              tabIndex={2}
              type="password"
              placeholder="Password"
              name="loginPassword"
              onChange={(e) => {
                this.setState({ [e.target.name]: e.target.value });
              }}
            ></input>
            <p
              className={classnames("loginErrorMsg", {
                show: errors.password,
              })}
            >
              {errors.password}
            </p>
            <input
              tabIndex={isRegisterForm ? 3 : -1}
              type="password"
              placeholder="Confirm password"
              name="registerPassword2"
              onChange={(e) => {
                this.setState({ [e.target.name]: e.target.value });
              }}
            ></input>
            <p
              className={classnames("loginErrorMsg", {
                show: errors.password2 && isRegisterForm,
              })}
            >
              {errors.password2}
            </p>
            <input
              tabIndex={isRegisterForm ? 4 : -1}
              type="email"
              placeholder="Email"
              name="registerEmail"
              onChange={(e) => {
                this.setState({ [e.target.name]: e.target.value });
              }}
            ></input>
            <p
              className={classnames("loginErrorMsg", {
                show: errors.email && isRegisterForm,
              })}
            >
              {errors.email}
            </p>
            <button className="loginFormBtn" tabIndex={5} type="submit">
              Submit
            </button>
            <p
              className={classnames("loginErrorMsg loginOrRegistrationError", {
                show: errors.registration || errors.login,
              })}
            >
              {errors.registration || errors.login}
            </p>
            <p
              className={classnames("loginErrorMsg loginOrRegistrationError registrationSuccessful", {
                show: registrationSuccessful,
              })}
            >
              {registrationSuccessful}
            </p>
          </form>

          <button
            className="closeLoginBtn"
            onClick={() => {
              this.setState({ showLogin: false });
            }}
          >
            _
          </button>

          <button
            className="toggleFormTypeBtn"
            onClick={() => {
              this.setState((prevState) => ({
                isRegisterForm: !prevState.isRegisterForm,
              }));
            }}
          >
            {isRegisterForm ? "Login" : "Register"}
          </button>
          <div
            className={classnames("progressBar", {
              active: isLoading,
            })}
          ></div>

          <p id="or">OR</p>

          <div className="googleLoginWrapper">
            <GoogleLogin
              clientId="1081686684395-a4r9r45ijvirjdks99bq93kphqugu52n.apps.googleusercontent.com"
              render={(renderProps) => (
                <div className="googleLoginBtnWrapper">
                  <img src="/google-icon.png" alt="Google-Login"></img>
                  <button className="loginFormBtn" onClick={renderProps.onClick} disabled={renderProps.disabled}>
                    {isRegisterForm ? "Register" : "Log in"} with Google
                  </button>
                </div>
              )}
              buttonText="Login"
              onSuccess={(e) => this.responseGoogle(e)}
              onFailure={(e) => this.responseGoogle(e)}
              cookiePolicy={"single_host_origin"}
            />
            {/* <GoogleLogout
              clientId="1081686684395-a4r9r45ijvirjdks99bq93kphqugu52n.apps.googleusercontent.com"
              buttonText="Logout"
              render={(renderProps) => (
                <div className="googleLoginBtnWrapper">
                  <img src="./google-icon.png" alt="Google-Login"></img>
                  <button className="loginFormBtn" onClick={renderProps.onClick} disabled={renderProps.disabled}>
                    Log out
                  </button>
                </div>
              )}
              // onLogoutSuccess={logout}
            /> */}
          </div>
        </div>
      </div>
    );
  }
}

function mapStateToProps(state) {
  return {
    auth: state.auth,
  };
}

export default connect(mapStateToProps, {
  loginUser,
  logoutUser,
  registerUser,
  clearState,
  updateNotes,
  setLastNotes,
  setServerResponseMsg,
  setNotesOrigin,
})(Login);
