import isEmpty from "../validation/is-empty";
import { SET_CURRENT_USER } from "../actions/types";

function timestampAction(action) {
  return {
    action,
    time: Date.now(),
  };
}

export function storageMiddleware(store) {
  return (next) => {
    return (action) => {
      const stampedAction = timestampAction(action);
      // console.log("local storage 1: ", localStorage.getItem('STORAGE_KEY'));
      // console.log("local storage 2: ", JSON.parse(localStorage.getItem('STORAGE_KEY')));

      // console.log("Logged action: ", stampedAction);
      if (
        isEmpty(localStorage.getItem("STORAGE_KEY")) ||
        JSON.parse(localStorage.getItem("STORAGE_KEY")) === {} ||
        localStorage.getItem("STORAGE_KEY") === "{}"
      ) {
        // console.log("set new storage key");
        // localStorage.setItem('STORAGE_KEY', JSON.stringify(action));
        localStorage.setItem("STORAGE_KEY", JSON.stringify(stampedAction));
      }
      next(action);
    };
  };
}

export function createStorageListener(store) {
  return (event) => {
    // console.log("listener event: ", event);
    // the storage event tells you which value changed
    // const { action } = JSON.parse(event.newValue);

    // console.log("store dispatch action (storageListener)");

    store.dispatch({
      type: SET_CURRENT_USER,
      payload: {},
    });
  };
}
