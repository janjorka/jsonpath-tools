import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default defineConfig({
    plugins: [
        dts({
            include: ["lib"],
            bundleTypes: true
        })
    ],
    build: {
        lib: {
            entry: {
                index: resolve(__dirname, "lib/index.ts"),
                bin: resolve(__dirname, "lib/bin.ts")
            },
            formats: ["es"]
        },
        rollupOptions: {
            external: [
                "@jsonpath-tools/jsonpath",
                "vscode-languageserver/node",
                "vscode-languageserver-textdocument"
            ],
            output: {
                paths: {
                    "vscode-languageserver/node": "vscode-languageserver/node.js"
                }
            }
        },
        copyPublicDir: false
    },
    define: {
        JSONPATH_TOOLS_VERSION: JSON.stringify(process.env.npm_package_version)
    }
});
