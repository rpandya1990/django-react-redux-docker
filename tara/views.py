# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import json
import logging

from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.mixins import LoginRequiredMixin
from django.http.response import HttpResponse
from django.views.generic import RedirectView, TemplateView
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import permission_classes
from rest_framework.views import APIView

from tara.models import AppList


log = logging.getLogger(__name__)
AUTH_USER_MODEL = get_user_model()


class IndexPage(LoginRequiredMixin, TemplateView):
    template_name = "index.html"


@permission_classes((permissions.AllowAny,))
class GetAppList(APIView):
    def get(self, request, *args, **kwargs):
        print(request.get_raw_uri())
        query_set = [dict(
            name=al.name,
            link=al.link,
            category=al.category,
            icon_name=al.icon_name,
            icon_link=al.custom_icon_link
        ) for al in AppList.objects.all().order_by("id")]
        context = dict(
            query_set=list(query_set),
            user=request.user.username
        )
        return HttpResponse(
            json.dumps(context), content_type="application/json")