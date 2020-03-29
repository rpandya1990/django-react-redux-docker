import {GET_MANAGER_SUITE_BUILD_BY_BUILD_SUCCESS, GET_MANAGER_TEST_CASE_TIMELINE_SUCCESS,} from "../actions/types";
import _ from "lodash";

const initialState = {
    manager_suite_build_by_build: {},
    manager_testcase_timeline: {},
};

export default (state = initialState, action) => {
    switch (action.type) {
        case GET_MANAGER_SUITE_BUILD_BY_BUILD_SUCCESS:
            return {
                ...state,
                manager_suite_build_by_build: _.merge({}, state.manager_suite_build_by_build, action.payload)
            };
        case GET_MANAGER_TEST_CASE_TIMELINE_SUCCESS:
            return {
                ...state,
                manager_testcase_timeline: _.merge({}, state.manager_testcase_timeline, action.payload)
            };
        default:
            return {...state}
    }
}