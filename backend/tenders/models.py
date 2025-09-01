from django.db import models
from django.utils import timezone


def tender_file_upload_to(instance, filename):
    return f"tender_files/{instance.tender.id}/{filename}"


class Tender(models.Model):
    STATUS_CHOICES = [
        ("won", "Won"),
        ("lost", "Lost"),
        ("unresolved", "Unresolved"),
    ]

    status = models.CharField(
        max_length=12,
        choices=STATUS_CHOICES,
        default="unresolved",
        verbose_name="Status",
    )
    name = models.CharField(max_length=255, verbose_name="Tender name")
    client = models.CharField(
        max_length=255,
        verbose_name="Client",
        default="Unknown",
    )

    implementation_link = models.URLField(
        max_length=200,
        blank=True,
        null=True,
        default="",
    )

    created_at = models.DateTimeField(
        auto_now_add=True, verbose_name="Created at"
    )
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated at")
    is_active = models.BooleanField(default=True, verbose_name="Is active")

    def __str__(self):
        return self.name

    def total_tender_price(self):
        return (
            self.entries.aggregate(total=models.Sum("total_price"))["total"]
            or 0
        )

    total_tender_price.short_description = "Total tender value"

    def get_uploaded_files(self):
        """Zwraca listę URL-i do plików powiązanych z przetargiem."""
        return [
            uploaded_file.file.url
            for uploaded_file in self.uploaded_files.all()
        ]


class TenderEntry(models.Model):
    tender = models.ForeignKey(
        Tender,
        on_delete=models.CASCADE,
        related_name="entries",
        verbose_name="Tender",
    )
    position = models.CharField(max_length=255, verbose_name="Position")
    company = models.CharField(max_length=255, verbose_name="Company")
    developer_price = models.DecimalField(
        max_digits=12, decimal_places=2, verbose_name="Developer price"
    )
    margin = models.DecimalField(
        max_digits=6, decimal_places=2, verbose_name="Margin (%)"
    )
    total_price = models.DecimalField(
        max_digits=12, decimal_places=2, verbose_name="Total price"
    )
    created_at = models.DateTimeField(
        auto_now_add=True, verbose_name="Created at"
    )
    updated_at = models.DateTimeField(auto_now=True, verbose_name="Updated at")
    description = models.TextField(
        blank=True, null=True, verbose_name="Description"
    )

    def save(self, *args, **kwargs):
        self.total_price = self.developer_price * (1 + self.margin / 100)
        super().save(*args, **kwargs)
        Tender.objects.filter(id=self.tender_id).update(
            updated_at=timezone.now()
        )

    def __str__(self):
        return f"{self.position} – {self.company} ({self.total_price:.2f} zł)"


class UploadedFile(models.Model):
    tender = models.ForeignKey(
        "Tender", on_delete=models.CASCADE, related_name="uploaded_files"
    )
    file = models.FileField(upload_to=tender_file_upload_to)
    uploaded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"File for Tender {self.tender.id}: {self.file.name}"
