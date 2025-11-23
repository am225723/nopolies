import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateGameToken } from "./ai-service";

export async function registerRoutes(app: Express): Promise<Server> {
  // Token generation endpoint
  app.post("/api/generate-token", async (req, res) => {
    try {
      const { prompt, theme } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }
      
      const tokenUrl = await generateGameToken(prompt, theme);
      res.json({ url: tokenUrl, success: true });
    } catch (error) {
      console.error("Token generation error:", error);
      res.status(500).json({ error: "Failed to generate token" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
