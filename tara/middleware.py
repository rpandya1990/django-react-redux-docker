from django.core.urlresolvers import reverse
from django.http import HttpResponseNotAllowed
from django.shortcuts import redirect


class RestrictSuperToAdminMiddleware(object):
    def __init__(self, get_response):
        self.get_response = get_response
        # One-time configuration and initialization.

    def __call__(self, request):
        # Code to be executed for each request before
        # the view (and later middleware) are called.

        response = self.get_response(request)

        if request.path.startswith(reverse('admin:index')):
            if request.user.is_authenticated():
                if not request.user.is_superuser:
                    raise HttpResponseNotAllowed

        if request.path.endswith('/logout/'):
            return redirect(reverse('login'))

        # Code to be executed for each request/response after
        # the view is called.
        return response
