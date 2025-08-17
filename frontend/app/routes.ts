import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/todos.tsx"),
  route("login", "routes/login.tsx"),
  route("signup", "routes/signup.tsx"),
  route("logout", "routes/logout.tsx"),
  route("user/users", "user/users.tsx"),
  route("user/:user_uuid", "user/user_uuid.tsx"),
  route("todo/:todo_uuid", "todo/todo_uuid.tsx"),
] satisfies RouteConfig;
