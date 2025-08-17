import { logout } from "~/data/auth.server";
import type { Route } from "./+types/logout";

export async function action({ request }: Route.ActionArgs) {
  return await logout(request);
}
