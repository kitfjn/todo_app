import { createCookieSessionStorage, redirect } from "react-router";
import type { Token } from "~/type/auth";

const sessionSecret = process.env.SESSION_SECRET || "default_secret_key";

if (!sessionSecret) {
  throw new Error("SESSION_SECRET must be set.");
}

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: "__session",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 1 week
    secrets: [sessionSecret],
  },
});

export async function createUserSession(token: Token, redirectPath: string) {
  const session = await sessionStorage.getSession();
  session.set("access_token", token?.access_token);
  session.set("refresh_token", token?.refresh_token);
  session.set("token_type", token?.token_type);
  return redirect(redirectPath, {
    headers: {
      "Set-Cookie": await sessionStorage.commitSession(session),
    },
  });
}
