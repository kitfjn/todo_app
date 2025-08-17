import shutil
from typing import Annotated, List

from fastapi import APIRouter, Depends, File, HTTPException, UploadFile, status
from sqlmodel import Session, select

from core.security import create_tokens, get_password_hash
from crud.user import (
    check_user,
    delete_user,
    get_user_by_uuid,
    update_user,
    users_register,
)
from db.session import get_session
from models.User import (
    User,
    UserCreate,
    UserPublic,
    UserUpdate,
)
from models.GenericSchema import Token

router = APIRouter()


# sign up
@router.post("/signup", response_model=Token)
def create_user(userIn: UserCreate, session: Session = Depends(get_session)):
    user = check_user(session, userIn)

    if user:
        raise HTTPException(
            status_code=409,
            detail="Username or email has been used. Please change to other username or email.",
        )

    else:
        new_user = User(
            username=userIn.username,
            email=userIn.email,
            is_active=True,
            is_superuser=False,
            hashed_password=get_password_hash(userIn.password),
            refresh_token="",
        )

        session.add(new_user)
        session.commit()
        session.refresh(new_user)

        token = create_tokens(new_user.uuid)
        return token


@router.post("/upload_users")
def upload_users(
    session: Session = Depends(get_session),
    file: UploadFile = File(...),
):
    file_location = f"temp_{file.filename}"  # 一時的にファイルを保存

    with open(file_location, "wb+") as file_object:
        shutil.copyfileobj(file.file, file_object)

    # 登録処理
    result = users_register(session, file_location)

    if result:
        return {
            "message": "Some users failed to register. Please check each item.",
            "failed_users": result,
        }
    else:
        return {"message": "Users registered successfully."}


@router.get("/all_user", response_model=List[UserPublic])
def read_all_user(session: Session = Depends(get_session)):
    all_user = session.exec(select(User)).all()
    return all_user


@router.get("/{user_uuid}", response_model=UserPublic)
def get_user(user_uuid: str, session: Session = Depends(get_session)):
    user = get_user_by_uuid(session, user_uuid)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found."
        )

    return user


@router.patch("/edit_user/{user_uuid}", response_model=UserPublic)
def edit_user(
    *,
    session: Session = Depends(get_session),
    user_uuid: str,
    user: UserUpdate,
):
    db_user = session.exec(select(User).where(User.uuid == user_uuid)).first()

    print(db_user)
    if not db_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found."
        )
    return update_user(session=session, db_user=db_user, user_in=user)


@router.delete("/delete_user/{user_uuid}")
def user_delete(*, session: Session = Depends(get_session), user_uuid: str):
    user = get_user_by_uuid(session, user_uuid)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="User not found."
        )
    return delete_user(session, user_uuid)
