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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { X } from "lucide-react";
import { useAppSelector } from "@/hooks/useRedux";
import { useCreateTemplateMutation } from "@/services/templateApi";
import { useGetAllFrameTagsQuery } from "@/services/frameTagsApi";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/badge";
import transformElementsKeys from "@/utils/transformElementKeys";

const formSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name cannot exceed 50 characters"),
  group: z.string().min(1, "Group cannot be empty"),
  type: z.string().min(1, "Type cannot be empty"),
  category: z.string(),
  tags: z.array(z.number()),
  aspect_ratio: z.enum(["9:16", "1:1"]),
  raw_input: z.string(),
  is_public: z.boolean(),
  default_primary: z.string(),
  default_secondary_color: z.string(),
});

export default function GeneralForm() {
  function rgbaToHex(color: string): string {
    const match = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/i);

    if (match) {
      const [r, g, b] = match.slice(1, 4).map(Number);
      return (
        "#" + [r, g, b].map((x) => x.toString(16).padStart(2, "0")).join("")
      );
    }

    return color;
  }

  const elements = useAppSelector((state) => state.canvas.elements);
  const stageHeight = useAppSelector((state) => state.canvas.stageHeight);
  const stageWidth = useAppSelector((state) => state.canvas.stageWidth);
  const aspectRatio = useAppSelector((state) => state.canvas.aspectRatio);
  const brandingColors = useAppSelector((state) => state.branding.colors);
  const brandingFonts = useAppSelector((state) => state.branding.fontFamilies);

  const handleJSON = (): string => {
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
        fitMode: "objectFit",
      },
    };

    const fallbackMapping = {
      stroke: "borderColor",
      strokeWidth: "borderWidth",
      backgroundStroke: "borderColor",
      backgroundStrokeWidth: "borderWidth",
      dashed: "borderStyle",
    };

    const transformedElements = transformElementsKeys(
      elements,
      keyMappingsByType,
      fallbackMapping
    );

    const exportData = {
      elements: transformedElements,
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
  };

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      group: "",
      type: "",
      category: "",
      tags: [],
      aspect_ratio: aspectRatio,
      raw_input: handleJSON(),
      is_public: true,
      default_primary: rgbaToHex(brandingColors?.primary || "#000000"),
      default_secondary_color: rgbaToHex(
        brandingColors?.secondary || "#ffffff"
      ),
    },
  });

  const [createTemplate, { isLoading }] = useCreateTemplateMutation();
  const { data: frameTags } = useGetAllFrameTagsQuery();

  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log("Submitting values:", values);
      const response = await createTemplate(values).unwrap();
      console.log("Template created:", response);
    } catch (error) {
      console.error("Failed to create template:", error);
    }
  }

  const toggleTag = (tagId: number) => {
    const currentTags = form.getValues("tags");
    if (currentTags.includes(tagId)) {
      form.setValue(
        "tags",
        currentTags.filter((id) => id !== tagId)
      );
    } else {
      form.setValue("tags", [...currentTags, tagId]);
    }
  };

  const getTagById = (id: number) => {
    return frameTags?.find((tag) => tag.id === id);
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">General Form</h1>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 w-full"
        >
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
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
                <FormLabel>Group</FormLabel>
                <FormControl>
                  <Input placeholder="Enter group name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="type"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
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

          <FormField
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
                      )
                  )}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="aspect_ratio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Aspect Ratio</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select aspect ratio" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="9:16">9:16</SelectItem>
                    <SelectItem value="1:1">1:1</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="raw_input"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Raw Input</FormLabel>
                <FormControl>
                  <textarea
                    placeholder="Enter raw input data..."
                    className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
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

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Submit Template"}
          </Button>
        </form>
      </Form>
    </div>
  );
}
