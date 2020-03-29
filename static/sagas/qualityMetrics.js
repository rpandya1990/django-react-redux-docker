import axios from "axios";
import {all, call, put, takeEvery} from 'redux-saga/effects';

import {
    DESTINY_GET_MANAGER_SUITE_BUILD_BY_BUILD_ENDPOINT,
    DESTINY_GET_MANAGER_TEST_CASE_TIMELINE_ENDPOINT,
} from "../api/endpoints";
import {
    DECREMENT_FETCHING,
    GET_MANAGER_SUITE_BUILD_BY_BUILD,
    GET_MANAGER_SUITE_BUILD_BY_BUILD_SUCCESS,
    GET_MANAGER_TEST_CASE_TIMELINE,
    GET_MANAGER_TEST_CASE_TIMELINE_SUCCESS,
    INCREMENT_FETCHING
} from "../actions/types";

function* incrementFetching(value) {
    yield put({
        type: INCREMENT_FETCHING,
        value: value
    });
}

function* decrementFetching(value) {
    yield put({
        type: DECREMENT_FETCHING,
        value: value
    });
}

function* getManagerSuiteBuildByBuild(action) {
    try {
        const {params} = action;
        yield call(incrementFetching, GET_MANAGER_SUITE_BUILD_BY_BUILD);
        const rsp = yield call(axios.get, `${DESTINY_GET_MANAGER_SUITE_BUILD_BY_BUILD_ENDPOINT}?${params ? params.toString() : ''}`);
        yield put({
            type: GET_MANAGER_SUITE_BUILD_BY_BUILD_SUCCESS,
            payload: rsp.data
        });
        yield call(decrementFetching, GET_MANAGER_SUITE_BUILD_BY_BUILD);
    } catch (e) {
        console.log("Failed because", e);
    }
}

function* getManagerTestCaseTimeline(action) {
    try {
        const {params} = action;
        yield call(incrementFetching, GET_MANAGER_TEST_CASE_TIMELINE);
        const rsp = yield call(axios.get, `${DESTINY_GET_MANAGER_TEST_CASE_TIMELINE_ENDPOINT}?${params ? params.toString() : ''}`);
        yield put({
            type: GET_MANAGER_TEST_CASE_TIMELINE_SUCCESS,
            payload: rsp.data
        });
        yield call(decrementFetching, GET_MANAGER_TEST_CASE_TIMELINE);
    } catch (e) {
        console.log("Failed because", e);
    }
}

export default function* qualityMetrics() {
    yield all([
        takeEvery(GET_MANAGER_SUITE_BUILD_BY_BUILD, getManagerSuiteBuildByBuild),
        takeEvery(GET_MANAGER_TEST_CASE_TIMELINE, getManagerTestCaseTimeline)
    ]);
}
