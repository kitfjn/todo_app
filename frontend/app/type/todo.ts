import type { UserWithTodo } from "./auth";

export type Todo = {
  id: string;
  title: string;
  description?: string;
  completed: boolean;
  limit_date: Date;
  created_at: string;
  updated_at: string;
  author_uuid: string;
  author: UserWithTodo;
};
