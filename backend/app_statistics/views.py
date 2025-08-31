from django.db.models import Avg, FloatField, Sum
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from tenders.models import Tender, TenderEntry


class TenderStatsAPIView(APIView):
    def get(self, request):
        total_tenders = Tender.objects.count()
        won_tenders = Tender.objects.filter(status="won").count()
        lost_tenders = Tender.objects.filter(status="lost").count()
        unresolved_tenders = Tender.objects.filter(status="unresolved").count()

        avg_tender_value = Tender.objects.annotate(
            total_value=Sum("entries__total_price")
        ).aggregate(avg_value=Avg("total_value", output_field=FloatField()))[
            "avg_value"
        ]
        avg_tender_value = (
            round(avg_tender_value, 2) if avg_tender_value else 0
        )

        unique_developers = (
            TenderEntry.objects.values("company").distinct().count()
        )

        unique_clients = Tender.objects.values("client").distinct().count()

        data = {
            "total_tenders": total_tenders,
            "won_tenders": won_tenders,
            "lost_tenders": lost_tenders,
            "unresolved_tenders": unresolved_tenders,
            "avg_tender_value": float(avg_tender_value),
            "unique_developers": unique_developers,
            "unique_clients": unique_clients,
        }

        return Response(data, status=status.HTTP_200_OK)
