import { Link, Form } from "react-router";
import type { User } from "~/type/auth";
import { Button } from "./ui/button";
import { CommonLink } from "./CommonLink";

interface FooterProps {
  loginUser: User | null;
}

export function Footer({ loginUser }: FooterProps) {
  return (
    <footer className="bg-gray-800 text-white p-4 shadow-md w-full">
      <div className="container mx-auto flex justify-between items-center">
        <Link
          to="/"
          className="text-2xl font-bold text-white hover:text-gray-300"
        >
          Todo Application
        </Link>
        <CommonLink loginUser={loginUser} />
      </div>
      <div className="w-full mx-auto max-w-screen-xl p-4 md:flex md:items-center md:justify-between">
        <span className="text-sm text-gray-500 sm:text-center dark:text-gray-400">
          © 2025{" "}
          <a href="#" className="hover:underline">
            KITFJN™
          </a>
          . All Rights Reserved.
        </span>
      </div>
    </footer>
  );
}
