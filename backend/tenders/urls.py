# urls.py
from django.urls import path
from .views import TenderListAPIView

urlpatterns = [
    path('tenders/', TenderListAPIView.as_view(), name='tender-list'),
]
