# -*- coding: utf-8 -*-
from __future__ import unicode_literals

import logging
import operator
import sys
from functools import reduce

from django.apps import apps
from django.contrib import admin
from django.contrib.admin.utils import lookup_needs_distinct
from django.db import models


log = logging.getLogger(__name__)


class BaseAdmin(admin.ModelAdmin):
    """Create Admin pages in the format ModelNameAdmin"""

    def get_readonly_fields(self, request, obj):
        if hasattr(self, 'readonly_fields_all') and self.readonly_fields_all:
            return [i.name for i in obj._meta.fields] + [i.name for i in obj._meta.many_to_many]

        return super(BaseAdmin, self).get_readonly_fields(request, obj)

    def get_search_results(self, request, queryset, search_term):
        """
        Returns a tuple containing a queryset to implement the search,
        and a boolean indicating if the results may contain duplicates.
        """

        # Apply keyword searches.
        def construct_search(field_name):
            if hasattr(self, 'search_fields_json') and field_name in getattr(self, 'search_fields_json'):
                return field_name
            elif field_name.startswith('^'):
                return "%s__istartswith" % field_name[1:]
            elif field_name.startswith('='):
                return "%s__iexact" % field_name[1:]
            elif field_name.startswith('@'):
                return "%s__search" % field_name[1:]
            else:
                return "%s__icontains" % field_name

        use_distinct = False
        search_fields = self.get_search_fields(request)
        if search_fields and search_term:
            orm_lookups = [construct_search(str(search_field))
                           for search_field in search_fields]

            or_queries = list()
            for bit in search_term.split(','):
                or_queries.extend([models.Q(**{orm_lookup: bit})
                                   for orm_lookup in orm_lookups])

            if or_queries:
                queryset = queryset.filter(reduce(operator.or_, or_queries))

            if not use_distinct:
                for search_spec in orm_lookups:
                    if hasattr(self, 'search_fields_json') and search_spec in getattr(self, 'search_fields_json'):
                        continue
                    if lookup_needs_distinct(self.opts, search_spec):
                        use_distinct = True
                        break

        return queryset, use_distinct

    def __getattr__(self, attr):
        try:
            # not dynamic lookup, default behaviour
            return self.__getattribute__(attr)
        except Exception:
            lookup_more = ('__' in attr
                           and not attr.startswith('_')
                           and not attr.endswith('_boolean')
                           and not attr.endswith('_short_description'))
            if lookup_more:
                def dyn_lookup(instance):
                    try:
                        # traverse all __ lookups
                        return reduce(lambda parent, child: getattr(parent, child),
                                      attr.split('__'),
                                      instance)
                    except Exception:
                        return self.__getattribute__(attr)

                # get admin_order_field, boolean and short_description
                dyn_lookup.admin_order_field = attr
                dyn_lookup.boolean = getattr(self, '{}_boolean'.format(attr), False)
                dyn_lookup.short_description = getattr(
                    self, '{}_short_description'.format(attr),
                    attr.replace('_', ' ').capitalize())

                return dyn_lookup

            raise

    list_per_page = 30


class ItemAdmin(BaseAdmin):
    list_display = [
        'name',
        'link'
    ]
    search_fields = [
        'name',
        'link'
    ]


# This should always be the last section otherwise code admin pages will not
# get auto generated
# bulk model to admin page registration
current_module = sys.modules[__name__]
current_app = apps.get_app_config('tara')
for model_name, model in current_app.models.items():
    try:
        admin.site.register(model, getattr(current_module, "{}Admin".format(model.__name__)))
    except AttributeError:
        pass
