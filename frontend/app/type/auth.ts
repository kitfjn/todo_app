export type User = {
  id: number | undefined;
  uuid: string | undefined;
  username: string;
  email: string | undefined;
  is_active: boolean | undefined;
  is_superuser: boolean | undefined;
  created_at: Date;
  updated_at: Date;
  refresh_token: string | undefined;
};

export type UserWithTodo = {
  uuid: string;
  username: string;
};

export type Token = {
  access_token: string;
  refresh_token: string;
  token_type: string;
};

export type SignUpType = {
  email: string | undefined;
  password: string | undefined;
  username: string | undefined;
};

export type LoginType = {
  email: string | undefined;
  password: string | undefined;
};
