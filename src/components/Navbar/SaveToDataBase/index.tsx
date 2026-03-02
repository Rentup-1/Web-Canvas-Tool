import { Button } from "@/components/ui/Button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  // DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import GeneralForm from "./GeneralForm";
import FramesForm from "./FramesForm";
import TextsForm from "./TextsForm";

export function SaveToDataBase() {
  return (
    <Dialog defaultOpen={false}>
      <DialogTrigger asChild>
        <Button variant="default">Save</Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-2xl max-h-[85vh] flex flex-col overflow-hidden">
        <DialogHeader className="shrink-0 mb-2">
          <DialogTitle>Save Template</DialogTitle>
          <DialogDescription>
            Fill inputs with template data to save it. Click save when you're
            done.
          </DialogDescription>
        </DialogHeader>
        <Tabs
          defaultValue="general"
          className="w-full flex-1 flex flex-col min-h-0 overflow-hidden"
        >
          <TabsList className="grid w-full grid-cols-3 mb-4 shrink-0">
            <TabsTrigger value="general">General</TabsTrigger>
            <TabsTrigger value="frames">Template Frames</TabsTrigger>
            <TabsTrigger value="texts">Template Text Boxes</TabsTrigger>
          </TabsList>
          <TabsContent
            value="general"
            className="flex-1 overflow-y-auto mt-0 pr-2 pb-2"
          >
            <GeneralForm />
          </TabsContent>
          <TabsContent
            value="frames"
            className="flex-1 overflow-y-auto mt-0 pr-2 pb-2"
          >
            <FramesForm />
          </TabsContent>
          <TabsContent
            value="texts"
            className="flex-1 overflow-y-auto mt-0 pr-2 pb-2"
          >
            <TextsForm />
          </TabsContent>
        </Tabs>
        {/*         <DialogFooter>
          <Button type="submit">Save changes</Button>
        </DialogFooter> */}
      </DialogContent>
    </Dialog>
  );
}
