import { z } from "zod";
import { Form, Link } from "react-router";

// ui
import { Button } from "../components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Alert, AlertTitle } from "../components/ui/alert";

// type
import type { Route } from "./+types/login";

// server
import { getLoginUser, signup } from "../data/auth.server";
import { createUserSession } from "../data/session.server";

// meta
export function meta({}: Route.MetaArgs) {
  return [
    { title: "Signup" },
    {
      property: "og:title",
      content: "content",
    },
    { name: "description", content: "Login page" },
  ];
}

// validation
const LoginFormValidation = z.object({
  email: z.string().min(1, { message: "Input your email address." }),
  password: z.string().min(4, { message: "Password length is 4 at least." }),
  username: z.string().min(4, { message: "Username is too short." }),
});

// action
export async function action({ request }: Route.ActionArgs) {
  const formData = Object.fromEntries(await request.formData());

  const validationResult = LoginFormValidation.safeParse(formData);
  const email = validationResult.data?.email?.toString();
  const password = validationResult.data?.password?.toString();
  const username = validationResult.data?.username?.toString();

  try {
    const token = await signup({ email, password, username });
    console.log(token);
    const user = await getLoginUser(token.access_token);
    console.log(user);
    return createUserSession(token, `/user/${user?.uuid}`);
  } catch (error: unknown) {
    return {
      errors: `アカウントの作成が失敗しました（${error}）`,
      global: "Failed signin.",
    };
  }
}

export default function SignUp({ actionData }: Route.ComponentProps) {
  return (
    <div className="w-[500px] mx-auto my-[150px]">
      <Card className="w-[500px] mx-auto">
        <CardHeader>
          <CardTitle className="mx-auto">ユーザー登録</CardTitle>
          <CardDescription className="mx-auto">
            メールアドレスとユーザーネーム、パスワードを入力して、アカウントを作成します。
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form method="post">
            <div className="grid max-w-[400px] mx-auto items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="メールアドレス"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">ユーザーネーム</Label>
                <Input
                  id="username"
                  name="username"
                  type="username"
                  placeholder="ユーザーネーム"
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">パスワード</Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="パスワード"
                />

                {actionData && (
                  <Alert variant="destructive">
                    <AlertTitle className="h-3">{actionData.errors}</AlertTitle>
                  </Alert>
                )}
              </div>
              <div className="mt-2 flex justify-between">
                <Button asChild variant="link" className="hover:text-blue-500">
                  <Link to="/login">Already, you have an account ?</Link>
                </Button>
                <Button type="submit">登録</Button>
              </div>
            </div>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
