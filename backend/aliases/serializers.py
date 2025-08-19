from rest_framework import serializers

from tenders.models import Tender, TenderEntry

from .models import Alias, AliasGroup


class TenderSerializer(serializers.ModelSerializer):
    class Meta:
        model = Tender
        fields = ["name"]


class TenderEntrySerializer(serializers.ModelSerializer):
    # Zastąpienie domyślnego pola 'tender' zagnieżdżonym serializatorem
    tender = TenderSerializer(  required=False)

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
            "tender",
        ]


class AliasGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = AliasGroup
        fields = ["id", "name"]


class AliasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alias
        fields = ["id", "alias_group", "alias_name"]
