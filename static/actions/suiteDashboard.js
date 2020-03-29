import {
    GET_MANAGER_SUITE_TREE,
    CHANGE_TR_TRIAGE_STATUS,
    CHANGE_TR_ISSUE_LINK,
    GET_MANAGERS_SUITES, UPDATE_INFO,
} from "./types";
import _ from "lodash";


export const getManagerSuiteTree = (getParams, fetchSuites, product) => (dispatch) => {
    if (_.isEmpty(fetchSuites)) {
        return;
    }
    dispatch({
        type: GET_MANAGER_SUITE_TREE,
        product,
        getParams
    });
};

export const changeTrTriageStatus = (getParams, id) => dispatch => {
    dispatch({
        type: CHANGE_TR_TRIAGE_STATUS,
        id,
        getParams
    })
};

export const updateInfo = (id, payload) => dispatch => {
    dispatch({
        type: UPDATE_INFO,
        id,
        payload
    })
};

export const changeTrIssueLink = (getParams, id) => dispatch => {
    dispatch({
        type: CHANGE_TR_ISSUE_LINK,
        getParams,
        id
    })
};

export const getManagersSuites = (getParams, manager, branch) => (dispatch, getState) => {
    let state = getState();
    if (state.suiteDashboard.managerSuites[manager] && state.suiteDashboard.managerSuites[manager][branch]) {
        return;
    }
    dispatch({
        type: GET_MANAGERS_SUITES,
        getParams,
        manager
    })
};
