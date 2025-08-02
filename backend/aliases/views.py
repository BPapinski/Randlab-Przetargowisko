from rest_framework.decorators import api_view
# W pliku views.py
from rest_framework import generics
from rest_framework.response import Response
from rest_framework import status
from .utils import get_tender_entries_for_alias_group
from tenders.serializers import TenderEntrySerializer
from .models import AliasGroup, Alias
from tenders.models import TenderEntry
from django.db.models import F
from .serializers import AliasGroupSerializer, AliasSerializer, TenderEntrySerializer
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

@api_view(['GET'])
def AliasList(request):
    if request.method == 'GET':
        aliases = Alias.objects.all()
        serializer = AliasSerializer(aliases, many=True)
        return Response(serializer.data, status=status.HTTP_200_OK)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class TenderEntryList(generics.ListAPIView):
    serializer_class = TenderEntrySerializer
    def get_queryset(self):
        position_name = self.request.query_params.get('position', None)
        if position_name == "None":
            # Szukaj pozycji, które nie są aliasami
            alias_names = Alias.objects.values_list('alias_name', flat=True)
            return TenderEntry.objects.exclude(position__in=alias_names)
        elif position_name:
            # Szukaj aliasów i ich pozycji
            group = AliasGroup.objects.filter(name=position_name).first()
            if group:
                aliases = group.aliases.values_list('alias_name', flat=True)
                return TenderEntry.objects.filter(position__in=aliases)
        return TenderEntry.objects.none()
    
class AliasGroupList(generics.ListCreateAPIView):
    """
    Lista i tworzenie grup aliasów.
    Endpoint: /api/aliases/groups/
    """
    queryset = AliasGroup.objects.all()
    serializer_class = AliasGroupSerializer

class AliasCreate(generics.CreateAPIView):
    """
    Tworzenie nowego aliasu.
    Endpoint: /api/aliases/aliases/
    """
    queryset = Alias.objects.all()
    serializer_class = AliasSerializer

class TenderEntryList(generics.ListAPIView):
    """
    Lista wpisów przetargów, z możliwością filtrowania po nazwie grupy aliasów.
    Obsługuje również pozycje 'nieznane'.
    Endpoint: /api/aliases/tender-entries/
    """
    serializer_class = TenderEntrySerializer

    def get_queryset(self):
        position_param = self.request.query_params.get('position', None)
        
        all_alias_names = Alias.objects.values_list('alias_name', flat=True)

        if position_param == "None":
            return TenderEntry.objects.exclude(position__in=all_alias_names)
        elif position_param:
            try:
                alias_group = AliasGroup.objects.get(name=position_param)
                aliases_in_group = alias_group.aliases.values_list('alias_name', flat=True)
                return TenderEntry.objects.filter(position__in=aliases_in_group)
            except AliasGroup.DoesNotExist:
                return TenderEntry.objects.none()
        
        return TenderEntry.objects.none()
    
@api_view(['POST'])
def create_alias_view(request):
    alias_group_name = request.data.get('alias_group_name')
    entry_position = request.data.get('entry_position')

    if not alias_group_name or not entry_position:
        return Response(
            {"error": "Brak wymaganych danych: 'alias_group_name' lub 'entry_position'."},
            status=status.HTTP_400_BAD_REQUEST
        )

    # Sprawdzenie, czy AliasGroup o podanej nazwie już istnieje
    try:
        alias_group = AliasGroup.objects.get(name=alias_group_name)
    except AliasGroup.DoesNotExist:
        # Jeśli nie istnieje, utwórz nową grupę
        alias_group = AliasGroup.objects.create(name=alias_group_name)

    # Sprawdzenie, czy alias o danej nazwie już istnieje
    if Alias.objects.filter(alias_name=entry_position).exists():
        return Response(
            {"error": f"Alias o nazwie '{entry_position}' już istnieje."},
            status=status.HTTP_409_CONFLICT
        )

    # Utworzenie nowego aliasu i przypisanie go do grupy
    alias = Alias.objects.create(
        alias_group=alias_group,
        alias_name=entry_position
    )

    return Response(
        {"success": f"Alias '{alias.alias_name}' został przypisany do grupy '{alias_group.name}'.",
         "alias_id": alias.id,
         "alias_group_id": alias_group.id},
        status=status.HTTP_201_CREATED
    )