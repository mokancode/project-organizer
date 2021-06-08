import { combineReducers } from 'redux';
import authReducer from './authReducer';
import styleReducer from './styleReducer';
// import errorReducer from './errorReducer';

export default combineReducers({
    auth: authReducer,
    styles: styleReducer
    // errors: errorReducer,
})