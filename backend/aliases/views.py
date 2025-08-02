from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .utils import get_tender_entries_for_alias_group
from tenders.serializers import TenderEntrySerializer
from .models import AliasGroup, Alias
from tenders.models import TenderEntry

@api_view(['GET'])
def tender_entries_by_standard_position(request):
    position = request.GET.get('position')
    print(f"Received position: {position}")  # Debugging line

    if position == 'None':
        print("Position is None, fetching entries with no matching alias.")
        alias_names = list(Alias.objects.values_list('alias_name', flat=True))
        group_names = list(AliasGroup.objects.values_list('name', flat=True))
        all_known_names = alias_names + group_names

        entries = TenderEntry.objects.exclude(position__in=all_known_names)
        print(f"Found {entries.count()} entries with no matching alias.")
    elif position:
        try:
            entries = get_tender_entries_for_alias_group(position)
        except Alias.DoesNotExist:
            return Response({'error': f"Alias '{position}' not found."}, status=status.HTTP_404_NOT_FOUND)

    else:
        return Response({'error': 'Missing position parameter.'}, status=status.HTTP_400_BAD_REQUEST)
    
    serializer = TenderEntrySerializer(entries, many=True)
    return Response(serializer.data)

@api_view(['GET'])
def alias_group_list(request):
    groups = AliasGroup.objects.all().values_list('name', flat=True)
    return Response(groups)