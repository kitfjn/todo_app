import { Link, Form } from "react-router";
import type { User } from "~/type/auth";
import { Button } from "./ui/button";
import { CommonLink } from "./CommonLink";

interface HeaderProps {
  loginUser: User | null;
}

export function Header({ loginUser }: HeaderProps) {
  return (
    <header className="fixed bg-gray-800 text-white p-4 shadow-md w-full">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl font-bold text-white hover:text-gray-300"
        >
          Todo Application
        </Link>
        <CommonLink loginUser={loginUser} />
      </div>
    </header>
  );
}
