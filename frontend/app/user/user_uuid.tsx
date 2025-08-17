import {
  getTokenFromSession,
  requireAccountSession,
  updateUser,
} from "~/data/auth.server";
import type { User } from "~/type/auth";
import { useEffect, useState } from "react";

// image
// import default_avatar from "../../files/avatar/default_avatar.png";
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
import type { Route } from "./+types/user_uuid";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";
import z from "zod";
import { Input } from "~/components/ui/input";
import { getAllTodoByAuthorUuid } from "~/data/todo.server";
import type { Todo } from "~/type/todo";
import { format, isBefore, isEqual } from "date-fns";
import { ja } from "date-fns/locale/ja";
import { Card } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";

export const meta = ({ data }: Route.MetaArgs) => {
  return [
    { title: `${data?.loginUser?.username}さんのページ` },
    {
      property: "og:title",
      content: `${data?.loginUser?.username}さんのプロフィール画面`,
    },
    {
      name: "description",
      content: `${data?.loginUser?.username}さんのページ`,
    },
  ];
};

const updateUserValidation = z.object({
  username: z.string().min(4, { message: "Username length is 4 at least." }),
  email: z.string().min(1, { message: "Input your email address." }),
});

export async function action({ request }: Route.ActionArgs) {
  const formData = await request.formData();
  const rawwData = Object.fromEntries(formData.entries());
  const uuid = formData.get("uuid")?.toString();

  const validationResult = updateUserValidation.safeParse(rawwData);
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
  const { username, email } = validationResult.data;
  const is_active = formData.get("is_active") === "true";
  const is_superuser = formData.get("is_superuser") === "true";

  if (!uuid) {
    return new Response(JSON.stringify({ error: "User ID is required." }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  try {
    await updateUser(request, uuid, username, email, is_active, is_superuser);
    return Response.json({
      success: true,
      message: "ユーザー情報の更新が完了しました。",
    });
    // redirect(`/user/${uuid}`); // redirectで再読み込み
  } catch (error: unknown) {
    return Response.json({
      success: false,
      message: "ユーザー情報の更新ができませんでした。",
    });
  }
}

export async function loader({ request }: Route.LoaderArgs) {
  const loginUser = await requireAccountSession(request);
  const token = await getTokenFromSession(request);
  const myTodo = await getAllTodoByAuthorUuid(
    token?.access_token,
    loginUser?.uuid
  );
  return { loginUser, myTodo };
}

export default function UserDetail({
  loaderData,
}: {
  loaderData: { loginUser: User; myTodo: Todo[] };
}) {
  const { loginUser, myTodo } = loaderData;

  const actionData = useActionData<{ success?: boolean; message: string }>();

  // state
  const [username, setUsername] = useState<string | undefined>(
    loginUser?.username
  );
  const [email, setEmail] = useState<string | undefined>(loginUser?.email);
  const [isActive, setIsActive] = useState<boolean | undefined>(
    loginUser?.is_active
  );
  const [isSuperuser, setIsSuperuser] = useState<boolean | undefined>(
    loginUser?.is_superuser
  );

  const [editingUserId, setEditingUserId] = useState<string | undefined>("");

  const [showAlert, setShowAlert] = useState<boolean>(false);

  //logic
  const handleIsActiveCheckboxChange = () => {
    setIsActive((prev) => !prev); // 現在の状態を反転
  };

  const handleIsSuperuserCheckboxChange = () => {
    setIsSuperuser((prev) => !prev); // 現在の状態を反転
  };

  const handleEditClick = (user: User) => {
    setEditingUserId(user.uuid);
  };

  const handleCancelEdit = () => {
    setEditingUserId("");
  };

  // `editingUserId`が変更されたときに編集フォームの値を初期化
  useEffect(() => {
    if (actionData?.success) {
      setEditingUserId("");
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
      <h1 className="text-3xl mb-3 text-center font-bold">ユーザーページ</h1>
      <div className="flex h-[70px] items-center">
        {/* <div className="relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full">
          <img
            // src={default_avatar}
            alt={`${loginUser.username}のアバター`}
            className="aspect-square h-full w-full"
          />
          <div className="flex h-full w-full items-center justify-center rounded-full bg-neutral-100">
            {loginUser.username}のアバター
          </div>
        </div> */}
        <div className="flex flex-col ml-3">
          <div>
            <p className="text-2xl font-bold">{loginUser.username}さん</p>
          </div>
          <div>
            <p>ID: {loginUser?.uuid}</p>
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
        {editingUserId !== loginUser.uuid ? (
          <>
            <div className="flex my-3">
              <div className="flex flex-col space-y-1.5 p-6 px-6 py-3">
                プロフィール
              </div>
              <HoverCard openDelay={200}>
                <HoverCardTrigger asChild>
                  <Button
                    // variant="ghost"
                    onClick={() => handleEditClick(loginUser)}
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
                      自分のプロフィール情報を変更したい場合は、「編集」ボタンをクリックして、各フォームに入力して
                      <span className="font-bold">"保存"</span>{" "}
                      ボタンを押して下さい。
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            </div>
            <div className="p-6 pt-0 mt-3">
              <p className="mt-2">Username： {loginUser?.username}</p>
              <p className="mt-2">Email：{loginUser?.email}</p>
            </div>
          </>
        ) : (
          <>
            <div className="mt-5">
              <div className="text-sm text-neutral-500 px-6">
                変更したいフィールドを入力して、保存ボタンを押してください。
              </div>
              <div className="text-sm text-neutral-500 px-6 text-[10px]">
                * usernameとEmailフィールドが変更可能です
              </div>

              <div className="p-6 pt-0 mt-3">
                <Form method="post">
                  <div>
                    <input type="hidden" name="uuid" value={loginUser?.uuid} />
                  </div>
                  <p className="mt-2">Username</p>
                  <Input
                    name="username"
                    className="mt-1 flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-950 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#79BD9A] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    placeholder="Username"
                    defaultValue={loginUser?.username}
                    onChange={(e) => setUsername(e.target.value)}
                  />
                  <p className="mt-2">Email</p>
                  <Input
                    name="email"
                    className="mt-1 flex h-9 w-full rounded-md border border-neutral-200 bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-neutral-950 placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#79BD9A] disabled:cursor-not-allowed disabled:opacity-50 md:text-sm"
                    placeholder="Email"
                    defaultValue={loginUser?.email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                  {loginUser?.is_superuser === true && (
                    <div>
                      <div className="mt-2 flex items-center">
                        <Input
                          type="checkbox"
                          className="cursor-pointer mr-3 peer h-4 w-4 shrink-0 rounded-xl border border-neutral-900 shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#79BD9A] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#79BD9A] data-[state=checked]:text-neutral-50"
                          checked={isActive}
                          onChange={handleIsActiveCheckboxChange}
                        />
                        {isActive == true ? "active" : "disactive"}
                        <Input
                          type="hidden"
                          name="is_active"
                          value={isActive ? "true" : "false"}
                        />
                      </div>
                      <div className="mt-2 flex items-center">
                        <Input
                          type="checkbox"
                          className="cursor-pointer mr-3 peer h-4 w-4 shrink-0 rounded-xl border border-neutral-900 shadow focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#79BD9A] disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-[#79BD9A] data-[state=checked]:text-neutral-50"
                          checked={isSuperuser}
                          onChange={handleIsSuperuserCheckboxChange}
                        />
                        {isSuperuser == true ? "superuser" : "user"}
                        <Input
                          type="hidden"
                          name="is_superuser"
                          value={isSuperuser ? "true" : "false"}
                        />
                      </div>
                    </div>
                  )}
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
      <Separator className="mt-8 border-2" />
      <h1 className="text-2xl text-center font-bold mt-4">あなたのTodo一覧</h1>
      {myTodo.length === 0 ? (
        <div className="flex justify-center mt-3">
          <p>まだTodoが登録されていません</p>
        </div>
      ) : (
        myTodo.map((todo) => (
          <li key={todo.id} className="py-4 flex items-center justify-between">
            <Card className="flex-1 min-w-0 mr-4 p-5">
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
                      {format(
                        new Date(todo.updated_at),
                        "yyyy年MM月dd日 HH:mm",
                        {
                          locale: ja,
                        }
                      )}
                    </p>
                  )}
                </div>
                {todo?.completed && (
                  <span className="ml-2 m-auto text-white bg-blue-600 py-1 px-2 rounded-md">
                    Completed
                  </span>
                )}
              </div>
            </Card>
          </li>
        ))
      )}
      <div className="flex justify-center mt-5">
        <Button asChild>
          <Link to="/">Todo一覧に戻る</Link>
        </Button>
      </div>
    </div>
  );
}
