# urls.py
from django.urls import path
from .views import TenderListAPIView, TenderCreateView

urlpatterns = [
    path('tenders/', TenderListAPIView.as_view(), name='tender-list'),
    path('tenders/create/', TenderCreateView.as_view(), name='tender-create'),
]
