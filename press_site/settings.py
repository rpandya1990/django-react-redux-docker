from __future__ import absolute_import

import os

from social_core.pipeline import DEFAULT_AUTH_PIPELINE

# ############################################################################
# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ############################################################################
ATLANTIS_PRODUCTION_SERVER = int(os.environ.get('ATLANTIS_PRODUCTION_SERVER', '0'))

# Logging and Debugging
LOG_BASE_PATH = "/mnt/data/joblogs"
DEBUG = True
LOGGING = {
    'version': 1,
    'disable_existing_loggers': True,
    'formatters': {
        'verbose': {
            'format': "[%(asctime)s|%(name)s|%(process)d.%(threadName)s|%(module)s.%(funcName)s.%(lineno)s|%(levelname)s] %(message)s"
        },
    },
    'handlers': {
        'root_console': {  # To avoid screw up by yoda logging module
            'level': 'DEBUG',
            'class': 'logstash.TCPLogstashHandler',
            'host': 'logstash',  # IP/name of our Logstash EC2 instance
            'port': 5000,
            'version': 1,
            'message_type': 'logstash',
            'fqdn': True,
            'tags': ['atlantis-production' if os.getenv('ATLANTIS_PRODUCTION_SERVER', '') == '1' else 'atlantis-dev'],
        },
        'file': {
            'level': 'DEBUG',
            'class': 'logging.handlers.RotatingFileHandler',
            'filename': 'run.log',
            'maxBytes': 1 * 1024 * 1024,
            'backupCount': 20,
            'formatter': 'verbose'
        },
        'console': {
            'class': 'logging.StreamHandler',
            'formatter': 'verbose',
        }
    },
    'loggers': {
        '': {
            'handlers': ['root_console', 'file', 'console'],
            'level': 'DEBUG',
        },
        'django': {
            'handlers': ['root_console', 'file'],
            'level': 'INFO',
            'propagate': False
        },
        'urllib3': {
            'level': 'ERROR'
        },
        'plumbum': {
            'level': 'ERROR'
        },
        'amqp': {
            'level': 'ERROR'
        },
        'newrelic': {
            'level': 'ERROR'
        },
        'newrelic.config': {
            'level': 'ERROR'
        },
        'newrelic.core.agent': {
            'level': 'ERROR'
        },
        'newrelic.core.application': {
            'level': 'ERROR'
        },
        'newrelic.common.utilization': {
            'level': 'ERROR'
        },
        'raven.contrib.django.client.DjangoClient': {
            'level': 'ERROR'
        }
    }
}

# ############################################################################
# Core Django
WSGI_APPLICATION = 'atlantis_site.wsgi.application'
ALLOWED_HOSTS = ['*']
SECRET_KEY = '3eh)j&cx#(sxi4w+n%kmk6^cc*is0ks@8wwerkpxx7)do7o6p%'
ROOT_URLCONF = "atlantis_site.urls"
INSTALLED_APPS = [
    'jet',
    'material',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django_extensions',
    'django_filters',
    'jsoneditor',  # https://github.com/nnseva/django-jsoneditor
    'rest_framework',
    'destiny',
    'performance',
    'social_django',
    'django_celery_beat',
    'productivity',
    'slack',
    'brahma',
    'elasticapm.contrib.django'
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'destiny.middleware.RestrictSuperToAdminMiddleware'
]
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            os.path.join(BASE_DIR + '/destiny/templates'),
            os.path.join(BASE_DIR + '/templates'),
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'social_django.context_processors.backends',
                'social_django.context_processors.login_redirect',
            ],
        },
    },
]

# Internationalization
# https://docs.djangoproject.com/en/1.11/topics/i18n/
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True

# APM
ELASTIC_APM = {
    'SERVICE_NAME': 'atlantis-prod',
    # TODO: Need to move to production apm server and use https
    # https://rubrik.atlassian.net/browse/ATL-377
    'SERVER_URL': 'http://10.0.195.50:8200/',
    'TRANSACTION_MAX_SPANS': 5000
}

# Static files (CSS, JavaScript, Images)
# https://docs.djangoproject.com/en/1.11/howto/static-files/
STATIC_URL = '/static/'
# Add these new lines
STATICFILES_DIRS = (
    # Enable when we need it
    os.path.join(BASE_DIR, 'static'),
)
STATIC_ROOT = os.path.join(BASE_DIR, '../staticfiles')

# ############################################################################
# Database
# https://docs.djangoproject.com/en/1.11/ref/settings/#databases
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'destinydb',
        'USER': 'postgres',
        'PASSWORD': 'password',
        'HOST': 'db',
        'PORT': '5432',
        'CONN_MAX_AGE': 600,
    }
}

# ############################################################################
# Auth
# Password validation
# https://docs.djangoproject.com/en/1.11/ref/settings/#auth-password-validators
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator',
    },
    {
        'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator',
    },
]

AUTHENTICATION_BACKENDS = (
    'social_core.backends.google.GoogleOAuth2',
    'django.contrib.auth.backends.ModelBackend',
)

SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = '<ReplaceWithDevInstanceKeyInCustomSettings>'
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = '<ReplaceWithDevInstanceKeyInCustomSettings>'
SOCIAL_AUTH_PIPELINE = list(DEFAULT_AUTH_PIPELINE) + [
    'atlantis_site.pipeline.save_to_group'
]

LOGIN_URL = 'login'
LOGOUT_URL = 'logout'
LOGIN_REDIRECT_URL = 'login'

# ############################################################################
# Django rest settings
REST_FRAMEWORK = {
    # Use Django's standard `django.contrib.auth` permissions
    'DEFAULT_PERMISSION_CLASSES': [
        'rest_framework.permissions.DjangoModelPermissions'
    ],
    'DEFAULT_FILTER_BACKENDS': ('django_filters.rest_framework.DjangoFilterBackend',),
    'DEFAULT_PAGINATION_CLASS': 'destiny.pagination.DestinyApiPagination',
    'PAGE_SIZE': 20,
    'DEFAULT_RENDERER_CLASSES': (
        'rest_framework.renderers.JSONRenderer',
        'rest_framework.renderers.BrowsableAPIRenderer',
    )
}

# ############################################################################
# Jet Setting
JET_THEMES = [
    {
        'theme': 'default',  # theme folder name
        'color': '#47bac1',  # color of the theme's button in user menu
        'title': 'Default'  # theme title
    },
    {
        'theme': 'green',
        'color': '#44b78b',
        'title': 'Green'
    },
    {
        'theme': 'light-green',
        'color': '#2faa60',
        'title': 'Light Green'
    },
    {
        'theme': 'light-violet',
        'color': '#a464c4',
        'title': 'Light Violet'
    },
    {
        'theme': 'light-blue',
        'color': '#5EADDE',
        'title': 'Light Blue'
    },
    {
        'theme': 'light-gray',
        'color': '#222',
        'title': 'Light Gray'
    }
]

JET_DEFAULT_THEME = 'green'
JET_SIDE_MENU_COMPACT = True
JET_SIDE_MENU_ITEMS = {
    'admin': [
        {
            'label': 'Test Management',
            'app_label': 'destiny',
            'items': [
                {'name': 'testcase'},
                {'name': 'testsuite'},
                {'name': 'testtag'},
            ]
        },
        {
            'label': 'Test Results',
            'app_label': 'destiny',
            'items': [
                {'name': 'testresult'},
            ]
        },
        {
            'label': 'Test Execution',
            'app_label': 'destiny',
            'items': [
                {'name': 'testjobserver'},
                {'name': 'testjob'},
                {'name': 'testjobresult'},
            ]
        },
        {
            'label': 'Product Management',
            'app_label': 'destiny',
            'items': [
                {'name': 'product'},
                {'name': 'repo'},
                {'name': 'branch'},
                {'name': 'version'},
            ]
        },
        {
            'label': 'User Management',
            'app_label': 'auth',
            'items': [
                {'name': 'group'},
                {'name': 'user'},
            ]
        }
    ],
    'appAdmin': [
        {
            'label': 'Test Management',
            'app_label': 'destiny',
            'items': [
                {'name': 'testcase'},
                {'name': 'testsuite'},
                {'name': 'testtag'},
            ]
        },
        {
            'label': 'Test Results',
            'app_label': 'destiny',
            'items': [
                {'name': 'testresult'},
            ]
        },
        {
            'label': 'Test Execution',
            'app_label': 'destiny',
            'items': [
                {'name': 'testjobserver'},
                {'name': 'testjob'},
                {'name': 'testjobresult'},
            ]
        },
    ]
}

# ############################################################################
# Json editor
JSON_EDITOR_JS = 'https://cdnjs.cloudflare.com/ajax/libs/jsoneditor/4.2.1/jsoneditor.js'
JSON_EDITOR_CSS = 'https://cdnjs.cloudflare.com/ajax/libs/jsoneditor/4.2.1/jsoneditor.css'

# ############################################################################
# Destiny Settings
# BASELINES_FILE = "atlantis_lib/job_manager/baseline_raw_info.json"
PER_FEATURE_LABEL_ORDER_FILE = "atlantis_lib/job_manager/feature_to_label.json"
BASELINES_FILE = 'atlantis_lib/job_manager/baseline_raw.txt'
DESTINY_LOG_BASE_PATH = LOG_BASE_PATH
DESTINY_LOG_STAGING = os.path.join(DESTINY_LOG_BASE_PATH, "staging")
DESTINY_LOG_ARCHIVE = os.path.join(DESTINY_LOG_BASE_PATH, "archive")

POLARIS_DESTINY_LOG_STAGING = os.path.join(DESTINY_LOG_BASE_PATH, "polaris/staging")

DESTINY_WEB_SHELL_DOCKER_HOST = "tcp://localhost:2375"
DESTINY_WEB_SHELL_MAX_LIFE = 1800  # IN SECS
DESTINY_WEB_SHELL_IMAGE_NAME = 'atlantis_web_shell:latest'
DESTINY_WEB_SHELL_PUBLIC_IP = 'localhost'

DESTINY_LOG_BROWSER_PUBLIC_IP = 'localhost'
DESTINY_LOG_BROWSER_PORT = 8080
DESTINY_ES_HOSTNAME = 'elasticsearch'
DESTINY_ES_USERNAME = '<Replace with username>'
DESTINY_ES_PASSWORD = '<Replace with password>'

DESTINY_ES_KEEP_LOGSTASH_LOGS_DAYS = 7
DESTINY_GOOGLE_SPARK_PROJECT_NAME = 'spark-lab'
DESTINY_GOOGLE_SPARK_LOG_READ_KEY = {
    "type": '<ReplaceWithDevInstanceKeyInCustomSettings>',
    "project_id": '<ReplaceWithDevInstanceKeyInCustomSettings>',
    "private_key_id": '<ReplaceWithDevInstanceKeyInCustomSettings>',
    "private_key": '<ReplaceWithDevInstanceKeyInCustomSettings>',
    "client_email": '<ReplaceWithDevInstanceKeyInCustomSettings>',
    "client_id": '<ReplaceWithDevInstanceKeyInCustomSettings>',
    "auth_uri": '<ReplaceWithDevInstanceKeyInCustomSettings>',
    "token_uri": '<ReplaceWithDevInstanceKeyInCustomSettings>',
    "auth_provider_x509_cert_url": '<ReplaceWithDevInstanceKeyInCustomSettings>',
    "client_x509_cert_url": '<ReplaceWithDevInstanceKeyInCustomSettings>'
}

DESTINY_TEST_JOB_SERVER_CREDS = {
    'https://jenkins.spark.rubrik-lab.com': {
        'username': '<ReplaceWithDevInstanceKeyInCustomSettings>',
        'password': '<ReplaceWithDevInstanceKeyInCustomSettings>'
    }
}

# ############################################################################
# Celery application definition
# http://docs.celeryproject.org/en/latest/userguide/configuration.html

CELERY_TIMEZONE = TIME_ZONE
CELERY_BROKER_URL = 'amqp://dev-admin:nopassword@rabbit:5672/'
CELERY_ACCEPT_CONTENT = ['json']

CELERY_RESULT_SERIALIZER = 'json'
CELERY_RESULT_CACHE_MAX = -1
CELERY_RESULT_BACKEND = 'redis://redis:6379'

CELERY_TASK_ANNOTATIONS = {'celery.chord_unlock': {'soft_time_limit': 300, 'default_retry_delay': 5}, }
CELERY_TASK_RESULT_EXPIRES = 2 * 3600
CELERY_TASK_TRACK_STARTED = True
CELERY_TASK_SERIALIZER = 'json'
CELERY_TASK_ACKS_LATE = True
CELERY_TASK_ALWAYS_EAGER = False

CELERY_WORKER_PREFETCH_MULTIPLIER = 1
CELERY_WORKER_POOL_RESTARTS = True
CELERY_WORKER_HIJACK_ROOT_LOGGER = False
CELERY_WORKER_MAX_TASKS_PER_CHILD = 10

CELERY_ONCE = {
    'backend': 'celery_once.backends.Redis',
    'settings': {
        'url': '{0}/0'.format(CELERY_RESULT_BACKEND),
        'default_timeout': 2 * 60 * 60  # 1 hr
    },
}

if ATLANTIS_PRODUCTION_SERVER:
    # DO NOT CHANGE THIS FOR NON PRODUCTION SERVERS
    CELERY_BEAT_SCHEDULE = {
        'prune_web_shell': {
            'task': 'destiny.tasks.prune_web_shell',
            'schedule': 10 * 60,
            'args': ()
        },
        'prune_old_job_logs': {
            'task': 'destiny.tasks.prune_old_job_logs',
            'schedule': 12 * 60 * 60,
            'args': ()
        },
        # 'prune_logstash_logs': {
        #     'task': 'destiny.tasks.prune_logstash_logs',
        #     'schedule': 12 * 60 * 60,
        #     'args': ()
        # },
        # 'brik_find_jenkins_jobs': {
        #     'task': 'destiny.tasks.brik_find_jenkins_jobs',
        #     'schedule': 10 * 60,
        #     'args': ()
        # },
        # 'brik_find_new_builds': {
        #     'task': 'destiny.tasks.brik_find_new_builds',
        #     'schedule': 10 * 60,
        #     'args': ()
        # },
        # 'brik_download_build_artifacts': {
        #     'task': 'destiny.tasks.brik_download_build_artifacts',
        #     'schedule': 10 * 60,
        #     'args': ()
        # },
        # 'brik_populate_job_result': {
        #     'task': 'destiny.tasks.brik_populate_job_result',
        #     'schedule': 10 * 60,
        #     'args': ()
        # },
        # 'brik_archive_log_dir': {
        #     'task': 'destiny.tasks.brik_archive_log_dir',
        #     'schedule': 15 * 60,
        #     'args': ()
        # },
        # 'brik_import_test_result': {
        #     'task': 'destiny.tasks.brik_import_test_result',
        #     'schedule': 90 * 60,
        #     'args': ()
        # },
        # 'brik_verify_test_result': {
        #     'task': 'destiny.tasks.brik_verify_test_result',
        #     'schedule': 24 * 60 * 60,
        #     'args': ()
        # },
        # 'brik_test_result_post_analysis': {
        #     'task': 'destiny.tasks.brik_test_result_post_analysis',
        #     'schedule': 10 * 60,
        #     'args': ()
        # },
        # 'brik_add_triage_info': {
        #     'task': 'destiny.tasks.brik_add_triage_info',
        #     'schedule': 10 * 60,
        #     'args': ()
        # },
        'polaris_find_jenkins_jobs': {
            'task': 'destiny.tasks.polaris_find_jenkins_jobs',
            'schedule': 10 * 60,
            'args': ()
        },
        'polaris_find_new_builds': {
            'task': 'destiny.tasks.polaris_find_new_builds',
            'schedule': 10 * 60,
            'args': ()
        },
        'polaris_fetch_build_artifacts': {
            'task': 'destiny.tasks.polaris_fetch_build_artifacts',
            'schedule': 10 * 60,
            'args': ()
        },
        'polaris_populate_job_result': {
            'task': 'destiny.tasks.polaris_populate_job_result',
            'schedule': 10 * 60,
            'args': ()
        },
        'polaris_archive_log_dir': {
            'task': 'destiny.tasks.polaris_archive_log_dir',
            'schedule': 10 * 60,
            'args': ()
        },
        'polaris_populate_test_result': {
            'task': 'destiny.tasks.polaris_populate_test_result',
            'schedule': 10 * 60,
            'args': ()
        },
        'polaris_process_test_job_result_unprocessable': {
            'task': 'destiny.tasks.polaris_process_test_job_result_unprocessable',
            'schedule': 60 * 60,
            'args': ()
        },
        # 'brik_import_pipelines': {
        #     'task': 'destiny.tasks.brik_import_pipelines',
        #     'schedule': 15 * 60,
        #     'args': ()
        # },
        # 'brik_process_pipeline_results': {
        #     'task': 'destiny.tasks.brik_process_pipeline_results',
        #     'schedule': 50 * 60,
        #     'args': ()
        # },
        # 'brik_triage_pipeline_results': {
        #     'task': 'destiny.tasks.brik_triage_pipeline_results',
        #     'schedule': 15 * 60,
        #     'args': ()
        # },
        'process_perf_test_result': {
            'task': 'destiny.tasks.process_perf_test_result',
            'schedule': 15 * 60,
            'args': ()
        },
        'process_perf_test_logs': {
            'task': 'destiny.tasks.process_perf_test_logs',
            'schedule': 15 * 60,
            'args': ()
        },
        'generate_perf_configs': {
            'task': 'destiny.tasks.generate_perf_configs',
            'schedule': 24 * 60 * 60,
            'args': ()
        },
        'generate_perf_run_info': {
            'task': 'destiny.tasks.generate_perf_run_info',
            'schedule': 12 * 60 * 60,
            'args': ()
        },
        # 'process_suite_test_trees': {
        #     'task': 'destiny.tasks.process_suite_test_trees',
        #     'schedule': 30 * 60,
        #     'args': ()
        # },
        'process_system_test_result': {
            'task': 'destiny.tasks.process_system_test_result',
            'schedule': 15 * 60,
            'args': ()
        },
        'process_feature_stress_test_result': {
            'task': 'destiny.tasks.process_feature_stress_test_results',
            'schedule': 15 * 60,
            'args': ()
        },
        'process_phabricator_data': {
            'task': 'productivity.tasks.process_phabricator_data',
            'schedule': 6 * 60 * 60,
            'args': ()
        },
        'archive_palladium_jobs': {
            'task': 'destiny.tasks.archive_palladium_jobs',
            'schedule': 60 * 60,
            'args': ()
        },
        'process_running_palladium_jobs': {
            'task': 'destiny.tasks.process_running_palladium_jobs',
            'schedule': 60 * 60,
            'args': ()
        },
        'process_running_p0_palladium_jobs': {
            'task': 'destiny.tasks.process_running_p0_palladium_jobs',
            'schedule': 10 * 60,
            'args': ()
        },
        'trigger_triage_engine': {
            'task': 'destiny.tasks.trigger_triage_engine',
            'schedule': 30 * 60,
            'args': ()
        },
        'prune_cache': {
            'task': 'destiny.tasks.prune_cache',
            'schedule': 240 * 60,
            'args': ()
        },
        'reset_system_cache': {
            'task': 'destiny.tasks.reset_system_cache',
            'schedule': 60 * 60,
            'args': ()
        },
        'reset_test_state_across_build_cache': {
            'task': 'destiny.tasks.reset_test_state_across_build_cache',
            'schedule': 60 * 60,
            'args': ()
        },
        'process_update_triage_resolution_from_jira': {
            'task': 'destiny.tasks.process_update_triage_resolution_from_jira',
            'schedule': 360 * 60,
            'args': ()
        },
        'process_test_results_without_jira': {
            'task': 'destiny.tasks.process_test_results_without_jira',
            'schedule': 1440 * 60,
            'args': ()
        },
        'process_missing_palladium_jobs': {
            'task': 'destiny.tasks.process_missing_palladium_jobs',
            'schedule': 180 * 60,
            'args': ()
        },
        'send_manager_report': {
            'task': 'slack.tasks.send_manager_report',
            'schedule': 7 * 24 * 60 * 60,  # weekly
            'args': ()
        },
        'backup_error_trie': {
            'task': 'destiny.tasks.backup_error_trie',
            'schedule': 240 * 60,
            'args': ()
        },
        'run_crystal_benchmarks_analyzer': {
            'task': 'destiny.tasks.run_benchmarks_analyzer',
            'schedule': 6 * 60 * 60,  # every six hours
            'args': ('CrystalBenchmarks',),
        },
    }
else:
    CELERY_BEAT_SCHEDULE = {
        'prune_logstash_logs': {
            'task': 'destiny.tasks.prune_logstash_logs',
            'schedule': 1 * 60 * 60,
            'args': ()
        },
    }

# ############################################################################
# ATLANTIS SETTINGS
# TODO (ATL-399): Move Atlantis to secure http
SERVER_BASE_URL = "http://atlantis.rubrik.com"

# PERF TASK SETTINGS
PERF_NFS_SERVER = "artifact.webstark.colo.rubrik.com:/mnt/data/perf-job-archive"
PERF_ARTIFACTS_MOUNT_PATH = "/mnt/data/perf-job-archive"
PERF_LOGS_DIR = "/mnt/data/joblogs/perf_test_logs"

# JIRA LIBRARY SETTINGS
JIRA_URL = 'https://rubrik.atlassian.net'
JIRA_USERNAME = '<Replace with jira username. Default in production settings>'
JIRA_PASSWORD = '<Replace with jira token password. Default in production settings>'
JIRA_FIELD_SIZE_LIMIT = 50000
JIRA_MAX_RESULTS = 1000
JIRA_RETRY_LIMIT = 3

# PHABRICATOR CONDUIT API SETTINGS
PHAB_URL = "https://phabricator.rubrik.com/api/"
PHAB_USERNAME = '<Replace with phabricator username.>'
PHAB_TOKEN = '<Replace with phabricator token.>'

# SLACK API SETTINGS
SLACK_CLIENT_ID = '<Replace with Slack App Client ID. Default in production settings>'
SLACK_CLIENT_SECRET = '<Replace with Slack App Client Secret. Default in production settings>'
SLACK_VERIFICATION_TOKEN = '<Replace with Slack App Verification Token. Default in production settings>'
SLACK_BOT_USER_TOKEN = '<Replace with Slack App Bot User OAuth Access Token. Default in production settings>'

# SYSTEM TEST RESULT

SYSTEM_TEST_RESULT_PATH = "/mnt/data/joblogs/systest_logs"
FEATURE_STRESS_TEST_RESULT_PATH = "/mnt/data/joblogs/feature_stress"

SYSTEM_TEST_RESULT_UNPROCESSED_FOLDER = "unprocessed"
FEATURE_STRESS_TEST_RESULT_UNPROCESSED_FOLDER = ""

# #############################################################################
# Triage settings
ERROR_TRIE_FILE = os.path.join(LOG_BASE_PATH, "error_trie.json")
MASTER_P0_ERROR_TRIE_FILE = os.path.join(LOG_BASE_PATH, "master_p0_error_trie.json")
ERROR_TRIE_COPY = "/mnt/data/error_trie.json"
TESTCASE_BUCKET_FILE = os.path.join(LOG_BASE_PATH, "testid_bucket.json")
ATLANTIS_JIRA_MAP = "destiny/lib/triage/atlantis_jira_map.json"

# For yml job parsing
RESULT_FILE = "extract_yml_job_tree.json"
VERSION_FILE = "version.property"
SDMAIN_PATH = "/home/ubuntu/sdmain"
SDMAIN_VERSION_FILE_PATH = os.path.join(SDMAIN_PATH, "conf", VERSION_FILE)
YML_JOB_RESULT = os.path.join("/tmp", RESULT_FILE)
GIT_WORKSPACE_HOST = dict(
    hostname="10.0.203.132",
    username='ubuntu',
    password='qwerty'
)

# Palladium
PALLADIUM_JOB_REQUEST_URL = "http://web.palladium.colo.rubrik.com/api/job_request"
PALLADIUM_REQUEST_PARAMS = {
    "client_secret": "87qtH12YPLLPGDmHjCTC6ySVtkluaTYfwJXrwg5Y17F8lZrVHjpL4uEOLZdd8y41XZG2y2puubSmcpiciRbBzEqkUMqpT9dFU9T8TZCFnAAnwtTXeSZKCss7dQ9vtG8B",
    "client_id": "yCjlneINsEmsWAjAzpc0EKQytFr2hS3kmH8563CV",
    "grant_type": "password",
    "username": "atlantis",
    "password": "atlantis_poller"
}
PALLADIUM_RESUBMIT_TOKEN_PARAMS = {
    "client_secret": "QwzEEaEoB7Y5yF392h67fALBFj8pQY0mH13H4uFqtfZZilO3EfOaZ8E8yYTIvlkSXsoajoS7uZC2mDJ9EnKita0TVKqE78b62lQCdeaBlZwel55vcTXFkBWzJ55oDE2y",
    "client_id": "grVOZk4uzYR8k1LsMV08RLMElbNx2vMIUetodDl4",
    'grant_type': 'password',
    'username': 'resubmitter',
    'password': 'nopassword'
}
PALLADIUM_REQUEST_HEADERS = {
    "Content-Type": "application/json",
    "Authorization": "Bearer 123456789"
}
PALLADIUM_REQUEST_FIELDNAMES = ["id", "status[name]", "start_time", "end_time", "request_type[name]"]
PALLADIUM_JOB_INSTANCE_FIELDNAMES = ["data"]
PALLADIUM_LIMIT_CONSTANT = 1000
PALLADIUM_ARCHIVAL_PATH = "/mnt/data/joblogs/archive/palladium"
PALLADIUM_AUTH_TOKEN_ENDPOINT = 'http://web.palladium.colo.rubrik.com/auth/token/'
PALLADIUM_RESUBMIT_ENDPOINT = "http://web.palladium.colo.rubrik.com/api/job_instance/%s/resubmit/"
PALLADIUM_JOB_INSTANCE_ENDPOINT = "http://web.palladium.colo.rubrik.com/api/job_instance/%s/"


TABLEAU_SERVER_ENDPOINT = 'https://us-west-2b.online.tableau.com'
TABLEAU_ACCOUNT = 'rubrikwisdom'
TABLEAU_WORKBOOKS = {
    'CrystalBenchmarks': {
        'name': 'CrystalBenchmarks',
        'dashboards': {
            'tab-name': 'Pageloadtime', # Other tabs: singleplane, Clusterversioninfo, AverageLoadtime etc
            'filters': {
                'workflow-item': 'Workflow%20Item%20Key',
                'cluster-name': 'Cluster%20Name',
                'role-type': 'Role%20Type',
                'user-type': 'User%20Type',
            }
        }
    }
}

# InfluxDB
TURBO_INFLUXDB = {
    "host": "netapp-graphite-infra.colo.rubrik.com",
    "port": 8086
}

# Grafana
TURBO_GRAFANA = {
    "host": "netapp-graphite-infra.colo.rubrik.com",
    "port": 3000
}
TURBO_GRAFANA_FOLDER_ID_TO_UPLOAD_DASH = 27

# pylint: disable=E0611
##############################################################################
# Import performance application settings

# ############################################################################
# Overrider settings with production settings
if ATLANTIS_PRODUCTION_SERVER == 1:
    if os.path.exists("%s/production_settings.py" % os.path.dirname(__file__)):
        INSTALLED_APPS.append('raven.contrib.django.raven_compat')
        from atlantis_site.production_settings import *
else:
    # ############################################################################
    # Override settings with dev settings

    if os.path.exists("%s/dev_settings.py" % os.path.dirname(__file__)):
        from atlantis_site.dev_settings import *

##############################################################################
# Feature Stress ELK Settings
FEATURE_STRESS_TEST_DASHBOARD_UUID = "c484fb40-58d1-11ea-bce7-2fe0b8b2a595"
FEATURE_STRESS_TEST_DASHBOARD_ADDRESS = "10.0.6.238"
FEATURE_STRESS_TEST_KIBANA_DASHBOARD_PORT = "5601"
