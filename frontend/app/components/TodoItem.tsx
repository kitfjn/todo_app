import { Link, type FetcherWithComponents } from "react-router";
import type { Todo } from "~/type/todo";
import { DateTimePicker24h } from "./DateTimePicker24";
import { format, isBefore, isEqual } from "date-fns";
import { ja } from "date-fns/locale/ja";
import { Button } from "./ui/button";
import { Label } from "./ui/label";
import { Input } from "./ui/input";
import { Textarea } from "./ui/textarea";
import type { User } from "~/type/auth";

type EditResponseData = {
  message: string;
  _action: "edit";
};

type DeleteResponseData = {
  message: string;
  _action: "delete";
};

interface TodoItemProps {
  loginUser: User;
  todo: Todo;
  editingTodoId: string | null;
  setEditingTodoId: (id: string | null) => void;
  editingCompleted: boolean;
  setEditingCompleted: React.Dispatch<React.SetStateAction<boolean>>;
  editTodoLimitDate: Date | undefined;
  setEditTodoLimitDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  handleDeleteClick: (id: string) => void;
  fetcher: FetcherWithComponents<EditResponseData | DeleteResponseData>;
}

export default function TodoItem({
  loginUser,
  todo,
  editingTodoId,
  setEditingTodoId,
  editingCompleted,
  setEditingCompleted,
  editTodoLimitDate,
  setEditTodoLimitDate,
  handleDeleteClick,
  fetcher,
}: TodoItemProps) {
  const handleIsCompletedCheckBoxChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEditingCompleted(event.target.checked);
  };

  const handleCancelEdit = () => {
    setEditingTodoId(null);
  };

  const handleEditClick = (todo: Todo) => {
    setEditingTodoId(todo.id);
    setEditingCompleted(todo.completed);
    setEditTodoLimitDate(
      todo.limit_date ? new Date(todo.limit_date) : undefined
    );
  };

  return (
    <li key={todo.id} className="py-4 flex items-center justify-between">
      <div className="flex-1 min-w-0 mr-4">
        {editingTodoId === todo.id ? (
          <fetcher.Form method="post">
            <Input type="hidden" name="_action" value="edit" />
            <Input type="hidden" name="id" value={todo.id} />
            <div className="mb-2">
              <Label
                htmlFor={`edit-title-${todo.id}`}
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                タイトル
              </Label>
              <Input
                type="text"
                id={`edit-title-${todo.id}`}
                name="title"
                defaultValue={todo.title}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div className="mb-2">
              <Label
                htmlFor={`edit-description-${todo.id}`}
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                説明
              </Label>
              <Textarea
                id={`edit-description-${todo.id}`}
                name="description"
                defaultValue={todo.description}
                rows={2}
                className="field-sizing-content"
              />
            </div>
            <div className="flex items-center mb-2">
              <Input
                type="hidden"
                name="completed"
                value={editingCompleted ? "true" : "false"}
              />
              <Input
                type="checkbox"
                id={`edit-completed-${todo.id}`}
                checked={editingCompleted}
                onChange={handleIsCompletedCheckBoxChange}
                className="cursor-pointer form-checkbox h-4 w-4 text-indigo-600 rounded focus:ring-indigo-500 border-gray-300 dark:border-gray-600 dark:bg-gray-700 dark:checked:bg-indigo-600"
              />
              <Label
                htmlFor={`edit-completed-${todo.id}`}
                className="ml-2 block text-sm text-gray-900 dark:text-gray-300"
              >
                {editingCompleted === true ? (
                  <div className="mr-2">完了</div>
                ) : (
                  <div className="mr-2">未完了</div>
                )}
              </Label>
            </div>
            <div className="mb-4">
              <Label
                htmlFor="edit_limit_date"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
              >
                期限（オプション）
              </Label>
              <DateTimePicker24h
                date={editTodoLimitDate}
                onChange={setEditTodoLimitDate}
              />
              {/* フォーム送信用の隠しフィールド */}
              <Input
                type="hidden"
                name="limit_date"
                value={
                  editTodoLimitDate ? editTodoLimitDate?.toISOString() : ""
                }
              />
            </div>
            <div className="flex space-x-2">
              <Button type="submit" className="cursor-pointer">
                保存
              </Button>
              <Button
                type="button"
                onClick={handleCancelEdit}
                className="cursor-pointer"
              >
                Cancel
              </Button>
            </div>
          </fetcher.Form>
        ) : (
          <>
            <Link to={`/todo/${todo.id}`}>
              <h2
                className={`mt-2 text-2xl font-medium ${todo.completed ? "line-through text-gray-500 dark:text-gray-400" : "text-gray-900 dark:text-white"}`}
              >
                {todo.title}
              </h2>
            </Link>
            {todo.description && (
              <p
                className={`line-clamp-2 mt-1 text-md ${todo.completed ? "line-through text-gray-500 dark:text-gray-400" : "text-gray-600 dark:text-gray-300"}`}
              >
                {todo.description}
              </p>
            )}
            <div className="flex">
              {todo.limit_date && (
                <p className="mt-1 text-sm">
                  期限：
                  {format(new Date(todo.limit_date), "yyyy年MM月dd日 HH:mm", {
                    locale: ja,
                  })}
                </p>
              )}
              {todo.limit_date &&
                todo.completed !== true &&
                isBefore(new Date(todo.limit_date), new Date()) && (
                  <p className="text-red-500 font-bold ml-3 text-sm mt-1">
                    期限切れ
                  </p>
                )}
            </div>
            <div className="flex">
              <div className="ml-0 mr-3 m-auto text-xs text-gray-400 dark:text-gray-500">
                <p>
                  登録日:{" "}
                  {format(new Date(todo.created_at), "yyyy年MM月dd日 HH:mm", {
                    locale: ja,
                  })}
                </p>
                {!isEqual(todo.created_at, todo.updated_at) && (
                  <p>
                    更新日:{" "}
                    {format(new Date(todo.updated_at), "yyyy年MM月dd日 HH:mm", {
                      locale: ja,
                    })}
                  </p>
                )}
              </div>
              {todo?.completed && (
                <span className="ml-2 m-auto text-white bg-blue-600 py-1 px-2 rounded-md">
                  Completed
                </span>
              )}
            </div>
            {loginUser.is_superuser === true && (
              <div>
                <p
                  className={`text-sm mt-2 m-auto ${loginUser.uuid !== todo.author_uuid && "underline font-semibold"}`}
                >
                  ※Todo作成者:{" "}
                  <Link to={`/user/${todo.author_uuid}`}>
                    {todo.author.username}
                  </Link>
                  さん
                </p>
              </div>
            )}
          </>
        )}
      </div>
      <div className="flex flex-col items-center space-x-3">
        {editingTodoId !== todo.id && (
          <Button
            onClick={() => handleEditClick(todo)}
            className="cursor-pointer m-0"
          >
            編集
          </Button>
        )}
        {editingTodoId !== todo.id && (
          <fetcher.Form method="post" className="m-0">
            <input type="hidden" name="_action" value="toggle" />
            <input type="hidden" name="id" value={todo.id} />
            <input
              type="hidden"
              name="completed"
              value={String(todo.completed)}
            />
            <div className="flex mt-2 w-16">
              <input
                type="checkbox"
                checked={todo.completed}
                onChange={(e) => fetcher.submit(e.currentTarget.form)}
                className="bg-black m-auto cursor-pointer form-checkbox h-4 w-4 rounded-md border-gray-300 dark:border-gray-600 dark:bg-gray-700"
              />
              <Label
                htmlFor={`toggle-checkbox-${todo.id}`}
                className="text-sm w-16 justify-center"
              >
                {todo.completed ? "完了" : "未完了"}
              </Label>
            </div>
          </fetcher.Form>
        )}
        <fetcher.Form
          method="post"
          id={`delete-form-${todo.id}`}
          className="flex flex-col items-center"
        >
          <input type="hidden" name="_action" value="delete" />
          <input type="hidden" name="id" value={todo.id} />
          <Button
            type="button" // typeをbuttonに変更
            onClick={() => handleDeleteClick(todo.id)}
            className="cursor-pointer mt-2"
          >
            削除
          </Button>
        </fetcher.Form>
      </div>
    </li>
  );
}
