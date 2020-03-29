from __future__ import absolute_import

import os

from social_core.pipeline import DEFAULT_AUTH_PIPELINE

# ############################################################################
# Build paths inside the project like this: os.path.join(BASE_DIR, ...)
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# ############################################################################
PRESS_PRODUCTION_SERVER = int(os.environ.get('PRESS_PRODUCTION_SERVER', '0'))

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
            'tags': ['press-production' if os.getenv('PRESS_PRODUCTION_SERVER', '') == '1' else 'press-dev'],
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
WSGI_APPLICATION = 'press_site.wsgi.application'
ALLOWED_HOSTS = ['*']
SECRET_KEY = '3eh)j&cx#(sxi4w+n%kmk6^cc*is0ks@8wwerkpxx7)do7o6p%'
ROOT_URLCONF = "press_site.urls"
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
    'tara'
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'tara.middleware.RestrictSuperToAdminMiddleware'
]
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            os.path.join(BASE_DIR + '/tara/templates'),
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
    'press_site.pipeline.save_to_group'
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
    'DEFAULT_PAGINATION_CLASS': 'tara.pagination.TaraApiPagination',
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
            'label': 'Items',
            'app_label': 'tara',
            'items': []
        }
    ],
    'appAdmin': [
        {
            'label': 'Items',
            'app_label': 'tara',
            'items': []
        }
    ]
}

# ############################################################################
# Json editor
JSON_EDITOR_JS = 'https://cdnjs.cloudflare.com/ajax/libs/jsoneditor/4.2.1/jsoneditor.js'
JSON_EDITOR_CSS = 'https://cdnjs.cloudflare.com/ajax/libs/jsoneditor/4.2.1/jsoneditor.css'



