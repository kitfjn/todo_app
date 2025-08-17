import { Form, Link } from "react-router";
import type { User } from "~/type/auth";
import { Button } from "./ui/button";

interface LinkProps {
  loginUser: User | null;
}

export function CommonLink({ loginUser }: LinkProps) {
  return (
    <nav>
      <ul className="flex space-x-4 items-center">
        {loginUser && loginUser.uuid && (
          <>
            <li>
              <Link to="/" className="hover:text-gray-300">
                Todos
              </Link>
            </li>
            <li>
              {loginUser?.is_superuser === true && (
                <Link to="/user/users">ユーザー一覧</Link>
              )}
            </li>
            <li>
              <Link
                to={`/user/${loginUser?.uuid}`}
                className="hover:text-gray-300"
              >
                {loginUser.username}さんのページ
              </Link>
            </li>
            <li>
              <Form action="/logout" method="post">
                <Button
                  type="submit"
                  // onClick={onLogout}
                  className="cursor-pointer hover:bg-red-500 border"
                  // className="px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                >
                  Logout
                </Button>
              </Form>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
