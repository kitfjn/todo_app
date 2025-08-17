from datetime import datetime, timedelta, timezone
import os
from typing import Any

from fastapi import HTTPException, status

from jose import JWTError, jwt
from passlib.context import CryptContext

from core.config import settings

from models.GenericSchema import Token

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

ALGORITHM = settings.ALGORITHM


# 別のアプリからコピペ
def create_tokens(uuid: str):
    access_token_payload = {
        "token_type": "access_token",
        "exp": datetime.now(timezone.utc)
        + timedelta(days=int(os.environ["ACCESS_TOKEN_EXPIRE_DAYS"])),
        "uuid": uuid,
    }

    refresh_token_payload = {
        "token_type": "refresh_token",
        "exp": datetime.now(timezone.utc)
        + timedelta(days=int(os.environ["REFRESH_TOKEN_EXPIRE_DAYS"])),
        "uuid": uuid,
    }

    # create token
    access_token = jwt.encode(
        access_token_payload,
        os.environ["SECRET_KEY"],
        algorithm=os.environ["ALGORITHM"],
    )

    refresh_token = jwt.encode(
        refresh_token_payload,
        os.environ["SECRET_KEY"],
        algorithm=os.environ["ALGORITHM"],
    )

    return {
        "access_token": access_token,
        "refresh_token": refresh_token,
        "token_type": "bearer",
    }


def verify_token(token: str):
    try:
        payload = jwt.decode(
            token,
            os.environ["SECRET_KEY"],
            algorithms=[
                os.environ["ALGORITHM"],
            ],
        )
        uuid: str = payload.get("uuid")
        if uuid is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Unauthorized.",
            )
        token_data = Token(uuid=uuid)
        return token_data
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token."
        )


def change_password(request, current_user, session):
    """パスワードを変更する処理"""
    if not settings.pwd_context.verify(
        request.current_password, current_user.hashed_password
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="現在のパスワードが正しくありません",
        )

    # 新しいパスワードをハッシュ化
    hasehd_new_password = settings.pwd_context.hash(request.new_password)

    # パスワードを更新
    current_user.hashed_password = hasehd_new_password
    session.add(current_user)
    session.commit()

    return {"message": "パスワードが正常に更新されました"}


def get_password_hash(password: str) -> str:
    return settings.pwd_context.hash(password)
