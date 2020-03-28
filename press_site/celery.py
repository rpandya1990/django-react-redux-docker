from __future__ import absolute_import, unicode_literals

import os

from celery import Celery

# set the default Django settings module for the 'celery' program.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'atlantis_site.settings')

app = Celery('atlantis')

# Using a string here means the worker don't have to serialize
# the configuration object to child processes.
# - namespace='CELERY' means all celery-related configuration keys
#   should have a `CELERY_` prefix.
app.config_from_object('django.conf:settings', namespace='CELERY')

# Load task modules from all registered Django app configs.
app.autodiscover_tasks()

app.conf.task_routes = {
    'destiny.tasks.polaris_find_jenkins_jobs': {'queue': 'polaris'},
    'destiny.tasks.polaris_find_new_builds': {'queue': 'polaris'},
    'destiny.tasks.polaris_fetch_build_artifacts': {'queue': 'polaris'},
    'destiny.tasks.polaris_populate_job_result': {'queue': 'polaris'},
    'destiny.tasks.polaris_archive_log_dir': {'queue': 'polaris'},
    'destiny.tasks.polaris_populate_test_result': {'queue': 'polaris'},
    'destiny.tasks.polaris_download_build_artifacts': {'queue': 'polaris'},
    'destiny.tasks.polaris_process_test_job_result_unprocessable': {'queue': 'polaris'},
    'destiny.tasks.sub_polaris_populate_test_result': {'queue': 'polaris'},
    'destiny.tasks.sub_polaris_populate_job_result': {'queue': 'polaris'},
    'destiny.tasks.run_benchmarks_analyzer': {'queue': 'performance'},
    'brahma.tasks.deploy_runner': {'queue': 'brahma'},
    'brahma.tasks.deploy_system_from_config': {'queue': 'brahma'},
    'brahma.tasks.deploy_runner_with_logs': {'queue': 'brahma'},
    'brahma.tasks.deploy_system_from_config_with_logs': {'queue': 'brahma'},
    'brahma.tasks.fetch_logs': {'queue': 'brahma'}
}
