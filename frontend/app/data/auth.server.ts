import { redirect } from "react-router";
import type { LoginType, SignUpType, Token, User } from "~/type/auth";
import { sessionStorage } from "./session.server";

export async function login({ email, password }: LoginType) {
  try {
    const res = await fetch(
      `${process.env.API_ROOT_URL}/api/v1/auth/auth_token`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      }
    );

    if (!res.ok) {
      throw new Error("Request failed.");
    }

    const token: Token = await res.json();
    if (!token || !token.access_token) {
      throw new Error("No token returned from API.");
    } else {
      return token;
    }
  } catch (error: unknown) {
    throw new Error("Login failed.");
  }
}

export async function requireAccountSession(request: Request) {
  const token = await getTokenFromSession(request);

  const res = await getLoginUser(token?.access_token);
  return res;
}

export async function getTokenFromSession(request: Request) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );

  const access_token: string | undefined = session.get("access_token");
  const refresh_token: string | undefined = session.get("refresh_token");

  if (!access_token || !refresh_token) {
    return null;
  }

  return {
    access_token: access_token,
    refresh_token: refresh_token,
  };
}

export async function getLoginUser(
  access_token: string | undefined
): Promise<User | undefined> {
  try {
    const res = await fetch(`${process.env.API_ROOT_URL}/api/v1/auth/me`, {
      method: "GET",
      headers: {
        accept: "application/json",
        Authorization: `Bearer ${access_token}`,
      },
    });

    if (res.status === 401) {
      throw new Error("Unauthorized.");
    }

    if (!res.ok) {
      throw new Error("Failed to fetch user.");
    }

    return await res.json();
  } catch (error: unknown) {
    // redirect("/auth/signup")
    redirect("/login");
  }
}

export async function logout(request: Request) {
  const session = await sessionStorage.getSession(
    request.headers.get("Cookie")
  );
  return redirect("/login", {
    headers: {
      "Set-Cookie": await sessionStorage.destroySession(session),
    },
  });
  // return redirect("/auth/login")
}

export async function signup({ email, username, password }: SignUpType) {
  try {
    const res = await fetch(`${process.env.API_ROOT_URL}/api/v1/users/signup`, {
      method: "POST",
      headers: {
        accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, username, password }),
    });

    if (!res.ok) {
      throw new Error("Signup is failed.");
    }

    const token: Token = await res.json();
    if (!token || !token.access_token) {
      throw new Error("No token returned from API.");
    } else {
      return token;
    }
  } catch (error: unknown) {
    throw new Error(`${error}`);
  }
}

export async function getAllUser(
  access_token: string | undefined
): Promise<User[] | undefined> {
  const res = await fetch(`${process.env.API_ROOT_URL}/api/v1/users/all_user`, {
    method: "GET",
    headers: {
      accept: "application/json",
      // Authorization: `Bearer ${access_tokem}`,
    },
  });

  if (res.ok) {
    return res.json();
  } else if (res.status === 401) {
    throw new Error("Unauthorized.");
  } else {
    throw new Error("Unknown Error occured.");
  }
}

export async function getUserData(
  request: Request,
  user_uuid: string | undefined
): Promise<User | undefined> {
  const token = await getTokenFromSession(request);

  try {
    const res = await fetch(
      `${process.env.API_ROOT_URL}/api/v1/user/${user_uuid}`,
      {
        method: "GET",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token?.access_token}`,
        },
      }
    );

    if (res.status === 401) {
      throw new Error("Unauthorized.");
    }

    if (!res.ok) {
      throw new Error("Failed to fetch user data.");
    }

    return res.json();
  } catch (error: unknown) {
    // redirect("/auth/login")
    redirect("/login");
  }
}

export async function deleteUser(user_uuid: string | undefined) {
  try {
    const res = await fetch(
      `${process.env.API_ROOT_URL}/api/v1/user/delete_user/${user_uuid}`,
      {
        method: "DELETE",
        headers: {
          accept: "application/json",
        },
      }
    );

    if (res.status === 401) {
      throw new Error("Unauthorized.");
    }

    if (!res.ok) {
      throw new Error("Failed to delete user data.");
    }

    return res.json();
  } catch (error: unknown) {
    // redirect("/auth/login")
    redirect("/login");
  }
}

export async function updateUser(
  request: Request,
  user_uuid: string,
  username: string | undefined,
  email: string | undefined,
  is_active: boolean | undefined,
  is_superuser: boolean | undefined
): Promise<User | undefined> {
  const token = await getTokenFromSession(request);

  try {
    const res = await fetch(
      `${process.env.API_ROOT_URL}/api/v1/users/edit_user/${user_uuid}`,
      {
        method: "PATCH",
        headers: {
          accept: "application/json",
          // Authorization: `Bearer ${token?.access_token},
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: username,
          email: email,
          is_active: is_active,
          is_superuser: is_superuser,
        }),
      }
    );

    if (res.status === 401) {
      throw new Error("Unauthorized.");
    }

    if (!res.ok) {
      throw new Error("Failed to update user data.");
    }

    return res.json();
  } catch (error: unknown) {
    // redirect("/auth/login")
    redirect("/login");
  }
}

export async function ChangePassword(
  request: Request,
  user_uuid: string,
  current_password: string,
  new_password: string
) {
  const token = await getTokenFromSession(request);

  try {
    const res = await fetch(
      `${process.env.API_ROOT_URL}/api/v1/auth/change_password`,
      {
        method: "POST",
        headers: {
          accept: "application/json",
          Authorization: `Bearer ${token?.access_token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          current_password: current_password,
          new_password: new_password,
        }),
      }
    );

    if (res.status === 401) {
      throw new Error("Unauthorized.");
    }

    if (!res.ok) {
      throw new Error("Failed to change password.");
    }

    return res.json();
  } catch (error: unknown) {
    // redirect(`/user/${user_uuid}`)
    redirect("/login");
  }
}
