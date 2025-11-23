import fs from "node:fs";
import path from "node:path";
import { type Server } from "node:http";
import { fileURLToPath } from "url";
import { dirname } from "path";

import express, { type Express } from "express";
import runApp, { log } from "./app";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export async function serveStatic(app: Express, _server: Server) {
  const distPath = path.resolve(__dirname, "public");

  log(`Serving static files from: ${distPath}`);

  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`,
    );
  }

  app.use(express.static(distPath));

  // fall through to index.html if the file doesn't exist
  app.use("*", (_req, res) => {
    res.set("Content-Type", "text/html");
    const indexPath = path.resolve(distPath, "index.html");
    if (fs.existsSync(indexPath)) {
       res.sendFile(indexPath);
    } else {
       log(`Error: index.html not found at ${indexPath}`);
       res.status(404).send("Not found");
    }
  });
}

(async () => {
  await runApp(serveStatic);
})();
