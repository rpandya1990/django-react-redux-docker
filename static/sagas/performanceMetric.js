import axios from "axios";
import { call, put, takeEvery, takeLatest, all } from 'redux-saga/effects';
import {
    PERF_METRIC_TOGGLE_BASELINE_SUCCESS,
    PERF_METRIC_CHANGE_JIRA_TAGS_SUCCESS,
    PERF_METRIC_GET_DATA_SUCCESS,
    PERF_METRIC_GET_DATA,
    PERF_METRIC_TOGGLE_BASELINE,
    PERF_METRIC_CHANGE_JIRA_TAGS,
    PERF_METRIC_INVALIDATE,
    ENQUEUE_SNACKBAR
} from "../actions/types";
import {
    DESTINY_PERFORMANCE_METRIC_ENDPOINT,
    CHANGE_PERF_METRIC_JIRA_TAGS,
} from "../api/endpoints";
import {getCookie} from "../utils";

function* getPerformanceMetricData(action) {
    try {
        const rawContext = yield call(axios.get, `${DESTINY_PERFORMANCE_METRIC_ENDPOINT}${action.id}/`);
        yield put({
            type: PERF_METRIC_GET_DATA_SUCCESS,
            payload: rawContext.data,
            id: action.id
        });
    } catch (e) {
        console.log("Failed because", e);
    }
}

function* changePerfMetricJiraTags(action) {
    const verifiedAxios = axios.create({
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
        }
    });
    try {
        const rawContext = yield call(verifiedAxios.put, `${CHANGE_PERF_METRIC_JIRA_TAGS}/?id=${action.id}&jira_tags=${action.jira_tags}`);
        yield put({
            type: PERF_METRIC_CHANGE_JIRA_TAGS_SUCCESS,
            payload: rawContext.data.jira_tags,
            id: action.id
        });
        yield put({
            type: ENQUEUE_SNACKBAR,
            notification: {
                key: new Date().getTime() + Math.random(),
                message: action.id + " has been updated."
            }
        });
    } catch (e) {
        console.log("Failed because", e);
    }
}

function* invalidateMetric(action) {
    const verifiedAxios = axios.create({
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
        }
    });
    try {
        const rawContext = yield call(verifiedAxios.delete, `${DESTINY_PERFORMANCE_METRIC_ENDPOINT}${action.id}/`);
        yield put({
            type: ENQUEUE_SNACKBAR,
            notification: {
                key: new Date().getTime() + Math.random(),
                message: action.id + " has been updated."
            }
        });
    } catch (e) {
        console.log("Failed because", e);
    }
}

function* toggleBaseline(action) {
    const verifiedAxios = axios.create({
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
        }
    });
    try {
        const rawContext = yield call(verifiedAxios.patch, `${DESTINY_PERFORMANCE_METRIC_ENDPOINT}${action.id}/`);
        yield put({
            type: PERF_METRIC_TOGGLE_BASELINE_SUCCESS,
            payload: rawContext.data.baseline,
            id: action.id
        });
        yield put({
            type: ENQUEUE_SNACKBAR,
            notification: {
                key: new Date().getTime() + Math.random(),
                message: action.id + " has been updated."
            }
        });
    } catch (e) {
        console.log("Failed because", e);
    }
}

export default function* performanceMetric() {
    yield all([
        takeEvery(PERF_METRIC_CHANGE_JIRA_TAGS, changePerfMetricJiraTags),
        takeLatest(PERF_METRIC_INVALIDATE, invalidateMetric),
        takeLatest(PERF_METRIC_GET_DATA, getPerformanceMetricData),
        takeLatest(PERF_METRIC_TOGGLE_BASELINE, toggleBaseline)
    ]);
}
