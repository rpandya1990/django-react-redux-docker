import {
    PERF_METRIC_FETCHING_PREVIOUS,
    PERF_METRIC_FETCHING_PREVIOUS_SUCCESS,
    PERF_METRIC_CHANGE_JIRA_TAGS_SUCCESS,
    PERF_METRIC_GET_DATA_SUCCESS,
    PERF_METRIC_TOGGLE_BASELINE,
    PERF_METRIC_TOGGLE_BASELINE_SUCCESS,
} from "../actions/types";
import _ from "lodash";

const initialState = {
    fetchingPreviousPerfMetrics: false,
    performance_metric_data: {},
    fetching_baseline: false,
    previous_perf_metrics: {}
};

export default (state = initialState, action) => {
    let stateCopy = {...state};
    switch (action.type) {
        case(PERF_METRIC_GET_DATA_SUCCESS):
            stateCopy.performance_metric_data[action.id] = action.payload;
            break;
        case(PERF_METRIC_CHANGE_JIRA_TAGS_SUCCESS):
            stateCopy.performance_metric_data[action.id]['jira_tags'] = action.payload;
            break;
        case(PERF_METRIC_TOGGLE_BASELINE_SUCCESS):
            stateCopy.performance_metric_data[action.id]['baseline'] = action.payload;
            stateCopy.fetching_baseline = false;
            break;
        case(PERF_METRIC_TOGGLE_BASELINE):
            stateCopy.fetching_baseline = true;
            break;
        case(PERF_METRIC_FETCHING_PREVIOUS):
            stateCopy.fetchingPreviousPerfMetrics = true;
            break;
        case(PERF_METRIC_FETCHING_PREVIOUS_SUCCESS):
            stateCopy.previous_perf_metrics = {...action.payload};
            stateCopy.fetchingPreviousPerfMetrics = false;
            break;
        default:
            break;
    }
    return stateCopy;
}
