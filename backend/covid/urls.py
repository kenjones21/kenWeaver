from django.conf.urls import include, url

from . import views

urlpatterns = [
    url(r'data/', views.get_data),
]
