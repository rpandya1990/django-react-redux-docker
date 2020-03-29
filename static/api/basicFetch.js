const axios = require('axios');


export const get = (endpoint) => {
    return axios.get(endpoint);
};
