from django.db import models

class AliasGroup(models.Model):
    name = models.CharField(max_length=255, unique=True, verbose_name="Standard position name")

    def __str__(self):
        return self.name


class Alias(models.Model):
    alias_group = models.ForeignKey(AliasGroup, on_delete=models.CASCADE, related_name="aliases")
    alias_name = models.CharField(max_length=255, unique=True, verbose_name="Alias")

    def __str__(self):
        return f"{self.alias_name} → {self.alias_group.name}"
