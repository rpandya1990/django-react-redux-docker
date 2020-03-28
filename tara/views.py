# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import datetime
import json
import logging
import re
import urllib
from collections import Counter, OrderedDict, defaultdict
from datetime import timedelta
from operator import itemgetter
from time import sleep

import pytz
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.decorators import login_required
from django.contrib.auth.mixins import LoginRequiredMixin
from django.core.paginator import EmptyPage, PageNotAnInteger, Paginator
from django.db.models import Q
from django.http import JsonResponse
from django.http.response import Http404, HttpResponse, HttpResponseBadRequest
from django.shortcuts import redirect
from django.views.generic import RedirectView, TemplateView
from dotmap import DotMap
from fuzzywuzzy import fuzz
from plumbum import local
from rest_framework import permissions, status, viewsets
from rest_framework.decorators import permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView


log = logging.getLogger(__name__)
LOG_STAGING = settings.DESTINY_LOG_STAGING
AUTH_USER_MODEL = get_user_model()