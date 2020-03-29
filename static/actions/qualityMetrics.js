import {
    GET_MANAGER_SUITE_BUILD_BY_BUILD,
    GET_MANAGER_TEST_CASE_TIMELINE,
} from "./types";


export const getManagerSuiteBuildByBuild = params => dispatch => {
    dispatch({
        type: GET_MANAGER_SUITE_BUILD_BY_BUILD,
        params: params
    })
};

export const getManagerTestCaseTimeline = params => dispatch => {
    dispatch({
        type: GET_MANAGER_TEST_CASE_TIMELINE,
        params: params
    })
};