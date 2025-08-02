from rest_framework import serializers
from .models import Tender, TenderEntry

class TenderEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = TenderEntry
        fields = [
            'id', 'position', 'company', 'developer_price',
            'margin', 'total_price', 'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'total_price', 'created_at', 'updated_at']

class TenderSerializer(serializers.ModelSerializer):
    entries = TenderEntrySerializer(many=True, read_only=True)
    # 1. Add a SerializerMethodField for the total price
    total_tender_value = serializers.SerializerMethodField()
    price = serializers.FloatField(read_only=True)

    class Meta:
        model = Tender
        fields = ['id', 'name', 'created_at', 'updated_at', 'entries', 'total_tender_value', 'is_active', 'price']

    def get_total_tender_value(self, obj):
        return obj.total_tender_price()
    
class TenderCreateSerializer(serializers.ModelSerializer):
    entries = TenderEntrySerializer(many=True)

    class Meta:
        model = Tender
        fields = ['id', 'name', 'entries']

    def create(self, validated_data):
        entries_data = validated_data.pop('entries')
        tender = Tender.objects.create(**validated_data)
        for entry_data in entries_data:
            TenderEntry.objects.create(tender=tender, **entry_data)
        return tender