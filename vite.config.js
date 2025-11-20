import { defineConfig } from "vite";
import { glob } from "glob";
import injectHTML from "vite-plugin-html-inject";

export default defineConfig(({ command }) => {
  return {
    define: {
      [command === "serve" ? "global" : "_global"]: {},
    },
    root: "src", // Kök dizin 'src' olduğu için
    build: {
      outDir: "../dist", // DÜZELTME 1: Burası build'in hemen altında olmalı, rollupOptions içinde değil.
      emptyOutDir: true, // DÜZELTME 2: Kök dizin dışını temizlemek için bu izin gereklidir.
      sourcemap: true,
      rollupOptions: {
        input: glob.sync("./src/*.html"),
      },
    },
    plugins: [
      injectHTML(),
    ],
  };
});