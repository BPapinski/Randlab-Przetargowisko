from rest_framework import serializers

from .models import Tender, TenderEntry, UploadedFile


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


class UploadedFileSerializer(serializers.ModelSerializer):
    class Meta:
        model = UploadedFile
        fields = ["id", "file", "uploaded_at"]


class TenderSerializer(serializers.ModelSerializer):
    entries = TenderEntrySerializer(many=True, read_only=True)
    price = serializers.FloatField(read_only=True)
    uploaded_files = UploadedFileSerializer(many=True, read_only=True)

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
            "uploaded_files",
        ]


class TenderCreateSerializer(serializers.ModelSerializer):
    entries = TenderEntrySerializer(many=True)

    class Meta:
        model = Tender
        fields = [
            "id",
            "name",
            "entries",
            "client",
            "status",
            "implementation_link",
        ]

    def create(self, validated_data):
        entries_data = validated_data.pop("entries")
        tender = Tender.objects.create(**validated_data)
        for entry_data in entries_data:
            TenderEntry.objects.create(tender=tender, **entry_data)
        return tender
