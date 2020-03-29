export const DESTINY_APP_LIST = "/api/destiny/get_app_list/";
export const DESTINY_USER_ENDPOINT = "/api/destiny/user/";
export const DESTINY_BRANCH_ENDPOINT = "/api/destiny/branch/";
export const DESTINY_PRODUCT_ENDPOINT = "/api/destiny/product/";
export const DESTINY_REPO_ENDPOINT = "/api/destiny/repo/";
export const DESTINY_TEST_STATUS_LIST_ENDPOINT = "/api/destiny/test_status/";
export const DESTINY_TRIAGE_STATUS_LIST_ENDPOINT = "/api/destiny/triage_status/";
export const DESTINY_TRIAGE_RESOLUTION_LIST_ENDPOINT = "/api/destiny/triage_resolution/";
export const DESTINY_TEST_FRAMEWORK_LIST_ENDPOINT = "/api/destiny/test_framework/";
export const DESTINY_TEST_CATEGORY_LIST_ENDPOINT = "/api/destiny/test_category/";
export const DESTINY_TEST_JOB_ENDPOINT = "/api/destiny/testjob/";
export const DESTINY_TEST_JOB_SERVER_ENDPOINT = "/api/destiny/testjobserver/";
export const DESTINY_TEST_RESULT_ENDPOINT = "/api/destiny/testresult/";
export const DESTINY_VERSION_ENDPOINT = "/api/destiny/version/";
export const DESTINY_TEST_CASE_ENDPOINT = "/api/destiny/testcase/";
export const DESTINY_TEST_JOB_RESULT_ENDPOINT = "/api/destiny/testjobresult/";
export const DESTINY_TEST_SUITE_ENDPOINT = "/api/destiny/testsuite/";
export const DESTINY_TEST_TAG_ENDPOINT = "/api/destiny/testtag/";
export const DESTINY_TEST_STATE_SUMMARY_ENDPOINT = "/api/destiny/test_state_summary/";
export const DESTINY_TEST_STATE_BREAKDOWN_ENDPOINT =
    "/api/destiny/test_state_breakdown/";
export const DESTINY_TEST_STATE_ACROSS_BUILDS_ENDPOINT =
    "/api/destiny/test_state_across_builds/";
export const DESTINY_USER_INTEGRATION_ENDPOINT = "/api/destiny/user_integration/";
export const DESTINY_PERFORMANCE_METRIC_ENDPOINT = "/api/destiny/performance_metric/";
export const DESTINY_PALLADIUM_JOB_RESULT_ENDPOINT =
    "/api/destiny/palladium_job_result/";

export const DESTINY_GET_NOSTRADAMUS_DATA_ENDPOINT = "/get_nostradamus_data/";
export const DESTINY_GET_SUITES_ENDPOINT = "/get_suites/";
export const DESTINY_GET_TEST_CASES_ENDPOINT = "/get_testcases/";
export const DESTINY_GET_PRODUCTS_ENDPOINT = "/get_products";
export const DESTINY_GET_BRANCHES_ENDPOINT = "/get_branches/";
export const DESTINY_GET_PIPELINES_ENDPOINT = "/get_pipelines/";
export const DESTINY_GET_MANAGERS_ENDPOINT = "/get_managers/";
export const DESTINY_GET_MANAGER_SUITE_BUILD_BY_BUILD_ENDPOINT = "/get_manager_suite_build_by_build/";
export const DESTINY_GET_MANAGER_TEST_CASE_TIMELINE_ENDPOINT = "/get_manager_testcase_timeline/";
export const DESTINY_TOGGLE_MANAGERS_SUITE_ENDPOINT = "/toggle_manager_suite/";
export const DESTINY_BULK_IMPORT_SYSTEM_TEST_CASE = "/upload/bulk_import_system_test_case";
export const DESTINY_BULK_IMPORT_SYSTEM_TEST_RESULT = "/upload/bulk_import_system_test_result";

export const GET_PERFORMANCE_QUALITY_INFO = "/get_performance_quality_info";
export const GET_PERFORMANCE_RUN_SUMMARY_ENDPOINT = "/get_performance_run_summary";
export const GET_PERFORMANCE_RUN_BY_RUN_ENDPOINT = "/get_performance_run_by_run";
export const GET_HIGH_VARIABLE_PERF_METRICS_ENDPOINT = "/get_high_variable_perf_metrics";
export const GET_PREVIOUS_PERF_METRIC_VERSIONS_ENDPOINT = "/get_previous_perf_metric_versions/";
export const GET_FEATURE_TABLEAU_LINK_ENDPOINT = "/get_feature_tableau_link";
export const GET_PIPELINE_QUALITY_INFO = "/get_pipeline_quality_info";
export const GET_SYSTEM_QUALITY_INFO = "/get_system_quality_info";
export const GET_EFFECTIVE_PIPELINE_RUN_BY_RUN = "/get_effective_pipeline_run_by_run";
export const GET_PIPELINE_RUN_BY_RUN = "/get_pipeline_run_by_run";
export const GET_EFFECTIVE_SYSTEM_RUN_BY_RUN = "/get_effective_system_run_by_run";
export const GET_SYSTEM_RUN_BY_RUN = "/get_system_run_by_run";
export const GET_SYSTEM_TEST_ACROSS_BUILDS = "/get_system_test_across_builds";
export const GET_SYSTEM_CLUSTERS = "/get_system_test_clusters";
export const GET_SYSTEM_CLUSTER_BREAKDOWN = "/get_system_test_cluster_breakdown";
export const GET_LAST_FIVE_TREND_ENDPOINT = "/get_last_five_trend";
export const GET_BUILD_BY_BUILD_REGRESSION_ENDPOINT = "/get_build_by_build_regression";

export const GET_PREVIOUS_METRICS = "/get_previous_metrics";
export const CHANGE_PERF_METRIC_JIRA_TAGS = "/change_metric_jira_tags";
export const GET_WEB_SHELL_ENDPOINT = "/get_web_shell";

export const PRODUCTIVITY_USER_ENDPOINT = "/api/productivity/user/";
export const PRODUCTIVITY_DIFFERENTIAL_ENDPOINT = "/api/productivity/differential/";
export const PRODUCTIVITY_REVIEW_ENDPOINT = "/api/productivity/review/";
export const PRODUCTIVITY_JIRA_ENDPOINT = "/api/productivity/jira/";
export const PRODUCTIVITY_MANAGERS_ENDPOINT = "/api/productivity/managers/";
export const PRODUCTIVITY_TEAM_STATS_ENDPOINT = "/api/productivity/teamstats/";
export const PRODUCTIVITY_USER_STATS_ENDPOINT = "/api/productivity/userstats/";
export const PRODUCTIVITY_TEAM_DATA_POINTS_ENDPOINT =
    "/api/productivity/teamdatapoints/";

export const GET_RECENT_VERSIONS_ENDPOINT = "/get_recent_versions";
export const DESTINY_VERIFY_TEST_CASE_ENDPOINT = "/verify_test_case";
export const DESTINY_VERIFY_TEST_RESULT_ENDPOINT = "/verify_test_result";

export const VMS_ENDPOINT = "/api/brahma/vm/";
export const HYPERVISOR_MANAGERS_ENPOINT = "/api/brahma/hypervisormanager/";
export const HYPERVISORS_ENPOINT = "/api/brahma/hypervisor/";
export const FILESET_ENPOINT = "/api/brahma/fileset/";
export const SLA_ENDPOINT = "/api/brahma/sla/";
export const FREQUENCY_ENDPOINT = "/api/brahma/frequency/";
export const DATASTORE_ENDPOINT = "/api/brahma/datastore/";
export const CONFIG_ENDPOINT = "/api/brahma/config/";
export const DISK_ENDPOINT = "/api/brahma/disk/";
export const DEPLOYED_SYSTEMS_ENDPOINT = "/api/brahma/deployed_system/";
export const ADD_PATH_FILESET_ENDPOINT = "/api/brahma/add_path_to_fileset";
export const ADD_COMMAND_VM_ENDPOINT = "/api/brahma/add_command_to_vm";
export const ADD_EXCLUSION_FILESET_ENDPOINT = "/api/brahma/add_exclusion_to_fileset";
export const ADD_EXCEPTION_FILESET_ENDPOINT = "/api/brahma/add_exception_to_fileset";
export const REMOVE_PATH_FILESET_ENDPOINT = "/api/brahma/remove_path_from_fileset";
export const REMOVE_EXCEPTION_FILESET_ENDPOINT = "/api/brahma/remove_exception_from_fileset";
export const REMOVE_EXLUSION_FILESET_ENDPOINT = "/api/brahma/remove_exclusion_from_fileset";
export const REMOVE_COMMAND_VM_ENDPOINT = "/api/brahma/remove_command_from_vm";
export const DEPLOY_SYSTEM_ENDPOINT = "/api/brahma/deploy_system";
export const TOGGLE_VM_STATUS = "/api/brahma/toggle_vm_status";
export const TOGGLE_SLA_STATUS = "/api/brahma/toggle_sla_status";
export const TOGGLE_FILESET_STATUS = "/api/brahma/toggle_fileset_status";
export const TOGGLE_HYPERVISOR_STATUS = "/api/brahma/toggle_hypervisor_status";
export const TOGGLE_HYPERVISOR_MANAGER_STATUS = "/api/brahma/toggle_hypervisor_manager_status";
export const FETCH_LOGS_ENDPOINT = "/api/brahma/fetch_logs";

// SuiteDashboard
export const GET_MANAGER_SUITE_TREE_ENDPOINT = "/get_manager_suite_tree";
export const CHANGE_TR_TRIAGE_STATUS_ENDPOINT = "/change_tr_triage_status";
export const CHANGE_TR_ISSUE_LINK_ENDPOINT = "/change_tr_issue_link";
export const GET_MANAGERS_SUITE_ENDPOINT = "/get_managers_suites";

//Feature Stress Dashboard
export const GET_FEATURE_STRESS_DASHBOARD = "/api/destiny/stress_test_uuid/";
export const GET_FEATURE_STRESS_RUN_BY_RUN = "/get_feature_stress_run_by_run";