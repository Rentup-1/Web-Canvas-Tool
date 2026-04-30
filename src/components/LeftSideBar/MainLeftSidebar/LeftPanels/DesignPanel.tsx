import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { BASE_API_URL } from "@/services/api";
import {
  useCreateTemplateMutation,
  useDeleteTemplateMutation,
  type TemplateData,
  useGetTemplatesQuery,
} from "@/services/templateApi";
import { MoreHorizontalIcon, Loader2 } from "lucide-react";
import { addTemplateId } from "@/features/form/saveFormSlice";
import { useDispatch } from "react-redux";
import { useCanvas } from "@/context/CanvasContext";
import { useState } from "react";
import { Button } from "@/components/ui/Button";
import { toast } from "sonner";

const getTemplateUserId = (template: TemplateData): number | null => {
  const value = (template as TemplateData & { user?: unknown }).user;
  if (typeof value === "number") {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
};

const getCurrentUserId = (): number | null => {
  const value = localStorage.getItem("userId")?.trim();
  if (!value) {
    return null;
  }

  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : null;
};

export default function DesignPanel() {
  const [lang, setLang] = useState<"ar" | "en">("en");
  const { handleImport } = useCanvas();
  const currentUserId = getCurrentUserId();
  const {
    data: templates,
    isLoading: isTemplatesLoading,
    isFetching: isTemplatesFetching,
    refetch,
  } = useGetTemplatesQuery(lang);
  const [createTemplate, { isLoading: isCloning }] =
    useCreateTemplateMutation();
  const [deleteTemplate, { isLoading: isDeleting }] =
    useDeleteTemplateMutation();

  const handleDelete = async (templateID: number) => {
    await deleteTemplate(templateID);
    refetch();
  };
  const dispatch = useDispatch();
  const handleEdit = (templateID: number, jsonData: string) => {
    dispatch(addTemplateId(templateID));
    handleImport(jsonData);
  };

  const handleClone = async (template: TemplateData) => {
    const currentUserId = getCurrentUserId();

    if (!currentUserId) {
      toast.error("User context is missing. Please reopen from parent app.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("user", String(currentUserId));
      formData.append("name", `${template.name} (Copy)`);
      formData.append("group", template.group);
      formData.append("type", template.type);
      formData.append("category", template.category);
      template.tags.forEach((tag) => formData.append("tags", String(tag)));
      template.projects?.forEach((projectId) => {
        formData.append("projects", String(projectId));
      });
      formData.append("aspect_ratio", template.aspect_ratio);
      formData.append("lang", template.lang || lang);
      formData.append("raw_input", template.raw_input);
      formData.append("is_public", String(template.is_public));
      formData.append("default_primary", template.default_primary);
      formData.append(
        "default_secondary_color",
        template.default_secondary_color,
      );

      await createTemplate(formData).unwrap();
      toast.success("Template cloned successfully!");
      refetch();
    } catch (error) {
      console.error("Failed to clone template:", error);
      toast.error("Failed to clone template. Please try again.");
    }
  };

  if (isDeleting || isCloning) return <span>Processing...</span>;

  return (
    <div className="p-4 space-y-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-lg font-bold">Templates</h2>
        <div className="flex gap-2">
          <Button
            variant={lang === "en" ? "default" : "outline"}
            onClick={() => setLang("en")}
            size="sm"
          >
            EN
          </Button>
          <Button
            variant={lang === "ar" ? "default" : "outline"}
            onClick={() => setLang("ar")}
            size="sm"
          >
            AR
          </Button>
        </div>
      </div>

      {isTemplatesLoading || isTemplatesFetching ? (
        <div className="flex justify-center items-center py-10">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4">
          {templates?.map((template) => {
            const templateUserId = getTemplateUserId(template);
            const canEdit =
              currentUserId !== null && templateUserId === currentUserId;

            return (
              <li
                key={template.id}
                className="border p-2 rounded shadow relative"
              >
                <DropdownMenu>
                  <DropdownMenuTrigger className="p-2 absolute top-2 right-2">
                    <MoreHorizontalIcon className="w-5 h-5" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleDelete(template.id)}>
                      Delete
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleClone(template)}>
                      Clone
                    </DropdownMenuItem>
                    {canEdit && (
                      <DropdownMenuItem
                        onClick={() =>
                          handleEdit(template.id, template.raw_input)
                        }
                      >
                        Edit
                      </DropdownMenuItem>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                <img
                  src={
                    template.icon
                      ? `${BASE_API_URL}${template.icon}`
                      : `https://placehold.co/500x500.png?text=${encodeURIComponent(
                          template.name,
                        )}`
                  }
                  alt={template.name}
                  className="w-full h-auto mb-2 rounded bg-white object-cover"
                />
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
