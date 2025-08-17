import uuid

from pydantic import EmailStr, BaseModel
from sqlmodel import Field, SQLModel, Relationship
from typing import List, TYPE_CHECKING
from datetime import datetime, timezone

if TYPE_CHECKING:
    from .Todo import Todo


class UserBase(SQLModel):
    username: str | None = Field(
        default=None,
        unique=True,
        max_length=255,
    )
    email: EmailStr = Field(
        unique=True,
        index=True,
        max_length=255,
    )
    is_active: bool = True
    is_stuff: bool = True
    is_superuser: bool = False


class UserLogin(SQLModel):
    email: str
    password: str


class UserCreate(SQLModel):
    username: str
    email: EmailStr
    password: str = Field(min_length=8, max_length=40)


class UserRegister(SQLModel):
    email: EmailStr = Field(max_length=255)
    password: str = Field(min_length=8, max_length=40)
    username: str | None = Field(default=None, max_length=255)


class UserUpdate(UserBase):
    email: EmailStr = Field(default=None, max_length=255)
    password: str | None = Field(default=None, min_length=8, max_length=40)


class UpdatePassword(SQLModel):
    current_password: str = Field(min_length=8, max_length=40)
    new_password: str = Field(min_length=8, max_length=40)


class User(UserBase, table=True):
    # id: int | None = Field(default=None, primary_key=True)
    uuid: str = Field(
        default_factory=lambda: str(uuid.uuid4()),
        nullable=False,
        unique=True,
        primary_key=True,
    )
    hashed_password: str = Field(nullable=False)
    created_at: datetime = Field(
        default=datetime.now(tz=timezone.utc),
        nullable=False,
    )
    updated_at: datetime = Field(
        default_factory=datetime.now,
        nullable=False,
        sa_column_kwargs={"onupdate": datetime.now(tz=timezone.utc)},
    )
    refresh_token: str | None = Field(
        nullable=True,
    )
    todos: List["Todo"] = Relationship(back_populates="author", cascade_delete=True)
    # tags: List["Tag"] = Relationship(
    #     back_populates="author",
    # )
    # fileData: List["FileData"] = Relationship(
    #     back_populates="author",
    # )
    # imageData: List["ImageData"] = Relationship(
    #     back_populates="author",
    # )


class UserPublic(UserBase):
    uuid: str
    created_at: datetime
    updated_at: datetime


class UsersPublic(SQLModel):
    data: list[UserPublic]
    count: int


class PasswordChangeRequest(BaseModel):
    current_password: str = Field(..., min_length=8, max_length=128)
    new_password: str = Field(..., min_length=8, max_length=128)

