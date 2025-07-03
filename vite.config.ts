import { defineConfig } from "vite";
import { resolve } from "path";
import dts from "vite-plugin-dts";

export default defineConfig({
   plugins: [
      dts({
         rollupTypes: true,
         tsconfigPath: "./tsconfig.app.json",
      }),
   ],
   resolve: {
      alias: {
         "@": resolve(__dirname, "src"),
      },
   },
   build: {
      lib: {
         entry: resolve(__dirname, "src/index.ts"),
         name: "curry-query",
         fileName: (format) => `curry-query-client.${format}.js`,
      },
      rollupOptions: {
         input: {
            main: resolve(__dirname, "src/index.ts"),
         },
      },
   },
});
