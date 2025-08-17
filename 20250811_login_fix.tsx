import React, { useState } from "react";
import { Form, redirect, useActionData } from "react-router";
import { getLoginUser, login } from "~/data/auth.server";
import { createUserSession } from "~/data/session.server";
import type { Route } from "./+types/login";
import z from "zod";

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
    <div className="flex items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900">
      <div className="px-8 py-6 mt-4 text-left bg-white dark:bg-gray-800 shadow-lg rounded-lg">
        <h3 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          Login to your account
        </h3>
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
          <div className="mt-4">
            <div>
              <label
                className="block text-gray-700 dark:text-gray-300"
                htmlFor="email"
              >
                Email
              </label>
              <input
                type="email"
                placeholder="Email"
                name="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 mt-2 border rounded-md focus:outline-none focus:ring-1 focus:ring-blue-600 dark:bg-gray-700 dark:text-white dark:border-gray-600"
                required
              />
            </div>
            <div className="mt-4">
              <label
                className="block text-gray-700 dark:text-gray-300"
                htmlFor="password"
              >
                Password
              </label>
              <input
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
            <div className="flex items-baseline justify-between">
              <button
                type="submit"
                className="px-6 py-2 mt-4 text-white bg-blue-600 rounded-lg hover:bg-blue-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Login
              </button>
            </div>
          </div>
        </Form>
      </div>
    </div>
  );
}
