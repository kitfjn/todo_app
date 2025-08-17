import os
from typing import Any, Optional

from fastapi import Depends, HTTPException, status
import pandas as pd
from sqlmodel import Session, select

from db.session import get_session
from core.security import get_password_hash
from crud.base import CRUDBase
from models.User import User, UserCreate, UserUpdate
from models.GenericSchema import TokenData
from core.config import settings

# auth
from jose import jwt, JWTError

# uuid
import uuid as uuid_pkg


def create_user(*, session: Session, user_create: UserCreate) -> User:
    db_obj = User.model_validate(
        user_create,
        update={
            "hashed_password": get_password_hash(user_create.password),
        },
    )
    session.add(db_obj)
    session.commit()
    session.refresh(db_obj)
    return db_obj


def update_user(*, session: Session, db_user: User, user_in: UserUpdate) -> User:

    user_data = user_in.model_dump(exclude_unset=True)

    extra_data = {}
    if "password" in user_data:
        plain_password = user_data.pop("password")
        hashed_password = get_password_hash(plain_password)
        extra_data["hashed_password"] = hashed_password

    # 更新データの振り分け
    for key, value in user_data.items():
        setattr(db_user, key, value)

    session.add(db_user)
    session.commit()
    session.refresh(db_user)
    return db_user


def get_user_by_uuid(session, uuid: str):
    return session.query(User).filter(User.uuid == uuid).first()


def get_user_by_email(*, session: Session, email: str) -> User | None:
    statement = select(User).where(User.email == email)
    session_user = session.exec(statement).first()
    return session_user


def authenticate(*, session: Session, email: str, password: str) -> User | None:
    db_user = get_user_by_email(session=session, email=email)
    if not db_user:
        return None
    if not verify_password(password, db_user.hashed_password):
        return None
    return db_user


def get_current_user_from_token(session, token: str, token_type: str):
    payload = jwt.decode(
        token, os.environ["SECRET_KEY"], algorithms=[os.environ["ALGORITHM"]]
    )

    current_user = get_user_by_uuid(session, payload["uuid"])

    if payload["token_type"] != token_type:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="token_type does not match.",
        )
    if token_type == "refresh_token" and current_user.refresh_token != token:
        # print(current_user.refresh_token, "¥n", token)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="refresh_token does not match.",
        )
    return current_user


def get_current_user(
    token: str = Depends(settings.oauth2_schema),
    session: Session = Depends(get_session),
):
    # print(token)
    print(get_current_user_from_token(session, token, "access_token"))
    return get_current_user_from_token(session, token, "access_token")


def get_user_from_refresh_token(
    token: str = Depends(settings.oauth2_schema),
    session: Session = Depends(get_session),
):
    return get_current_user_from_token(session, token, "refresh_token")


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
        token_data = TokenData(uuid=uuid)
        return token_data
    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token."
        )


def verify_password(password, hashed_password):
    return settings.pwd_context.verify(password, hashed_password)


def check_user(session, user):
    checked_user = session.exec(
        select(User)
        .where(User.username == user.username)
        .where(User.email == user.email)
    ).first()
    return checked_user


"""一括登録用のメソット"""


def users_register(session, file_path: str):

    failed_users = []

    if file_path.endswith(".csv"):
        df = pd.read_csv(file_path)
    elif file_path.endswith(".xlsx"):
        df = pd.read_excel(file_path)
    else:
        raise ValueError(
            "Invalid file format. Please provide a CSV or EXCEL file.",
        )

    for index, row in df.iterrows():
        # A: username, B: email, C:password, D:is_active, E: is_superuser
        username = row["username"]
        email = row["email"]
        password = row["password"]
        is_active = row["is_active"]
        is_superuser = row["is_superuser"]

        if pd.isna(username) or pd.isna(email) or pd.isna(password):
            failed_users.append(
                {
                    "username": username,
                    "error": "Username, email, password are required fired.",
                }
            )
            continue

        try:
            hashed_password = get_password_hash(password)

            # 既存ユーザーの検索
            existing_user = (
                session.query(User)
                .filter((User.username == username) | (User.email == email))
                .first()
            )

            if existing_user:
                # ユーザーが存在する場合、情報を更新（空欄の場合はその項目をスキップ）
                if not pd.isna(username):
                    existing_user.username = username
                if not pd.isna(email):
                    existing_user.email = email
                if not pd.isna(password):
                    existing_user.hashed_password = hashed_password
                if not pd.isna(is_active):
                    existing_user.is_active = is_active
                if not pd.isna(is_superuser):
                    existing_user.is_superuser = is_superuser

            else:
                # ユーザーが存在しない場合、新規作成
                new_user = User(
                    uuid=str(uuid_pkg.uuid4()),
                    username=username,
                    email=email,
                    hashed_password=hashed_password,
                    is_active=is_active,
                    is_superuser=is_superuser,
                )

                session.add(new_user)

        except Exception as e:
            failed_users.append({"username": username, "error": str(e)})

    session.commit()

    return failed_users


def delete_user(session, uuid):
    user = get_user_by_uuid(session, uuid)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found."
        )

    session.delete(user)
    session.commit()
    return {"message": "User was deleted."}
