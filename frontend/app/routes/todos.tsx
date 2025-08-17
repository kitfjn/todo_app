import { useEffect, useState } from "react";
import { useFetcher, redirect, useSearchParams } from "react-router";
import { isBefore } from "date-fns";
import { getTokenFromSession, requireAccountSession } from "~/data/auth.server";
import type { Route } from "./+types/todos";
import { getAllTodo, getAllTodoByAuthorUuid } from "~/data/todo.server";
import type { User } from "~/type/auth";
import ConfirmDialog from "~/components/ConfirmDialog";
import TodoSearch from "~/components/TodoSearch";
import TodoAddForm from "~/components/TodoAddForm";
import TodoList from "~/components/TodoList";
import type { Todo } from "~/type/todo";

export const meta = ({ data }: Route.MetaArgs) => {
  return [
    {
      title: `Todo Application： ${data?.loginUser?.username}さんのTodo一覧です`,
    },
    {
      name: "description",
      content: `${data?.loginUser?.username}さんのTodo一覧です`,
    },
  ];
};

export async function loader({ request }: Route.LoaderArgs) {
  const loginUser: User | undefined = await requireAccountSession(request);
  const token = await getTokenFromSession(request);

  if (!loginUser) {
    return redirect("/login");
  }

  if (loginUser.is_superuser) {
    try {
      const todos = await getAllTodo(
        token?.access_token
        // loginUser?.uuid
      );
      return { todos, loginUser };
    } catch (error: unknown) {
      console.log("Failed to fetch todos.", error);
      return { todos: [] };
    }
  } else {
    try {
      const todos = await getAllTodoByAuthorUuid(
        token?.access_token,
        loginUser?.uuid
      );
      return { todos, loginUser };
    } catch (error: unknown) {
      console.log("Failed to fetch todos.", error);
      return { todos: [] };
    }
  }
}

export async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const _action = formData.get("_action");
  const token = await getTokenFromSession(request);

  try {
    switch (_action) {
      case "add": {
        const title = formData.get("title");
        const description = formData.get("description");
        const author_uuid = formData.get("author_uuid");
        const completed = formData.get("completed") === "true";
        const limit_date = formData.get("limit_date");
        const response = await fetch(
          `${process.env.API_ROOT_URL}/api/v1/todos`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token?.access_token}`,
            },
            body: JSON.stringify({
              title,
              description,
              completed,
              author_uuid,
              limit_date,
            }),
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return Response.json({ type: "add-success" });
      }
      case "toggle": {
        const id = formData.get("id");
        const completed = formData.get("completed") === "true";
        const response = await fetch(
          `${process.env.API_ROOT_URL}/api/v1/todos/edit/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token?.access_token}`,
            },
            body: JSON.stringify({ completed: !completed }),
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        return Response.json({ type: "toggle-success" });
      }
      case "delete": {
        const id = formData.get("id");
        const response = await fetch(
          `${process.env.API_ROOT_URL}/api/v1/todos/delete/${id}`,
          {
            method: "DELETE",
            headers: {
              Authorization: `Bearer ${token?.access_token}`,
            },
          }
        );
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
        const limit_date = formData.get("limit_date");

        console.log(id, title, description, completed);

        const response = await fetch(
          `${process.env.API_ROOT_URL}/api/v1//todos/edit/${id}`,
          {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token?.access_token}`,
            },
            body: JSON.stringify({
              title,
              description,
              completed,
              limit_date,
            }),
          }
        );
        console.log(response);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        // return redirect("/"); // Redirect to revalidate loader data
        return Response.json({ type: "edit-success" });
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

  // add form state
  const [newTodoTitle, setNewTodoTitle] = useState<string>("");
  const [newTodoDescription, setNewTodoDescription] = useState<string>("");
  // 期限を管理するステートを追加（新規登録時）
  const [newTodoLimitDate, setNewTodoLimitDate] = useState<Date | undefined>(
    undefined
  );

  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("query") || "");
  const fetcher = useFetcher();
  const [editingTodoId, setEditingTodoId] = useState<string | null>(null);

  // 編集フォーム内でのcompleted状態を管理するためのローカルステート
  const [editingCompleted, setEditingCompleted] = useState<boolean>(false);

  // dialog表示管理のステート
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  // 削除対象のTodo Id管理のステート
  const [deleteTodoId, setDeleteTodoId] = useState<string | null>(null);

  // 期限を管理するステートを追加（更新時）
  const [editTodoLimitDate, setEditTodoLimitDate] = useState<Date | undefined>(
    new Date()
  );

  // `searchParams`の変更を監視し、フォームの値を同期
  useEffect(() => {
    setQuery(searchParams.get("query") || "");
  }, [searchParams]);

  useEffect(() => {
    if (fetcher.state === "idle" && fetcher.data) {
      // `fetcher.data`の型を適切に推論させる
      const data = fetcher.data as { type: string };

      // 新規todoフォームのクリア
      if (data?.type === "add-success") {
        setNewTodoTitle("");
        setNewTodoDescription("");
        setNewTodoLimitDate(new Date());
      }

      if (data && typeof data === "object" && "type" in data) {
        // 編集フォームのクローズ
        if (data.type === "edit-success") {
          setEditingTodoId(null);
        }
      }
    }
  }, [fetcher.state, fetcher.data]);

  // `editingTodoId`が変更されたときに編集フォームの値を初期化
  useEffect(() => {
    if (editingTodoId) {
      const todoToEdit = todos.find((t) => t.id === editingTodoId);
      if (todoToEdit) {
        setEditingCompleted(todoToEdit.completed);
        // limit_dateがあればDateオブジェクトに変換してステートに設定
        setEditTodoLimitDate(
          todoToEdit.limit_date ? new Date(todoToEdit.limit_date) : undefined
        );
      }
    } else {
      // 編集が終了したときにステートをクリア
      setEditTodoLimitDate(undefined);
    }
  }, [editingTodoId, todos]);

  const filteredTodos = todos.filter(
    (todo) =>
      todo.title.toLowerCase().includes(query.toLowerCase()) ||
      (todo.description &&
        todo.description.toLowerCase().includes(query.toLowerCase()))
  );

  // 追加のソート処理
  const sortedTodos = [...filteredTodos].sort((a, b) => {
    const aIsPast = a.limit_date
      ? isBefore(new Date(a.limit_date), new Date())
      : false;
    const bIsPast = b.limit_date
      ? isBefore(new Date(b.limit_date), new Date())
      : false;

    if (aIsPast && bIsPast) {
      // aの期限がbより前なら-1
      return (
        new Date(a.limit_date).getTime() - new Date(b.limit_date).getTime()
      );
    }
    // aだけ期限切れの場合、aを優先
    if (aIsPast) {
      return -1;
    }

    // bだけ期限切れの場合、bを優先
    if (bIsPast) {
      return 1;
    }

    // どちらも期限切れではない
    const aLimitDate = a.limit_date ? new Date(a.limit_date) : null;
    const bLimitDate = b.limit_date ? new Date(b.limit_date) : null;

    // どちらも期限がある場合、期限が早い方を優先
    if (aLimitDate && bLimitDate) {
      return aLimitDate.getTime() - bLimitDate.getTime();
    }

    // aだけ期限がある場合、aを優先
    if (aLimitDate) {
      return -1;
    }

    // bだけ期限がある場合、bを優先
    if (bLimitDate) {
      return 1;
    }

    //　どちらも期限がない場合、作成日時が新しい方を優先
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });

  const handleDeleteClick = (todoId: string) => {
    setDeleteTodoId(todoId);
    setIsDialogOpen(true);
  };

  // 削除をキャンセルするハンドラ
  const handleCancelDelete = () => {
    setIsDialogOpen(false);
    setDeleteTodoId(null);
  };

  // 削除を確定するハンドラを追加
  const handleConfirmDelete = () => {
    if (deleteTodoId) {
      // 既存のdeleteアクションを呼び出すためにfetcher.Formを送信
      const form = document.getElementById(
        `delete-form-${deleteTodoId}`
      ) as HTMLFormElement;
      if (form) {
        fetcher.submit(form);
      }
    }
    setIsDialogOpen(false);
    setDeleteTodoId(null);
  };

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 text-center">
        My Todo List
      </h1>

      {/* 管理者としてログインしていることのお知らせ */}
      {loginUser.is_superuser === true && (
        <div className="flex justify-center">
          <p className="text-red-600 text-sm mx-auto">
            管理者（{loginUser.username}さんは管理者）でログインしています
          </p>
        </div>
      )}

      <TodoSearch
        query={query}
        setQuery={setQuery}
        setSearchParams={setSearchParams}
      />

      <TodoAddForm
        loginUser={loginUser}
        newTodoTitle={newTodoTitle}
        setNewTodoTitle={setNewTodoTitle}
        newTodoDescription={newTodoDescription}
        setNewTodoDescription={setNewTodoDescription}
        newTodoLimitDate={newTodoLimitDate}
        setNewTodoLimitDate={setNewTodoLimitDate}
        fetcher={fetcher}
      />

      <TodoList
        loginUser={loginUser}
        sortedTodos={sortedTodos}
        query={query}
        editingTodoId={editingTodoId}
        setEditingTodoId={setEditingTodoId}
        editingCompleted={editingCompleted}
        setEditingCompleted={setEditingCompleted}
        editTodoLimitDate={editTodoLimitDate}
        setEditTodoLimitDate={setEditTodoLimitDate}
        handleDeleteClick={handleDeleteClick}
        fetcher={fetcher}
      />

      {/* ページの最後にダイアログを配置 */}
      <ConfirmDialog
        isOpen={isDialogOpen}
        onClose={handleCancelDelete}
        onConfirm={handleConfirmDelete}
        title="タスクの削除"
        message="本当にこのタスクを削除しますか？この操作は元に戻せません。"
      />
    </div>
  );
}
