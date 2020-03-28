# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import sys

from django.contrib.admin.actions import delete_selected as delete_selected_original
from django.core.exceptions import PermissionDenied
from dotmap import DotMap

from collections import OrderedDict
from django import forms
from django.apps import apps
from django.contrib.admin.sites import AdminSite
from django.contrib.admin.sites import site
from django.forms import Textarea
from django.template.response import TemplateResponse
from django.utils.module_loading import autodiscover_modules
from django.views.decorators.cache import never_cache

from tara import admin as adminView


# Registration to AppAdmin
class AppAdminSite(AdminSite):
    def __init__(self):
        super(AppAdminSite, self).__init__(name='appAdmin')

    @never_cache
    def index(self, request, extra_context=None):
        request.current_app = self.name
        return TemplateResponse(
            request, self.index_template or "index.html"
        )

def autodiscover():
    autodiscover_modules('appAdmin', register_to=site)


appAdminSite = AppAdminSite()

current_module = sys.modules[__name__]
current_app = apps.get_app_config('tara')
for model_name, model in current_app.models.items():
    try:
        appAdminSite.register(
            model,
            getattr(
                current_module,
                "{}Admin".format(model.__name__)
            )
        )
    except AttributeError:
        pass
