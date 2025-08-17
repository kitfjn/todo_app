import { type FetcherWithComponents } from "react-router";
import type { Todo } from "~/type/todo";
import TodoItem from "./TodoItem";
import type { User } from "~/type/auth";

type EditResponseData = {
  message: string;
  _action: "edit";
};

type DeleteResponseData = {
  message: string;
  _action: "delete";
};

interface TodoListProps {
  loginUser: User;
  sortedTodos: Todo[];
  query: string;
  editingTodoId: string | null;
  setEditingTodoId: (id: string | null) => void;
  editingCompleted: boolean;
  setEditingCompleted: React.Dispatch<React.SetStateAction<boolean>>;
  editTodoLimitDate: Date | undefined;
  setEditTodoLimitDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  handleDeleteClick: (id: string) => void;
  fetcher: FetcherWithComponents<EditResponseData | DeleteResponseData>;
}

export default function TodoList({
  loginUser,
  sortedTodos,
  query,
  editingTodoId,
  setEditingTodoId,
  editingCompleted,
  setEditingCompleted,
  editTodoLimitDate,
  setEditTodoLimitDate,
  handleDeleteClick,
  fetcher,
}: TodoListProps) {
  return (
    <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-6">
      {query !== "" && (
        <p className="text-center text-gray-500 dark:text-gray-400">
          検索ワード：{query}
        </p>
      )}
      {sortedTodos.length === 0 ? (
        <>
          <p className="text-center text-gray-500 dark:text-gray-400">
            Todoがありません
          </p>
        </>
      ) : (
        <ul className="divide-y divide-gray-200 dark:divide-gray-700">
          {sortedTodos.map((todo) => (
            <TodoItem
              loginUser={loginUser}
              todo={todo}
              editingTodoId={editingTodoId}
              setEditingTodoId={setEditingTodoId}
              editingCompleted={editingCompleted}
              setEditingCompleted={setEditingCompleted}
              editTodoLimitDate={editTodoLimitDate}
              setEditTodoLimitDate={setEditTodoLimitDate}
              handleDeleteClick={handleDeleteClick}
              fetcher={fetcher}
            />
          ))}
        </ul>
      )}
    </div>
  );
}
