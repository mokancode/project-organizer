import { GET_ERRORS, CLEAR_ERRORS } from '../actions/types';

const initialState = {};

export default function (state = initialState, action) {
    switch (action.type) {

        case GET_ERRORS:
            // console.log("action.payload error: ", action.payload);
            return action.payload;

        case CLEAR_ERRORS:
            return {}

        default:
            return state;
    }
}