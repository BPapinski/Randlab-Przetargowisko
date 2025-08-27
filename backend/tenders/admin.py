from django import forms
from django.contrib import admin
from django.db.models import Sum

from .models import Tender, TenderEntry


class TenderEntryInlineForm(forms.ModelForm):
    class Meta:
        model = TenderEntry
        exclude = ["total_price"]

    def save(self, commit=True):
        instance = super().save(commit=False)
        instance.total_price = instance.developer_price * (1 + instance.margin / 100)
        if commit:
            instance.save()
        return instance


class TenderEntryInline(admin.TabularInline):
    model = TenderEntry
    form = TenderEntryInlineForm
    extra = 1
    show_change_link = True
    readonly_fields = ["total_price"]
    fields = ("position", "company", "developer_price", "margin", "total_price")
    verbose_name = "Tender entry"
    verbose_name_plural = "Tender entries"


@admin.register(Tender)
class TenderAdmin(admin.ModelAdmin):
    inlines = [TenderEntryInline]
    readonly_fields = ["total_tender_price_display"]
    list_display = (
        "id",
        "name",
        "client",
        "status",
        "created_at",
        "updated_at",
        "total_tender_price",
        "is_active",
    )
    list_display_links = ("name",)
    search_fields = ("name", "client")
    list_filter = ("status", "is_active")

    def total_tender_price_display(self, obj):
        total = obj.entries.aggregate(total=Sum("total_price"))["total"] or 0
        return f"{total:.2f} zł"

    total_tender_price_display.short_description = "Total tender value"

    fieldsets = (
        (
            "Main Information",
            {
                "fields": (
                    "name",
                    "client",
                    "status",
                    "implementation_link",
                    "is_active",
                    "total_tender_price_display",
                )
            },
        ),
    )

    def get_readonly_fields(self, request, obj=None):
        if obj:
            return self.readonly_fields + ["created_at", "updated_at"]
        return self.readonly_fields


@admin.register(TenderEntry)
class TenderEntryAdmin(admin.ModelAdmin):
    readonly_fields = ["total_price"]
    list_display = (
        "id",
        "tender",
        "position",
        "company",
        "developer_price",
        "margin",
        "total_price",
    )
    list_filter = ("company", "tender")
    search_fields = ("position", "company__name", "tender__name")
