from rest_framework import serializers
from .models import TenderEntry

class TenderEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = TenderEntry
        fields = "__all__"