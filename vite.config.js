import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const contentFile = path.resolve(__dirname, "./src/data/portfolio.json");

// Temporary local persistence for the editor. This middleware exists only while
// `npm run dev` is running; Supabase will replace it in the next phase.
const localContentApi = () => ({
  name: "local-portfolio-content-api",
  configureServer(server) {
    server.middlewares.use("/api/portfolio-content", (req, res) => {
      if (req.method === "GET") {
        res.setHeader("Content-Type", "application/json");
        res.end(fs.readFileSync(contentFile, "utf8"));
        return;
      }

      if (req.method !== "PUT") {
        res.statusCode = 405;
        res.end("Method not allowed");
        return;
      }

      let body = "";
      req.on("data", (chunk) => {
        body += chunk;
      });
      req.on("end", () => {
        try {
          const content = JSON.parse(body);
          fs.writeFileSync(contentFile, `${JSON.stringify(content, null, 2)}\n`);
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ ok: true, content }));
        } catch {
          res.statusCode = 400;
          res.end(JSON.stringify({ ok: false, message: "Invalid JSON content." }));
        }
      });
    });
  },
});

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss(), localContentApi()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
