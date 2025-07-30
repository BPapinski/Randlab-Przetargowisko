
from rest_framework import serializers
from .models import Tender, TenderEntry

class TenderEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = TenderEntry
        fields = ['id', 'position', 'company', 'developer_price', 'margin', 'total_price', 'created_at', 'updated_at']

class TenderSerializer(serializers.ModelSerializer):
    entries = TenderEntrySerializer(many=True, read_only=True)

    class Meta:
        model = Tender
        fields = ['id', 'name', 'created_at', 'updated_at', 'entries']
