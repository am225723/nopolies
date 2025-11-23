import { useMonopoly } from "@/lib/stores/useMonopoly";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { themes } from "@/data/themes";
import { useState } from "react";

export function ThemeSelection() {
  const { selectedTheme, players, setPhase, setProperties, addPlayer, removePlayer, updatePlayer } = useMonopoly();
  const [newPlayerName, setNewPlayerName] = useState("");

  const theme = selectedTheme ? themes[selectedTheme] : null;

  if (!theme) return null;

  const handleStartGame = () => {
    const propertiesWithIds = theme.properties.map((prop, idx) => ({
      ...prop,
      id: idx + 1,
      owner: null,
      houses: 0
    }));
    setProperties(propertiesWithIds);
    setPhase("playing");
  };

  const handleAddPlayer = () => {
    if (newPlayerName && players.length < 6) {
      const colors = ["#FF0000", "#0000FF", "#00FF00", "#FFFF00", "#FF00FF", "#00FFFF"];
      addPlayer({
        name: newPlayerName,
        color: colors[players.length],
        position: 0,
        money: 1500,
        properties: [],
        inJail: false
      });
      setNewPlayerName("");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-green-900 via-green-700 to-emerald-600">
      <Card className="w-full max-w-2xl mx-4 p-8 bg-white/95 backdrop-blur">
        <Button
          onClick={() => setPhase("menu")}
          variant="ghost"
          className="mb-4"
        >
          ← Back
        </Button>

        <h1 className="text-4xl font-bold mb-2 text-center text-green-800">
          {theme.name}
        </h1>
        <p className="text-center text-gray-600 mb-8">{theme.description}</p>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Players ({players.length}/6)</h2>
          <div className="space-y-2 mb-4">
            {players.map((player) => (
              <div key={player.id} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                <div className="flex items-center gap-3">
                  <div
                    className="w-8 h-8 rounded-full"
                    style={{ backgroundColor: player.color }}
                  />
                  <Input
                    value={player.name}
                    onChange={(e) => updatePlayer(player.id, { name: e.target.value })}
                    className="w-40"
                  />
                </div>
                {players.length > 2 && (
                  <Button
                    onClick={() => removePlayer(player.id)}
                    variant="ghost"
                    size="sm"
                    className="text-red-600"
                  >
                    Remove
                  </Button>
                )}
              </div>
            ))}
          </div>

          {players.length < 6 && (
            <div className="flex gap-2">
              <Input
                placeholder="Player name"
                value={newPlayerName}
                onChange={(e) => setNewPlayerName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleAddPlayer()}
              />
              <Button onClick={handleAddPlayer}>
                Add Player
              </Button>
            </div>
          )}
        </div>

        <div className="mb-6">
          <h3 className="font-bold mb-2">Property Preview</h3>
          <div className="max-h-48 overflow-y-auto bg-gray-50 p-4 rounded">
            <div className="grid grid-cols-2 gap-2 text-sm">
              {theme.properties.slice(0, 10).map((prop) => (
                <div key={prop.position}>• {prop.name}</div>
              ))}
            </div>
            {theme.properties.length > 10 && (
              <div className="text-center mt-2 text-gray-500">
                +{theme.properties.length - 10} more properties...
              </div>
            )}
          </div>
        </div>

        <Button
          onClick={handleStartGame}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
          disabled={players.length < 2}
        >
          Start Game
        </Button>
      </Card>
    </div>
  );
}
