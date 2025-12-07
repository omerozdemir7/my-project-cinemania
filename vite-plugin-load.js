

import fs from "fs";
import path from "path";

export default function loadPartials() {
  return {
    name: "vite-plugin-load",
    transformIndexHtml(html, ctx) {
     
      return html.replace(
        /<load src="(.*?)"\s*\/>/g,
        (_, srcPath) => {
          const filePath = path.resolve(ctx.filename, "..", srcPath);
          return fs.readFileSync(filePath, "utf8");
        }
      );
    }
  };
}
