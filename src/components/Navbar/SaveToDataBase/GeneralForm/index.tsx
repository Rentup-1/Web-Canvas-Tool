"use client";

import { Button } from "@/components/ui/Button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCanvas } from "@/context/CanvasContext";
import { addTemplateId } from "@/features/form/saveFormSlice";
import { useAppSelector } from "@/hooks/useRedux";
import {
  type ProjectData,
  useLazyGetProjectsQuery,
} from "@/services/projectsApi";
import {
  useCreateTemplateMutation,
  useGetTemplateQuery,
  useUpdateTemplateMutation,
} from "@/services/templateApi";
import transformElementsKeys from "@/utils/transformElementKeys";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useDispatch } from "react-redux";
import { z } from "zod";
import { toast } from "sonner";
import ReactSelect from "react-select";
import type { StylesConfig } from "react-select";

// Define the form schema with stricter validation
const formSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  group: z.string().min(1, "Group cannot be empty"),
  type: z.enum(["default", "customized", "branded"], {
    required_error: "Type cannot be empty",
  }),
  category: z.enum([
    "commercial_ads",
    "commercial_ads_for_developers",
    "commercial_ads_for_project",
    "seasonal_posts",
    "special_events",
  ]),
  tags: z.array(z.number()),
  projects: z.array(z.number()),
  aspect_ratio: z.enum(["SQUARE", "VERTICAL", "HORIZONTAL"]),
  lang: z.enum(["en", "ar"]),
  raw_input: z.string().refine(
    (value) => {
      try {
        JSON.parse(value);
        return true;
      } catch {
        return false;
      }
    },
    { message: "Raw input must be valid JSON" },
  ),
  is_public: z.boolean(),
  default_primary: z.string().regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  default_secondary_color: z
    .string()
    .regex(/^#[0-9A-Fa-f]{6}$/, "Invalid hex color"),
  icon: z.instanceof(File).optional(), // Icon is a File, not a string
});

type FormValues = z.infer<typeof formSchema>;

type ProjectOption = {
  value: number;
  label: string;
};

const getProjectSelectStyles = (
  isDarkMode: boolean,
): StylesConfig<ProjectOption, true> => ({
  control: (base, state) => ({
    ...base,
    minHeight: 40,
    backgroundColor: isDarkMode ? "#151515" : "#ffffff",
    borderColor: state.isFocused
      ? isDarkMode
        ? "#383838"
        : "#9ca3af"
      : isDarkMode
        ? "#383838"
        : "#d1d5db",
    boxShadow: "none",
    ":hover": {
      borderColor: state.isFocused
        ? isDarkMode
          ? "#383838"
          : "#9ca3af"
        : isDarkMode
          ? "#383838"
          : "#9ca3af",
    },
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: isDarkMode ? "#151515" : "#ffffff",
    border: `1px solid ${isDarkMode ? "#383838" : "#e5e7eb"}`,
    zIndex: 50,
  }),
  singleValue: (base) => ({
    ...base,
    color: isDarkMode ? "#f3f4f6" : "#151515",
  }),
  input: (base) => ({
    ...base,
    color: isDarkMode ? "#f3f4f6" : "#151515",
  }),
  placeholder: (base) => ({
    ...base,
    color: isDarkMode ? "#9ca3af" : "#6b7280",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isFocused
      ? isDarkMode
        ? "#1f2937"
        : "#f3f4f6"
      : isDarkMode
        ? "#151515"
        : "#ffffff",
    color: isDarkMode ? "#f3f4f6" : "#151515",
    cursor: "pointer",
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: isDarkMode ? "#2f2f2f" : "#e5e7eb",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: isDarkMode ? "#f9fafb" : "#151515",
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: isDarkMode ? "#d1d5db" : "#4b5563",
    ":hover": {
      backgroundColor: isDarkMode ? "#4b5563" : "#d1d5db",
      color: isDarkMode ? "#ffffff" : "#151515",
    },
  }),
  clearIndicator: (base) => ({
    ...base,
    color: isDarkMode ? "#9ca3af" : "#6b7280",
  }),
  dropdownIndicator: (base) => ({
    ...base,
    color: isDarkMode ? "#9ca3af" : "#6b7280",
  }),
});

export default function GeneralForm() {
  const isDarkMode = document.documentElement.classList.contains("dark");
  const templateId = useAppSelector((state) => state.saveForm.templateId);
  const {
    data: specificTemplateData,
    isLoading: isTemplateLoading,
    error: templateError,
  } = useGetTemplateQuery(templateId!, { skip: !templateId });
  const { stageRef } = useCanvas();
  const [createTemplate, { isLoading: isCreating }] =
    useCreateTemplateMutation();
  const [updateTemplate, { isLoading: isUpdating }] =
    useUpdateTemplateMutation();
  const [loadProjects] = useLazyGetProjectsQuery();
  const dispatch = useDispatch();
  const [projectOptions, setProjectOptions] = useState<ProjectOption[]>([]);
  const [isProjectsLoading, setIsProjectsLoading] = useState(false);
  const hasAuthContext = Boolean(localStorage.getItem("accessToken")?.trim());

  const elements = useAppSelector((state) => state.canvas.elements);
  const stageHeight = useAppSelector((state) => state.canvas.stageHeight);
  const stageWidth = useAppSelector((state) => state.canvas.stageWidth);
  const aspectRatio = useAppSelector((state) => state.canvas.aspectRatio);
  const brandingColors = useAppSelector((state) => state.branding.colors);
  const brandingFonts = useAppSelector((state) => state.branding.fontFamilies);
  // start frames handler

  useEffect(() => {
    let isActive = true;

    const loadAllProjects = async () => {
      if (!hasAuthContext) {
        setProjectOptions([]);
        setIsProjectsLoading(false);
        return;
      }

      setIsProjectsLoading(true);

      try {
        const collectedProjects: ProjectData[] = [];
        let nextPage: { next?: string | null } | void = undefined;

        while (true) {
          const response = await loadProjects(nextPage).unwrap();
          collectedProjects.push(...response.results);

          if (!response.next) {
            break;
          }

          nextPage = { next: response.next };
        }

        if (isActive) {
          setProjectOptions(
            collectedProjects.map((project) => ({
              value: project.id,
              label: project.name,
            })),
          );
        }
      } catch (error) {
        console.error("Failed to load projects:", error);
        if (isActive) {
          setProjectOptions([]);
        }
      } finally {
        if (isActive) {
          setIsProjectsLoading(false);
        }
      }
    };

    loadAllProjects();

    return () => {
      isActive = false;
    };
  }, [hasAuthContext, loadProjects]);

  const handleJSON = useCallback(() => {
    const keyMappingsByType = {
      text: {
        backgroundStrokeWidth: "borderWidth",
        backgroundStroke: "borderColor",
        dashed: "borderStyle",
      },
      frame: {
        dash: "borderStyle",
        strokeWidth: "borderWidth",
        stroke: "borderColor",
      },
    };

    const fallbackMapping = {
      stroke: "borderColor",
      strokeWidth: "borderWidth",
      backgroundStroke: "borderColor",
      backgroundStrokeWidth: "borderWidth",
      dashed: "borderStyle",
    };

    // Filter out image elements, keep only frames and other elements
    const filteredElements = elements.filter((el) => el.type !== "image");

    const exportData = {
      elements: transformElementsKeys(
        filteredElements,
        keyMappingsByType,
        fallbackMapping,
      ),
      stage: {
        height: stageHeight,
        width: stageWidth,
        aspectRatio: aspectRatio,
      },
      branding: {
        colors: brandingColors,
        fonts: brandingFonts,
      },
    };

    return JSON.stringify(exportData, null, 2);
  }, [
    elements,
    stageHeight,
    stageWidth,
    aspectRatio,
    brandingColors,
    brandingFonts,
  ]);

  // Convert RGBA to Hex
  const rgbaToHex = useCallback((color: string): string => {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);
    if (match) {
      const [r, g, b] = match.slice(1, 4).map(Number);
      return `#${[r, g, b]
        .map((x) => x.toString(16).padStart(2, "0"))
        .join("")}`;
    }
    return color.startsWith("#") ? color : "#000000";
  }, []);

  // Capture Konva stage as PNG
  const captureStageAsPNG = useCallback(async (): Promise<File | null> => {
    if (!stageRef?.current) {
      return null;
    }

    try {
      const dataURL = stageRef.current.toDataURL({
        mimeType: "image/png",
        quality: 0.8, // Increased quality for better previews
        pixelRatio: 2, // Higher resolution for clarity
      });

      const response = await fetch(dataURL);
      const blob = await response.blob();
      return new File([blob], "stage-preview.png", { type: "image/png" });
    } catch (error) {
      console.error("Failed to capture stage as PNG:", error);
      return null;
    }
  }, [stageRef]);

  // Initialize form with react-hook-form
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      group: "",
      type: "default",
      category: "commercial_ads",
      tags: [],
      projects: [],
      aspect_ratio: "SQUARE",
      raw_input: handleJSON(),
      is_public: true,
      lang: "en",
      default_primary: rgbaToHex(brandingColors?.primary || "#000000"),
      default_secondary_color: rgbaToHex(
        brandingColors?.secondary || "#ffffff",
      ),
      icon: undefined,
    },
  });

  // Reset form ONLY when a different template is loaded (not on every canvas change)
  useEffect(() => {
    if (specificTemplateData) {
      form.reset({
        name: specificTemplateData.name || "",
        group: specificTemplateData.group || "",
        type: ["default", "customized", "branded"].includes(
          specificTemplateData.type,
        )
          ? (specificTemplateData.type as "default" | "customized" | "branded")
          : "default",
        category: [
          "commercial_ads",
          "commercial_ads_for_developers",
          "commercial_ads_for_project",
          "seasonal_posts",
          "special_events",
        ].includes(specificTemplateData.category)
          ? (specificTemplateData.category as
              | "commercial_ads"
              | "commercial_ads_for_developers"
              | "commercial_ads_for_project"
              | "seasonal_posts"
              | "special_events")
          : "commercial_ads",
        tags: specificTemplateData.tags || [],
        projects: specificTemplateData.projects || [],
        is_public: specificTemplateData.is_public ?? true,
        raw_input: handleJSON(),
        aspect_ratio: "SQUARE",
        lang: ["en", "ar"].includes(specificTemplateData.lang as string)
          ? (specificTemplateData.lang as "en" | "ar")
          : "en",
        default_primary: rgbaToHex(brandingColors?.primary || "#000000"),
        default_secondary_color: rgbaToHex(
          brandingColors?.secondary || "#ffffff",
        ),
        icon: undefined,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [specificTemplateData]); // Only reset when template data changes, NOT on canvas changes

  // Update raw_input separately when canvas elements change (without resetting other fields)
  useEffect(() => {
    form.setValue("raw_input", handleJSON(), { shouldDirty: false });
  }, [handleJSON, form]);

  // // Handle tag toggling
  // const toggleTag = useCallback(
  //   (tagId: number) => {
  //     const currentTags = form.getValues("tags");
  //     form.setValue(
  //       "tags",
  //       currentTags.includes(tagId)
  //         ? currentTags.filter((id) => id !== tagId)
  //         : [...currentTags, tagId],
  //     );
  //   },
  //   [form],
  // );

  // // Get tag by ID
  // const getTagById = useCallback(
  //   (id: number) => frameTags?.find((tag) => tag.id === id),
  //   [frameTags],
  // );

  // Form submission handler
  const onSubmit = useCallback(
    async (values: FormValues, actionType: "addNew" | "update") => {
      if (!hasAuthContext) {
        toast.error("Authentication is required before saving templates.");
        return;
      }

      const userId = localStorage.getItem("userId")?.trim() || "";
      console.log(userId);

      try {
        const formData = new FormData();
        formData.append("user", userId);
        formData.append("name", values.name);
        formData.append("group", values.group);
        formData.append("type", values.type);
        formData.append("category", values.category);
        values.tags.forEach((tag) => formData.append("tags", tag.toString()));
        formData.append("aspect_ratio", values.aspect_ratio);
        formData.append("lang", values.lang);
        formData.append("raw_input", values.raw_input);
        formData.append("is_public", values.is_public.toString());
        formData.append("default_primary", values.default_primary);
        formData.append(
          "default_secondary_color",
          values.default_secondary_color,
        );
        values.projects.forEach((projectId) => {
          formData.append("projects", String(projectId));
        });
        const iconFile = await captureStageAsPNG();
        if (iconFile) {
          formData.append("icon", iconFile);
        }
        let response;
        if (actionType === "addNew") {
          response = await createTemplate(formData).unwrap();
          dispatch(addTemplateId(response.id));
          toast.success("Template created successfully!");
        } else if (templateId || actionType === "update") {
          response = await updateTemplate({
            id: templateId as number,
            data: formData,
          }).unwrap();
          toast.success(
            "Template updated successfully! Now you can update frames and texts.",
          );
        } else {
          throw new Error("Template ID is missing for update action");
        }

        dispatch(addTemplateId(response.id));
      } catch (error) {
        console.error("Failed to submit template:", error);
        toast.error("Failed to save template. Please try again.");
      }
    },
    [
      hasAuthContext,
      captureStageAsPNG,
      createTemplate,
      updateTemplate,
      dispatch,
      templateId,
    ],
  );

  // Handle preview capture (for debugging)
  const handleCapturePreview = useCallback(async () => {
    const file = await captureStageAsPNG();
    if (file) {
      const url = URL.createObjectURL(file);
      const link = document.createElement("a");
      link.href = url;
      link.download = "stage-preview.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, [captureStageAsPNG]);

  // Loading state
  if (isTemplateLoading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        <p>Loading...</p>
      </div>
    );
  }

  // Error state
  if (templateError) {
    return (
      <div className="p-4 text-red-500">
        Failed to load template data. Please try again.
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-6">General Form</h1>

      {/* Preview capture button (for debugging, consider removing in production) */}
      <Button
        type="button"
        variant="outline"
        onClick={handleCapturePreview}
        className="mb-4"
      >
        Preview Stage Capture
      </Button>

      <Form {...form}>
        {!hasAuthContext && (
          <div className="mb-4 rounded-md border border-yellow-300 bg-yellow-50 p-3 text-sm text-yellow-800">
            You are not authenticated. Open this tool from the parent app so
            your access token is passed, then try saving again.
          </div>
        )}

        <form
          onSubmit={(e) => {
            e.preventDefault();
            const submitEvent = e.nativeEvent as SubmitEvent;
            const actionType =
              (submitEvent.submitter as HTMLButtonElement)?.name || "addNew";
            form.handleSubmit((values) =>
              onSubmit(values, actionType as "addNew" | "update"),
            )(e);
          }}
          className="space-y-8"
        >
          <div className="flex gap-4 w-full">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Name <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Template Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="group"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Group <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter group name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex gap-4 w-full">
            <FormField
              control={form.control}
              name="aspect_ratio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Aspect Ratio <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select aspect ratio" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="SQUARE">Square</SelectItem>
                      <SelectItem value="VERTICAL">Vertical</SelectItem>
                      <SelectItem value="HORIZONTAL">Horizontal</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="lang"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    lang <span className="text-red-500">*</span>
                  </FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select lang" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ar">Arabic</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="projects"
            render={({ field }) => {
              const selectedProjects = projectOptions.filter((project) =>
                (field.value || []).includes(project.value),
              );

              return (
                <FormItem>
                  <FormLabel>Projects</FormLabel>
                  <FormControl>
                    <ReactSelect<ProjectOption, true>
                      isMulti
                      isClearable
                      isDisabled={!hasAuthContext}
                      isLoading={isProjectsLoading}
                      styles={getProjectSelectStyles(isDarkMode)}
                      options={projectOptions}
                      value={selectedProjects}
                      onChange={(selected) =>
                        field.onChange(selected.map((item) => item.value))
                      }
                      placeholder="Search and select projects"
                      className="text-sm"
                      classNamePrefix="react-select"
                    />
                  </FormControl>
                  <FormDescription>
                    Search by project name and select one or more projects.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <div className="flex gap-4 w-full">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="default">Default</SelectItem>
                      <SelectItem value="customized">Custom</SelectItem>
                      <SelectItem value="branded">Branded</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="commercial_ads">
                        Commercial Ads
                      </SelectItem>
                      <SelectItem value="commercial_ads_for_developers">
                        Commercial Ads for Developers
                      </SelectItem>
                      <SelectItem value="commercial_ads_for_project">
                        Commercial Ads for Project
                      </SelectItem>
                      <SelectItem value="seasonal_posts">
                        Seasonal Posts
                      </SelectItem>
                      <SelectItem value="special_events">
                        Special Events
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* <FormField
            control={form.control}
            name="tags"
            render={() => (
              <FormItem>
                <FormLabel>Tags</FormLabel>
                <FormDescription>
                  Click tags to add or remove them from your template
                </FormDescription>
                <div className="flex flex-wrap gap-2 mb-3">
                  {form.watch("tags").map((tagId) => {
                    const tag = getTagById(tagId);
                    return tag ? (
                      <Badge
                        key={tagId}
                        variant="secondary"
                        className="flex items-center gap-1 cursor-pointer"
                        onClick={() => toggleTag(tagId)}
                      >
                        {tag.tag}
                        <X className="h-3 w-3" />
                      </Badge>
                    ) : null;
                  })}
                </div>
                <div className="flex flex-wrap gap-2">
                  {frameTags?.map(
                    (tag) =>
                      !form.watch("tags").includes(tag.id) && (
                        <Badge
                          key={tag.id}
                          variant="outline"
                          className="cursor-pointer"
                          onClick={() => toggleTag(tag.id)}
                        >
                          {tag.tag}
                        </Badge>
                      ),
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          /> */}

          <FormField
            control={form.control}
            name="raw_input"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Raw Input</FormLabel>
                <FormControl>
                  <textarea
                    placeholder="Enter raw input data..."
                    className="flex min-h-28 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Enter any raw input data or configuration for your template
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="is_public"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Make this template public</FormLabel>
                  <FormDescription>
                    Public templates can be viewed and used by other users
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="default_primary"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Primary Color</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Input type="color" {...field} className="w-16 h-10" />
                      <Input {...field} placeholder="#000000" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="default_secondary_color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Default Secondary Color</FormLabel>
                  <FormControl>
                    <div className="flex items-center space-x-2">
                      <Input type="color" {...field} className="w-16 h-10" />
                      <Input {...field} placeholder="#ffffff" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="flex gap-2">
            <Button
              type="submit"
              className="flex-1"
              disabled={isCreating || isUpdating || !hasAuthContext}
              name="addNew"
            >
              {isCreating
                ? "Submitting..."
                : templateId
                  ? "Add As New"
                  : "Submit Template"}
            </Button>
            {templateId && (
              <Button
                type="submit"
                className="flex-1"
                disabled={isCreating || isUpdating || !hasAuthContext}
                variant="secondary"
                name="update"
              >
                {isUpdating ? "Updating..." : "Update Template"}
              </Button>
            )}
          </div>
        </form>
      </Form>
    </div>
  );
}
