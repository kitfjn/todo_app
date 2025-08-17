from datetime import timedelta
from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session

from crud.user import authenticate, get_current_user, get_user_from_refresh_token
from db.session import get_session
from core.config import settings
from core.security import (
    create_tokens,
    verify_token,
)
from models.User import User, UserLogin, UserPublic
from models.GenericSchema import Token

router = APIRouter()


@router.post("/login/access_token")
def login_access_token(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()],
    session: Session = Depends(get_session),
) -> Token:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = authenticate(
        session=session, email=form_data.username, password=form_data.password
    )
    if user is None:
        print("User not foumd.")
    else:
        print(f"user_uuid: {user.uuid}")  # ok

    if not user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect email or password",
        )
    elif not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST, detail="Inactive user"
        )
    token = create_tokens(user.uuid)
    user.refresh_token = token["refresh_token"]
    session.add(user)
    session.commit()
    session.refresh(user)
    return token


@router.post("/auth_token", response_model=Token)
def login(login_user_info: UserLogin, session: Session = Depends(get_session)):
    """
    - json形式でPOSTする場合のAPI
    - OAuth2PasswordRequestFormは使用していません
    """
    user = authenticate(
        session=session,
        email=login_user_info.email,
        password=login_user_info.password,
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password.",
        )

    if user is None:
        # 例外を発生させてユーザーが存在しないことを伝える
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found."
        )

    token = create_tokens(user.uuid)
    user.refresh_token = token["refresh_token"]
    session.add(user)
    session.commit()
    session.refresh(user)
    return token


@router.get("/refresh_token", response_model=Token)
def refresh_token(
    session: Session = Depends(get_session),
    current_user: User = Depends(get_user_from_refresh_token),
):
    token = create_tokens(current_user.uuid)
    current_user.refresh_token = token("refresh_token")
    session.add(current_user)
    session.commit()
    session.refresh(current_user)
    return token


@router.get("/me", response_model=UserPublic)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/verify_token")
async def verify_token_route(token: str = Depends(settings.oauth2_schema)):
    token_data = verify_token(token)
    return {
        "isAuthenticated": True,
        "uuid": token_data.uuid,
    }


# @router.post("/change_password", status_code=status.HTTP_200_OK)
# def change_password(
#     request: PasswordChangeRequest,
#     current_user: User = Depends(get_current_user),
#     session: Session = Depends(get_session),
# ):
#     return verify_password(current_user, session)
