// @ts-check
import { defineConfig } from "astro/config";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { reading } from "./src/config";
import { remarkMark } from "./src/features/post/remark-mark";
import remarkDirective from "remark-directive";
import { remarkGithubCard } from "./src/features/post/remark-github-card";

// https://astro.build/config
export default defineConfig({
  site: "https://halory-ito.github.io",
  integrations: [react()],
  vite: {
    plugins: [tailwindcss()],
  },
  markdown: {
    syntaxHighlight: "shiki",
    shikiConfig: {
      theme: reading.codeTheme,
    },
    remarkPlugins: [remarkMark, remarkDirective, remarkGithubCard],
  },
});
