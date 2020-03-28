from collections import OrderedDict

from django.contrib.auth import get_user_model
from rest_framework import serializers


def get_serializers_with_all_fields(model_class):
    class DynamicModelSerializer(serializers.HyperlinkedModelSerializer):
        def get_default_field_names(self, declared_fields, model_info):
            """
            Return the default list of field names that will be used if the
            `Meta.fields` option is not specified.
            """
            return ([self.url_field_name, 'id'] +
                    list(declared_fields.keys()) +
                    list(model_info.fields.keys()) +
                    list(model_info.forward_relations.keys()))

        class Meta:
            model = model_class
            fields = '__all__'

    return DynamicModelSerializer


def get_model_serializers_with_all_fields(model_class):
    class DynamicModelSerializer(serializers.ModelSerializer):
        def get_default_field_names(self, declared_fields, model_info):
            """
            Return the default list of field names that will be used if the
            `Meta.fields` option is not specified.
            """
            return ([self.url_field_name, 'id'] +
                    list(declared_fields.keys()) +
                    list(model_info.fields.keys()) +
                    list(model_info.forward_relations.keys()))

        class Meta:
            model = model_class
            fields = '__all__'

    return DynamicModelSerializer


def get_dynamic_field(model_class):
    class DynamicModelField(serializers.HyperlinkedRelatedField):
        def to_representation(self, instance):
            obj = model_class.objects.get(pk=instance.pk)
            return OrderedDict({
                'id': obj.id,
                'url': super(DynamicModelField, self).to_representation(instance),
                'label': str(obj)
            })

        def get_choices(self, cutoff=None):
            queryset = self.get_queryset()
            if queryset is None:
                return {}

            return OrderedDict([(item.id, str(item)) for item in queryset])

    return DynamicModelField