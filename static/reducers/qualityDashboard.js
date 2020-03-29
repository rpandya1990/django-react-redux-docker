import {
    FETCH_FILTERED_PERFORMANCE_CONTEXT,
    FETCH_FILTERED_PERFORMANCE_CONTEXT_SUCCESS,
    FETCHING_EFFECTIVE_PIPELINE_RUN_BY_RUN_DATA,
    FETCHING_EFFECTIVE_SYSTEM_RUN_BY_RUN_DATA,
    FETCHING_PERFORMANCE_CONTEXT,
    FETCHING_PERFORMANCE_RUN_SUMMARY,
    FETCHING_HIGH_VARIABLE_PERF_METRICS,
    FETCHING_PIPELINE_CONTEXT,
    FETCHING_PIPELINE_RUN_BY_RUN_DATA,
    FETCHING_SYSTEM_CLUSTER_BREAKDOWN_DATA,
    FETCHING_SYSTEM_CLUSTERS_DATA,
    FETCHING_SYSTEM_CONTEXT,
    FETCHING_SYSTEM_RUN_BY_RUN_DATA,
    FETCHING_SYSTEM_TEST_ACROSS_BUILDS_DATA,
    GET_EFFECTIVE_PIPELINE_RUN_BY_RUN_DATA,
    GET_EFFECTIVE_SYSTEM_RUN_BY_RUN_DATA,
    FETCHING_PREVIOUS_PERF_METRICS,
    GET_PREVIOUS_PERF_METRICS_SUCCESS,
    CHANGE_PERF_METRIC_JIRA_TAGS_SUCCESS,
    GET_LAST_FIVE_TREND_SUCCESS,
    GET_PERFORMANCE_CONTEXT,
    GET_PERFORMANCE_RUN_SUMMARY,
    GET_HIGH_VARIABLE_PERF_METRICS,
    GET_PERFORMANCE_METRIC_DATA_SUCCESS,
    GET_PIPELINE_CONTEXT,
    GET_PIPELINE_RUN_BY_RUN_DATA,
    GET_RECENT_VERSIONS_SUCCESS,
    GET_PREVIOUS_PERF_METRIC_VERSIONS_SUCCESS,
    GET_SYSTEM_CLUSTER_BREAKDOWN_DATA,
    GET_SYSTEM_CLUSTERS_DATA,
    GET_SYSTEM_CONTEXT,
    GET_SYSTEM_RUN_BY_RUN_DATA,
    GET_SYSTEM_TEST_ACROSS_BUILDS_DATA,
    TOGGLE_BASELINE,
    TOGGLE_BASELINE_SUCCESS,
    GET_BUILD_BY_BUILD_REGRESSION,
    GET_BUILD_BY_BUILD_REGRESSION_SUCCESS,
    DESTINY_GET_SUITES_SUCCESS,
    FETCH_POLARIS_PIPELINE_DATA,
    FETCH_POLARIS_PIPELINE_DATA_SUCCESS,
    FETCH_POLARIS_RUN_BY_RUN_DATA_SUCCESS,
    GET_WEB_SHELL,
    GET_WEB_SHELL_SUCCESS,
    GET_WEB_SHELL_FAILURE,
    FETCHING_PERFORMANCE_RUN_BY_RUN,
    GET_PERFORMANCE_RUN_BY_RUN,
    GET_STRESSTEST_INFO,
    GET_FEATURE_STRESS_RUN_BY_RUN_DATA
} from "../actions/types";
import {GET_SYSTEM_CLUSTER_BREAKDOWN} from "../api/endpoints";
import _ from "lodash";

const initialState = {
    pipeline_context: {},
    performance_context: {},
    performance_run_summary: {},
    high_variable_perf_metrics: {},
    system_context: {},
    feature_stress_context: {},
    fetching_pipeline: {},
    fetching_performance: {},
    fetching_performance_run_summary: {},
    fetching_high_variable_perf_metrics: {},
    fetching_system: {},
    effective_run_by_run: {
        'pipeline': {},
        'system': {}
    },
    run_by_run: {
        'pipeline': {},
        'system': {},
        'feature_stress': {}
    },
    fetching_effective_run_by_run: {
        'pipeline': {},
        'system': {}
    },
    fetching_run_by_run: {
        'pipeline': {},
        'system': {}
    },
    fetching_system_test_across_builds: {},
    system_test_across_builds: {},
    system_clusters: {},
    system_clusters_breakdown: {},
    fetching_system_clusters: {},
    fetching_system_clusters_breakdown: {},
    fetching_filtered_performance_context: {},
    filtered_performance_context: {},
    fetchingPreviousPerfMetrics: false,
    performance_metric_data: {},
    fetching_baseline: false,
    fetching_web_shell: false,
    versionSuggestions: [],
    previous_perf_metrics: {},
    previous_perf_metric_versions: [],
    lastFiveTrend: {},
    fetchingBuildByBuildRegression: false,
    buildByBuildRegression: {},
    polarisFetching: 0,
    polarisPipelineContext: {},
    polarisRunByRun: {},
    stressResults: {}
};

// (stateCopy.high_variable_perf_metrics, action.branches, false, action.value);

const flipBranchFetchingState = (fetchingState, payload, state, validate = null) => {
    let fetchStateCopy = {...fetchingState};
    for (const branch of payload) {
        if (validate && fetchStateCopy[branch] !== validate) {
            return null;
        }
        fetchStateCopy[branch] = state;
    }
    return fetchStateCopy;
};

export default (state = initialState, action) => {
    let stateCopy = {...state};
    switch (action.type) {
        case(GET_PIPELINE_CONTEXT):
            let pipFetch = flipBranchFetchingState(stateCopy.fetching_pipeline, action.branches, false, action.value);
            if (pipFetch) {
                stateCopy.pipeline_context = {...stateCopy.pipeline_context, ...action.payload};
                stateCopy.fetching_pipeline = pipFetch;
            }
            break;
        case(GET_SYSTEM_CONTEXT):
            let sysFetch = flipBranchFetchingState(stateCopy.fetching_system, action.branches, false, action.value);
            if (sysFetch) {
                stateCopy.system_context = {...stateCopy.system_context, ...action.payload};
                stateCopy.fetching_system = sysFetch;
            }
            break;
        case(GET_PERFORMANCE_CONTEXT):
            let perfFetch = flipBranchFetchingState(stateCopy.fetching_performance, action.branches, false, action.value);
            if (perfFetch) {
                stateCopy.performance_context = {...stateCopy.performance_context, ...action.payload};
                stateCopy.fetching_performance = perfFetch;
            }
            break;
        case(GET_PERFORMANCE_RUN_SUMMARY):
            let perfSummaryFetch = flipBranchFetchingState(stateCopy.fetching_performance_run_summary,
                action.branches, false, action.value);
            if (perfSummaryFetch) {
                stateCopy.performance_run_summary = {...stateCopy.performance_run_summary, ...action.payload};
                stateCopy.fetching_performance_run_summary = perfSummaryFetch;
            }
            break;
        case(GET_HIGH_VARIABLE_PERF_METRICS):
            let perfHighVariableMetrics = flipBranchFetchingState(stateCopy.fetching_high_variable_perf_metrics,
                action.branches, false, action.value);
            if (perfHighVariableMetrics) {
                stateCopy.high_variable_perf_metrics = {...stateCopy.high_variable_perf_metrics, ...action.payload};
                stateCopy.fetching_high_variable_perf_metrics = perfHighVariableMetrics;
            }
            break;
        case(FETCH_FILTERED_PERFORMANCE_CONTEXT_SUCCESS):
            stateCopy.filtered_performance_context = {...stateCopy.filtered_performance_context, ...action.payload};
            stateCopy.fetching_filtered_performance_context = flipBranchFetchingState(stateCopy.fetching_filtered_performance_context, action.branches, false);
            break;
        case(FETCHING_PIPELINE_CONTEXT):
            stateCopy.fetching_pipeline = flipBranchFetchingState(stateCopy.fetching_pipeline, action.branches, action.value);
            break;
        case(FETCHING_PERFORMANCE_CONTEXT):
            stateCopy.fetching_performance = flipBranchFetchingState(stateCopy.fetching_performance, action.branches, action.value);
            break;
        case(FETCHING_PERFORMANCE_RUN_SUMMARY):
            stateCopy.fetching_performance_run_summary = flipBranchFetchingState(
                stateCopy.fetching_performance_run_summary, action.branches, action.value);
            break;
        case(FETCHING_HIGH_VARIABLE_PERF_METRICS):
            stateCopy.fetching_high_variable_perf_metrics = flipBranchFetchingState(
                stateCopy.fetching_high_variable_perf_metrics, action.branches, action.value);
            break;
        case(FETCHING_SYSTEM_CONTEXT):
            stateCopy.fetching_system = flipBranchFetchingState(stateCopy.fetching_system, action.branches, action.value);
            break;
        case(GET_EFFECTIVE_PIPELINE_RUN_BY_RUN_DATA):
            let effPipelineRunFetch = flipBranchFetchingState(stateCopy.fetching_effective_run_by_run['pipeline'], action.branches, false, action.value);
            let effectivePipelineRunByRun = {...stateCopy.effective_run_by_run['pipeline'], ...action.payload};
            if (effPipelineRunFetch) {
                stateCopy.effective_run_by_run = {...stateCopy.effective_run_by_run, pipeline: effectivePipelineRunByRun};
                stateCopy.fetching_effective_run_by_run = {...stateCopy.fetching_effective_run_by_run, pipeline: effPipelineRunFetch};
            }
            break;
        case(GET_PERFORMANCE_RUN_BY_RUN):
            let runPerformanceFetch = flipBranchFetchingState(stateCopy.fetching_run_by_run['performance'], action.branches, false, action.value);
            let performanceRunByRun = {...stateCopy.run_by_run['performance'], ...action.payload};
            if (runPerformanceFetch) {
                stateCopy.run_by_run = {...stateCopy.run_by_run, performance: performanceRunByRun};
                stateCopy.fetching_run_by_run = {...stateCopy.fetching_run_by_run, performance: runPerformanceFetch};
            }
            break;
        case(GET_PIPELINE_RUN_BY_RUN_DATA):
            let runPipelineFetch = flipBranchFetchingState(stateCopy.fetching_run_by_run['pipeline'], action.branches, false, action.value);
            let pipelineRunByRun = {...stateCopy.run_by_run['pipeline'], ...action.payload};
            if (runPipelineFetch) {
                stateCopy.run_by_run = {...stateCopy.run_by_run, pipeline: pipelineRunByRun};
                stateCopy.fetching_run_by_run = {...stateCopy.fetching_run_by_run, pipeline: runPipelineFetch};
            }
            break;
        case(GET_EFFECTIVE_SYSTEM_RUN_BY_RUN_DATA):
            let effSystemRunFetch = flipBranchFetchingState(stateCopy.fetching_effective_run_by_run['system'], action.branches, false, action.value);
            let effSystemRunByRun = {...stateCopy.effective_run_by_run['system'], ...action.payload};
            if (effSystemRunFetch) {
                stateCopy.effective_run_by_run = {...stateCopy.effective_run_by_run, system: effSystemRunByRun};
                stateCopy.fetching_effective_run_by_run = {...stateCopy.fetching_effective_run_by_run, system: effSystemRunFetch};
            }
            break;
        case(GET_SYSTEM_RUN_BY_RUN_DATA):
            let runSystemFetch = flipBranchFetchingState(stateCopy.fetching_run_by_run['system'], action.branches, false, action.value);
            let systemRunByRun = {...stateCopy.run_by_run['system'], ...action.payload};
            if (runSystemFetch) {
                stateCopy.run_by_run = {...stateCopy.run_by_run, system: systemRunByRun};
                stateCopy.fetching_run_by_run = {...stateCopy.fetching_run_by_run, system: runSystemFetch};
            }
            break;
        case(GET_SYSTEM_TEST_ACROSS_BUILDS_DATA):
            let runSystemTestAcrossBuildsFetch = flipBranchFetchingState(stateCopy.fetching_system_test_across_builds, action.branches, false, action.value);
            if (runSystemTestAcrossBuildsFetch) {
                stateCopy.system_test_across_builds = {...stateCopy.system_test_across_builds, ...action.payload};
                stateCopy.fetching_system_test_across_builds = runSystemTestAcrossBuildsFetch;
            }
            break;
        case(GET_SYSTEM_CLUSTERS_DATA):
            let runSystemClustersFetch = flipBranchFetchingState(stateCopy.fetching_system_clusters, action.branches, false, action.value);
            if (runSystemClustersFetch) {
                stateCopy.system_clusters = {...stateCopy.system_clusters, ...action.payload};
                stateCopy.fetching_system_clusters = runSystemClustersFetch;
            }
            break;
        case(GET_SYSTEM_CLUSTER_BREAKDOWN_DATA):
            let runSystemClustersBreakdownFetch = flipBranchFetchingState(stateCopy.fetching_system_clusters_breakdown, action.branches, false, action.value);
            if (runSystemClustersBreakdownFetch) {
                stateCopy.system_clusters_breakdown = _.merge({}, stateCopy.system_clusters_breakdown, action.payload);
                stateCopy.fetching_system_clusters_breakdown = runSystemClustersBreakdownFetch;
            }
            break;
        case(FETCHING_EFFECTIVE_PIPELINE_RUN_BY_RUN_DATA):
            stateCopy.fetching_effective_run_by_run['pipeline'] = flipBranchFetchingState(stateCopy.fetching_effective_run_by_run['pipeline'], action.branches, action.value);
            break;
        case(FETCHING_PIPELINE_RUN_BY_RUN_DATA):
            stateCopy.fetching_run_by_run['pipeline'] = flipBranchFetchingState(stateCopy.fetching_run_by_run['pipeline'], action.branches, action.value);
            break;
        case(FETCHING_PERFORMANCE_RUN_BY_RUN):
            stateCopy.fetching_run_by_run['performance'] = flipBranchFetchingState(stateCopy.fetching_run_by_run['performance'], action.branches, action.value);
            break;
        case(FETCHING_EFFECTIVE_SYSTEM_RUN_BY_RUN_DATA):
            stateCopy.fetching_effective_run_by_run['system'] = flipBranchFetchingState(stateCopy.fetching_effective_run_by_run['system'], action.branches, action.value);
            break;
        case(FETCHING_SYSTEM_RUN_BY_RUN_DATA):
            stateCopy.fetching_run_by_run['system'] = flipBranchFetchingState(stateCopy.fetching_run_by_run['system'], action.branches, action.value);
            break;
        case(FETCHING_SYSTEM_TEST_ACROSS_BUILDS_DATA):
            stateCopy.fetching_system_test_across_builds = flipBranchFetchingState(stateCopy.fetching_system_test_across_builds, action.branches, action.value);
            break;
        case(FETCHING_SYSTEM_CLUSTERS_DATA):
            stateCopy.fetching_system_clusters = flipBranchFetchingState(stateCopy.fetching_system_clusters, action.branches, action.value);
            break;
        case(FETCHING_SYSTEM_CLUSTER_BREAKDOWN_DATA):
            stateCopy.fetching_system_clusters_breakdown = flipBranchFetchingState(stateCopy.fetching_system_clusters_breakdown, action.branches, action.value);
            break;
        case(FETCH_FILTERED_PERFORMANCE_CONTEXT):
            stateCopy.fetching_filtered_performance_context = flipBranchFetchingState(stateCopy.fetching_filtered_performance_context, action.branches, true);
            break;
        case(CHANGE_PERF_METRIC_JIRA_TAGS_SUCCESS):
        case(GET_PERFORMANCE_METRIC_DATA_SUCCESS):
        case(TOGGLE_BASELINE_SUCCESS):
            stateCopy.performance_metric_data = {...stateCopy.performance_metric_data, ...action.payload};
            stateCopy.fetching_baseline = false;
            break;
        case(TOGGLE_BASELINE):
            stateCopy.fetching_baseline = true;
            break;
        case(GET_WEB_SHELL_FAILURE):
        case(GET_WEB_SHELL_SUCCESS):
            stateCopy.fetching_web_shell = false;
            break;
        case(GET_WEB_SHELL):
            stateCopy.fetching_web_shell = true;
            break;
        case GET_RECENT_VERSIONS_SUCCESS:
            stateCopy.versionSuggestions = action.payload;
            break;
        case GET_PREVIOUS_PERF_METRIC_VERSIONS_SUCCESS:
            stateCopy.previous_perf_metric_versions = action.payload;
            break;
        case(FETCHING_PREVIOUS_PERF_METRICS):
            stateCopy.fetchingPreviousPerfMetrics = true;
            break;
        case(GET_PREVIOUS_PERF_METRICS_SUCCESS):
            stateCopy.previous_perf_metrics = {...action.payload};
            stateCopy.fetchingPreviousPerfMetrics = false;
            break;
        case GET_LAST_FIVE_TREND_SUCCESS:
            stateCopy.lastFiveTrend = {...stateCopy.lastFiveTrend, ...action.payload};
            break;
        case GET_BUILD_BY_BUILD_REGRESSION:
            stateCopy.fetchingBuildByBuildRegression = true;
            break;
        case GET_BUILD_BY_BUILD_REGRESSION_SUCCESS:
            stateCopy.fetchingBuildByBuildRegression = false;
            stateCopy.buildByBuildRegression = {...stateCopy.buildByBuildRegression, ...action.payload};
            break;
        case FETCH_POLARIS_PIPELINE_DATA_SUCCESS:
            stateCopy.polarisPipelineContext = {
                ...stateCopy.polarisPipelineContext,
                [action.category]: {
                    ...stateCopy.polarisPipelineContext[action.category],
                    ...action.payload
                }
            };
            stateCopy.polarisFetching -= 1;
            break;
        case FETCH_POLARIS_PIPELINE_DATA:
            stateCopy.polarisFetching += 1;
            break;
        case FETCH_POLARIS_RUN_BY_RUN_DATA_SUCCESS:
            stateCopy.polarisRunByRun = {
                ...stateCopy.polarisRunByRun,
                [action.category]: {
                    ...stateCopy.polarisRunByRun[action.category],
                    ...action.payload
                }
            };
            stateCopy.polarisFetching -= 1;
        case GET_STRESSTEST_INFO:
            stateCopy.stressResults = action.payload
            break;
        case(GET_FEATURE_STRESS_RUN_BY_RUN_DATA):
            let featureStressRunByRun = {...stateCopy.run_by_run['feature_stress'], ...action.payload};
            stateCopy.run_by_run = {...stateCopy.run_by_run, feature_stress: featureStressRunByRun};
            break;
        default:
            break;
    }
    return stateCopy;
}
