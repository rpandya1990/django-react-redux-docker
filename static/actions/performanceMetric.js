import axios from "axios";

import {
    PERF_METRIC_FETCHING_PREVIOUS,
    PERF_METRIC_FETCHING_PREVIOUS_SUCCESS,
    PERF_METRIC_CHANGE_JIRA_TAGS,
    PERF_METRIC_INVALIDATE,
    PERF_METRIC_GET_DATA,
    PERF_METRIC_TOGGLE_BASELINE,
} from "./types";

import {
    GET_PREVIOUS_METRICS,
    CHANGE_PERF_METRIC_JIRA_TAGS as CHANGE_METRIC_JIRA_TAGS,
} from "../api/endpoints";


export const getPerformanceMetricData = (id) => dispatch => {
    dispatch({
        type: PERF_METRIC_GET_DATA,
        id: id
    });
};


export const toggleBaseline = (id) => dispatch => {
    dispatch({
        type: PERF_METRIC_TOGGLE_BASELINE,
        id: id
    });
};


export const getPreviousPerfMetrics = (id, limit, version_starts_with_l=null) => dispatch => {
    dispatch({
        type: PERF_METRIC_FETCHING_PREVIOUS
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
                type: PERF_METRIC_FETCHING_PREVIOUS_SUCCESS,
                payload: rsp.data,
            });
        })
        .catch(err => {
            console.log(err);
        });
};

export const changePerfMetricJiraTags = (id, tags) => dispatch => {
    dispatch({
        type: PERF_METRIC_CHANGE_JIRA_TAGS,
        id: id,
        jira_tags: tags
    });
};

export const invalidateMetric = (id) => dispatch => {
    dispatch({
        type: PERF_METRIC_INVALIDATE,
        id: id
    });
};


