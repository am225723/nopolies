import { useState } from "react";
import { useMonopoly } from "@/lib/stores/useMonopoly";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function TokenCreator() {
  const { setPhase, selectedTheme, addCustomToken, customTokens } = useMonopoly();
  const [prompt, setPrompt] = useState("");
  const [generating, setGenerating] = useState(false);
  const [generatedTokens, setGeneratedTokens] = useState<string[]>(customTokens);

  const handleGenerateToken = async () => {
    if (!prompt) return;
    
    setGenerating(true);
    try {
      const response = await fetch("/api/generate-token", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt, theme: selectedTheme })
      });
      
      if (response.ok) {
        const data = await response.json();
        setGeneratedTokens([...generatedTokens, data.url]);
      }
    } catch (error) {
      console.error("Failed to generate token:", error);
    } finally {
      setGenerating(false);
    }
  };

  const examplePrompts = [
    "A sleek sports car",
    "A wizard's hat",
    "A golden crown",
    "A spaceship",
    "A cute dog",
    "A magical wand"
  ];

  return (
    <div className="fixed inset-0 overflow-y-auto bg-gradient-to-br from-green-900 via-green-700 to-emerald-600">
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8 bg-white/95 backdrop-blur my-8">
          <Button
            onClick={() => setPhase("menu")}
            variant="ghost"
            className="mb-4"
          >
            ← Back to Menu
          </Button>

          <h1 className="text-4xl font-bold mb-2 text-center text-green-800">
            AI Token Creator
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Generate custom game pieces with AI
          </p>

          <div className="mb-6">
            <Label>Describe your game piece</Label>
            <div className="flex gap-2 mt-2">
              <Input
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="e.g., A golden vintage car"
                onKeyPress={(e) => e.key === "Enter" && handleGenerateToken()}
              />
              <Button
                onClick={handleGenerateToken}
                disabled={generating || !prompt}
                className="bg-green-600 hover:bg-green-700"
              >
                {generating ? "Generating..." : "Generate"}
              </Button>
            </div>
          </div>

          <div className="mb-6">
            <Label className="mb-2 block">Example prompts:</Label>
            <div className="flex flex-wrap gap-2">
              {examplePrompts.map((example) => (
                <Button
                  key={example}
                  variant="outline"
                  size="sm"
                  onClick={() => setPrompt(example)}
                >
                  {example}
                </Button>
              ))}
            </div>
          </div>

          {generatedTokens.length > 0 && (
            <div className="mb-6">
              <Label className="mb-2 block">Generated Tokens:</Label>
              <div className="grid grid-cols-3 gap-4">
                {generatedTokens.map((url, index) => (
                  <Card key={index} className="p-4">
                    <img
                      src={url}
                      alt={`Token ${index + 1}`}
                      className="w-full h-32 object-contain mb-2"
                    />
                    <Button
                      size="sm"
                      className="w-full"
                      onClick={() => {
                        // Save token to store
                        addCustomToken(url);
                        alert('Token saved! You can now use it in game setup.');
                      }}
                    >
                      Save Token
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}

          <div className="bg-blue-50 border border-blue-200 rounded p-4 mb-6">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> AI-generated tokens use Gemini image generation through Replit AI Integrations. 
              Usage is billed to your Replit credits.
            </p>
          </div>

          <Button
            onClick={() => setPhase("menu")}
            variant="outline"
            className="w-full"
          >
            Back to Menu
          </Button>
        </Card>
      </div>
    </div>
  );
}
