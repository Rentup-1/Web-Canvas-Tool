import { addElement } from "@/features/canvas/canvasSlice";
import { useAppDispatch } from "@/hooks/useRedux";
import { Icon } from "@iconify/react";
import { useEffect, useState } from "react";

type IconItem = {
  name: string;
};

export function IconsPanel() {
  const [icons, setIcons] = useState<IconItem[]>([]);
  const [query, setQuery] = useState("home")
  const dispatch = useAppDispatch();

  useEffect(() => {
    fetch(`https://api.iconify.design/search?query=${query}&limit=20`)
      .then((res) => res.json())
      .then((data) => {
        const results = data.icons || [];
        setIcons(results.map((name: string) => ({ name })));
      })
      .catch((err) => {
        console.error("Failed to fetch icons:", err);
      });
  }, [query]);

  return (
    <>
        <div className="relative w-full max-w-md">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
                <svg
                className="w-5 h-5 text-gray-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
                </svg>
            </div>
            <input
                type="text"
                className="w-full py-2 pl-10 pr-4 text-gray-300 placeholder-gray-400 bg-gray-800 border border-gray-700 rounded-full focus:outline-none focus:ring-1 focus:ring-gray-600 focus:border-gray-600"
                placeholder="Search..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
            />
        </div>
        <div className="grid grid-cols-3 gap-3 p-4">
          {icons.map((icon) => (
            <button
              key={icon.name}
              className="flex flex-col items-center cursor-pointer justify-center text-sm p-2 border rounded hover:bg-gray-800"
              onClick={() => dispatch(addElement({ type: "icon" }))}
              >
              <Icon icon={icon.name} width={28} height={28} />
            </button>
          ))}
        </div>
    </>
  );
}
