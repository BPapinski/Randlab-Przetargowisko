from django.db.models import DecimalField, Q, Sum, Value
from django.db.models.functions import Coalesce
from django.http import JsonResponse
from django.shortcuts import get_object_or_404
from rest_framework import generics, permissions, status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.filters import OrderingFilter
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView

from .models import Tender, TenderEntry
from .serializers import (
    TenderCreateSerializer,
    TenderEntrySerializer,
    TenderSerializer,
)


class TenderListAPIView(generics.ListAPIView):
    serializer_class = TenderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [OrderingFilter]
    ordering_fields = ["created_at", "updated_at", "name", "price"]
    ordering = ["-created_at"]

    def get_queryset(self):
        qs = Tender.objects.annotate(
            price=Coalesce(
                Sum("entries__total_price"),
                Value(0, output_field=DecimalField()),
            )
        ).prefetch_related("entries")

        qs = qs.filter(is_active=True)

        params = self.request.query_params

        client = params.get("client")
        if client:
            qs = qs.filter(client__iexact=client)

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

        status = self.request.query_params.get("status")

        if status in dict(Tender.STATUS_CHOICES).keys():
            qs = qs.filter(status=status)

        return qs.distinct()


class TenderCreateView(generics.CreateAPIView):
    queryset = Tender.objects.all()
    serializer_class = TenderCreateSerializer
    permission_classes = [permissions.IsAuthenticated]


class TenderEntryRetrieveUpdateDestroyView(
    generics.RetrieveUpdateDestroyAPIView
):
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
        companies = TenderEntry.objects.values_list(
            "company", flat=True
        ).distinct()
        return Response(companies)


class UniqueClientListView(APIView):
    def get(self, request):
        clients = Tender.objects.values_list("client", flat=True).distinct()
        return Response(clients)


@api_view(["POST"])
def add_tender_entry(request, tender_id):
    """
    Tworzy nowe TenderEntry przypisane do konkretnego Tender.
    """
    tender = get_object_or_404(Tender, id=tender_id)

    serializer = TenderEntrySerializer(data=request.data)
    if serializer.is_valid():
        serializer.save(tender=tender)  # tender przekazujemy ręcznie
        return Response(serializer.data, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
