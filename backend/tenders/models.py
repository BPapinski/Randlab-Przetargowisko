from django.db import models


class Tender(models.Model):
    name = models.CharField(max_length=255, verbose_name="Tender name")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created at")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated at")

    def __str__(self):
        return self.name

    def total_tender_price(self):
        return self.entries.aggregate(total=models.Sum('total_price'))['total'] or 0

    total_tender_price.short_description = "Total tender value"


class TenderEntry(models.Model):
    tender = models.ForeignKey(Tender, on_delete=models.CASCADE, related_name="entries", verbose_name="Tender")
    position = models.CharField(max_length=255, verbose_name="Position")
    company = models.CharField(max_length=255, verbose_name="Company")
    developer_price = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Developer price")
    margin = models.DecimalField(max_digits=6, decimal_places=2, verbose_name="Margin (%)")
    total_price = models.DecimalField(max_digits=12, decimal_places=2, verbose_name="Total price")
    created_at = models.DateTimeField(auto_now_add=True, verbose_name="Created at")
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated at")

    def save(self, *args, **kwargs):
        self.total_price = self.developer_price * (1 + self.margin / 100)
        super().save(*args, **kwargs)

    def __str__(self):
        return f"{self.position} – {self.company} ({self.total_price:.2f} zł)"
