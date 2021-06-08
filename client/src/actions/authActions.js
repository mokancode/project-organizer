import axios from "axios";
import {
  SET_CURRENT_USER,
  GET_ERRORS,
  UPDATE_NOTES,
  CLEAR_STATE,
  SET_LAST_NOTES,
  SERVER_RESPONSE,
  ANIMATE_CLOUD_ICON,
  SET_NOTE_ORIGIN,
} from "./types";
import setAuthToken from "../utils/setAuthToken";
import jwt_decode from "jwt-decode";

// Login user - Get user (JWT) token
export const loginUser = (userData, socket) => (dispatch) => {
  return new Promise((resolve, reject) => {
    return axios
      .post("/api/users/login", userData)
      .then((res) => {
        // console.log("loginUser: ", userData);

        // console.log("socket from authActions: ", socket);
        // if (socket) {
        // throw { response: { data: { password: "User already logged in" } } }
        // }

        // Get token from response
        const { token } = res.data;
        // Save token to localStorage
        localStorage.setItem("jwtToken", token);
        // Set token to Authorization header
        setAuthToken(token);
        // Decode token to get user data
        const decoded = jwt_decode(token);
        // Set current user
        // console.log("decoded: ", decoded);
        dispatch(setCurrentUser(decoded));

        // console.log("loginUser res: ", res.data);

        resolve(res.data.notes);
      })
      .catch((err) => {
        // console.log("login err", err);

        // console.log("login auth error: ", err.response.data)
        // dispatch({
        //     type: GET_ERRORS,
        //     payload: err.response.data
        // })
        reject(err.response.data);
      });
  });
};

// Set logged-in user
export const setCurrentUser = (decoded) => {
  // console.log("setting current user authAction");
  return {
    type: SET_CURRENT_USER,
    payload: decoded,
  };
};

// Log user out
export const logoutUser = (socket) => (dispatch) => {
  // console.log("logout user");

  // Remove token from localStorage
  localStorage.removeItem("jwtToken");
  // Remove auth header for future requests
  setAuthToken(false);
  // Set current user to {} which will also set isAuthenticated to false
  dispatch(setCurrentUser({}));
  localStorage.setItem("STORAGE_KEY", JSON.stringify({}));

  // socket.disconnect();
  // console.log("Socket disconnected: ", socket);
};

export const updateNotes = (notes) => (dispatch) => {
  dispatch({
    type: UPDATE_NOTES,
    payload: notes,
  });
};

// Upload notes to cloud
export const uploadNotes = (notes) => (dispatch) => {
  dispatch({
    type: ANIMATE_CLOUD_ICON,
    payload: false,
  });

  return new Promise((resolve, reject) => {
    return axios
      .post("/api/users/uploadnotes", { notes })
      .then((res) => {
        // console.log("uploaded notes res: ", res.data);

        // return reject(null);

        dispatch({
          type: ANIMATE_CLOUD_ICON,
          payload: true,
        });

        resolve(res.data.notes);
      })
      .catch((err) => {
        // console.log("upload notes error: ", err.response.data);

        dispatch({
          type: GET_ERRORS,
          payload: err.response.data,
        });
        reject(err.response.data);
      });
  });
};

export const setLastNotes = (notes) => (dispatch) => {
  dispatch({
    type: SET_LAST_NOTES,
    payload: notes,
  });
};

export const clearState = (clearNotes) => (dispatch) => {
  // console.log("clearing state");
  dispatch({
    type: CLEAR_STATE,
    payload: clearNotes,
  });
};

export const setServerResponseMsg = (serverResponse) => {
  return (dispatch) => {
    // console.log("server response auth", serverResponse);
    dispatch({
      type: SERVER_RESPONSE,
      payload: serverResponse,
    });
  };
};

export const setNotesOrigin = (notesOrigin) => {
  return (dispatch) => {
    // console.log("notes origin:", notesOrigin);
    dispatch({
      type: SET_NOTE_ORIGIN,
      payload: notesOrigin,
    });
  };
};

// Login user - Get user (JWT) token
export const registerUser = (userData, socket) => (dispatch) => {
  return new Promise((resolve, reject) => {
    return axios
      .post("/api/users/register", userData)
      .then((res) => {
        // console.log("loginUser: ", userData);
        resolve(res.data);

        // // Get token from response
        // const { token } = res.data;
        // // Save token to localStorage
        // localStorage.setItem("jwtToken", token);
        // // Set token to Authorization header
        // setAuthToken(token);
        // // Decode token to get user data
        // const decoded = jwt_decode(token);
        // // Set current user
        // // console.log("decoded: ", decoded);
        // dispatch(setCurrentUser(decoded));

        // console.log("loginUser res: ", res.data);

        resolve(res);
      })
      .catch((err) => {
        console.log("login err", err);

        // console.log("login auth error: ", err.response.data)
        // dispatch({
        //     type: GET_ERRORS,
        //     payload: err.response.data
        // })
        reject(err.response.data);
      });
  });
};