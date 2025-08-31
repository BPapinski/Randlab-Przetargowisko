from django.urls import path

from .views import TenderStatsAPIView

urlpatterns = [
    path("tender-stats/", TenderStatsAPIView.as_view(), name="tender-stats"),
]
