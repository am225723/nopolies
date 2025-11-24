import { useState } from 'react';
import { useMonopoly } from '@/lib/stores/useMonopoly';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface Token {
  id: string;
  name: string;
  icon: string;
  color: string;
}

const TOKENS: Token[] = [
  { id: 'car', name: 'Car', icon: '🚗', color: '#FF0000' },
  { id: 'ship', name: 'Ship', icon: '⛵', color: '#0066CC' },
  { id: 'hat', name: 'Hat', icon: '🎩', color: '#8B4513' },
  { id: 'dog', name: 'Dog', icon: '🐕', color: '#8B4513' },
  { id: 'thimble', name: 'Thimble', icon: '🧵', color: '#C0C0C0' },
  { id: 'boot', name: 'Boot', icon: '👢', color: '#654321' },
  { id: 'wheelbarrow', name: 'Wheelbarrow', icon: '🪣', color: '#8B4513' },
  { id: 'iron', name: 'Iron', icon: '⚡', color: '#808080' },
];

export function TokenSelection() {
  const [playerName, setPlayerName] = useState('');
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [playerCount, setPlayerCount] = useState(2);
  const { setPhase, addPlayer, setProperties, selectedTheme } = useMonopoly();

  const handleStartGame = () => {
    if (!playerName.trim() || !selectedToken) {
      alert('Please enter your name and select a token');
      return;
    }

    // Add the human player
    addPlayer({
      name: playerName,
      color: selectedToken,
      position: 0,
      money: 1500,
      properties: [],
      inJail: false,
    });

    // Add AI players
    for (let i = 2; i <= playerCount; i++) {
      const availableTokens = TOKENS.filter(t => t.id !== selectedToken && !TOKENS.slice(0, i-2).includes(t));
      const aiToken = availableTokens[Math.floor(Math.random() * availableTokens.length)];
      
      addPlayer({
        name: `Player ${i}`,
        color: aiToken.color,
        position: 0,
        money: 1500,
        properties: [],
        inJail: false,
      });
    }

    // Load properties for selected theme
    if (selectedTheme) {
      import('@/data/themes').then(({ themes }) => {
        const theme = themes[selectedTheme];
        if (theme) {
          const propertiesWithIds = theme.properties.map((p, index) => ({ 
            ...p, 
            id: index + 1, 
            owner: null, 
            houses: 0 
          }));
          setProperties(propertiesWithIds);
        }
        setPhase('playing');
      });
    } else {
      // Default to cities theme if no theme selected
      import('@/data/themes').then(({ themes }) => {
        const theme = themes.cities;
        if (theme) {
          const propertiesWithIds = theme.properties.map((p, index) => ({ 
            ...p, 
            id: index + 1, 
            owner: null, 
            houses: 0 
          }));
          setProperties(propertiesWithIds);
        }
        setPhase('playing');
      });
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-green-900 via-green-700 to-emerald-600 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader>
          <CardTitle className="text-3xl font-bold text-center">Game Setup</CardTitle>
          <CardDescription className="text-center">
            Choose your token and configure the game
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Player Name */}
          <div className="space-y-2">
            <Label htmlFor="playerName">Your Name</Label>
            <Input
              id="playerName"
              placeholder="Enter your name"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              maxLength={20}
            />
          </div>

          {/* Token Selection */}
          <div className="space-y-3">
            <Label className="text-lg font-semibold">Select Your Token</Label>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {TOKENS.map((token) => (
                <Card
                  key={token.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                    selectedToken === token.id
                      ? 'ring-2 ring-green-500 bg-green-50'
                      : 'hover:scale-105'
                  }`}
                  onClick={() => setSelectedToken(token.color)}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">{token.icon}</div>
                    <div className="font-semibold">{token.name}</div>
                  </div>
                </Card>
              ))}
            </div>
          </div>

          {/* Number of Players */}
          <div className="space-y-2">
            <Label htmlFor="playerCount">Number of Players: {playerCount}</Label>
            <input
              id="playerCount"
              type="range"
              min="2"
              max="8"
              value={playerCount}
              onChange={(e) => setPlayerCount(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>2</span>
              <span>8</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button
              variant="outline"
              onClick={() => setPhase('menu')}
              className="flex-1"
            >
              Back
            </Button>
            <Button
              onClick={handleStartGame}
              disabled={!playerName.trim() || !selectedToken}
              className="flex-1"
            >
              Start Game
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}