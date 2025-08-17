import type { User } from "~/type/auth";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { DateTimePicker24h } from "./DateTimePicker24";
import { Button } from "./ui/button";
import { type FetcherWithComponents } from "react-router";
import { useState } from "react";
import { Input } from "./ui/input";

type AddResponseData = {
  message: string;
  _action: "add";
};

interface TodoAddFormProps {
  loginUser: User;
  newTodoTitle: string;
  setNewTodoTitle: React.Dispatch<React.SetStateAction<string>>;
  newTodoDescription: string;
  setNewTodoDescription: React.Dispatch<React.SetStateAction<string>>;
  newTodoLimitDate: Date | undefined;
  setNewTodoLimitDate: React.Dispatch<React.SetStateAction<Date | undefined>>;
  fetcher: FetcherWithComponents<AddResponseData>;
}

export default function TodoAddForm({
  loginUser,
  newTodoTitle,
  setNewTodoTitle,
  newTodoDescription,
  setNewTodoDescription,
  newTodoLimitDate,
  setNewTodoLimitDate,
  fetcher,
}: TodoAddFormProps) {
  // toggle式のopen状態の管理
  const [isNewTodoFormOpen, setIsNewTodoFormOpen] = useState(false);

  return (
    <Collapsible
      open={isNewTodoFormOpen}
      onOpenChange={setIsNewTodoFormOpen}
      className="w-full space-y-2 mb-8"
    >
      <div className="flex items-center justify-between">
        <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
          新しいTodoを追加する
        </h4>
        <CollapsibleTrigger asChild>
          <Button
            // variant="ghost"
            size="sm"
            className="text-white cursor-pointer"
          >
            {isNewTodoFormOpen ? "Close" : "Create"}
          </Button>
        </CollapsibleTrigger>
      </div>
      <CollapsibleContent>
        <fetcher.Form
          method="post"
          className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md mb-8"
        >
          <input type="hidden" name="_action" value="add" />
          <input type="hidden" name="author_uuid" value={loginUser.uuid} />
          <div className="mb-4">
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              タイトル
            </label>
            <input
              type="text"
              id="title"
              name="title"
              placeholder="登録するたTodoのタイトル"
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
              Todoの説明（オプション）
            </label>
            <textarea
              id="description"
              name="description"
              placeholder="Todoの説明を記載します"
              value={newTodoDescription}
              onChange={(e) => setNewTodoDescription(e.target.value)}
              rows={3}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-gray-700 dark:text-white"
            />
          </div>
          {/* 新規追加: Limit Dateセクション */}
          <div className="mb-4">
            <label
              htmlFor="limit_date"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
            >
              期限（オプション）
            </label>
            <DateTimePicker24h
              date={newTodoLimitDate}
              onChange={setNewTodoLimitDate}
            />
            {/* フォーム送信用の隠しフィールド */}
            <Input
              type="hidden"
              name="limit_date"
              value={newTodoLimitDate ? newTodoLimitDate.toISOString() : ""}
            />
          </div>
          <input type="hidden" name="completed" value={String(false)} />
          <Button
            type="submit"
            className="cursor-pointer flex justify-center mx-auto"
            // className="cursor-pointer w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            登録
          </Button>
        </fetcher.Form>
      </CollapsibleContent>
    </Collapsible>
  );
}
