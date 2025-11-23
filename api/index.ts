import { generateGameToken } from "../server/ai-service";

export default async function handler(req: any, res: any) {
  // Handle CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const { url } = req;
    
    if (url === '/api/generate-token' && req.method === 'POST') {
      const { prompt, theme } = req.body;
      
      if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
      }
      
      const tokenUrl = await generateGameToken(prompt, theme);
      return res.json({ url: tokenUrl, success: true });
    }

    if (url === '/api/health' && req.method === 'GET') {
      return res.json({ status: "ok", timestamp: new Date().toISOString() });
    }

    return res.status(404).json({ error: "Not found" });
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}
