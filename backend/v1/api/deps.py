# from typing import Generator, Annotated

# from fastapi import Depends, HTTPException, status
# from fastapi.security import OAuth2PasswordBearer
# from jose import jwt, JWTError
# from pydantic import ValidationError
# from sqlmodel import Session

# from core.config import settings
# from db.session import get_session
# from models.User import User
# from crud.user import user as crud_user


# reusable_oauth2 = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/access-token")


# def get_db(session: Annotated[Session, Depends(get_session)]) -> Generator:
#     try:
#         yield session
#     finally:
#         session.close()


# def get_current_user(
#     session: Annotated[Session, Depends(get_db)],
#     token: Annotated[str, Depends(reusable_oauth2)],
# ) -> User:
#     try:
#         payload = jwt.decode(
#             token,
#             settings.SECRET_KEY,
#             algorithms=[settings.ALGORITHM],
#         )
#         token_data = payload.get("sub")
#         if not token_data:
#             raise HTTPException(
#                 status_code=status.HTTP_403_FORBIDDEN,
#                 detail="Could not validate credentials",
#             )
#     except JWTError:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Could not validate credentials",
#         )
#     except ValidationError:
#         raise HTTPException(
#             status_code=status.HTTP_403_FORBIDDEN,
#             detail="Could not validate credentials",
#         )
#     user = crud_user.get(session, id=token_data)
#     if not user:
#         raise HTTPException(status_code=404, detail="User not found")
#     return user


# def get_current_active_user(
#     current_user: Annotated[User, Depends(get_current_user)],
# ) -> User:
#     if not current_user.is_active:
#         raise HTTPException(status_code=400, detail="Inactive user")
#     return current_user


# def get_current_active_superuser(
#     current_user: Annotated[User, Depends(get_current_user)],
# ) -> User:
#     if not current_user.is_superuser:
#         raise HTTPException(
#             status_code=400, detail="The user doesn't have enough privileges"
#         )
#     return current_user
