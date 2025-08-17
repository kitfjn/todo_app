import { Button } from "./ui/button";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
}: ConfirmDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* 背景のオーバーレイ */}
      <div className="fixed inset-0 bg-black opacity-50" onClick={onClose} />

      {/* ダイアログパネル */}
      <div className="relative z-10 w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
        <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        <div className="mt-2 text-sm text-gray-500">{message}</div>

        <div className="mt-4 flex justify-end space-x-2">
          <Button
            type="button"
            className="cursor-pointer rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-white hover:text-black hover:bg-gray-100"
            onClick={onClose}
          >
            キャンセル
          </Button>
          <Button
            type="button"
            className="cursor-pointer rounded-md border border-transparent px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
            onClick={onConfirm}
          >
            削除
          </Button>
        </div>
      </div>
    </div>
  );
}
