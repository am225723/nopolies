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
  { id: 'thimble', name: 'Thimble', icon: '🥵', color: '#C0C0C0' },
  { id: 'boot', name: 'Boot', icon: '👢', color: '#654321' },
  { id: 'wheelbarrow', name: 'Wheelbarrow', icon: '🚜', color: '#8B4513' },
  { id: 'iron', name: 'Iron', icon: '⚡', color: '#808080' },
];

export function TokenSelection() {
  const [playerName, setPlayerName] = useState('');
  const [selectedToken, setSelectedToken] = useState<string>('');
  const [playerCount, setPlayerCount] = useState(2);
  const { setPhase, setPlayers, setBoard, setCurrentPlayer, currentTheme, customTokens } = useMonopoly();

  // Combine default tokens with custom tokens
  const allTokens: Token[] = [
    ...TOKENS,
    ...customTokens.map((url, index) => ({
      id: `custom-${index}`,
      name: `Custom Token ${index + 1}`,
      icon: '🎨',
      color: '#FFD700',
      imageUrl: url
    }))
  ];

  const handleStartGame = () => {
    if (!playerName.trim() || !selectedToken) {
      alert('Please enter your name and select a token');
      return;
    }

    // Clear existing players first
    setPlayers([]);

    // Create the human player
    const tokenObj = allTokens.find(t => t.id === selectedToken);
    const humanPlayer = {
      id: 'player-1',
      name: playerName.trim(),
      token: (tokenObj as any)?.imageUrl || selectedToken,
      color: tokenObj?.color || '#000000',
      position: 0,
      money: 1500,
      properties: [],
      isAI: false,
    };

    // Create AI players
    const aiPlayers: any[] = [];
    const usedTokens = [selectedToken];
    
    for (let i = 2; i <= playerCount; i++) {
      const availableTokens = allTokens.filter(t => !usedTokens.includes(t.id) && !t.id.startsWith('custom-'));
      const pool = availableTokens.length > 0 ? availableTokens : TOKENS;
      
      const aiToken = pool[Math.floor(Math.random() * pool.length)];
      usedTokens.push(aiToken.id);
      
      aiPlayers.push({
        id: `player-${i}`,
        name: `Player ${i}`,
        token: aiToken.id,
        color: aiToken.color,
        position: 0,
        money: 1500,
        properties: [],
        isAI: true,
      });
    }

    // Set all players with human player first
    setPlayers([humanPlayer, ...aiPlayers]);
    
    // Set current player to human player (index 0)
    setCurrentPlayer(0);

    // Load properties for selected theme or use default
    if (currentTheme) {
      import('@/data/themes').then(({ themes }) => {
        const theme = themes[currentTheme];
        if (theme && theme.properties) {
          // Convert theme properties to store format
          const boardProperties = theme.properties.map((p: any, index: number) => ({
            id: p.id || `property-${index}`,
            name: p.name,
            type: p.type || 'property',
            price: p.price,
            rent: p.rent || [0],
            color: p.color,
            position: index,
          }));
          setBoard(boardProperties);
        }
        setPhase('playing');
      }).catch((e) => {
        console.error("Failed to load theme:", e);
        // Fallback to playing phase if theme loading fails
        setPhase('playing');
      });
    } else {
      // Default to playing phase
      setPhase('playing');
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
              {allTokens.map((token: any) => (
                <Card
                  key={token.id}
                  className={`p-4 cursor-pointer transition-all hover:shadow-lg ${
                    selectedToken === token.id
                      ? 'ring-2 ring-green-500 bg-green-50'
                      : 'hover:scale-105'
                  }`}
                  onClick={() => setSelectedToken(token.id)}
                >
                  <div className="text-center">
                    {token.imageUrl ? (
                      <img
                        src={token.imageUrl}
                        alt={token.name}
                        className="w-16 h-16 mx-auto mb-2 object-contain"
                      />
                    ) : (
                      <div className="text-4xl mb-2">{token.icon}</div>
                    )}
                    <div className="font-semibold text-sm">{token.name}</div>
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