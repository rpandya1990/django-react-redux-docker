from django.contrib.auth.models import Group


def save_to_group(backend, user, response, *args, **kwargs):
    defaultgroup = Group.objects.get(name='NoAdd_NoDelete_StandardUser')
    user.groups.add(defaultgroup)
    user.is_staff = True
    user.save()
