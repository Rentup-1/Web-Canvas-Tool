import { Button } from "@/components/ui/Button";
import { addElement } from "@/features/canvas/canvasSlice";
import { useAppDispatch } from "@/hooks/useRedux";
import { useGetAllTextLabelsQuery } from "@/services/textLabelsApi";
import { useState } from "react";

export function TextPanel() {
  const dispatch = useAppDispatch();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<"en" | "ar">("en");
  const { data: allLabels, isLoading, error } = useGetAllTextLabelsQuery();

  const filteredLabels = allLabels?.filter((item) => {
    const example =
      selectedLanguage === "en" ? item.example_en : item.example_ar;
    return (
      (example?.toLowerCase() || "").includes(searchTerm.toLowerCase()) ||
      (item.label?.toLowerCase() || "").includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div>
      <Button
        onClick={() =>
          dispatch(addElement({ type: "text", text: "Edit Me Now..." }))
        }
      >
        Add Text
      </Button>

      <input
        type="text"
        placeholder="Search examples..."
        className="mt-4 p-2 border rounded w-full"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Language Tabs */}
      <div className="flex gap-2 mt-4">
        <Button
          variant={selectedLanguage === "en" ? "default" : "outline"}
          onClick={() => setSelectedLanguage("en")}
          className="flex-1"
        >
          EN
        </Button>
        <Button
          variant={selectedLanguage === "ar" ? "default" : "outline"}
          onClick={() => setSelectedLanguage("ar")}
          className="flex-1"
        >
          AR
        </Button>
      </div>

      <div className="mt-4">
        {isLoading && <p>Loading...</p>}
        {error && <p>Error loading labels</p>}

        {filteredLabels && filteredLabels.length > 0 ? (
          filteredLabels.map((item) => {
            const example =
              selectedLanguage === "en" ? item.example_en : item.example_ar;
            return example ? (
              <div
                key={item.id}
                className="mb-2 p-2 cursor-pointer border rounded hover:bg-gray-100 hover:text-black "
              >
                <p
                  onClick={() =>
                    dispatch(
                      addElement({
                        type: "text",
                        text: example,
                        toi_labels: item.label,
                      }),
                    )
                  }
                >
                  {example}
                </p>
              </div>
            ) : null;
          })
        ) : (
          <p>No result found</p>
        )}
      </div>
    </div>
  );
}
