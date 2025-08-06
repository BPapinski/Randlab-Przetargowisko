from rest_framework import status
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken


class LogoutView(APIView):
    def post(self, request):
        try:
            refresh_token = request.data["refresh_token"]
            token = RefreshToken(refresh_token)
            token.blacklist()  # Dodaje token do blacklisty

            return Response(status=status.HTTP_205_RESET_CONTENT)
        except KeyError:
            return Response(
                {"detail": "Brak tokena odświeżającego."},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except Exception as e:
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
