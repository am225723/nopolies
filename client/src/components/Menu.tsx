import { useMonopoly } from "@/lib/stores/useMonopoly";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { themes } from "@/data/themes";

export function Menu() {
  const { setPhase, setTheme } = useMonopoly();

  const handleThemeSelect = (themeKey: string) => {
    setTheme(themeKey);
    setPhase("theme_selection");
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-gradient-to-br from-green-900 via-green-700 to-emerald-600">
      <Card className="w-full max-w-4xl mx-4 p-8 bg-white/95 backdrop-blur">
        <div className="text-center mb-8">
          <h1 className="text-6xl font-bold mb-2 text-green-800" style={{ fontFamily: 'Oswald, sans-serif' }}>
            MONOPOLY
          </h1>
          <p className="text-xl text-gray-600">Personalized Edition</p>
        </div>

        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4 text-center">Choose Your Theme</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {Object.entries(themes).map(([key, theme]) => (
              <Card
                key={key}
                className="p-4 cursor-pointer hover:shadow-lg hover:scale-105 transition-all border-2 hover:border-green-500"
                onClick={() => handleThemeSelect(key)}
              >
                <h3 className="font-bold text-lg mb-2">{theme.name}</h3>
                <p className="text-sm text-gray-600">{theme.description}</p>
              </Card>
            ))}
          </div>
        </div>

        <div className="flex gap-4 justify-center">
          <Button
            onClick={() => setPhase("board_creator")}
            variant="outline"
            className="px-8 py-6 text-lg"
          >
            Create Custom Board
          </Button>
          <Button
            onClick={() => setPhase("token_creator")}
            variant="outline"
            className="px-8 py-6 text-lg"
          >
            AI Token Creator
          </Button>
        </div>
      </Card>
    </div>
  );
}
