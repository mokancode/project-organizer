import isEmpty from '../validation/is-empty';
import { CLEAR_STATE, SET_CURRENT_USER, UPDATE_NOTES, SET_LAST_NOTES, SERVER_RESPONSE, SET_NOTE_ORIGIN } from '../actions/types';

const initialState = {
    isAuthenticated: false,
    user: {},
    notes: [],
    lastNotes: [],
    clearNotes: null,
    serverResponse: null,
    notesOrigin: null
}

export default function (state = initialState, action) {
    switch (action.type) {
        case SET_CURRENT_USER:
            // console.log("setting current user authReducer", action.payload);
            return {
                ...state,
                isAuthenticated: !isEmpty(action.payload),
                user: action.payload
            }
        case UPDATE_NOTES:
            return {
                ...state,
                notes: action.payload
            }
        case SET_LAST_NOTES:
            return {
                ...state,
                lastNotes: action.payload
            }
        case CLEAR_STATE:
            return {
                ...state,
                clearNotes: action.payload
            }
        case SERVER_RESPONSE:
            return {
                ...state,
                serverResponse: action.payload
            }
        case SET_NOTE_ORIGIN:
            return {
                ...state,
                notesOrigin: action.payload
            }
        default:
            return state;
    }
}