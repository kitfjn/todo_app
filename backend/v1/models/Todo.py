from datetime import datetime, timezone
from typing import Optional, TYPE_CHECKING
from uuid import UUID, uuid4

from pydantic import ValidationInfo, field_validator
from sqlmodel import Field, Relationship, SQLModel


if TYPE_CHECKING:
    from .User import User


class TodoBase(SQLModel):
    title: str = Field(index=True)
    description: Optional[str] = None
    completed: bool = Field(default=False)
    limit_date: datetime | None = Field(nullable=True)

    # 空文字を None に変換するバリデータ
    @field_validator("limit_date", mode="before")
    def empty_str_to_none(cls, v, info: ValidationInfo):
        if v == "" or v is None:
            return None
        return v


class TodoCreate(TodoBase):
    author_uuid: str
    limit_date: datetime | None = Field(nullable=True)


class TodoUpdate(TodoBase):
    title: Optional[str] = None
    description: Optional[str] = None
    completed: Optional[bool] = None
    limit_date: datetime = Field(default=None, nullable=True)


class Todo(TodoBase, table=True):
    id: Optional[UUID] = Field(default_factory=uuid4, primary_key=True)
    created_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc), nullable=False
    )
    updated_at: datetime = Field(
        default_factory=lambda: datetime.now(timezone.utc),
        nullable=False,
        sa_column_kwargs={"onupdate": lambda: datetime.now(timezone.utc)},
    )
    author_uuid: str = Field(
        foreign_key="user.uuid", nullable=False, ondelete="CASCADE"
    )
    author: "User" = Relationship(back_populates="todos")


class UserWithTodos(SQLModel):
    uuid: UUID
    username: str


class TodoRead(TodoBase):
    id: UUID
    title: str
    description: str
    completed: bool
    limit_date: datetime
    created_at: datetime
    updated_at: datetime
    author_uuid: str
    author: "UserWithTodos"


