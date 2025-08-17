// components/DeleteButton.tsx
import { Form } from "react-router";
import { Button } from "./ui/button";

export default function DeleteUserButton({
  user_uuid,
}: {
  user_uuid: string | undefined;
}) {
  if (!user_uuid) {
    return null;
  }

  return (
    <Form method="post" action="/user/delete">
      <input type="hidden" name="user_uuid" value={user_uuid} />
      <Button
        type="submit"
        className="m-2 rounded-xl cursor-pointer px-4 py-2 hover:bg-red-600 hover:text-white"
      >
        DELETE
      </Button>
    </Form>
  );
}
