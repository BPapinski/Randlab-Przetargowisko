from django.db.models import DecimalField, Q, Sum, Value
from django.db.models.functions import Coalesce
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions
from rest_framework.decorators import api_view, permission_classes
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Tender, TenderEntry
from .serializers import TenderCreateSerializer, TenderSerializer, TenderEntrySerializer


class TenderListAPIView(generics.ListAPIView):
    serializer_class = TenderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [OrderingFilter]
    ordering_fields = ["created_at", "updated_at", "name", "price"]
    ordering = ["-created_at"]

    def get_queryset(self):
        qs = Tender.objects.annotate(
            price=Coalesce(Sum("entries__total_price"), Value(0, output_field=DecimalField()))
        ).prefetch_related("entries")
        params = self.request.query_params

        # filtracja po cenie
        price_from = params.get("price_from")
        price_to = params.get("price_to")
        if price_from:
            qs = qs.filter(price__gte=price_from)
        if price_to:
            qs = qs.filter(price__lte=price_to)

        # filtracja po marży
        margin_from = params.get("margin_from")
        margin_to = params.get("margin_to")
        if margin_from:
            qs = qs.filter(entries__margin__gte=margin_from)
        if margin_to:
            qs = qs.filter(entries__margin__lte=margin_to)

        # filtracja po firmie
        company = params.get("company")
        if company:
            qs = qs.filter(entries__company__iexact=company)

        # 🔍 filtracja po search (Tender.name, TenderEntry.position, TenderEntry.company)
        search = params.get("search")
        if search:
            qs = qs.filter(
                Q(name__icontains=search)
                | Q(entries__position__icontains=search)
                | Q(entries__company__icontains=search)
            )

        return qs.distinct()


class TenderCreateView(generics.CreateAPIView):
    queryset = Tender.objects.all()
    serializer_class = TenderCreateSerializer
    permission_classes = [permissions.IsAuthenticated]

class TenderEntryUpdateView(generics.UpdateAPIView):
    queryset = TenderEntry.objects.all()
    serializer_class = TenderEntrySerializer


@permission_classes([IsAuthenticated])
@api_view(["POST"])
def toggle_tender_active(request, tender_id):
    tender = get_object_or_404(Tender, id=tender_id)
    tender.is_active = not tender.is_active
    tender.save()

    return JsonResponse(
        {
            "success": True,
            "is_active": tender.is_active,
            "message": f"Przetarg '{tender.name}' został {'aktywowany' if tender.is_active else 'dezaktywowany'}.",
        },
        status=200,
    )


class CompanyListView(APIView):
    def get(self, request):
        companies = TenderEntry.objects.values_list("company", flat=True).distinct()
        return Response(companies)
