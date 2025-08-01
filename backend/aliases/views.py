from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .utils import get_tender_entries_for_alias_group
from tenders.serializers import TenderEntrySerializer

@api_view(['GET'])
def tender_entries_by_standard_position(request):
    position = request.GET.get('position')
    print(f"Received position: {position}")  # Debugging line
    if not position:
        return Response({'error': 'Missing position parameter.'}, status=status.HTTP_400_BAD_REQUEST)

    entries = get_tender_entries_for_alias_group(position)
    print(f"Found {entries.count()} entries for position: {position}")
    serializer = TenderEntrySerializer(entries, many=True)
    return Response(serializer.data)
