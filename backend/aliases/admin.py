# aliases/admin.py
from django.contrib import admin

from .models import Alias, AliasGroup


@admin.register(AliasGroup)
class AliasGroupAdmin(admin.ModelAdmin):
    list_display = ("name",)


@admin.register(Alias)
class AliasAdmin(admin.ModelAdmin):
    list_display = ("alias_name", "alias_group")
