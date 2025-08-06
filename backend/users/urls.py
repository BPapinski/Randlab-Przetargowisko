# from django.contrib import admin
from django.urls import path

from users.views import LogoutView

urlpatterns = [
    path("logout/", LogoutView.as_view(), name="auth_logout"),
]
