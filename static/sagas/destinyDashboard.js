import {all, call, put, takeEvery, takeLatest} from 'redux-saga/effects';

import {
    ADD_TEST_CASE,
    ADD_TEST_CASE_SUCCESS,
    ADD_TEST_RESULT,
    ADD_TEST_RESULT_SUCCESS,
    BULK_IMPORT_SYSTEM_TEST_CASE,
    BULK_IMPORT_SYSTEM_TEST_RESULT,
    DELETE_TEST_CASE,
    DELETE_TEST_CASE_SUCCESS,
    DELETE_TEST_RESULT,
    DELETE_TEST_RESULT_SUCCESS,
    ENQUEUE_SNACKBAR,
    GET_BRANCHES,
    GET_BRANCHES_SUCCESS,
    GET_PRODUCTS,
    GET_PRODUCTS_SUCCESS,
    GET_REPOSITORIES,
    GET_REPOSITORIES_SUCCESS,
    GET_TEST_CASE_LIST,
    GET_TEST_CASE_LIST_SUCCESS,
    GET_TEST_CATEGORY_LIST,
    GET_TEST_CATEGORY_LIST_SUCCESS,
    GET_TEST_FRAMEWORK_LIST,
    GET_TEST_FRAMEWORK_LIST_SUCCESS,
    GET_TEST_RESULT_LIST,
    GET_TEST_RESULT_LIST_SUCCESS,
    GET_TEST_STATUS_LIST,
    GET_TEST_STATUS_LIST_SUCCESS,
    GET_TRIAGE_RESOLUTION_LIST,
    GET_TRIAGE_RESOLUTION_LIST_SUCCESS,
    GET_TRIAGE_STATUS_LIST,
    GET_TRIAGE_STATUS_LIST_SUCCESS,
    GET_USERS,
    GET_USERS_SUCCESS,
    GET_VERSIONS,
    GET_VERSIONS_SUCCESS,
    UPDATE_TEST_CASE,
    UPDATE_TEST_CASE_SUCCESS,
    UPDATE_TEST_RESULT,
    UPDATE_TEST_RESULT_SUCCESS
} from "../actions/types";
import axios from "axios";
import {
    DESTINY_BRANCH_ENDPOINT,
    DESTINY_BULK_IMPORT_SYSTEM_TEST_CASE,
    DESTINY_BULK_IMPORT_SYSTEM_TEST_RESULT,
    DESTINY_PRODUCT_ENDPOINT,
    DESTINY_REPO_ENDPOINT,
    DESTINY_TEST_CASE_ENDPOINT,
    DESTINY_TEST_CATEGORY_LIST_ENDPOINT,
    DESTINY_TEST_FRAMEWORK_LIST_ENDPOINT,
    DESTINY_TEST_RESULT_ENDPOINT,
    DESTINY_TEST_STATUS_LIST_ENDPOINT,
    DESTINY_TRIAGE_RESOLUTION_LIST_ENDPOINT,
    DESTINY_TRIAGE_STATUS_LIST_ENDPOINT,
    DESTINY_USER_ENDPOINT,
    DESTINY_VERSION_ENDPOINT
} from "../api/endpoints";
import {getCookie} from "../utils";
import React from "react";

function* getUsers(action) {
    try {
        const {params} = action;
        const rsp = yield call(axios.get, `${DESTINY_USER_ENDPOINT}?${params ? params.toString() : ''}`);
        yield put({
            type: GET_USERS_SUCCESS,
            payload: rsp.data
        });
    } catch (e) {
        console.log("Failed because", e);
    }
}

function* getRepositories(action) {
    try {
        const {params} = action;
        const rsp = yield call(axios.get, `${DESTINY_REPO_ENDPOINT}?${params ? params.toString() : ''}`);
        yield put({
            type: GET_REPOSITORIES_SUCCESS,
            payload: rsp.data
        });
    } catch (e) {
        console.log("Failed because", e);
    }
}


function* getProducts(action) {
    try {
        const {params} = action;
        const rsp = yield call(axios.get, `${DESTINY_PRODUCT_ENDPOINT}?${params ? params.toString() : ''}`);
        yield put({
            type: GET_PRODUCTS_SUCCESS,
            payload: rsp.data
        });
    } catch (e) {
        console.log("Failed because", e);
    }
}


function* getBranches(action) {
    try {
        const {params} = action;
        const rsp = yield call(axios.get, `${DESTINY_BRANCH_ENDPOINT}?${params ? params.toString() : ''}`);
        yield put({
            type: GET_BRANCHES_SUCCESS,
            payload: rsp.data
        });
    } catch (e) {
        console.log("Failed because", e);
    }
}


function* getVersions(action) {
    try {
        const {params} = action;
        const rsp = yield call(axios.get, `${DESTINY_VERSION_ENDPOINT}?${params ? params.toString() : ''}`);
        yield put({
            type: GET_VERSIONS_SUCCESS,
            payload: rsp.data
        });
    } catch (e) {
        console.log("Failed because", e);
    }
}

function* getTestStatusList(action) {
    try {
        const {params} = action;
        const rsp = yield call(axios.get, `${DESTINY_TEST_STATUS_LIST_ENDPOINT}?${params ? params.toString() : ''}`);
        yield put({
            type: GET_TEST_STATUS_LIST_SUCCESS,
            payload: rsp.data
        });
    } catch (e) {
        console.log("Failed because", e);
    }
}

function* getTriageStatusList(action) {
    try {
        const {params} = action;
        const rsp = yield call(axios.get, `${DESTINY_TRIAGE_STATUS_LIST_ENDPOINT}?${params ? params.toString() : ''}`);
        yield put({
            type: GET_TRIAGE_STATUS_LIST_SUCCESS,
            payload: rsp.data
        });
    } catch (e) {
        console.log("Failed because", e);
    }
}

function* getTriageResolutionList(action) {
    try {
        const {params} = action;
        const rsp = yield call(axios.get, `${DESTINY_TRIAGE_RESOLUTION_LIST_ENDPOINT}?${params ? params.toString() : ''}`);
        yield put({
            type: GET_TRIAGE_RESOLUTION_LIST_SUCCESS,
            payload: rsp.data
        });
    } catch (e) {
        console.log("Failed because", e);
    }
}

function* getTestFrameworkList(action) {
    try {
        const {params} = action;
        const rsp = yield call(axios.get, `${DESTINY_TEST_FRAMEWORK_LIST_ENDPOINT}?${params ? params.toString() : ''}`);
        yield put({
            type: GET_TEST_FRAMEWORK_LIST_SUCCESS,
            payload: rsp.data
        });
    } catch (e) {
        console.log("Failed because", e);
    }
}

function* getTestCategoryList(action) {
    try {
        const {params} = action;
        const rsp = yield call(axios.get, `${DESTINY_TEST_CATEGORY_LIST_ENDPOINT}?${params ? params.toString() : ''}`);
        yield put({
            type: GET_TEST_CATEGORY_LIST_SUCCESS,
            payload: rsp.data
        });
    } catch (e) {
        console.log("Failed because", e);
    }
}

function* getTestCases(action) {
    try {
        const {params} = action;
        const rsp = yield call(axios.get, `${DESTINY_TEST_CASE_ENDPOINT}?${params ? params.toString() : ''}`);
        yield put({
            type: GET_TEST_CASE_LIST_SUCCESS,
            payload: rsp.data
        });
    } catch (e) {
        console.log("Failed because", e);
    }
}

function* getTestResults(action) {
    try {
        const {params} = action;
        const rsp = yield call(axios.get, `${DESTINY_TEST_RESULT_ENDPOINT}?${params ? params.toString() : ''}`);
        yield put({
            type: GET_TEST_RESULT_LIST_SUCCESS,
            payload: rsp.data
        });
    } catch (e) {
        console.log("Failed because", e);
    }
}

function* addTestCase(action) {
    try {
        const {testCase} = action;
        console.log('POST', testCase);
        const res = yield call(axios.post, DESTINY_TEST_CASE_ENDPOINT, testCase, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });
        console.log(`GET ${DESTINY_TEST_CASE_ENDPOINT}${res.data.id}/`);
        const rsp = yield call(axios.get, `${DESTINY_TEST_CASE_ENDPOINT}${res.data.id}/`);
        yield call(handleNotification, {
            message: "Added Successfully",
            variant: 'success',
        });
        yield put({
            type: ADD_TEST_CASE_SUCCESS,
            payload: rsp.data
        });
    } catch (e) {
        console.log("Failed because", e);
        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}

function* updateTestCase(action) {
    try {
        const {testCase} = action;
        console.log(`PUT ${DESTINY_TEST_CASE_ENDPOINT}${testCase.id}/`, testCase);
        const res = yield call(axios.put, `${DESTINY_TEST_CASE_ENDPOINT}${testCase.id}/`, testCase, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });
        console.log(`GET ${DESTINY_TEST_CASE_ENDPOINT}${res.data.id}/`);
        const rsp = yield call(axios.get, `${DESTINY_TEST_CASE_ENDPOINT}${res.data.id}/`);
        yield call(handleNotification, {
            message: "Updated Successfully",
            variant: 'success',
        });
        yield put({
            type: UPDATE_TEST_CASE_SUCCESS,
            payload: rsp.data
        });
    } catch (e) {
        console.log("Failed because", e);
        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}

function* deleteTestCase(action) {
    try {
        const {id} = action;
        console.log('DELETE', `${DESTINY_TEST_CASE_ENDPOINT}${id}/`);
        yield call(axios.delete, `${DESTINY_TEST_CASE_ENDPOINT}${id}/`, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });
        yield call(handleNotification, {
            message: "Deleted Successfully",
            variant: 'success',
        });
        yield put({
            type: DELETE_TEST_CASE_SUCCESS,
            payload: id
        });
    } catch (e) {
        console.log("Failed because", e);
        yield call(handleNotification, {
            message: e.message,
            variant: 'error',
        });
    }
}

function* bulkImportSystemTestCase(action) {
    try {
        const data = action.payload;
        const fd = new FormData();
        fd.append('data', data);
        const res = yield call(axios.post, DESTINY_BULK_IMPORT_SYSTEM_TEST_CASE, fd, {
            credentials: "include",
            headers: {
                "Content-Type": "multipart/form-data",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });
        console.log(res.data);
        for (const id of Array.from(res.data)) {
            console.log(`GET ${DESTINY_TEST_CASE_ENDPOINT}${id}/`);
            const rsp = yield call(axios.get, `${DESTINY_TEST_CASE_ENDPOINT}${id}/`);
            yield call(handleNotification, {
                message: "Added Successfully",
                variant: 'success',
            });
            yield put({
                type: ADD_TEST_CASE_SUCCESS,
                payload: rsp.data
            });
        }
        yield call(handleNotification, {
            message: `Imported ${Array.from(res.data).length} Test Cases`,
            variant: 'success',
        });
    } catch (e) {
        console.log("Failed because", e);
        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}

function* addTestResult(action) {
    try {
        const {testResult} = action;
        console.log('POST', DESTINY_TEST_RESULT_ENDPOINT, testResult);
        const res = yield call(axios.post, DESTINY_TEST_RESULT_ENDPOINT, testResult, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });
        console.log(`GET ${DESTINY_TEST_RESULT_ENDPOINT}${res.data.id}/`);
        const rsp = yield call(axios.get, `${DESTINY_TEST_RESULT_ENDPOINT}${res.data.id}/`);
        yield call(handleNotification, {
            message: "Added Successfully",
            variant: 'success',
        });
        yield put({
            type: ADD_TEST_RESULT_SUCCESS,
            payload: rsp.data
        });
    } catch (e) {
        console.log("Failed because", e);
        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}

function* updateTestResult(action) {
    try {
        const {testResult} = action;
        console.log(`PUT ${DESTINY_TEST_RESULT_ENDPOINT}${testResult.id}/`, testResult);
        const res = yield call(axios.put, `${DESTINY_TEST_RESULT_ENDPOINT}${testResult.id}/`, testResult, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });
        console.log(`GET ${DESTINY_TEST_RESULT_ENDPOINT}${res.data.id}/`);
        const rsp = yield call(axios.get, `${DESTINY_TEST_RESULT_ENDPOINT}${res.data.id}/`);
        yield call(handleNotification, {
            message: "Updated Successfully",
            variant: 'success',
        });
        yield put({
            type: UPDATE_TEST_RESULT_SUCCESS,
            payload: rsp.data
        });
    } catch (e) {
        console.log("Failed because", e);
        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}

function* deleteTestResult(action) {
    try {
        const {id} = action;
        console.log('DELETE', `${DESTINY_TEST_RESULT_ENDPOINT}${id}/`);
        yield call(axios.delete, `${DESTINY_TEST_RESULT_ENDPOINT}${id}/`, {
            credentials: "include",
            headers: {
                "Content-Type": "application/json",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });
        yield call(handleNotification, {
            message: "Deleted Successfully",
            variant: 'success',
        });
        yield put({
            type: DELETE_TEST_RESULT_SUCCESS,
            payload: id
        });
    } catch (e) {
        console.log("Failed because", e);
        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}

function* handleNotification({message, variant}) {
    let notification = {
        message: message,
        options: {
            key: new Date().getTime() + Math.random(),
            variant: variant,
            anchorOrigin: {
                horizontal: 'right',
                vertical: 'bottom'
            }
        }
    };

    const key = notification.options && notification.options.key;

    yield put({
        type: ENQUEUE_SNACKBAR,
        notification: {
            ...notification,
            key: key || new Date().getTime() + Math.random(),
        }
    });
}

function* bulkImportSystemTestResult(action) {
    try {
        const data = action.payload;
        const fd = new FormData();
        fd.append('data', data);
        const res = yield call(axios.post, DESTINY_BULK_IMPORT_SYSTEM_TEST_RESULT, fd, {
            credentials: "include",
            headers: {
                "Content-Type": "multipart/form-data",
                "X-CSRFToken": getCookie("csrftoken"),
            }
        });
        console.log(res.data);
        for (const id of Array.from(res.data)) {
            console.log(`GET ${DESTINY_TEST_RESULT_ENDPOINT}${id}/`);
            const rsp = yield call(axios.get, `${DESTINY_TEST_RESULT_ENDPOINT}${id}/`);
            yield call(handleNotification, {
                message: "Added Successfully",
                variant: 'success',
            });
            yield put({
                type: ADD_TEST_RESULT_SUCCESS,
                payload: rsp.data
            });
        }
        yield call(handleNotification, {
            message: `Imported ${Array.from(res.data).length} Test Results`,
            variant: 'success',
        });
    } catch (e) {
        console.log("Failed because", e);
        yield call(handleNotification, {
            message: e.message,
            variant: 'error'
        });
    }
}

export default function* destinyDashboard() {
    yield all([
        takeEvery(GET_USERS, getUsers),
        takeEvery(GET_REPOSITORIES, getRepositories),
        takeEvery(GET_PRODUCTS, getProducts),
        takeEvery(GET_USERS, getBranches),
        takeEvery(GET_BRANCHES, getUsers),
        takeEvery(GET_VERSIONS, getVersions),
        takeEvery(GET_TEST_STATUS_LIST, getTestStatusList),
        takeEvery(GET_TRIAGE_STATUS_LIST, getTriageStatusList),
        takeEvery(GET_TRIAGE_RESOLUTION_LIST, getTriageResolutionList),
        takeEvery(GET_TEST_FRAMEWORK_LIST, getTestFrameworkList),
        takeEvery(GET_TEST_CATEGORY_LIST, getTestCategoryList),
        takeLatest(GET_TEST_CASE_LIST, getTestCases),
        takeLatest(GET_TEST_RESULT_LIST, getTestResults),
        takeEvery(ADD_TEST_CASE, addTestCase),
        takeEvery(UPDATE_TEST_CASE, updateTestCase),
        takeEvery(DELETE_TEST_CASE, deleteTestCase),
        takeEvery(ADD_TEST_RESULT, addTestResult),
        takeEvery(UPDATE_TEST_RESULT, updateTestResult),
        takeEvery(DELETE_TEST_RESULT, deleteTestResult),
        takeEvery(BULK_IMPORT_SYSTEM_TEST_CASE, bulkImportSystemTestCase),
        takeEvery(BULK_IMPORT_SYSTEM_TEST_RESULT, bulkImportSystemTestResult),
    ]);
}
