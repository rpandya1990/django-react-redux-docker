import csv
import math
from collections import OrderedDict
from io import StringIO
from operator import __or__

from django.db.models import Q
from rest_framework import viewsets, permissions, views
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework.response import Response
from rest_framework.utils.urls import replace_query_param
from .serializers import get_serializers_with_all_fields


def get_api_views_with_all_fields_readonly():
    models = [
    ]

    dynamic_class = []
    for m in models:
        class DynamicViewSet(viewsets.ReadOnlyModelViewSet):
            queryset = m.objects.all().order_by('-id')
            serializer_class = get_serializers_with_all_fields(m)
            filter_fields = list(
                [
                    i.name for i in filter(
                    lambda x: x.__class__.__name__ != 'JSONField' and x.__class__.__name__ != 'ArrayField',
                    [i for i in m._meta.concrete_fields]
                )
                ]
            )

        dynamic_class.append(DynamicViewSet)
    return dynamic_class


def get_api_views_with_all_fields_create_retrieve():
    models = [
    ]

    dynamic_class = []
    for m in models:
        class DynamicViewSet(viewsets.ModelViewSet):
            queryset = m.objects.all().order_by('-id')
            serializer_class = get_serializers_with_all_fields(m)
            _fields = [i for i in m._meta.concrete_fields]
            filter_fields = list([i.name for i in filter(
                lambda x: x.__class__.__name__ != 'JSONField' and x.__class__.__name__ != 'ArrayField', _fields)])

        dynamic_class.append(DynamicViewSet)
    return dynamic_class
