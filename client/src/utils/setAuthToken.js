import axios from 'axios';

const setAuthToken = (token) => {
    if (token) {
        // Apply to every request
        
        // console.log("setting auth header token");
        axios.defaults.headers.common['Authorization'] = token;
    } else {
        // Delete auth header
        
        // console.log("deleting auth header");
        delete axios.defaults.headers.common['Authorization'];
    }
}

export default setAuthToken;