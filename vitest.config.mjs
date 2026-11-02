import { fileURLToPath } from "node:url";
import { transformAsync, types } from "@babel/core";
import { defineConfig } from "vitest/config";

const libPath = fileURLToPath(new URL("./lib/", import.meta.url));
const testPath = fileURLToPath(new URL("./test/", import.meta.url));

export default defineConfig({
  plugins: [
    {
      name: "inkdrop-test-source",
      enforce: "pre",
      transform(code, id) {
        if (!id.endsWith(".js") || (!id.startsWith(libPath) && !id.startsWith(testPath))) {
          return;
        }

        return transformAsync(code, {
          filename: id,
          babelrc: false,
          configFile: false,
          sourceMaps: true,
          presets: [["@babel/preset-react", { runtime: "classic" }]],
          plugins: [
            // Inkdrop の import と module.exports の混在をテスト時だけ ESM に変換する。
            () => ({
              visitor: {
                AssignmentExpression(path) {
                  if (types.matchesPattern(path.node.left, "module.exports")) {
                    path.parentPath.replaceWith(types.exportDefaultDeclaration(path.node.right));
                  }
                },
              },
            }),
          ],
        });
      },
    },
  ],
  resolve: {
    alias: {
      inkdrop: fileURLToPath(new URL("./test/mocks/inkdrop.js", import.meta.url)),
    },
  },
  test: {
    environment: "jsdom",
    globals: true,
    include: ["test/**/*.test.js"],
    setupFiles: ["./test/setup.js"],
    clearMocks: true,
    restoreMocks: true,
    coverage: {
      provider: "v8",
      include: ["lib/**/*.js"],
    },
  },
});
