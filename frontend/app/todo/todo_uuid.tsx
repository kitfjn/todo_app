import { getTokenFromSession, requireAccountSession } from "~/data/auth.server";
import type { User } from "~/type/auth";
import { useEffect, useState } from "react";

import { Form, Link, useActionData } from "react-router";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "~/components/ui/drawer";
import { Button } from "~/components/ui/button";
import DeleteUserButton from "~/components/DeleteUserButton";
import type { Route } from "./+types/todo_uuid";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import z from "zod";
import { getTodoById, updateTodo } from "~/data/todo.server";
import type { Todo } from "~/type/todo";
import { DateTimePicker24h } from "~/components/DateTimePicker24";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";

export const meta = ({ data }: Route.MetaArgs) => {
  return [
    { title: `Todo: ${data?.todo?.title}` },
    {
      name: "description",
      content: `${data?.todo?.description}`,
    },
  ];
};

const updateUserValidation = z.object({
  title: z.string().min(4),
  description: z.string(),
  limit_date: z
    .string()
    .optional()
    .transform((val) => (val ? new Date(val) : undefined))
    .refine(
      (val) => val === undefined || !isNaN(val.getTime()),
      "期限が正しい日付ではありません"
    ),
});

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const rawData = Object.fromEntries(formData.entries());
  const uuid = formData.get("uuid")?.toString();
  const token = await getTokenFromSession(request);

  const validationResult = updateUserValidation.safeParse(rawData);
  if (!validationResult.success) {
    return new Response(
      JSON.stringify({
        error: validationResult.error.issues,
      }),
      {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
  const { title, description, limit_date } = validationResult.data;
  const completed = formData.get("completed") === "true";

  if (!uuid) {
    return new Response(JSON.stringify({ error: "User ID is required." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    await updateTodo(
      request,
      token?.access_token,
      uuid,
      title,
      description,
      completed,
      limit_date
    );
    return Response.json({
      success: true,
      message: "Todoの更新が完了しました。",
    });
    // redirect(`/user/${uuid}`); // redirectで再読み込み
  } catch (error: unknown) {
    return Response.json({
      success: false,
      message: "Todoの更新ができませんでした。",
    });
  }
}

export async function loader({ params, request }: Route.LoaderArgs) {
  const loginUser = await requireAccountSession(request);
  const token = await getTokenFromSession(request);
  const todo = await getTodoById(token?.access_token, params.todo_uuid);
  return { loginUser, todo };
}

export default function TodoDetail({
  loaderData,
}: {
  loaderData: { loginUser: User; todo: Todo };
}) {
  const { loginUser, todo } = loaderData;

  const actionData = useActionData<{ success?: boolean; message: string }>();

  // state
  const [title, setTitle] = useState<string | undefined>(todo?.title);
  const [description, setDescription] = useState<string | undefined>(
    todo?.description
  );
  const [completed, setCompleted] = useState<boolean | undefined>(
    todo?.completed
  );
  const [editLimitDate, setEditLimitDate] = useState<Date | undefined>(
    new Date()
  );

  const [editingTodoId, setEditingTodoId] = useState<string | undefined>("");

  // 編集フォーム内でのcompleted状態を管理するためのローカルステート
  const [editingCompleted, setEditingCompleted] = useState<boolean>(false);

  const [showAlert, setShowAlert] = useState<boolean>(false);

  //logic
  const handleEditClick = (todo: Todo) => {
    setEditingTodoId(todo.id);
    setTitle(todo.title);
    setDescription(todo.description);
    setEditLimitDate(todo.limit_date ? new Date(todo.limit_date) : undefined);
  };

  const handleCancelEdit = () => {
    setEditingTodoId("");
  };

  const handleIsCompletedCheckBoxChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEditingCompleted(event.target.checked);
  };

  // `editingTodoId`が変更されたときに編集フォームの値を初期化
  useEffect(() => {
    if (actionData?.success) {
      setEditingTodoId("");
      setShowAlert(true); // アラートを表示

      // 5秒後にアラートを非表示にする
      const timer = setTimeout(() => {
        setShowAlert(false);
      }, 5000);

      // クリーンアップ関数を返すことで、コンポーネントがアンマウントされる前にタイマーをクリア
      return () => clearTimeout(timer);
    }

    if (actionData === null) {
      setShowAlert(false);
    }
  }, [actionData]);

  return (
    <div className="mx-auto m-5 max-w-[600px]">
      <h1 className="text-3xl mb-3 text-center font-bold">Todo詳細ページ</h1>
      <div className="flex h-[70px] items-center">
        <div className="flex flex-col ml-3">
          <div>
            <p className="text-2xl font-bold">{todo?.title}</p>
          </div>
          <div>
            <p>ID: {todo?.id}</p>
          </div>
        </div>
      </div>
      {showAlert === true && (
        <>
          <Alert
            variant="default"
            className={`my-2 ${actionData?.success === true ? "border-blue-500" : "border-red-500"}`}
          >
            <AlertTitle>Infomation</AlertTitle>
            <AlertDescription
              className={`${actionData?.success === true ? "text-blue-500" : "text-red-500"}`}
            >
              {actionData?.message}
            </AlertDescription>
          </Alert>
        </>
      )}
      <div className="rounded-xl border border-neutral-200 bg-white text-neutral-950 shadow">
        {editingTodoId !== todo.id ? (
          <>
            <div className="flex my-3">
              <div className="flex flex-col space-y-1.5 p-6 px-6 py-3">
                Todoの詳細
              </div>
              {todo?.author_uuid === loginUser.uuid ||
                (loginUser.is_superuser === true && (
                  <HoverCard openDelay={200}>
                    <HoverCardTrigger asChild>
                      <Button
                        // variant="ghost"
                        onClick={() => handleEditClick(todo)}
                        className="cursor-pointer space-y-1.5 p-6 px-6 py-3 my-auto"
                      >
                        編集
                      </Button>
                    </HoverCardTrigger>
                    <HoverCardContent
                      side="right"
                      className="w-80 bg-black text-white"
                    >
                      <div className="flex justify-between gap-4">
                        <div className="text-[12px] m-2">
                          Todoの情報を変更したい場合は、「編集」ボタンを押して、各フォームに入力して
                          <span className="font-bold">"保存"</span>{" "}
                          ボタンを押して下さい。
                        </div>
                      </div>
                    </HoverCardContent>
                  </HoverCard>
                ))}
            </div>
            <div className="p-6 pt-0 mt-3">
              <p className="mt-2">タイトル：{todo?.title}</p>
              <p className="mt-2">内容：{todo?.description}</p>
            </div>
          </>
        ) : (
          <>
            <div className="my-5">
              <div className="text-sm text-neutral-500 px-6">
                変更したいフィールドを入力して、保存ボタンを押してください。
              </div>
              <div className="text-sm text-neutral-500 px-6 text-[10px]">
                * タイトルと内容を変更できます
              </div>

              <div className="p-6 pt-0 mt-3">
                <Form method="post">
                  <div>
                    <Input type="hidden" name="uuid" value={todo?.id} />
                  </div>
                  <p className="mt-2">タイトル</p>
                  <Input
                    name="title"
                    placeholder="title"
                    defaultValue={todo?.title}
                    onChange={(e) => setTitle(e.target.value)}
                  />
                  <p className="mt-2">内容：</p>
                  <Textarea
                    name="description"
                    placeholder="内容"
                    className="field-sizing-content"
                    defaultValue={todo?.description}
                    onChange={(e) => setDescription(e.target.value)}
                  />
                  <div className="flex items-center m-2">
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
                      date={editLimitDate}
                      onChange={setEditLimitDate}
                    />
                    {/* フォーム送信用の隠しフィールド */}
                    <Input
                      type="hidden"
                      name="limit_date"
                      value={editLimitDate ? editLimitDate?.toISOString() : ""}
                    />
                  </div>
                  <div className="flex justify-center">
                    <Button className="cursor-pointer mt-3 mr-3" type="submit">
                      保存
                    </Button>
                    <Button
                      type="button"
                      onClick={handleCancelEdit}
                      className="cursor-pointer mt-3"
                    >
                      Cancel
                    </Button>
                  </div>
                </Form>
              </div>
            </div>

            <div className="flex justify-center p-6 pt-0">
              {loginUser?.is_superuser === true ? (
                <Drawer>
                  <DrawerTrigger asChild>
                    <Button
                      // variant="ghost"
                      className="hover:bg-red-600 hover:border-white hover:text-white cursor-pointer"
                    >
                      DELETE
                    </Button>
                  </DrawerTrigger>
                  <DrawerContent>
                    <div className="mx-auto w-full max-w-sm">
                      <DrawerHeader>
                        <DrawerTitle className="text-2xl text-red-600 text-center">
                          DANGER
                        </DrawerTitle>
                        <DrawerDescription className="text-md text-red-600 text-center">
                          ユーザーの削除処理は取り消しできません。
                          <br />
                          本当に削除してよろしいですか？
                        </DrawerDescription>
                      </DrawerHeader>
                      <div className="p-4 pb-0">
                        <div className="flex items-center justify-center space-x-2">
                          <DrawerFooter>
                            <DeleteUserButton user_uuid={loginUser?.uuid} />
                            <DrawerClose asChild>
                              <Button
                                variant="ghost"
                                className="text-black cursor-pointer"
                              >
                                Cancel
                              </Button>
                            </DrawerClose>
                          </DrawerFooter>
                        </div>
                      </div>
                    </div>
                  </DrawerContent>
                </Drawer>
              ) : (
                ""
              )}
            </div>
          </>
        )}
      </div>
      <div className="flex justify-center mt-5">
        <Button asChild>
          <Link to="/">Todo一覧に戻る</Link>
        </Button>
      </div>
    </div>
  );
}
