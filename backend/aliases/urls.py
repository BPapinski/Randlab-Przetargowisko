from django.urls import path
from . import views

urlpatterns = [
    path('tender-entries/', views.tender_entries_by_standard_position, name='tender_entries_by_standard_position'),
    path("groups/", views.alias_group_list, name="alias_group_list"),
    path('aliases/groups/', views.AliasGroupList.as_view(), name='alias-group-list'),
    path('getaliases/', views.AliasList, name='alias-create'),
    path('aliases/tender-entries/', views.TenderEntryList.as_view(), name='tender-entry-list'),
    path('create/', views.create_alias_view, name='create-alias'),

]
