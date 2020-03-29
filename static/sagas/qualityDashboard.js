import axios from "axios";
import { call, put, takeEvery, takeLatest, all } from 'redux-saga/effects';
import {
    FETCH_FILTERED_PERFORMANCE_CONTEXT,
    TOGGLE_BASELINE_SUCCESS,
    CHANGE_PERF_METRIC_JIRA_TAGS_SUCCESS,
    GET_PERFORMANCE_METRIC_DATA_SUCCESS,
    FETCH_FILTERED_PERFORMANCE_CONTEXT_SUCCESS,
    GET_PERFORMANCE_METRIC_DATA,
    TOGGLE_BASELINE,
    CHANGE_PERF_METRIC_JIRA_TAGS,
    INVALIDATE_METRIC,
    GET_RECENT_VERSIONS,
    GET_RECENT_VERSIONS_SUCCESS,
    GET_PREVIOUS_PERF_METRIC_VERSIONS,
    GET_PREVIOUS_PERF_METRIC_VERSIONS_SUCCESS,
    REDIRECT_FEATURE_TABLEAU_DASH,
    GET_LAST_FIVE_TREND,
    GET_LAST_FIVE_TREND_SUCCESS,
    GET_WEB_SHELL,
    GET_WEB_SHELL_SUCCESS,
    GET_WEB_SHELL_FAILURE,
    GET_BUILD_BY_BUILD_REGRESSION,
    GET_BUILD_BY_BUILD_REGRESSION_SUCCESS,
    DESTINY_GET_SUITES,
    DESTINY_GET_SUITES_SUCCESS,
    ENQUEUE_SNACKBAR,
    FETCH_POLARIS_PIPELINE_DATA,
    FETCH_POLARIS_PIPELINE_DATA_SUCCESS,
    GET_PIPELINE_CONTEXT,
    FETCH_POLARIS_RUN_BY_RUN_DATA,
    FETCH_POLARIS_RUN_BY_RUN_DATA_SUCCESS
} from "../actions/types";
import {
    DESTINY_PERFORMANCE_METRIC_ENDPOINT,
    CHANGE_PERF_METRIC_JIRA_TAGS as CHANGE_METRIC_JIRA_TAGS,
    GET_RECENT_VERSIONS_ENDPOINT,
    GET_PREVIOUS_PERF_METRIC_VERSIONS_ENDPOINT,
    GET_FEATURE_TABLEAU_LINK_ENDPOINT,
    GET_LAST_FIVE_TREND_ENDPOINT,
    GET_WEB_SHELL_ENDPOINT,
    GET_BUILD_BY_BUILD_REGRESSION_ENDPOINT,
    DESTINY_GET_SUITES_ENDPOINT,
    GET_PIPELINE_QUALITY_INFO,
    GET_PIPELINE_RUN_BY_RUN,
} from "../api/endpoints";
import {getCookie} from "../utils";


function* fetchFilteredPerformanceContext(action) {
    try {
        const rawContext = yield call(axios.get, `${DESTINY_PERFORMANCE_METRIC_ENDPOINT}?${action.getParams}`);
        const context = rawContext.data;
        const versionContext = {};
        versionContext[action.feature+action.version] = context;
        yield put({
            type: FETCH_FILTERED_PERFORMANCE_CONTEXT_SUCCESS,
            payload: versionContext,
            branches: action.branches
        });
    } catch (e) {
        console.log("Failed because", e);
    }
}

function* getPerformanceMetricData(action) {
    try {
        const rawContext = yield call(axios.get, `${DESTINY_PERFORMANCE_METRIC_ENDPOINT}${action.id}/`);
        const perfContext = {};
        perfContext[action.id+"data"] = rawContext.data;
        perfContext[action.id+"baseline"] = perfContext[action.id+"data"].baseline;
        perfContext[action.id+"jira_tags"] = perfContext[action.id+"data"].jira_tags;
        perfContext[action.id+"rksupport"] = perfContext[action.id+"data"].rksupport;
        perfContext[action.id+"children_info"] = perfContext[action.id+"data"].children_info;
        yield put({
            type: GET_PERFORMANCE_METRIC_DATA_SUCCESS,
            payload: perfContext,
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
        const rawContext = yield call(verifiedAxios.put, `${CHANGE_METRIC_JIRA_TAGS}/?id=${action.id}&jira_tags=${action.jira_tags}`);
        const perfContext = {};
        perfContext[action.id+"jira_tags"] = rawContext.data.jira_tags;
        yield put({
            type: CHANGE_PERF_METRIC_JIRA_TAGS_SUCCESS,
            payload: perfContext,
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
        const perfContext = {};
        perfContext[action.id+"baseline"] = rawContext.data.baseline;
        yield put({
            type: TOGGLE_BASELINE_SUCCESS,
            payload: perfContext,
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

function* getWebShell(action) {
    const verifiedAxios = axios.create({
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
            "X-CSRFToken": getCookie("csrftoken"),
        }
    });
    try {
        const rawContext = yield call(verifiedAxios.put, `${GET_WEB_SHELL_ENDPOINT}/?logdir=${action.logdir}`);
        yield put({
            type: GET_WEB_SHELL_SUCCESS
        });
        if (rawContext['data']) {
            window.open(rawContext['data'])
        }
        else {
            window.alert("Logs do not exist");
        }
    } catch (e) {
        window.alert("Logs do not exist");
        yield put({
            type: GET_WEB_SHELL_FAILURE
        });
        console.log("Failed because", e);
    }
}

function* getRecentVersions(action) {
    try {
        const rawContext = yield call(axios.get, `${GET_RECENT_VERSIONS_ENDPOINT}?${action.getParams}`);
        yield put({
            type: GET_RECENT_VERSIONS_SUCCESS,
            payload: rawContext.data,
        });
    } catch (e) {
        console.log("Failed because", e);
    }
}

function* getPreviousPerfMetricVersions(action) {
    try {
        const rawContext = yield call(
            axios.get,
            `${GET_PREVIOUS_PERF_METRIC_VERSIONS_ENDPOINT}?${action.getParams}`);
        yield put({
            type: GET_PREVIOUS_PERF_METRIC_VERSIONS_SUCCESS,
            payload: rawContext.data,
        });
    } catch (e) {
        console.log("Failed because", e);
    }
}

function* redirectFeatureTableauDash(action) {
    try {
        const rawContext = yield call(axios.get, `${GET_FEATURE_TABLEAU_LINK_ENDPOINT}?${action.getParams}`);
        if (rawContext.data) {
            window.open(rawContext.data.tableau_link);
        }
    } catch(e) {
        console.log("Failed because", e);
    }
}

function* getLatestFiveTrend(action) {
    try {
        const rawContext = yield call(axios.get, `${GET_LAST_FIVE_TREND_ENDPOINT}?${action.getParams}`);
        yield put({
            type: GET_LAST_FIVE_TREND_SUCCESS,
            payload: rawContext.data
        });
    } catch(e) {
        console.log("Failed because", e);
    }
}

function* getBuildByBuildRegression(action) {
    try {
        const rawContext = yield call(axios.get, `${GET_BUILD_BY_BUILD_REGRESSION_ENDPOINT}?${action.getParams}`);
        yield put({
            type: GET_BUILD_BY_BUILD_REGRESSION_SUCCESS,
            payload: rawContext.data
        });
    } catch(e) {
        console.log("Failed because", e);
    }
}

function* fetchPolarisPipelineData(action) {
    try {
        const rawContext = yield call(axios.get, `${GET_PIPELINE_QUALITY_INFO}?${action.getParams}`);
        yield put({
            type: FETCH_POLARIS_PIPELINE_DATA_SUCCESS,
            payload: rawContext.data,
            category: action.category
        });
    } catch(e) {
        console.log("Failed because", e);
    }
}

function* getPolarisRunByRun(action) {
    try {
        const rawContext = yield call(axios.get, `${GET_PIPELINE_RUN_BY_RUN}?${action.getParams}`);
        yield put({
            type: FETCH_POLARIS_RUN_BY_RUN_DATA_SUCCESS,
            payload: rawContext.data,
            category: action.category
        });
    } catch(e) {
        console.log("Failed because", e);
    }
}

export default function* qualityDashboard() {
    yield all([
        takeEvery(FETCH_FILTERED_PERFORMANCE_CONTEXT, fetchFilteredPerformanceContext),
        takeEvery(CHANGE_PERF_METRIC_JIRA_TAGS, changePerfMetricJiraTags),
        takeLatest(INVALIDATE_METRIC, invalidateMetric),
        takeLatest(GET_PERFORMANCE_METRIC_DATA, getPerformanceMetricData),
        takeLatest(TOGGLE_BASELINE, toggleBaseline),
        takeLatest(GET_RECENT_VERSIONS, getRecentVersions),
        takeLatest(GET_PREVIOUS_PERF_METRIC_VERSIONS, getPreviousPerfMetricVersions),
        takeLatest(REDIRECT_FEATURE_TABLEAU_DASH, redirectFeatureTableauDash),
        takeLatest(GET_LAST_FIVE_TREND, getLatestFiveTrend),
        takeLatest(GET_BUILD_BY_BUILD_REGRESSION, getBuildByBuildRegression),
        takeEvery(FETCH_POLARIS_PIPELINE_DATA, fetchPolarisPipelineData),
        takeEvery(FETCH_POLARIS_RUN_BY_RUN_DATA, getPolarisRunByRun),
        takeLatest(GET_WEB_SHELL, getWebShell)
    ]);
}
