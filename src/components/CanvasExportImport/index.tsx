import type { FC } from "react";
import { FaFileImport, FaSave } from "react-icons/fa";
import { Button } from "../ui/Button";

const CanvasExportImport: FC = () => {
  return (
    <>
      <div className="flex flex-row items-center justify-center gap-2">
        <Button variant={"secondary"}>
          <FaFileImport className="mr-2" />
          Import
        </Button>
        <Button variant={"default"}>
          <FaSave className="mr-2" /> Export
        </Button>
      </div>
    </>
  );
};

export default CanvasExportImport;
