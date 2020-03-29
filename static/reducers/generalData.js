import {
    DECREMENT_FETCHING,
    GET_BRANCH_LIST,
    GET_MANAGER_LIST,
    GET_PIPELINE_LIST,
    GET_PRODUCT_LIST,
    INCREMENT_FETCHING,
    ENQUEUE_SNACKBAR,
    CLOSE_SNACKBAR,
    REMOVE_SNACKBAR, DESTINY_GET_SUITES_SUCCESS
} from "../actions/types";
import * as _ from "lodash";


const initialState = {
    products: [],
    branches: {},
    pipelines: [],
    managers: {},
    fetching: {
        'GET_MANAGER_SUITE_BUILD_BY_BUILD': 0,
        'GET_MANAGER_TEST_CASE_TIMELINE': 0,
        'GET_TEST_STATE_ACROSS_BUILDS': 0,
        'GET_TEST_STATE_BREAKDOWN': 0,
        'GET_TEST_STATE_SUMMARY': 0
    },
    notifications: [],
    suites: []
};

export default (state = initialState, action) => {
    switch (action.type) {
        case(GET_PRODUCT_LIST):
            return {
                ...state,
                products: action.payload
            };
        case(GET_BRANCH_LIST):
            return {
                ...state,
                branches: {...state.branches, ...action.payload}
            };
        case(GET_PIPELINE_LIST):
            return {
                ...state,
                pipelines: action.payload
            };
        case(GET_MANAGER_LIST):
            return {
                ...state,
                managers: action.payload
            };
        case INCREMENT_FETCHING:
            return {
                ...state,
                fetching: {...state.fetching, [action.value]: state.fetching[action.value] + 1}
            };
        case DECREMENT_FETCHING:
            return {
                ...state,
                fetching: {...state.fetching, [action.value]: state.fetching[action.value] - 1}
            };
        case ENQUEUE_SNACKBAR:
            return {
                ...state,
                notifications: [
                    ...state.notifications, {
                        key: action.key,
                        ...action.notification,
                    },
                ],
            };
        case CLOSE_SNACKBAR:
            return {
                ...state,
                notifications: state.notifications[action.value].map(notification => (
                    (action.dismissAll || notification.key === action.key)
                        ? {...notification, dismissed: true}
                        : {...notification}
                ))
            };
        case REMOVE_SNACKBAR:
            return {
                ...state,
                notifications: state.notifications.filter(notification => {
                    return !_.isEqual(notification.key, action.key)
                })
            };
        case DESTINY_GET_SUITES_SUCCESS:
            let stateCopy = {...state};
            stateCopy.suites = action.payload;
            return stateCopy;
        default:
            return state;
    }
}


