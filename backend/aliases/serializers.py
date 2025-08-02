from rest_framework import serializers
from tenders.models import TenderEntry
from .models import AliasGroup, Alias

class TenderEntrySerializer(serializers.ModelSerializer):
    class Meta:
        model = TenderEntry
        fields = "__all__"


class AliasGroupSerializer(serializers.ModelSerializer):
    class Meta:
        model = AliasGroup
        fields = ['id', 'name']

class AliasSerializer(serializers.ModelSerializer):
    class Meta:
        model = Alias
        fields = ['id', 'alias_group', 'alias_name']