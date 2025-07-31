from rest_framework import generics, permissions
from .models import Tender
from .serializers import TenderSerializer

class TenderListAPIView(generics.ListAPIView):
    queryset = Tender.objects.all().prefetch_related('entries')
    serializer_class = TenderSerializer
    permission_classes = [permissions.IsAuthenticated]