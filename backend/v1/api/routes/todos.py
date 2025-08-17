from typing import List
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session

from crud.todo import (
    create_todo,
    delete_todo,
    get_todo,
    get_todos,
    update_todo,
    get_todos_by_author_uuid,
)
from db.session import get_session
from models.Todo import Todo, TodoCreate, TodoRead, TodoUpdate

router = APIRouter()


@router.post("/todos", response_model=Todo)
def create_new_todo(*, db: Session = Depends(get_session), todo: TodoCreate):
    return create_todo(db=db, todo=todo)


@router.get("/todos", response_model=List[TodoRead])
def read_todos(skip: int = 0, limit: int = 100, db: Session = Depends(get_session)):
    return get_todos(db=db, skip=skip, limit=limit)


@router.get("/todos/{author_uuid}", response_model=List[TodoRead])
def read_todos_by_author_uuid(
    author_uuid: str,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_session),
):
    return get_todos_by_author_uuid(
        db=db, skip=skip, limit=limit, author_uuid=author_uuid
    )


@router.get("/todo/{todo_id}", response_model=TodoRead)
def read_todo(*, todo_id: str, db: Session = Depends(get_session)):
    try:
        todo_id = UUID(todo_id)
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid UUID format.",
        )

    todo = get_todo(db=db, todo_id=todo_id)
    if not todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return todo


@router.put("/todos/edit/{todo_id}", response_model=Todo)
def update_existing_todo(
    *, todo_id: UUID, todo: TodoUpdate, db: Session = Depends(get_session)
):
    updated_todo = update_todo(db=db, todo_id=todo_id, todo_update=todo)
    if not updated_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return updated_todo


@router.delete("/todos/delete/{todo_id}", response_model=Todo)
def delete_existing_todo(*, todo_id: UUID, db: Session = Depends(get_session)):
    deleted_todo = delete_todo(db=db, todo_id=todo_id)
    if not deleted_todo:
        raise HTTPException(status_code=404, detail="Todo not found")
    return deleted_todo
