import React, { useState } from "react";
import { Form, Link, redirect, useActionData } from "react-router";
import { getLoginUser, login } from "~/data/auth.server";
import { createUserSession } from "~/data/session.server";
import type { Route } from "./+types/login";
import z from "zod";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import { Input } from "~/components/ui/input";

const API_BASE_URL = "http://localhost:8000/api/v1";

// validation
const LoginFormValidation = z.object({
  email: z.string().min(1, { message: "Input your email address." }),
  password: z.string().min(8, { message: "Password length is 8 at least." }),
});

// action
export async function action({ request }: Route.ActionArgs) {
  const formData = Object.fromEntries(await request.formData());

  const validationResult = LoginFormValidation.safeParse(formData);
  const email = validationResult.data?.email?.toString();
  const password = validationResult.data?.password?.toString();

  try {
    const token = await login({ email, password });
    const user = await getLoginUser(token.access_token);
    return createUserSession(token, "/");
  } catch (error: unknown) {
    return {
      errors: `ログインに失敗しました（${error}）`,
      global: "Failed login.",
    };
  }
}

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const actionData = useActionData() as { error?: string };

  return (
    <div className="w-[500px] mx-auto my-[150px]">
      <Card className="w-[500px] mx-auto">
        <CardHeader>
          <CardTitle className="mx-auto">ログイン</CardTitle>
        </CardHeader>
        <CardContent>
          <Form method="post" className="mt-4">
            {actionData?.error && (
              <div
                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4"
                role="alert"
              >
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {actionData.error}</span>
              </div>
            )}
            <div className="grid max-w-[400px] mx-auto items-center gap-4">
              <Label
                className="block text-gray-700 dark:text-gray-300"
                htmlFor="email"
              >
                メールアドレス
              </Label>
              <Input
                type="email"
                placeholder="Email"
                name="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 m-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                required
              />
            </div>
            <div className="grid max-w-[400px] mx-auto items-center gap-4">
              <Label
                className="block text-gray-700 dark:text-gray-300"
                htmlFor="password"
              >
                パスワード
              </Label>
              <Input
                type="password"
                placeholder="Password"
                name="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                required
              />
            </div>
            <div className="flex items-baseline justify-center">
              <Button type="submit" className="cursor-pointer px-6 py-2 mt-4 ">
                ログイン
              </Button>
            </div>
          </Form>
        </CardContent>
        <div className="flex justify-center">
          <Link to="/signup" className="mt-2 text-sm hover:text-blue-500">
            Create your account?
          </Link>
        </div>
      </Card>
      <div className="text-center mt-3">
        <p className="text-sm">【Development Information】</p>
        <p className="text-sm">
          test user email:{" "}
          <span className="text-blue-700">test@example.com</span>
        </p>
        <p className="text-sm">
          test user password: <span className="text-blue-700">testtest</span>
        </p>
      </div>
    </div>
  );
}
