import {
    GET_APP_LIST
} from "../actions/types.js";


const initialState = {
    appItems: {
        query_set: [],
        user: ''
    },
};

export default function(state = initialState, action) {
    switch (action.type) {
        case GET_APP_LIST:
            return {
                ...state,
                appItems: action.payload
            };
        default:
            return state;
    }
}
