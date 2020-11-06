from django.conf.urls import include, url

from . import views

urlpatterns = [
    url(r'hello/', views.hello_world),
    url(r'profile/', views.profile)
]
