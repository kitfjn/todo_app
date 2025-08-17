from typing import Optional, Type
from uuid import UUID

from sqlmodel import Session, select
from sqlalchemy.orm import selectinload, joinedload

from models.Todo import Todo, TodoCreate, TodoRead, TodoUpdate


def create_todo(db: Session, todo: TodoCreate) -> Todo:
    db_todo = Todo.model_validate(todo)
    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo


def get_todo(db: Session, todo_id: UUID) -> Optional[Todo]:
    return db.get(Todo, todo_id)


def get_todos(db: Session, skip: int = 0, limit: int = 100) -> list[TodoRead]:
    return db.exec(
        select(Todo).options(selectinload(Todo.author)).offset(skip).limit(limit)
    ).all()


def get_todos_by_author_uuid(
    *,  # この引数以降はキーワード引数としてのみ受け付ける
    db: Session,
    author_uuid: str,
    skip: int = 0,
    limit: int = 100
) -> list[TodoRead]:
    """
    指定された author_uuid に紐づくTodoアイテムを取得します。
    """

    statement = (
        select(Todo)
        .where(Todo.author_uuid == author_uuid)
        .options(joinedload(Todo.author))
        .offset(skip)
        .limit(limit)
    )
    return db.exec(statement).all()


def update_todo(db: Session, todo_id: str, todo_update: TodoUpdate) -> Optional[Todo]:
    db_todo = db.get(Todo, todo_id)
    if not db_todo:
        return None

    # Update fields from todo_update
    for key, value in todo_update.model_dump(exclude_unset=True).items():
        setattr(db_todo, key, value)

    db.add(db_todo)
    db.commit()
    db.refresh(db_todo)
    return db_todo


def delete_todo(db: Session, todo_id: str) -> Optional[Todo]:
    todo = db.get(Todo, todo_id)
    if not todo:
        return None
    db.delete(todo)
    db.commit()
    return todo
