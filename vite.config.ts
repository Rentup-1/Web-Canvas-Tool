import { resolve } from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "src"), // 👈 This resolves @ to your src directory
    },
  },
  build: {
    lib: {
      // The entry point of your library
      entry: resolve(__dirname, "src/index.ts"),
      name: "TemplateDesigner", // A global variable name for the UMD build
      fileName: (format) => `design-tool.${format}.js`,
    },
    rollupOptions: {
      // Make sure to externalize deps that shouldn't be bundled
      // into your library (they are peer dependencies)
      external: ["react", "react-dom", "konva", "react-konva"],
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {
          react: "React",
          "react-dom": "ReactDOM",
          konva: "Konva",
          "react-konva": "ReactKonva",
        },
      },
    },
  },
});
