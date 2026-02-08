import { Button } from "../ui/Button";
import { Minus, Plus, RotateCcw } from "lucide-react";

interface ZoomControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onZoomReset: () => void;
  currentZoom: number;
}

export function ZoomControls({
  onZoomIn,
  onZoomOut,
  onZoomReset,
  currentZoom,
}: ZoomControlsProps) {
  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 flex flex-row gap-2 bg-background/95 backdrop-blur-sm p-2 rounded-lg shadow-lg border z-50">
      <Button
        variant="outline"
        size="icon"
        onClick={onZoomIn}
        title="Zoom In"
        aria-label="Zoom In"
      >
        <Plus />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onZoomReset}
        title="Reset Zoom"
        aria-label="Reset Zoom"
      >
        <RotateCcw />
      </Button>
      <Button
        variant="outline"
        size="icon"
        onClick={onZoomOut}
        title="Zoom Out"
        aria-label="Zoom Out"
      >
        <Minus />
      </Button>
      <div className="text-xs text-center text-muted-foreground px-3 py-2 min-w-[60px] flex items-center justify-center">
        {Math.round(currentZoom * 100)}%
      </div>
    </div>
  );
}
