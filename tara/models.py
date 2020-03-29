# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import datetime
import logging
import os
import re
import time
import uuid
from collections import defaultdict

import pytz
from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.contenttypes.models import ContentType
from django.contrib.postgres.fields import ArrayField
from django.db import models
from django.urls import reverse
from django.utils import timezone
from django.utils.html import format_html
from django.utils.safestring import mark_safe
from dotmap import DotMap
from jsoneditor.fields.postgres_jsonfield import JSONField


log = logging.getLogger(__name__)
AUTH_USER_MODEL = get_user_model()


class BaseModel(models.Model):
    """Base Class for all model.

    Layout
        Fields
            local fields
            Related fields (Fk, M2M)
        Meta Class
        Methods
    """
    record_create_time = models.DateTimeField(default=timezone.now)
    record_update_time = models.DateTimeField(auto_now=True)

    class Meta:
        abstract = True

    def get_change_url(self):
        content_type = ContentType.objects.get_for_model(self.__class__)
        return reverse("admin:%s_%s_change" % (content_type.app_label, content_type.model), args=(self.id,))

    @staticmethod
    def get_str_repr(attributes, separator=':'):
        return "{}".format(separator).join(["{}".format(i) for i in attributes])
