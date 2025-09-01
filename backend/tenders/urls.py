# urls.py
from django.urls import path

from .views import (
    CompanyListView,
    TenderCreateView,
    TenderEntryRetrieveUpdateDestroyView,
    TenderListAPIView,
    TenderUpdateAPIView,
    UniqueClientListView,
    UploadedFileCreateView,
    add_tender_entry,
    toggle_tender_active,
)

urlpatterns = [
    path("tenders/", TenderListAPIView.as_view(), name="tender-list"),
    path("tenders/create/", TenderCreateView.as_view(), name="tender-create"),
    path(
        "tender/<int:tender_id>/toggle-active/",
        toggle_tender_active,
        name="toggle_tender_active",
    ),
    path("companies/", CompanyListView.as_view(), name="company-list"),
    path("clients/", UniqueClientListView.as_view(), name="client-list"),
    path(
        "tender-entries/<int:pk>/",
        TenderEntryRetrieveUpdateDestroyView.as_view(),
        name="tender-entry-detail",
    ),
    path(
        "tender/<int:tender_id>/entries/",
        add_tender_entry,
        name="add-tender-entry",
    ),
    path(
        "tenders/<int:id>/",
        TenderUpdateAPIView.as_view(),
        name="tender-update",
    ),
    path(
        "tenders/<int:tender_id>/upload-file/",
        UploadedFileCreateView.as_view(),
        name="tender-upload-file",
    ),
]
