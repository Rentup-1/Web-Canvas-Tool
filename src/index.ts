import App from "./App";
import { buildTemplateFromJson } from "./components/Navbar/CanvasExportImport/MixerLogic";
import { addColor, addFont } from "./features/branding/brandingSlice";
import { setAspectRatio, setElements, setStageSize } from "./features/canvas/canvasSlice";

// test2
export default App;
export { buildTemplateFromJson, setAspectRatio, setElements, setStageSize, addColor, addFont };
