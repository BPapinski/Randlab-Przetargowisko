from django.urls import path
from . import views

urlpatterns = [
    path('tender-entries/', views.tender_entries_by_standard_position, name='tender_entries_by_standard_position'),
]
