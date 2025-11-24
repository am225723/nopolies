import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateGameToken } from "./ai-service";
import { MultiplayerManager } from "./multiplayer";

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

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  const httpServer = createServer(app);

  // Initialize multiplayer manager
  const multiplayerManager = new MultiplayerManager(httpServer);

  // Multiplayer stats endpoint
  app.get("/api/multiplayer/stats", (_req, res) => {
    res.json({
      rooms: multiplayerManager.getRoomCount(),
      players: multiplayerManager.getPlayerCount(),
    });
  });

  return httpServer;
}
