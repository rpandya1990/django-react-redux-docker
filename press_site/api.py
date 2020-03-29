from rest_framework import routers

from tara.api import \
    get_api_views_with_all_fields_create_retrieve as get_tara_api_views_with_all_fields_create_retrieve
from tara.api import \
    get_api_views_with_all_fields_readonly as get_tara_api_views_with_all_fields_readonly

# register rest api endpoints

router = routers.DefaultRouter()

# Add api where all the fields are exposed
for api_views in [get_tara_api_views_with_all_fields_readonly,
                  get_tara_api_views_with_all_fields_create_retrieve]:
    for v in api_views():
        url = "{}/{}".format(
            v.queryset.query.model.__module__.lower().split('.models')[0],
            v.queryset.query.model.__name__.lower()
        )
        router.register(url, v)
