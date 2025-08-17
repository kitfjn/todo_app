import {
  getAllUser,
  getTokenFromSession,
  requireAccountSession,
  updateUser,
} from "~/data/auth.server";
import type { Route } from "./+types/users";
import type { User } from "~/type/auth";
import { Card, CardContent, CardTitle } from "~/components/ui/card";
import { format, isEqual } from "date-fns";
import { ja } from "date-fns/locale/ja";
import {
  Form,
  Link,
  redirect,
  useActionData,
  useSearchParams,
} from "react-router";
import UserSearch from "~/components/UserSearch";
import { useEffect, useState } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
import { Button } from "~/components/ui/button";
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
import DeleteUserButton from "~/components/DeleteUserButton";
import { Input } from "~/components/ui/input";
import z from "zod";
import { Alert, AlertDescription, AlertTitle } from "~/components/ui/alert";

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

  if (loginUser?.is_superuser === true) {
    const users = await getAllUser(token?.access_token);
    return { loginUser, users };
  } else {
    return redirect("/");
  }
}

export default function UserDetail({
  loaderData,
}: {
  loaderData: { loginUser: User; users: User[] };
}) {
  const { loginUser, users } = loaderData;

  const actionData = useActionData<{ success?: boolean; message: string }>();

  const [searchParams, setSearchParams] = useSearchParams();
  const [query, setQuery] = useState(searchParams.get("query") || "");

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

  // `searchParams`の変更を監視し、フォームの値を同期
  useEffect(() => {
    setQuery(searchParams.get("query") || "");
  }, [searchParams]);

  const filteredUsers = users.filter(
    (user) =>
      user?.username.toLowerCase().includes(query.toLowerCase()) ||
      (user?.email && user?.email.toLowerCase().includes(query.toLowerCase()))
  );

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
    <div className="container mx-auto p-4">
      <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white mb-6 text-center">
        ユーザー一覧
      </h1>
      <UserSearch
        query={query}
        setQuery={setQuery}
        setSearchParams={setSearchParams}
      />
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

      {filteredUsers.length !== 0 ? (
        <>
          {filteredUsers.map((user) => (
            <Card key={user.uuid} className="p-5 mt-5">
              {editingUserId === user.uuid ? (
                <>
                  <div className="my-5">
                    <div className="text-sm text-neutral-500 px-6">
                      変更したいフィールドを入力して、保存ボタンを押してください。
                    </div>
                    <div className="text-sm text-neutral-500 px-6 text-[10px]">
                      * usernameとEmailフィールドが変更可能です
                    </div>

                    <div className="p-6 pt-0 mt-3">
                      <Form method="post">
                        <div>
                          <input
                            type="hidden"
                            name="uuid"
                            value={loginUser?.uuid}
                          />
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
                          <Button
                            className="cursor-pointer mt-3 mr-3"
                            type="submit"
                          >
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
                                  <DeleteUserButton
                                    user_uuid={loginUser?.uuid}
                                  />
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
              ) : (
                <>
                  {loginUser.is_superuser === true ? (
                    <>
                      <Link to={`/user/${user.uuid}`}>
                        <CardTitle className="text-2xl">
                          {user.username}
                        </CardTitle>
                      </Link>
                      <p className="text-sm">ID:{user.uuid}</p>
                    </>
                  ) : (
                    <>
                      <CardTitle className="text-2xl">
                        {user.username}
                      </CardTitle>
                      <p className="text-sm">ID:{user.uuid}</p>
                    </>
                  )}

                  <CardContent className="px-3">
                    <div>
                      <p>メールアドレス：{user.email}</p>
                      <p>
                        登録日:{" "}
                        {format(
                          new Date(user?.created_at),
                          "yyyy年M月dd日 HH:mm",
                          {
                            locale: ja,
                          }
                        )}
                      </p>
                      {!isEqual(user.created_at, user.updated_at) && (
                        <p>
                          更新日:{" "}
                          {format(
                            new Date(user?.updated_at),
                            "yyyy年M月dd日 HH:mm",
                            {
                              locale: ja,
                            }
                          )}
                        </p>
                      )}
                      <p>
                        アクティブユーザー：{" "}
                        {user.is_active === true ? "☑️" : "None"}
                      </p>
                      <p>
                        管理者権限の付与：{" "}
                        {user.is_superuser === true ? "☑️" : "None"}
                      </p>
                    </div>
                  </CardContent>
                  <CardContent>
                    {loginUser.is_superuser === true && (
                      <div className="flex justify-end">
                        <HoverCard openDelay={200}>
                          <HoverCardTrigger asChild>
                            <Button
                              // variant="ghost"
                              onClick={() => handleEditClick(user)}
                              className="cursor-pointer space-y-1.5 p-6 px-6 py-3 my-auto"
                            >
                              編集
                            </Button>
                          </HoverCardTrigger>
                          <HoverCardContent
                            side="top"
                            className="w-80 bg-black text-white"
                          >
                            <div className="flex justify-between gap-4">
                              <div className="text-[12px] m-2">
                                ユーザー情報を変更したい場合は、「編集」ボタンを押して、各フォームに入力して
                                <span className="font-bold">"保存"</span>{" "}
                                ボタンを押して下さい。
                              </div>
                            </div>
                          </HoverCardContent>
                        </HoverCard>
                      </div>
                    )}
                  </CardContent>
                </>
              )}
            </Card>
          ))}
        </>
      ) : (
        <>
          <p>登録されているユーザーはありません。</p>
        </>
      )}
    </div>
  );
}
