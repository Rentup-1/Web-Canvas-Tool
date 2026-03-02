import { Button } from "@/components/ui/Button";
import { addElement } from "@/features/canvas/canvasSlice";
import { useAppDispatch } from "@/hooks/useRedux";
import { useGetAllTextLabelsQuery } from "@/services/textLabelsApi";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

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
                className="mb-3 p-3 cursor-pointer border border-border bg-card hover:bg-muted/80 hover:border-primary/70 hover:text-primary hover:shadow-md transition-all flex flex-col gap-2 group overflow-hidden rounded-lg shadow-sm"
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
                <div className="flex justify-between items-center w-full">
                  <Badge
                    variant="outline"
                    className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground border-border bg-muted/30"
                  >
                    {item.label}
                  </Badge>
                </div>
                <p className="text-sm font-medium text-card-foreground leading-relaxed break-words whitespace-pre-wrap w-full">
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
