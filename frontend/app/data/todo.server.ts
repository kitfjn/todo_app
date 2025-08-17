import type { Todo } from "~/type/todo";

export async function getAllTodo(
  access_token: string | undefined
): Promise<Todo[] | undefined> {
  try {
    const res = await fetch(`${process.env.API_ROOT_URL}/api/v1/todos`, {
      method: "GET",
      headers: {
        accept: "application/json",
        // Authorization: `Bearer ${token?.access_token}`
      },
    });

    if (res.ok) {
      return res.json();
    } else if (res.status === 401) {
      throw new Error("Unauthorized");
    } else {
      throw new Error("unkown errors occured.");
    }
  } catch (error: unknown) {
    throw new Error(`${error}`);
  }
}

export async function getAllTodoByAuthorUuid(
  access_token: string | undefined,
  author_uuid: string | undefined
): Promise<Todo[] | undefined> {
  try {
    const res = await fetch(
      `${process.env.API_ROOT_URL}/api/v1/todos/${author_uuid}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          // Authorization: `Bearer ${token?.access_token}`
        },
      }
    );

    if (res.ok) {
      return await res.json();
    } else if (res.status === 401) {
      throw new Error("Unauthorized");
    } else {
      throw new Error("unkown errors occured.");
    }
  } catch (error: unknown) {
    throw new Error(`${error}`);
  }
}

export async function getTodoById(
  access_token: string | undefined,
  todo_id: string | undefined
): Promise<Todo | undefined> {
  try {
    const res = await fetch(
      `${process.env.API_ROOT_URL}/api/v1/todo/${todo_id}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          // Authorization: `Bearer ${token?.access_token}`
        },
      }
    );

    if (res.ok) {
      return await res.json();
    } else if (res.status === 401) {
      throw new Error("Unauthorized");
    } else {
      throw new Error("unkown errors occured.");
    }
  } catch (error: unknown) {
    throw new Error(`${error}`);
  }
}

export async function updateTodo(
  request: Request,
  access_token: string | undefined,
  todo_id: string | undefined,
  title: string | undefined,
  description: string | undefined,
  completed: boolean | undefined,
  limit_date: Date | undefined
): Promise<Todo | undefined> {
  try {
    const res = await fetch(
      `${process.env.API_ROOT_URL}/api/v1/todos/edit/${todo_id}`,
      {
        method: "PUT",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${access_token}`,
        },
        body: JSON.stringify({
          title,
          description,
          completed,
          limit_date,
        }),
      }
    );

    if (res.ok) {
      return res.json();
    } else if (res.status === 401) {
      throw new Error("Unauthorized");
    } else {
      throw new Error("unkown errors occured.");
    }
  } catch (error: unknown) {
    throw new Error(`${error}`);
  }
}
