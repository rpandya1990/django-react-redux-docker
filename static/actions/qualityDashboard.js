import axios from "axios";

import {
    FETCH_FILTERED_PERFORMANCE_CONTEXT,
    FETCHING_EFFECTIVE_PIPELINE_RUN_BY_RUN_DATA,
    FETCHING_EFFECTIVE_SYSTEM_RUN_BY_RUN_DATA,
    FETCHING_PERFORMANCE_CONTEXT,
    FETCHING_PERFORMANCE_RUN_SUMMARY,
    FETCHING_HIGH_VARIABLE_PERF_METRICS,
    FETCHING_PIPELINE_CONTEXT,
    FETCHING_PERFORMANCE_RUN_BY_RUN,
    FETCHING_PIPELINE_RUN_BY_RUN_DATA,
    FETCHING_SYSTEM_CLUSTER_BREAKDOWN_DATA,
    FETCHING_SYSTEM_CLUSTERS_DATA,
    FETCHING_SYSTEM_CONTEXT,
    FETCHING_SYSTEM_RUN_BY_RUN_DATA, FETCHING_SYSTEM_TEST_ACROSS_BUILDS_DATA,
    GET_EFFECTIVE_PIPELINE_RUN_BY_RUN_DATA,
    GET_EFFECTIVE_SYSTEM_RUN_BY_RUN_DATA,
    REDIRECT_FEATURE_TABLEAU_DASH,
    FETCHING_PREVIOUS_PERF_METRICS,
    GET_PREVIOUS_PERF_METRICS_SUCCESS,
    CHANGE_PERF_METRIC_JIRA_TAGS,
    INVALIDATE_METRIC,
    GET_LAST_FIVE_TREND,
    GET_WEB_SHELL,
    GET_PERFORMANCE_CONTEXT,
    GET_PERFORMANCE_RUN_SUMMARY,
    GET_PERFORMANCE_RUN_BY_RUN,
    GET_PERFORMANCE_METRIC_DATA,
    GET_HIGH_VARIABLE_PERF_METRICS,
    GET_PIPELINE_CONTEXT,
    GET_PIPELINE_RUN_BY_RUN_DATA,
    GET_RECENT_VERSIONS,
    GET_PREVIOUS_PERF_METRIC_VERSIONS,
    GET_SYSTEM_CLUSTER_BREAKDOWN_DATA,
    GET_SYSTEM_CLUSTERS_DATA,
    GET_SYSTEM_CONTEXT,
    GET_SYSTEM_RUN_BY_RUN_DATA, GET_SYSTEM_TEST_ACROSS_BUILDS_DATA,
    TOGGLE_BASELINE,
    GET_BUILD_BY_BUILD_REGRESSION, DESTINY_GET_SUITES,
    FETCH_POLARIS_PIPELINE_DATA,
    FETCH_POLARIS_RUN_BY_RUN_DATA,
    GET_STRESSTEST_INFO,
    GET_FEATURE_STRESS_RUN_BY_RUN_DATA
} from "./types";

import {
    GET_EFFECTIVE_PIPELINE_RUN_BY_RUN,
    GET_EFFECTIVE_SYSTEM_RUN_BY_RUN,
    GET_PERFORMANCE_QUALITY_INFO,
    GET_PERFORMANCE_RUN_SUMMARY_ENDPOINT,
    GET_PERFORMANCE_RUN_BY_RUN_ENDPOINT,
    GET_HIGH_VARIABLE_PERF_METRICS_ENDPOINT,
    GET_PREVIOUS_METRICS,
    CHANGE_PERF_METRIC_JIRA_TAGS as CHANGE_METRIC_JIRA_TAGS,
    GET_PIPELINE_QUALITY_INFO,
    GET_PIPELINE_RUN_BY_RUN,
    GET_SYSTEM_CLUSTER_BREAKDOWN,
    GET_SYSTEM_CLUSTERS,
    GET_SYSTEM_QUALITY_INFO,
    GET_SYSTEM_RUN_BY_RUN, GET_SYSTEM_TEST_ACROSS_BUILDS,
    GET_FEATURE_STRESS_DASHBOARD, GET_FEATURE_STRESS_RUN_BY_RUN
} from "../api/endpoints";


export const getPipelineContext = (params, branch) => dispatch => {
    dispatch({
        type: FETCHING_PIPELINE_CONTEXT,
        branches: [branch],
        value: params.toString()
    });
    let axiosInstance = axios.create({timeout: 60 * 2 * 1000});
    axiosInstance
        .get(`${GET_PIPELINE_QUALITY_INFO}?${params.toString()}`)
        .then(rsp => {
            dispatch({
                type: GET_PIPELINE_CONTEXT,
                payload: rsp.data,
                branches: [branch],
                value: params.toString()
            });
        })
        .catch(err => {
            console.log(err);
        });
};


export const getPerformanceContext = (params, branch) => dispatch => {
    dispatch({
        type: FETCHING_PERFORMANCE_CONTEXT,
        branches: [branch],
        value: params.toString()
    });
    axios
        .get(`${GET_PERFORMANCE_QUALITY_INFO}?${params.toString()}`)
        .then(rsp => {
            dispatch({
                type: GET_PERFORMANCE_CONTEXT,
                payload: rsp.data,
                branches: [branch],
                value: params.toString()
            });
        })
        .catch(err => {
            console.log(err);
        });
};


export const getPerformanceRunSummary = (params, branch) => dispatch => {
    dispatch({
        type: FETCHING_PERFORMANCE_RUN_SUMMARY,
        branches: [branch],
        value: params.toString()
    });
    axios
        .get(`${GET_PERFORMANCE_RUN_SUMMARY_ENDPOINT}?${params.toString()}`)
        .then(rsp => {
            dispatch({
                type: GET_PERFORMANCE_RUN_SUMMARY,
                payload: rsp.data,
                branches: [branch],
                value: params.toString()
            });
        })
        .catch(err => {
            console.log(err);
        });
};

export const getPerformanceRunByRun = (params, branch) => dispatch => {
    dispatch({
        type: FETCHING_PERFORMANCE_RUN_BY_RUN,
        branches: [branch],
        value: params.toString()
    });
    axios
        .get(`${GET_PERFORMANCE_RUN_BY_RUN_ENDPOINT}?${params.toString()}`)
        .then(rsp => {
            dispatch({
                type: GET_PERFORMANCE_RUN_BY_RUN,
                payload: rsp.data,
                branches: [branch],
                value: params.toString()
            });
        })
        .catch(err => {
            console.log(err);
        });
};

export const getHighVariablePerfMetrics = (params, branch) => dispatch => {
    dispatch({
        type: FETCHING_HIGH_VARIABLE_PERF_METRICS,
        branches: [branch],
        value: params.toString()
    });
    axios
        .get(`${GET_HIGH_VARIABLE_PERF_METRICS_ENDPOINT}?${params.toString()}`)
        .then(rsp => {
            dispatch({
                type: GET_HIGH_VARIABLE_PERF_METRICS,
                payload: rsp.data,
                branches: [branch],
                value: params.toString()
            });
        })
        .catch(err => {
            console.log(err);
        });
};

export const getSystemContext = (params, branch) => dispatch => {
    dispatch({
        type: FETCHING_SYSTEM_CONTEXT,
        branches: [branch],
        value: params.toString()
    });
    axios
        .get(`${GET_SYSTEM_QUALITY_INFO}?${params.toString()}`)
        .then(rsp => {
            dispatch({
                type: GET_SYSTEM_CONTEXT,
                payload: rsp.data,
                branches: [branch],
                value: params.toString()
            });
        })
        .catch(err => {
            console.log(err);
        });
};


export const getEffectivePipelineRunByRun = (params, branch) => dispatch => {
    dispatch({
        type: FETCHING_EFFECTIVE_PIPELINE_RUN_BY_RUN_DATA,
        branches: [branch],
        value: params.toString()
    });
    axios
        .get(`${GET_EFFECTIVE_PIPELINE_RUN_BY_RUN}?${params.toString()}`)
        .then(rsp => {
            dispatch({
                type: GET_EFFECTIVE_PIPELINE_RUN_BY_RUN_DATA,
                payload: rsp.data,
                branches: [branch],
                value: params.toString()
            });
        })
        .catch(err => {
            console.log(err);
        });
};


export const getPipelineRunByRun = (params, branch) => dispatch => {
    dispatch({
        type: FETCHING_PIPELINE_RUN_BY_RUN_DATA,
        branches: [branch],
        value: params.toString()
    });
    axios
        .get(`${GET_PIPELINE_RUN_BY_RUN}?${params.toString()}`)
        .then(rsp => {
            dispatch({
                type: GET_PIPELINE_RUN_BY_RUN_DATA,
                payload: rsp.data,
                branches: [branch],
                value: params.toString()
            });
        })
        .catch(err => {
            console.log(err);
        });
};


export const getEffectiveSystemRunByRun = (params, branch) => dispatch => {
    dispatch({
        type: FETCHING_EFFECTIVE_SYSTEM_RUN_BY_RUN_DATA,
        branches: [branch],
        value: params.toString()
    });
    axios
        .get(`${GET_EFFECTIVE_SYSTEM_RUN_BY_RUN}?${params.toString()}`)
        .then(rsp => {
            dispatch({
                type: GET_EFFECTIVE_SYSTEM_RUN_BY_RUN_DATA,
                payload: rsp.data,
                branches: [branch],
                value: params.toString()
            });
        })
        .catch(err => {
            console.log(err);
        });
};


export const getSystemRunByRun = (params, branch) => dispatch => {
    dispatch({
        type: FETCHING_SYSTEM_RUN_BY_RUN_DATA,
        branches: [branch],
        value: params.toString()
    });
    axios
        .get(`${GET_SYSTEM_RUN_BY_RUN}?${params.toString()}`)
        .then(rsp => {
            dispatch({
                type: GET_SYSTEM_RUN_BY_RUN_DATA,
                payload: rsp.data,
                branches: [branch],
                value: params.toString()
            });
        })
        .catch(err => {
            console.log(err);
        });
};


export const getSystemTestAcrossBuilds = (params, branch) => dispatch => {
    dispatch({
        type: FETCHING_SYSTEM_TEST_ACROSS_BUILDS_DATA,
        branches: [branch],
        value: params.toString()
    });
    axios
        .get(`${GET_SYSTEM_TEST_ACROSS_BUILDS}?${params.toString()}`)
        .then(rsp => {
            dispatch({
                type: GET_SYSTEM_TEST_ACROSS_BUILDS_DATA,
                payload: rsp.data,
                branches: [branch],
                value: params.toString()
            });
        })
        .catch(err => {
            console.log(err);
        });
};


export const getSystemClusters = (params, branch) => dispatch => {
    dispatch({
        type: FETCHING_SYSTEM_CLUSTERS_DATA,
        branches: [branch],
        value: params.toString()
    });
    axios
        .get(`${GET_SYSTEM_CLUSTERS}?${params.toString()}`)
        .then(rsp => {
            dispatch({
                type: GET_SYSTEM_CLUSTERS_DATA,
                payload: rsp.data,
                branches: [branch],
                value: params.toString()
            });
        })
        .catch(err => {
            console.log(err);
        });
};


export const getSystemClusterBreakdown = (params, branch) => dispatch => {
    dispatch({
        type: FETCHING_SYSTEM_CLUSTER_BREAKDOWN_DATA,
        branches: [branch],
        value: params.toString()
    });
    axios
        .get(`${GET_SYSTEM_CLUSTER_BREAKDOWN}?${params.toString()}`)
        .then(rsp => {
            dispatch({
                type: GET_SYSTEM_CLUSTER_BREAKDOWN_DATA,
                payload: rsp.data,
                branches: [branch],
                value: params.toString()
            });
        })
        .catch(err => {
            console.log(err);
        });
};


export const getFilteredPerformanceContext = (params, branch, version, feature) => (dispatch, getState) => {
    dispatch({
        type: FETCH_FILTERED_PERFORMANCE_CONTEXT,
        version: version,
        feature: feature,
        branches: [branch],
        getParams: params.toString()
    });
};


export const getPerformanceMetricData = (id) => dispatch => {
    dispatch({
        type: GET_PERFORMANCE_METRIC_DATA,
        id: id
    });
};


export const toggleBaseline = (id) => dispatch => {
    dispatch({
        type: TOGGLE_BASELINE,
        id: id
    });
};


export const getRecentVersions = (getParams) => dispatch => {
    dispatch({
        type: GET_RECENT_VERSIONS,
        getParams
    });
};

export const getPreviousPerfMetricVersions = (getParams) => dispatch => {
    dispatch({
        type: GET_PREVIOUS_PERF_METRIC_VERSIONS,
        getParams
    });
};

export const redirectFeatureTableauDash = (feature, getParams) => (dispatch, getState) => {
    dispatch({
        type: REDIRECT_FEATURE_TABLEAU_DASH,
        getParams
    });
};

export const getPreviousPerfMetrics = (id, limit, version_starts_with_l=null) => dispatch => {
    dispatch({
        type: FETCHING_PREVIOUS_PERF_METRICS
    });
    let axiosInstance = axios.create({timeout: 60 * 2 * 1000});
    let url = `${GET_PREVIOUS_METRICS}/?id=${id}&limit=${limit}`;
    if (version_starts_with_l) {
        version_starts_with_l.forEach(function (item) {
            item = item.trim();
            if (item.length) {
                url = url + `&version_starts_with=${item}`;
            }
        });
    }
    axiosInstance
        .get(url)
        .then(rsp => {
            dispatch({
                type: GET_PREVIOUS_PERF_METRICS_SUCCESS,
                payload: rsp.data,
            });
        })
        .catch(err => {
            console.log(err);
        });
};

export const changePerfMetricJiraTags = (id, tags) => dispatch => {
    dispatch({
        type: CHANGE_PERF_METRIC_JIRA_TAGS,
        id: id,
        jira_tags: tags
    });
};

export const invalidateMetric = (id) => dispatch => {
    dispatch({
        type: INVALIDATE_METRIC,
        id: id
    });
};

export const getLastFiveTrend = (getParams) => (dispatch) => {
    dispatch({
        type: GET_LAST_FIVE_TREND,
        getParams
    });
};

export const getWebShell = (logdir) => (dispatch) => {
    dispatch({
        type: GET_WEB_SHELL,
        logdir: logdir
    });
};

export const getBuildByBuildRegression = (getParams, id) => (dispatch, getState) => {
    let state = getState();
    if (state.qualityDashboard.buildByBuildRegression[id]) {
        return state.qualityDashboard.buildByBuildRegression[id];
    }
    dispatch({
        type: GET_BUILD_BY_BUILD_REGRESSION,
        getParams
    });
};

export const fetchPolarisPipelineData = (getParams, category, id) => (dispatch, getState) => {
    let state = getState();
    if (state.qualityDashboard.polarisPipelineContext[category] &&
        state.qualityDashboard.polarisPipelineContext[category][id]) {
        return;
    }
    dispatch({
        type: FETCH_POLARIS_PIPELINE_DATA,
        getParams,
        category
    });
};

export const getPolarisRunByRun = (getParams, category, id) => (dispatch, getState) => {
    let state = getState();
    if (state.qualityDashboard.polarisRunByRun[category] &&
        state.qualityDashboard.polarisRunByRun[category][id]) {
        return;
    }
    dispatch({
        type: FETCH_POLARIS_RUN_BY_RUN_DATA,
        getParams,
        category
    });
};

export const getFeatureStressTestResults = (currVersion) => (dispatch, getState) => {
    let state = getState();

    axios.get(
        `${GET_FEATURE_STRESS_DASHBOARD}?version=${currVersion.toString()}`
        // GET_FEATURE_STRESS_DASHBOARD + '/?version=${currVersion}'
    ).then(
        rsp => dispatch({
            type: GET_STRESSTEST_INFO,
            payload: rsp.data
        })
    ).catch(err => {
        console.log(err);
    })
};

export const getFeatureStressRunByRun = (params, branch) => dispatch => {
    axios
        .get(`${GET_FEATURE_STRESS_RUN_BY_RUN}?${params.toString()}`)
        .then(rsp => {
            dispatch({
                type: GET_FEATURE_STRESS_RUN_BY_RUN_DATA,
                payload: rsp.data,
                branches: [branch],
                value: params.toString()
            });
        })
        .catch(err => {
            console.log(err);
        });
};
