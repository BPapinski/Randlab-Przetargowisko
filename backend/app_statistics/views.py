from django.db.models import Avg, FloatField, Sum
from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView

from tenders.models import Tender, TenderEntry


class TenderStatsAPIView(APIView):
    def get(self, request):
        # ✅ tylko aktywne przetargi
        active_tenders = Tender.objects.filter(is_active=True)

        total_tenders = active_tenders.count()
        won_tenders = active_tenders.filter(status="won").count()
        lost_tenders = active_tenders.filter(status="lost").count()
        unresolved_tenders = active_tenders.filter(status="unresolved").count()

        unique_developer_companies = (
            TenderEntry.objects.filter(tender__is_active=True)
            .values("company")
            .distinct()
            .count()
        )

        avg_tender_value = active_tenders.annotate(
            total_value=Sum("entries__total_price")
        ).aggregate(avg_value=Avg("total_value", output_field=FloatField()))[
            "avg_value"
        ]
        avg_tender_value = (
            round(avg_tender_value, 2) if avg_tender_value else 0
        )

        unique_developers = (
            TenderEntry.objects.filter(tender__is_active=True)
            .values("company")
            .distinct()
            .count()
        )

        unique_clients = active_tenders.values("client").distinct().count()

        data = {
            "total_tenders": total_tenders,
            "won_tenders": won_tenders,
            "lost_tenders": lost_tenders,
            "unresolved_tenders": unresolved_tenders,
            "avg_tender_value": float(avg_tender_value),
            "unique_developers": unique_developers,
            "unique_clients": unique_clients,
            "unique_developer_companies": unique_developer_companies,
        }

        return Response(data, status=status.HTTP_200_OK)
