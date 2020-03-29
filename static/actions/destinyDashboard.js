import {
    ADD_TEST_CASE,
    ADD_TEST_RESULT, BULK_IMPORT_SYSTEM_TEST_CASE, BULK_IMPORT_SYSTEM_TEST_RESULT,
    DELETE_TEST_CASE,
    DELETE_TEST_RESULT,
    GET_BRANCHES,
    GET_PRODUCTS,
    GET_REPOSITORIES,
    GET_TEST_CASE_LIST,
    GET_TEST_CATEGORY_LIST,
    GET_TEST_FRAMEWORK_LIST,
    GET_TEST_RESULT_LIST,
    GET_TEST_STATUS_LIST,
    GET_TRIAGE_RESOLUTION_LIST,
    GET_TRIAGE_STATUS_LIST,
    GET_USERS,
    GET_VERSIONS,
    UPDATE_TEST_CASE,
    UPDATE_TEST_RESULT
} from "./types";


export const getUsers = params => dispatch => {
    dispatch({
        type: GET_USERS,
        params: params
    });
};

export const getRepositories = params => dispatch => {
    dispatch({
        type: GET_REPOSITORIES,
        params: params
    });
};

export const getProducts = params => dispatch => {
    dispatch({
        type: GET_PRODUCTS,
        params: params
    })
};

export const getBranches = params => dispatch => {
    dispatch({
        type: GET_BRANCHES,
        params: params
    })
};

export const getVersions = params => dispatch => {
    dispatch({
        type: GET_VERSIONS,
        params: params
    })
};

export const getTestStatusList = params => dispatch => {
    dispatch({
        type: GET_TEST_STATUS_LIST,
        params: params
    })
};

export const getTriageStatusList = params => dispatch => {
    dispatch({
        type: GET_TRIAGE_STATUS_LIST,
        params: params
    })
};

export const getTriageResolutionList = params => dispatch => {
    dispatch({
        type: GET_TRIAGE_RESOLUTION_LIST,
        params: params
    })
};

export const getTestFrameworkList = params => dispatch => {
    dispatch({
        type: GET_TEST_FRAMEWORK_LIST,
        params: params
    })
};

export const getTestCategoryList = params => dispatch => {
    dispatch({
        type: GET_TEST_CATEGORY_LIST,
        params: params
    })
};

export const getTestCases = params => dispatch => {
    dispatch({
        type: GET_TEST_CASE_LIST,
        params: params
    })
};


export const getTestResults = params => dispatch => {
    dispatch({
        type: GET_TEST_RESULT_LIST,
        params: params
    })
};


export const addTestCase = testCase => dispatch => {
    dispatch({
        type: ADD_TEST_CASE,
        testCase: testCase
    })
};

export const updateTestCase = testCase => dispatch => {
    dispatch({
        type: UPDATE_TEST_CASE,
        testCase: testCase
    })
};

export const deleteTestCase = id => dispatch => {
    dispatch({
        type: DELETE_TEST_CASE,
        id: id
    })
};

export const addTestResult = testResult => dispatch => {
    dispatch({
        type: ADD_TEST_RESULT,
        testResult: testResult
    })
};

export const updateTestResult = testResult => dispatch => {
    dispatch({
        type: UPDATE_TEST_RESULT,
        testResult: testResult
    })
};

export const deleteTestResult = id => dispatch => {
    dispatch({
        type: DELETE_TEST_RESULT,
        id: id
    })
};


export const bulkImportSystemTestCase = file => dispatch => {
    dispatch({
        type: BULK_IMPORT_SYSTEM_TEST_CASE,
        payload: file
    })
};


export const bulkImportSystemTestResult = file => dispatch => {
    dispatch({
        type: BULK_IMPORT_SYSTEM_TEST_RESULT,
        payload: file
    })
};