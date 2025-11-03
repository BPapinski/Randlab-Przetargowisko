from uuid import UUID

from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken
from rest_framework_simplejwt.models import TokenUser

from users.models import User


class CustomJWTAuthentication(JWTAuthentication):
    def get_user(self, validated_token):
        sub = validated_token.get("sub")
        if not sub:
            raise InvalidToken("Token missing 'sub' claim")

        try:
            UUID(sub)
        except ValueError:
            pass

        return TokenUser(validated_token)


def create_in_memory_user_from_token(payload):
    email = payload.get("email")
    role = payload.get("role")

    if not email:
        return None

    user = User(email=email)

    user.is_active = True
    if role == "ADMIN" or role == "SUPER_ADMIN":
        user.is_staff = True
    else:
        user.is_staff = False

    return user
