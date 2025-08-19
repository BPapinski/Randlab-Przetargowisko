# urls.py
from django.urls import path

from .views import CompanyListView, TenderCreateView, TenderListAPIView, toggle_tender_active

urlpatterns = [
    path("tenders/", TenderListAPIView.as_view(), name="tender-list"),
    path("tenders/create/", TenderCreateView.as_view(), name="tender-create"),
    path(
        "tender/<int:tender_id>/toggle-active/",
        toggle_tender_active,
        name="toggle_tender_active",
    ),
    path("companies/", CompanyListView.as_view(), name="company-list"),
]
