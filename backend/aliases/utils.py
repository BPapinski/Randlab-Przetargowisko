from tenders.models import TenderEntry

from .models import AliasGroup


def get_tender_entries_for_alias_group(alias_group_name):
    try:
        group = AliasGroup.objects.get(name=alias_group_name)
        print(f"Alias group found: {group.name}")  # Debugging line
    except AliasGroup.DoesNotExist:
        return TenderEntry.objects.none()

    aliases = list(group.aliases.values_list("alias_name", flat=True))
    print(f"Aliases found for group '{group.name}': {aliases}")  # Debugging line
    entries = TenderEntry.objects.filter(position__in=[group.name] + aliases)

    print(f"Tender entries found: {entries.first()}")
    return entries
