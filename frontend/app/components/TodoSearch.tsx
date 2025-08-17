import { useState } from "react";

interface TodoSearchProps {
  query: string;
  setQuery: React.Dispatch<React.SetStateAction<string>>;
  setSearchParams: (params: { query?: string }) => void;
}

export default function TodoSearch({
  query,
  setQuery,
  setSearchParams,
}: TodoSearchProps) {
  // 日本語入力中の常置を管理するステート
  const [isComposing, setIsComposing] = useState<boolean>(false);

  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    // 日本語入力中ではない、またはIME変換が終了した場合のみ検索を実行
    if (!isComposing) {
      setSearchParams(event.target.value ? { query: event.target.value } : {});
    }
    // queryステートを直接更新し、入力内容をUIに反映
    setQuery(event.target.value);
  };

  return (
    <div className="mb-6">
      <label
        htmlFor="search"
        className="text-xl block font-medium text-gray-700 dark:text-gray-300 mb-1"
      >
        Todo検索
      </label>
      <input
        type="text"
        id="search"
        placeholder="タイトルまたは説明欄に含まれるキーワードを検索します"
        value={query}
        onChange={handleSearchChange}
        onCompositionStart={() => setIsComposing(true)}
        onCompositionEnd={(e) => {
          setIsComposing(false);
          // 日本語入力完了後、onComositionEndでもフィルタリングを実行
          setSearchParams(
            e.currentTarget.value ? { query: e.currentTarget.value } : {}
          );
        }}
        className="mt-1 block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-gray-50 dark:bg-gray-700 dark:text-white"
      />
    </div>
  );
}
