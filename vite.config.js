import { defineConfig } from "vite";
import injectHTML from "vite-plugin-html-inject";

export default defineConfig({
  root: "src",

  base: "/My-Project-Cinemania/",

  build: {
    outDir: "../dist",
    rollupOptions: {
      input: {
        main: "src/index.html",
        catalog: "src/catalog.html",
        library: "src/my-library.html"
      }
    }
  },

  plugins: [injectHTML()]
});
