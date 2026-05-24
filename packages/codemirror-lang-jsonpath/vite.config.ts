import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    base: "./",
    plugins: [
        dts({
            include: ["lib"],
            bundleTypes: true
        })
    ],
    build: {
        lib: {
            entry: resolve(__dirname, "lib/index.ts"),
            fileName: "index",
            name: "codemirror-lang-jsonpath"
        },
        rollupOptions: {
            external: [
                "@codemirror/autocomplete",
                "@codemirror/language",
                "@codemirror/lint",
                "@codemirror/state",
                "@codemirror/view",
                "@jsonpath-tools/jsonpath",
                "@lezer/common",
                "@lezer/lr",
                "@lezer/highlight",
                "@lezer/json",
                "markdown-it"
            ],
            output: {
                globals: {
                    "@codemirror/autocomplete": "codemirror_autocomplete",
                    "@codemirror/language": "codemirror_language",
                    "@codemirror/lint": "codemirror_lint",
                    "@codemirror/state": "codemirror_state",
                    "@codemirror/view": "codemirror_view",
                    "@jsonpath-tools/jsonpath": "jsonpath",
                    "@lezer/common": "lezer_common",
                    "@lezer/lr": "lezer_lr",
                    "@lezer/highlight": "lezer_highlight",
                    "@lezer/json": "lezer_json",
                    "markdown-it": "markdownit"
                }
            }
        },
        copyPublicDir: false
    }
});