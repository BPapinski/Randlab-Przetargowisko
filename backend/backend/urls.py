from django.contrib import admin
from django.urls import include, path
from rest_framework_simplejwt.views import (
    # TokenBlacklistView,
    TokenObtainPairView,
    TokenRefreshView,
    TokenVerifyView,
)

urlpatterns = [
    path("admin/", admin.site.urls),
    path("api/token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),
    path("api/token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),
    path("api/token/verify/", TokenVerifyView.as_view(), name="token_verify"),
    path("api/", include("users.urls")),
    path("api/", include("tenders.urls")),
    path("api/aliases/", include("aliases.urls")),
]
