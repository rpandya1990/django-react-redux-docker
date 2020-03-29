"""
WSGI config for atlantis project.

It exposes the WSGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/1.11/howto/deployment/wsgi/
"""
import os

from django.core.wsgi import get_wsgi_application

from press_site.settings import BASE_DIR

os.environ.setdefault("DJANGO_SETTINGS_MODULE", "atlantis_site.settings")

if os.environ.get('ATLANTIS_PRODUCTION_SERVER', '') == '1':
    import newrelic.agent

    newrelic.agent.initialize(os.path.abspath('{}/newrelic.ini'.format(BASE_DIR)))
    application = get_wsgi_application()
    application = newrelic.agent.wsgi_application()(application)
else:
    application = get_wsgi_application()
