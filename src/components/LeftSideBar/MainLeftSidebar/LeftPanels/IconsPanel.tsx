import { useEffect, useState } from "react";
import { useAppDispatch } from "@/hooks/useRedux";
import { addElement } from "@/features/canvas/canvasSlice";

type IconItem = {
  name: string;
  path: string; // only one path
};

export function IconsPanel() {
  const [icons, setIcons] = useState<IconItem[]>([]);
  const [query, setQuery] = useState("home");
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!query.trim()) {
      setIcons([]);
      return;
    }

    const controller = new AbortController(); // controller for cancellation
    const { signal } = controller;

    (async () => {
      try {
        const res = await fetch(
          `https://api.iconify.design/search?query=${encodeURIComponent(
            query
          )}&limit=32`,
          { signal }
        );
        const data = await res.json();
        const results: string[] = data.icons || [];

        const filtered: IconItem[] = [];

        for (const fullName of results) {
          if (signal.aborted) return; // stop if aborted

          const [prefix, name] = fullName.split(":");
          if (!prefix || !name) continue;

          try {
            const metaRes = await fetch(
              `https://api.iconify.design/${prefix}.json?icons=${name}`,
              { signal }
            );
            if (!metaRes.ok) continue;

            const json = await metaRes.json();
            const iconData = json.icons?.[name];
            if (!iconData) continue;

            // Extract paths
            const paths = [...iconData.body.matchAll(/d="([^"]+)"/g)].map(
              (m) => m[1]
            );

            if (paths.length === 1) {
              filtered.push({
                name: fullName,
                path: paths[0],
              });
            }
          } catch (err) {
            if ((err as any).name === "AbortError") return; // ignore canceled
            console.error("Failed to fetch icon details:", fullName, err);
          }
        }

        if (!signal.aborted) {
          setIcons(filtered);
        }
      } catch (err) {
        if ((err as any).name === "AbortError") return;
        console.error("Search failed", err);
      }
    })();

    return () => {
      controller.abort(); // cancel request if query changes
    };
  }, [query]);

  return (
    <>
      <input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="w-full p-2 mb-3 border rounded"
        placeholder="Search Icons..."
      />
      <div className="grid grid-cols-3 gap-3">
        {icons.map((icon) => (
          <button
            key={icon.name}
            onClick={() =>
              dispatch(
                addElement({
                  type: "icon",
                  iconName: icon.name,
                  path: icon.path,
                })
              )
            }
            className="p-2 border rounded hover:bg-gray-500"
          >
            <img
              src={`https://api.iconify.design/${icon.name}.svg?color=%23dddddd`}
              alt={icon.name}
              className="w-8 h-8 mx-auto"
            />
          </button>
        ))}
      </div>
    </>
  );
}
