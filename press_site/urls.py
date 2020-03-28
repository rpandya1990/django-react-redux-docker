"""atlantis URL Configuration
The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls import include, url
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import logout
from django.views.generic import RedirectView, TemplateView
from rest_framework.schemas import get_schema_view

from atlantis_site.api import router
from destiny.api import BulkImportSystemTestCase, BulkImportSystemTestResult
from destiny.appAdmin import appAdminSite as destiny_site
from destiny.views import (CreateJira, DestinyIndex, Dolphin, GetAppList,
                           get_recent_versions, StressTestInfoViewSet, DeploymentInfoViewSet,
                           IndexPage, PalladiumJobResultViewSet,
                           PerformanceMetricViewSet, PipelineResultDetails,
                           PipelineResults, Pipelines, SuiteDashboard,
                           TriageDetailsView, UploadTestResult,
                           UserIntegrationViewSet, change_tr_issue_link,
                           change_tr_triage_status, get_branches,
                           get_effective_pipeline_run_by_run,
                           get_manager_suite_build_by_build,
                           get_manager_suite_tree, get_managers,
                           get_nostradamus_data, get_performance_quality_info,
                           get_pipeline_quality_info, get_pipeline_run_by_run,
                           get_pipelines, get_products, get_qd_info,
                           get_suites, get_system_quality_info, get_test_jobs,
                           get_testcases, modify_pm_publish,
                           get_last_five_trend,
                           toggle_manager_suite, view_test_report,
                           get_feature_tableau_link, web_shell_redirect, get_web_shell,
                           get_manager_testcase_timeline, get_managers_suites, get_build_by_build_regression,
                           verify_test_result, verify_test_case, get_system_run_by_run, get_effective_system_run_by_run,
                           get_system_test_clusters, get_system_test_cluster_breakdown, get_system_test_across_builds,
                           set_rerun_logic, set_pipeline_validity, set_pipeline_triage_mechanism, unset_cache,
                           get_feature_stress_run_by_run)
# Performance app imports
from performance.views import (get_high_variable_perf_metrics, get_feature_list,
                               get_performance_run_summary,
                               get_performance_run_by_run,
                               get_white_paper_data,
                               MetricViewSet)

admin.site.site_header = "Atlantis"
admin.site.site_title = "Destiny"
admin.site.index_title = "Atlantis"
destiny_site.site_header = admin.site.site_header
destiny_site.site_title = admin.site.site_title
destiny_site.index_title = admin.site.index_title

router.register(r'destiny/user_integration', UserIntegrationViewSet)
router.register(r'destiny/performance_metric', PerformanceMetricViewSet)
router.register(r'destiny/palladium_job_result', PalladiumJobResultViewSet)
router.register(r'destiny/stress_test_uuid', StressTestInfoViewSet)
router.register(r'destiny/deployment_info', DeploymentInfoViewSet)

urlpatterns = [
                  url(r'', destiny_site.urls),
                  url(r'^login', RedirectView.as_view(url='/', permanent=False), name='login'),
                  url(r'^logout', logout, {"next_page": "/login/"}, name='logout'),

                  url(r'^oauth/', include('social_django.urls', namespace='social')),
                  url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
                  url(r'^api-schema/', get_schema_view('Supported API')),
                  url(r'^api/', include(router.urls)),

                  url(r'^jet/', include('jet.urls', 'jet')),

                  url(r'^admin/', admin.site.urls),
                  url(r'^dolphin/job/(?P<id>[0-9]+)', Dolphin.as_view(), name='dolphin'),
                  url(r'^api/destiny/get_app_list', GetAppList.as_view(), name="get_app_list"),
                  url(r'^summary', DestinyIndex.as_view(), name='destiny_index'),
                  url(r'^modify_pm_publish', modify_pm_publish, name='modify_pm_publish'),
                  url(r'^nostradamus', login_required(TemplateView.as_view(template_name='nostradamus.html')),
                      name='nostradamus'),
                  url(r'^triage-details/(?P<id>[0-9]+)', TriageDetailsView.as_view(), name='triage-detail'),
                  url(r'^integration', TemplateView.as_view(template_name='integration_portal.html'),
                      name='integration'),
                  url(r'^web_shell_redirect', web_shell_redirect, name='web_shell_redirect'),
                  url(r'^get_web_shell', get_web_shell, name='get_web_shell'),
                  url(r'^view_test_report', view_test_report, name='view_test_report'),
                  url(r'^change_tr_triage_status', change_tr_triage_status, name="change_tr_triage_status"),
                  url(r'^pipelines', Pipelines.as_view(), name='pipelines'),
                  url(r'^pipeline_results', PipelineResults.as_view(), name='pipeline_results'),
                  url(r'^pipeline_result_details', PipelineResultDetails.as_view(), name='pipeline_result_details'),
                  url(r'^submit_jira/', CreateJira.as_view(), name="submit_jira"),
                  url(r'^get_test_jobs', get_test_jobs, name="get_test_jobs"),
                  url(r'^get_manager_suite_build_by_build', get_manager_suite_build_by_build,
                      name="get_manager_suite_build_by_build"),
                  url(r'^get_manager_testcase_timeline', get_manager_testcase_timeline,
                      name="get_manager_testcase_timeline"),
                  url(r'^get_manager_suite_tree', get_manager_suite_tree, name="get_manager_suite_tree"),
                  url(r'^get_managers_suites', get_managers_suites, name="get_managers_suites"),
                  url(r'^get_managers', get_managers, name="get_managers"),
                  url(r'^get_branches', get_branches, name="get_branches"),
                  url(r'^get_pipelines', get_pipelines, name="get_pipelines"),
                  url(r'^get_products', get_products, name="get_products"),
                  url(r'^get_suites', get_suites, name="get_suites"),
                  url(r'^get_testcases', get_testcases, name="get_testcases"),
                  url(r'^get_qd_info', get_qd_info, name="get_qd_info"),
                  url(r'^get_build_by_build_regression', get_build_by_build_regression,
                      name="build_by_build_regression"),
                  url(r'^get_pipeline_quality_info', get_pipeline_quality_info, name="get_pipeline_quality_info"),
                  url(r'^get_system_test_cluster_breakdown', get_system_test_cluster_breakdown,
                      name='get_system_test_cluster_breakdown'),
                  url(r'^get_system_test_clusters', get_system_test_clusters, name='get_system_test_clusters'),
                  url(r'^get_system_run_by_run', get_system_run_by_run, name='get_system_run_by_run'),
                  url(r'^get_system_test_across_builds', get_system_test_across_builds,
                      name="get_system_test_across_builds"),
                  url(r'^get_feature_stress_run_by_run', get_feature_stress_run_by_run,
                      name='get_feature_stress_run_by_run'),
                  url(r'^get_effective_system_run_by_run', get_effective_system_run_by_run,
                      name='get_effective_system_run_by_run'),
                  url(r'^get_system_quality_info', get_system_quality_info, name="get_system_quality_info"),
                  url(r'^get_performance_quality_info', get_performance_quality_info,
                      name="get_performance_quality_info"),
                  url(r'^toggle_manager_suite', toggle_manager_suite, name="toggle_manager_suite"),
                  url(r'^get_pipeline_run_by_run', get_pipeline_run_by_run, name="get_latest_pipeline_run_by_run"),
                  url(r'^get_effective_pipeline_run_by_run', get_effective_pipeline_run_by_run,
                      name="get_effective_pipeline_run_by_run"),
                  url(r'^get_nostradamus_data', get_nostradamus_data, name="get_nostradamus_data"),
                  url(r'^api/destiny/upload_test_result', UploadTestResult.as_view(), name='upload_test_result'),
                  url(r'^change_tr_issue_link', change_tr_issue_link, name="change_tr_issue_link"),
                  url(r'^get_feature_tableau_link', get_feature_tableau_link, name="get_feature_tableau_link"),
                  url(r'^get_last_five_trend', get_last_five_trend, name="get_last_five_trend"),
                  url(r'^verify_test_case', verify_test_case, name="verify_test_case"),
                  url(r'^verify_test_result', verify_test_result, name="verify_test_result"),
                  url(r'^upload/bulk_import_system_test_case', BulkImportSystemTestCase.as_view()),
                  url(r'^upload/bulk_import_system_test_result', BulkImportSystemTestResult.as_view()),

                  # Performance app URLs
                  url(r'^perf_app', login_required(TemplateView.as_view(template_name='white_paper.html')),
                      name='white_paper'),
                  url(r'^get_white_paper_data', get_white_paper_data, name='get_white_paper_data'),
                  url(r'^get_feature_list', get_feature_list, name='get_feature_list'),
                  url(r'^get_recent_versions', get_recent_versions, name="get_recent_versions"),
                  url(r'^get_previous_metrics/', MetricViewSet.as_view({'get': 'get_previous_metrics'}),
                      name='previous-metrics'),
                  url(r'^get_previous_perf_metric_versions/',
                      MetricViewSet.as_view({'get': 'get_previous_perf_metric_versions'}),
                      name='get_previous_perf_metric_versions'),
                  url(r'^change_metric_jira_tags/', MetricViewSet.as_view({'put': 'change_metric_jira_tags'}),
                      name='change_metric_jira_tags'),
                  url(r'^get_performance_run_summary', get_performance_run_summary,
                      name='get_performance_run_summary'),
                  url(r'^get_performance_run_by_run', get_performance_run_by_run,
                      name='get_performance_run_by_run'),
                  url(r'^get_high_variable_perf_metrics', get_high_variable_perf_metrics,
                      name='get_high_variability_metrics'),
                  url(r'^set_rerun_logic', set_rerun_logic, name="set_rerun_logic"),
                  url(r'^set_pipeline_validity', set_pipeline_validity, name="set_pipeline_validity"),
                  url(r'^set_pipeline_triage_mechanism', set_pipeline_triage_mechanism, name="set_pipeline_triage_mechanism"),
                  url(r'^unset_cache', unset_cache, name="unset_cache"),
                  url(r'productivity/', include('productivity.urls', namespace='productivity')),
                  url(r'slack/', include('slack.urls', namespace='slack')),
                  url(r'^.*', IndexPage.as_view(), name="frontend")
              ] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
