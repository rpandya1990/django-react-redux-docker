# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import logging

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.mixins import LoginRequiredMixin
from django.views.generic import RedirectView, TemplateView


log = logging.getLogger(__name__)
AUTH_USER_MODEL = get_user_model()


class IndexPage(LoginRequiredMixin, TemplateView):
    template_name = "index.html"
