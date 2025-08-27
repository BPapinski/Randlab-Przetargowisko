from rest_framework import serializers

from .models import Tender, TenderEntry


class TenderEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = TenderEntry
        fields = [
            "id",
            "position",
            "company",
            "developer_price",
            "margin",
            "total_price",
            "created_at",
            "updated_at",
            "description",
        ]
        read_only_fields = ["id", "total_price", "created_at", "updated_at"]


class TenderSerializer(serializers.ModelSerializer):
    entries = TenderEntrySerializer(many=True, read_only=True)
    price = serializers.FloatField(read_only=True)

    class Meta:
        model = Tender
        fields = [
            "id",
            "name",
            "created_at",
            "updated_at",
            "entries",
            "is_active",
            "price",
            "client",
            "status",
            "implementation_link",
        ]


class TenderCreateSerializer(serializers.ModelSerializer):
    entries = TenderEntrySerializer(many=True)

    class Meta:
        model = Tender
        fields = ["id", "name", "entries", "client", "status", "implementation_link"]

    def create(self, validated_data):
        entries_data = validated_data.pop("entries")
        tender = Tender.objects.create(**validated_data)
        for entry_data in entries_data:
            TenderEntry.objects.create(tender=tender, **entry_data)
        return tender
