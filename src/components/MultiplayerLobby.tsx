import { useState, useEffect } from 'react';
import { useMultiplayer } from '@/hooks/useMultiplayer';
import { useMonopoly } from '@/lib/stores/useMonopoly';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Users, Copy, Check, Crown, Settings } from 'lucide-react';

export function MultiplayerLobby() {
  const [mode, setMode] = useState<'menu' | 'create' | 'join' | 'lobby'>('menu');
  const [playerName, setPlayerName] = useState('');
  const [playerColor, setPlayerColor] = useState('#FF0000');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [showRules, setShowRules] = useState(false);

  const { properties } = useMonopoly();
  const multiplayer = useMultiplayer();

  const [customRules, setCustomRules] = useState({
    redDiceEnabled: false,
    moneyToFreeParking: false,
    snakeEyesBonus: 0,
    doubleGoSalary: false,
    auctionProperties: false,
    fastBuild: false,
  });

  useEffect(() => {
    if (multiplayer.roomCode && mode !== 'lobby') {
      setMode('lobby');
    }
  }, [multiplayer.roomCode, mode]);

  const handleCreateRoom = () => {
    if (playerName.trim()) {
      multiplayer.createRoom(playerName, playerColor, undefined, properties);
    }
  };

  const handleJoinRoom = () => {
    if (playerName.trim() && joinCode.trim()) {
      multiplayer.joinRoom(joinCode.toUpperCase(), playerName, playerColor);
    }
  };

  const handleCopyCode = () => {
    if (multiplayer.roomCode) {
      navigator.clipboard.writeText(multiplayer.roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleUpdateRules = (key: string, value: any) => {
    const newRules = { ...customRules, [key]: value };
    setCustomRules(newRules);
    if (multiplayer.isHost) {
      multiplayer.updateRules(newRules);
    }
  };

  const handleStartGame = () => {
    multiplayer.startGame();
  };

  if (mode === 'menu') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-3xl font-bold text-center">Multiplayer</CardTitle>
            <CardDescription className="text-center">
              Play with friends online
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              className="w-full h-16 text-lg" 
              onClick={() => setMode('create')}
            >
              <Users className="mr-2 h-6 w-6" />
              Create Room
            </Button>
            <Button 
              className="w-full h-16 text-lg" 
              variant="outline"
              onClick={() => setMode('join')}
            >
              Join Room
            </Button>
            <Button 
              className="w-full" 
              variant="ghost"
              onClick={() => window.location.reload()}
            >
              Back to Menu
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mode === 'create' || mode === 'join') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl">
              {mode === 'create' ? 'Create Room' : 'Join Room'}
            </CardTitle>
            <CardDescription>
              {mode === 'create' 
                ? 'Set up your game room' 
                : 'Enter the room code to join'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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

            <div className="space-y-2">
              <Label htmlFor="playerColor">Your Color</Label>
              <div className="flex gap-2">
                <Input
                  id="playerColor"
                  type="color"
                  value={playerColor}
                  onChange={(e) => setPlayerColor(e.target.value)}
                  className="w-20 h-10"
                />
                <Input
                  value={playerColor}
                  onChange={(e) => setPlayerColor(e.target.value)}
                  placeholder="#FF0000"
                  className="flex-1"
                />
              </div>
            </div>

            {mode === 'join' && (
              <div className="space-y-2">
                <Label htmlFor="joinCode">Room Code</Label>
                <Input
                  id="joinCode"
                  placeholder="Enter 6-digit code"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                  maxLength={6}
                  className="text-center text-2xl tracking-widest font-mono"
                />
              </div>
            )}

            {multiplayer.error && (
              <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                {multiplayer.error}
              </div>
            )}

            <div className="flex gap-2">
              <Button 
                className="flex-1" 
                onClick={() => setMode('menu')}
                variant="outline"
              >
                Back
              </Button>
              <Button 
                className="flex-1" 
                onClick={mode === 'create' ? handleCreateRoom : handleJoinRoom}
                disabled={!playerName.trim() || (mode === 'join' && joinCode.length !== 6)}
              >
                {mode === 'create' ? 'Create' : 'Join'}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (mode === 'lobby') {
    return (
      <div className="fixed inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-pink-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-3xl font-bold">Game Lobby</CardTitle>
                <CardDescription>
                  {multiplayer.isHost ? 'You are the host' : 'Waiting for host to start'}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <div className="text-right">
                  <div className="text-sm text-muted-foreground">Room Code</div>
                  <div className="text-2xl font-mono font-bold tracking-wider">
                    {multiplayer.roomCode}
                  </div>
                </div>
                <Button
                  size="icon"
                  variant="outline"
                  onClick={handleCopyCode}
                  className="h-12 w-12"
                >
                  {copied ? <Check className="h-5 w-5" /> : <Copy className="h-5 w-5" />}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Players List */}
            <div>
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Users className="h-5 w-5" />
                Players ({multiplayer.players.length}/8)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {multiplayer.players.map((player) => (
                  <Card key={player.id} className="p-4">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-full border-4"
                        style={{ backgroundColor: player.color, borderColor: player.color }}
                      />
                      <div className="flex-1">
                        <div className="font-semibold flex items-center gap-2">
                          {player.name}
                          {player.isHost && <Crown className="h-4 w-4 text-yellow-500" />}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {player.id === multiplayer.playerId ? '(You)' : 'Ready'}
                        </div>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            {/* Custom Rules */}
            {multiplayer.isHost && (
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <Settings className="h-5 w-5" />
                    Custom Rules
                  </h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowRules(!showRules)}
                  >
                    {showRules ? 'Hide' : 'Show'}
                  </Button>
                </div>

                {showRules && (
                  <div className="space-y-4 p-4 bg-muted rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="redDice">Red Dice Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          Add a third red die for chaos
                        </p>
                      </div>
                      <Switch
                        id="redDice"
                        checked={customRules.redDiceEnabled}
                        onCheckedChange={(checked) => handleUpdateRules('redDiceEnabled', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="freeParking">Money to Free Parking</Label>
                        <p className="text-sm text-muted-foreground">
                          All fines go to Free Parking
                        </p>
                      </div>
                      <Switch
                        id="freeParking"
                        checked={customRules.moneyToFreeParking}
                        onCheckedChange={(checked) => handleUpdateRules('moneyToFreeParking', checked)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="snakeEyes">Snake Eyes Bonus</Label>
                      <p className="text-sm text-muted-foreground">
                        Bonus money for rolling double ones
                      </p>
                      <Input
                        id="snakeEyes"
                        type="number"
                        min="0"
                        step="100"
                        value={customRules.snakeEyesBonus}
                        onChange={(e) => handleUpdateRules('snakeEyesBonus', parseInt(e.target.value) || 0)}
                        placeholder="0"
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="doubleGo">Double GO Salary</Label>
                        <p className="text-sm text-muted-foreground">
                          Get $400 instead of $200
                        </p>
                      </div>
                      <Switch
                        id="doubleGo"
                        checked={customRules.doubleGoSalary}
                        onCheckedChange={(checked) => handleUpdateRules('doubleGoSalary', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="auction">Auction Properties</Label>
                        <p className="text-sm text-muted-foreground">
                          Auction unpurchased properties
                        </p>
                      </div>
                      <Switch
                        id="auction"
                        checked={customRules.auctionProperties}
                        onCheckedChange={(checked) => handleUpdateRules('auctionProperties', checked)}
                      />
                    </div>

                    <div className="flex items-center justify-between">
                      <div>
                        <Label htmlFor="fastBuild">Fast Build Mode</Label>
                        <p className="text-sm text-muted-foreground">
                          Build without monopoly
                        </p>
                      </div>
                      <Switch
                        id="fastBuild"
                        checked={customRules.fastBuild}
                        onCheckedChange={(checked) => handleUpdateRules('fastBuild', checked)}
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={multiplayer.leaveRoom}
                className="flex-1"
              >
                Leave Room
              </Button>
              {multiplayer.isHost && (
                <Button 
                  onClick={handleStartGame}
                  disabled={multiplayer.players.length < 2}
                  className="flex-1"
                >
                  Start Game
                </Button>
              )}
            </div>

            {!multiplayer.isHost && (
              <p className="text-center text-sm text-muted-foreground">
                Waiting for host to start the game...
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}