import axios from "axios";
import _ from "lodash";

import {
    CLOSE_SNACKBAR, DESTINY_GET_SUITES,
    ENQUEUE_SNACKBAR,
    GET_BRANCH_LIST,
    GET_MANAGER_LIST,
    GET_PIPELINE_LIST,
    GET_PRODUCT_LIST,
    REMOVE_SNACKBAR
} from "./types";
import {
    DESTINY_GET_BRANCHES_ENDPOINT,
    DESTINY_GET_MANAGERS_ENDPOINT,
    DESTINY_GET_PIPELINES_ENDPOINT,
    DESTINY_GET_PRODUCTS_ENDPOINT,
} from "../api/endpoints";


export const getProductList = () => (dispatch, getState) => {
    let state = getState();
    if (!_.isEmpty(state.generalData.products)) {
        return;
    }
    axios.get(
        DESTINY_GET_PRODUCTS_ENDPOINT
    ).then(
        rsp => dispatch({
            type: GET_PRODUCT_LIST,
            payload: rsp.data
        })
    ).catch(err => {
        console.log(err);
    })
};


export const getBranchList = params => (dispatch, getState) => {
    let state = getState();
    if (!_.isEmpty(state.generalData.branches)) {
        return;
    }
    axios.get(
        `${DESTINY_GET_BRANCHES_ENDPOINT}?${params ? params.toString() : ''}`
    ).then(
        rsp => dispatch({
            type: GET_BRANCH_LIST,
            payload: rsp.data
        })
    ).catch(err => {
        console.log(err);
    })
};

export const getPipelineList = () => dispatch => {
    axios.get(
        DESTINY_GET_PIPELINES_ENDPOINT
    ).then(
        rsp => dispatch({
            type: GET_PIPELINE_LIST,
            payload: rsp.data
        })
    ).catch(err => {
        console.log(err);
    })
};

export const getManagerList = () => dispatch => {
    axios.get(
        DESTINY_GET_MANAGERS_ENDPOINT
    ).then(
        rsp => dispatch({
            type: GET_MANAGER_LIST,
            payload: rsp.data
        })
    ).catch(err => {
        console.log(err);
    })
};

export const enqueueSnackbar = notification => {
    const key = notification.options && notification.options.key;

    return {
        type: ENQUEUE_SNACKBAR,
        notification: {
            ...notification,
            key: key || new Date().getTime() + Math.random(),
        },
    };
};

export const closeSnackbar = key => ({
    type: CLOSE_SNACKBAR,
    dismissAll: !key, // dismiss all if no key has been defined
    key,
});

export const removeSnackbar = key => ({
    type: REMOVE_SNACKBAR,
    key,
});

export const getSuites = (getParams) => (dispatch, getState) => {
    dispatch({
        type: DESTINY_GET_SUITES,
        getParams
    })
};
