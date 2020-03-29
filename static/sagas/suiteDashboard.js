import axios from "axios";
import {
    GET_MANAGER_SUITE_TREE_ENDPOINT,
    CHANGE_TR_TRIAGE_STATUS_ENDPOINT,
    CHANGE_TR_ISSUE_LINK_ENDPOINT,
    GET_MANAGERS_SUITE_ENDPOINT
} from "../api/endpoints";
import {
    CHANGE_TR_TRIAGE_STATUS,
    CHANGE_TR_TRIAGE_STATUS_SUCCESS,
    GET_MANAGER_SUITE_TREE,
    GET_MANAGER_SUITE_TREE_SUCCESS,
    CHANGE_TR_ISSUE_LINK,
    CHANGE_TR_ISSUE_LINK_SUCCESS,
    GET_MANAGERS_SUITES,
    GET_MANAGERS_SUITES_SUCCESS, ENQUEUE_SNACKBAR
} from "../actions/types";
import {all, call, put, takeEvery} from 'redux-saga/effects';


function* getManagerSuiteTree(action) {
    try {
        const rsp = yield call(axios.get, `${GET_MANAGER_SUITE_TREE_ENDPOINT}?${action.getParams}`);
        yield put({
            type: GET_MANAGER_SUITE_TREE_SUCCESS,
            payload: rsp.data,
            product: action.product
        });
    } catch (e) {
        console.log("Failed because", e);
    }
}

function* changeTrTriageStatus(action) {
    try {
        const rsp = yield call(axios.get, `${CHANGE_TR_TRIAGE_STATUS_ENDPOINT}?${action.getParams}`);
        yield put({
            type: CHANGE_TR_TRIAGE_STATUS_SUCCESS,
            id: action.id,
            payload: rsp.data,
        });
        yield put({
            type: ENQUEUE_SNACKBAR,
            notification: {
                key: new Date().getTime() + Math.random(),
                message: action.id + " has been updated."
            }
        });
    } catch(e) {
        console.log("Failed because", e);
    }
}

function* changeTrIssueLink(action) {
    try {
        const rsp = yield call(axios.get, `${CHANGE_TR_ISSUE_LINK_ENDPOINT}?${action.getParams}`);
        yield put({
            type: CHANGE_TR_ISSUE_LINK_SUCCESS,
            id: action.id,
            payload: rsp.data,
        });
    } catch(e) {
        console.log("Failed because", e);
    }
}

function* getManagersSuites(action) {
    try {
        const rsp = yield call(axios.get, `${GET_MANAGERS_SUITE_ENDPOINT}?${action.getParams}`);
        yield put({
            type: GET_MANAGERS_SUITES_SUCCESS,
            payload: rsp.data,
            manager: action.manager
        });
    } catch(e) {
        console.log("Failed because", e);
    }
}

export default function* suiteDashboard() {
    yield all([
        takeEvery(GET_MANAGER_SUITE_TREE, getManagerSuiteTree),
        takeEvery(CHANGE_TR_TRIAGE_STATUS, changeTrTriageStatus),
        takeEvery(CHANGE_TR_ISSUE_LINK, changeTrIssueLink),
        takeEvery(GET_MANAGERS_SUITES, getManagersSuites)
    ]);
}
