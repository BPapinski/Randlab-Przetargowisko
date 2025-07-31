from django import forms
from django.contrib import admin
from django.db.models import Sum
from .models import Tender, TenderEntry


class TenderEntryInlineForm(forms.ModelForm):
    class Meta:
        model = TenderEntry
        exclude = ['total_price']  # hide total_price – it will be calculated automatically

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
    readonly_fields = ['total_price']
    fields = ('position', 'company', 'developer_price', 'margin', 'total_price')
    verbose_name = "Tender entry"
    verbose_name_plural = "Tender entries"


@admin.register(Tender)
class TenderAdmin(admin.ModelAdmin):
    inlines = [TenderEntryInline]
    readonly_fields = ['total_tender_price_display']
    list_display = ('id', 'name', 'created_at', 'updated_at', 'total_tender_price', 'is_active')
    list_display_links = ('name',)
    search_fields = ('name',)

    def total_tender_price_display(self, obj):
        total = obj.entries.aggregate(total=Sum('total_price'))['total'] or 0
        return f"{total:.2f} zł"

    total_tender_price_display.short_description = "Total tender value"

    fieldsets = (
        ('Main Information', {
            'fields': ('name', 'is_active', 'total_tender_price_display')
        }),
    )

    def get_readonly_fields(self, request, obj=None):
        if obj:
            return self.readonly_fields + ['created_at', 'updated_at']
        return self.readonly_fields