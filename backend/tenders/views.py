from rest_framework import generics, permissions
from .models import Tender
from .serializers import TenderSerializer, TenderCreateSerializer

from django.http import JsonResponse

from django.shortcuts import get_object_or_404

from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated

from rest_framework.filters import OrderingFilter
from django.db.models import Sum, F

class TenderListAPIView(generics.ListAPIView):
    queryset = Tender.objects.all().prefetch_related('entries')
    serializer_class = TenderSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [OrderingFilter]
    ordering_fields = ['created_at', 'updated_at', 'name', 'price']  # ← zezwalasz na sortowanie
    ordering = ['-created_at']  # domyślne

    def get_queryset(self):
        return Tender.objects.annotate(
            price=Sum('entries__total_price')  # ← alias: 'price'
        ).prefetch_related('entries')

class TenderCreateView(generics.CreateAPIView):
    queryset = Tender.objects.all()
    serializer_class = TenderCreateSerializer
    permission_classes = [permissions.IsAuthenticated]


@permission_classes([IsAuthenticated])
@api_view(['POST'])
def toggle_tender_active(request, tender_id):
    tender = get_object_or_404(Tender, id=tender_id)
    tender.is_active = not tender.is_active
    tender.save()
    
    return JsonResponse({
        'success': True,
        'is_active': tender.is_active,
        'message': f"Przetarg '{tender.name}' został {'aktywowany' if tender.is_active else 'dezaktywowany'}."
    }, status=200)