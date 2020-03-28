from django import forms
from django.utils.encoding import force_text


class CustomModelChoiceField(forms.ModelChoiceField):
    def __init__(self, label_attribute, *args, **kwargs):
        self.label_attribute = label_attribute
        super(CustomModelChoiceField, self).__init__(*args, **kwargs)

    def label_from_instance(self, obj):
        return force_text(getattr(obj, self.label_attribute))