from rest_framework import generics, permissions
from .models import Tender
from .serializers import TenderSerializer, TenderCreateSerializer

class TenderListAPIView(generics.ListAPIView):
    queryset = Tender.objects.all().prefetch_related('entries')
    serializer_class = TenderSerializer
    permission_classes = [permissions.IsAuthenticated]

class TenderCreateView(generics.CreateAPIView):
    queryset = Tender.objects.all()
    serializer_class = TenderCreateSerializer
    permission_classes = [permissions.IsAuthenticated]