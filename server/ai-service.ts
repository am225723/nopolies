// AI service for generating custom game tokens using Pollinations.ai
// This service generates unique images based on user prompts without requiring API keys

export async function generateGameToken(prompt: string, theme?: string): Promise<string> {
  try {
    // Construct a detailed prompt for the image generator
    const fullPrompt = `3D render of a monopoly board game token, ${prompt}, ${theme ? `theme: ${theme}, ` : ''}isometric view, shiny material, white background, high quality, miniature style`;
    
    // URL encode the prompt
    const encodedPrompt = encodeURIComponent(fullPrompt);
    
    // Use Pollinations.ai to generate the image
    // It returns the image directly, so we can just use the URL
    const imageUrl = `https://pollinations.ai/p/${encodedPrompt}?width=512&height=512&seed=${Math.floor(Math.random() * 1000)}`;
    
    console.log("Generated token URL:", imageUrl);
    
    return imageUrl;
    
  } catch (error) {
    console.error("Token generation error:", error);
    // Fallback to DiceBear if something goes wrong
    // Use btoa for browser compatibility instead of Buffer
    const tokenHash = btoa(prompt + (theme || '')).substring(0, 20);
    return `https://api.dicebear.com/7.x/shapes/svg?seed=${tokenHash}`;
  }
}
