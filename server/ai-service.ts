// AI service for generating custom game tokens using Google Gemini API
const GEMINI_API_KEY = "AIzaSyBIe4GwIk7V1snPyfSi1qKF4OZ0a-CEofQ";

export async function generateGameToken(prompt: string, theme?: string): Promise<string> {
  try {
    const fullPrompt = `Create a simple, iconic game piece token for a Monopoly board game. ${prompt}. Style: clean, 3D rendered, white background, suitable for a board game piece.${theme ? ` Theme: ${theme}` : ''}`;
    
    console.log("Generating token with prompt:", fullPrompt);
    
    // Use Google Gemini's text generation to create detailed descriptions
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Based on this description: "${fullPrompt}", create a detailed visual description of what this game token should look like. Be specific about colors, shapes, and style.`
          }]
        }]
      })
    });

    if (!geminiResponse.ok) {
      console.log("Gemini API not available, using fallback");
      const tokenHash = Buffer.from(prompt + (theme || '')).toString('base64').substring(0, 20);
      return `https://api.dicebear.com/7.x/shapes/svg?seed=${tokenHash}`;
    }

    const geminiData = await geminiResponse.json();
    const description = geminiData.candidates?.[0]?.content?.parts?.[0]?.text || "Game token";
    
    // Generate a unique token identifier based on the prompt and AI description
    const tokenHash = Buffer.from(prompt + description).toString('base64').substring(0, 20);
    
    // Use DiceBear API (free) to generate unique avatars based on the token hash
    // This creates a unique visual representation for each token
    return `https://api.dicebear.com/7.x/shapes/svg?seed=${tokenHash}`;
    
  } catch (error) {
    console.error("Token generation error:", error);
    // Fallback to a simple unique avatar generator (free)
    const tokenHash = Buffer.from(prompt + (theme || '')).toString('base64').substring(0, 20);
    return `https://api.dicebear.com/7.x/shapes/svg?seed=${tokenHash}`;
  }
}
