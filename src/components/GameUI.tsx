import { useMonopoly } from "@/lib/stores/useMonopoly";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getPropertyColor } from "@/data/themes";
import { useState } from "react";

export function GameUI() {
  const [isRolling, setIsRolling] = useState(false);
  const { 
    phase, 
    players, 
    currentPlayerIndex, 
    diceValues, 
    selectedProperty, 
    rollDice, 
    buyProperty, 
    nextTurn, 
    selectProperty 
  } = useMonopoly();

  if (phase !== "playing" && phase !== "property_action") return null;

  const handleRollRequest = () => {
    if (!isRolling) {
      setIsRolling(true);
      rollDice();
      setTimeout(() => {
        setIsRolling(false);
      }, 2500);
    }
  };

  const currentPlayer = players[currentPlayerIndex];

  return (
    <div className="fixed inset-0 pointer-events-none">
      {/* Top bar - Player info */}
      <div className="absolute top-4 left-4 right-4 flex gap-3 pointer-events-auto">
        {players.map((player, idx) => (
          <Card
            key={player.id}
            className={cn(
              "px-4 py-3 flex-1 transition-all",
              idx === currentPlayerIndex && "ring-4 ring-yellow-400 shadow-lg scale-105"
            )}
            style={{ backgroundColor: `${player.color}20`, borderColor: player.color }}
          >
            <div className="flex justify-between items-center">
              <div>
                <div className="font-bold text-lg" style={{ color: player.color }}>
                  {player.name}
                </div>
                <div className="text-sm text-gray-700">
                  ${player.money}
                </div>
              </div>
              <div className="text-xs text-gray-600">
                {player.properties.length} properties
              </div>
            </div>
          </Card>
        ))}
      </div>

      {/* Control instructions */}
      <Card className="absolute top-4 right-4 px-4 py-3 pointer-events-auto bg-white/90 backdrop-blur">
        <div className="text-xs space-y-1">
          <div className="font-bold mb-2">Camera Controls:</div>
          <div><kbd className="px-2 py-1 bg-gray-200 rounded">Q</kbd> / <kbd className="px-2 py-1 bg-gray-200 rounded">E</kbd> Rotate</div>
          <div><kbd className="px-2 py-1 bg-gray-200 rounded">R</kbd> Flip View</div>
          <div><kbd className="px-2 py-1 bg-gray-200 rounded">+</kbd> / <kbd className="px-2 py-1 bg-gray-200 rounded">-</kbd> Zoom</div>
        </div>
      </Card>

      {/* Bottom center - Dice and controls */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 pointer-events-auto">
        <Card className="px-6 py-4 bg-white/95 backdrop-blur">
          <div className="text-center mb-3">
            <div className="font-bold text-xl mb-1" style={{ color: currentPlayer.color }}>
              {currentPlayer.name}'s Turn
            </div>
            <div className="text-sm text-gray-600">Position: {currentPlayer.position}</div>
          </div>

          <div className="flex flex-col items-center gap-3">
            <div className="text-sm text-gray-600">
              Click the dice to roll them!
            </div>
            
            <div className="flex gap-4 items-center justify-center">
              <div className="flex gap-2">
                <div className={`w-14 h-14 flex items-center justify-center bg-white border-4 border-gray-800 rounded-lg shadow-md ${isRolling ? 'animate-bounce' : ''}`}>
                  <span className="text-3xl font-bold">{diceValues[0]}</span>
                </div>
                <div className={`w-14 h-14 flex items-center justify-center bg-white border-4 border-gray-800 rounded-lg shadow-md ${isRolling ? 'animate-bounce' : ''}`}>
                  <span className="text-3xl font-bold">{diceValues[1]}</span>
                </div>
              </div>
            </div>

            {phase === "playing" && (
              <Button
                onClick={nextTurn}
                variant="outline"
                className="px-6 py-2"
              >
                End Turn
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Property action modal */}
      {phase === "property_action" && selectedProperty && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center pointer-events-auto">
          <Card className="w-96 p-6 bg-white">
            <div
              className="h-2 mb-4 rounded"
              style={{ backgroundColor: getPropertyColor(selectedProperty.color) }}
            />
            
            <h2 className="text-2xl font-bold mb-2">{selectedProperty.name}</h2>
            
            <div className="space-y-2 mb-6">
              <div className="flex justify-between">
                <span className="text-gray-600">Price:</span>
                <span className="font-bold">${selectedProperty.price}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Rent:</span>
                <span className="font-bold">${selectedProperty.rent[0]}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Your Money:</span>
                <span className={cn(
                  "font-bold",
                  currentPlayer.money < selectedProperty.price && "text-red-600"
                )}>
                  ${currentPlayer.money}
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <Button
                onClick={() => buyProperty(currentPlayer.id, selectedProperty.id)}
                disabled={currentPlayer.money < selectedProperty.price}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Buy Property
              </Button>
              <Button
                onClick={() => {
                  selectProperty(null);
                  nextTurn();
                }}
                variant="outline"
                className="flex-1"
              >
                Pass
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}