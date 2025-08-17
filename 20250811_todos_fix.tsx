import React, { useState } from "react";
import {
  useLoaderData,
  Form,
  useFetcher,
  redirect,
  useSearchParams,
} from "react-router";
import { format } from "date-fns";
import { ja } from "date-fns/locale";
import { getTokenFromSession, requireAccountSession } from "~/data/auth.server";
import type { Route } from "./+types/todos";
import { getAllTodo } from "~/data/todo.server";
import type { User } from "~/type/auth";

interface Todo {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  created_at: string;
  updated_at: string;
}

const API_BASE_URL = "http://localhost:8000/api/v1"; // Assuming backend runs on this URL

export async function loader({ request }: Route.LoaderArgs) {
  const loginUser = await requireAccountSession(request);
  const token = await getTokenFromSession(request);

  // login要件なし
  try {
    const todos = await getAllTodo(token?.access_token);
    return { todos, loginUser };
  } catch (error: unknown) {
    console.log("Failed to fetch todos.", error);
    return { todos: [] };
  }
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const _action = formData.get("_action");
  const authToken = localStorage.getItem("authToken");

  if (!authToken) {
    return redirect("/login");
  }

  try {
    switch (_action) {
      case "add": {
        const title = formData.get("title");
        const description = formData.get("description");
        const response = await fetch(`${API_BASE_URL}/todos`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ title, description }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return redirect("/"); // Redirect to revalidate loader data
      }
      case "toggle": {
        const id = formData.get("id");
        const completed = formData.get("completed") === "true";
        const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ completed: !completed }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return redirect("/"); // Redirect to revalidate loader data
      }
      case "delete": {
        const id = formData.get("id");
        const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return redirect("/"); // Redirect to revalidate loader data
      }
      case "edit": {
        const id = formData.get("id");
        const title = formData.get("title");
        const description = formData.get("description");
        const completed = formData.get("completed") === "true";

        const response = await fetch(`${API_BASE_URL}/todos/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ title, description, completed }),
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return redirect("/"); // Redirect to revalidate loader data
      }
      default:
        throw new Error("Invalid action");
    }
  } catch (error) {
    console.error("Error in action:", error);
    return null; // Or return an error response
  }
}

export default function Todos({
  loaderData,
}: {
  loaderData: { todos: Todo[]; loginUser: User };
}) {
  const { todos, loginUser } = loaderData;
  const [newTodoTitle, setNewTodoTitle] = useState("");
  const [newTodoDescription, setNewTodoDescription] = useState("");
  const [searchParams, setSearchParams] = useSearchParams();
  const fetcher = useFetcher();
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);

  const query = searchParams.get("query") || "";

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = event.target.value;
    setSearchParams(newQuery ? { query: newQuery } : {});
  };

  const filteredTodos = todos.filter(
    (todo) =>
      todo.title.toLowerCase().includes(query.toLowerCase()) ||
      (todo.description &&
        todo.description.toLowerCase().includes(query.toLowerCase()))
  );

  const handleEditClick = (todoId: string) => {
    setEditingTodoId(todoId);
  };

  const handleCancelEdit = () => {
    setEditingTodoId(null);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 text-center">
        My Todo List
      </h1>

      <div className="mb-6">
        <label
          htmlFor="search"
          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
        >
          Filter Todos
        </label>
        <input
          type="text"
          id="search"
          placeholder="Search by title or description..."
          value={query}
          onChange={handleSearchChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-gray-700 dark:text-white"
        />
      </div>

      <Form
        method="post"
        className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8"
      >
        <input type="hidden" name="_action" value="add" />
        <div className="mb-4">
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            name="title"
            placeholder="Add a new todo"
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-gray-700 dark:text-white"
            required
          />
        </div>
        <div className="mb-4">
          <label
            htmlFor="description"
            className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
          >
            Description (Optional)
          </label>
          <textarea
            id="description"
            name="description"
            placeholder="Description for the todo"
            value={newTodoDescription}
            onChange={(e) => setNewTodoDescription(e.target.value)}
            rows={3}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-gray-700 dark:text-white"
          />
        </div>
        <button
          type="submit"
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          Add Todo
        </button>
      </Form>

      <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
        {filteredTodos.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400">
            No todos yet. Add one above!
          </p>
        ) : (
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredTodos.map((todo) => (
              <li
                key={todo.id}
                className="py-4 flex items-center justify-between"
              >
                <div className="flex-1 min-w-0 mr-4">
                  {editingTodoId === todo.id ? (
                    <fetcher.Form method="post">
                      <input type="hidden" name="_action" value="edit" />
                      <input type="hidden" name="id" value={todo.id} />
                      <div className="mb-2">
                        <label
                          htmlFor={`edit-title-${todo.id}`}
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Title
                        </label>
                        <input
                          type="text"
                          id={`edit-title-${todo.id}`}
                          name="title"
                          defaultValue={todo.title}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-gray-700 dark:text-white"
                          required
                        />
                      </div>
                      <div className="mb-2">
                        <label
                          htmlFor={`edit-description-${todo.id}`}
                          className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                        >
                          Description
                        </label>
                        <textarea
                          id={`edit-description-${todo.id}`}
                          name="description"
                          defaultValue={todo.description}
                          rows={2}
                          className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div className="flex items-center mb-2">
                        <input
                          type="checkbox"
                          id={`edit-completed-${todo.id}`}
                          name="completed"
                          defaultChecked={todo.completed}
                          className="form-checkbox h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-indigo-600"
                        />
                        <label
                          htmlFor={`edit-completed-${todo.id}`}
                          className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
                        >
                          Completed
                        </label>
                      </div>
                      <div className="flex space-x-2">
                        <button
                          type="submit"
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                          Save
                        </button>
                        <button
                          type="button"
                          onClick={handleCancelEdit}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-gray-700 bg-gray-200 hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 dark:text-gray-200 dark:bg-gray-600 dark:hover:bg-gray-700"
                        >
                          Cancel
                        </button>
                      </div>
                    </fetcher.Form>
                  ) : (
                    <>
                      <h2
                        className={`text-lg font-medium ${todo.completed ? "line-through text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-white"}`}
                      >
                        {todo.title}
                      </h2>
                      {todo.description && (
                        <p
                          className={`mt-1 text-sm ${todo.completed ? "line-through text-gray-500 dark:text-gray-400" : "text-gray-600 dark:text-gray-300"}`}
                        >
                          {todo.description}
                        </p>
                      )}
                      <div className="mt-2 text-xs text-gray-400 dark:text-gray-500">
                        <p>
                          Created:{" "}
                          {format(
                            new Date(todo.created_at),
                            "yyyy年MM月dd日 HH:mm",
                            { locale: ja }
                          )}
                        </p>
                        <p>
                          Updated:{" "}
                          {format(
                            new Date(todo.updated_at),
                            "yyyy年MM月dd日 HH:mm",
                            { locale: ja }
                          )}
                        </p>
                      </div>
                    </>
                  )}
                </div>
                <div className="flex items-center space-x-3">
                  {editingTodoId !== todo.id && (
                    <button
                      onClick={() => handleEditClick(todo.id)}
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Edit
                    </button>
                  )}
                  <fetcher.Form method="post">
                    <input type="hidden" name="_action" value="toggle" />
                    <input type="hidden" name="id" value={todo.id} />
                    <input
                      type="hidden"
                      name="completed"
                      value={String(todo.completed)}
                    />
                    <input
                      type="checkbox"
                      checked={todo.completed}
                      onChange={(e) => fetcher.submit(e.currentTarget.form)}
                      className="form-checkbox h-5 w-5 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-indigo-600"
                    />
                  </fetcher.Form>
                  <fetcher.Form method="post">
                    <input type="hidden" name="_action" value="delete" />
                    <input type="hidden" name="id" value={todo.id} />
                    <button
                      type="submit"
                      className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                    >
                      Delete
                    </button>
                  </fetcher.Form>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
