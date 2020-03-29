"""URL Configuration
The `urlpatterns` list routes URLs to views. For more information please see:
    https://docs.djangoproject.com/en/1.11/topics/http/urls/
Examples:
Function views
    1. Add an import:  from my_app import views
    2. Add a URL to urlpatterns:  url(r'^$', views.home, name='home')
Class-based views
    1. Add an import:  from other_app.views import Home
    2. Add a URL to urlpatterns:  url(r'^$', Home.as_view(), name='home')
Including another URLconf
    1. Import the include() function: from django.conf.urls import url, include
    2. Add a URL to urlpatterns:  url(r'^blog/', include('blog.urls'))
"""
from django.conf import settings
from django.conf.urls import include, url
from django.conf.urls.static import static
from django.contrib import admin
from django.contrib.auth.decorators import login_required
from django.contrib.auth.views import logout
from django.views.generic import RedirectView, TemplateView
from rest_framework.schemas import get_schema_view

from press_site.api import router
from tara.appAdmin import appAdminSite as tara_site
from tara.views import (IndexPage,
                        GetAppList)

admin.site.site_header = "Press-Website"
admin.site.site_title = "Tara"
admin.site.index_title = "Press-Website"
tara_site.site_header = admin.site.site_header
tara_site.site_title = admin.site.site_title
tara_site.index_title = admin.site.index_title

urlpatterns = [
                  url(r'', tara_site.urls),
                  url(r'^login', RedirectView.as_view(url='/', permanent=False), name='login'),
                  url(r'^logout', logout, {"next_page": "/login/"}, name='logout'),
                  url(r'^api/tara/get_app_list', GetAppList.as_view(), name="get_app_list"),
                  url(r'^oauth/', include('social_django.urls', namespace='social')),
                  url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework')),
                  url(r'^api-schema/', get_schema_view('Supported API')),
                  url(r'^api/', include(router.urls)),

                  url(r'^jet/', include('jet.urls', 'jet')),

                  url(r'^admin/', admin.site.urls),
                  url(r'^.*', IndexPage.as_view(), name="frontend")
              ] + static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
