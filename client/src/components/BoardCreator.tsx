import { useState } from "react";
import { useMonopoly } from "@/lib/stores/useMonopoly";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PropertyColor } from "@/lib/stores/useMonopoly";

export function BoardCreator() {
  const { setPhase, setProperties, customBoardName, setCustomBoardName } = useMonopoly();
  const [properties, setLocalProperties] = useState<any[]>([]);

  const propertyPositions = [1, 3, 6, 8, 9, 11, 13, 14, 16, 18, 19, 21, 23, 24, 26, 27, 29, 31, 32, 34, 37, 39];
  const railroadPositions = [5, 15, 25, 35];
  const utilityPositions = [12, 28];

  const allPositions = [...propertyPositions, ...railroadPositions, ...utilityPositions].sort((a, b) => a - b);

  const handleAddProperty = () => {
    const availablePosition = allPositions.find(pos => !properties.some(p => p.position === pos));
    if (availablePosition) {
      const isRailroad = railroadPositions.includes(availablePosition);
      const isUtility = utilityPositions.includes(availablePosition);
      
      setLocalProperties([...properties, {
        position: availablePosition,
        name: isRailroad ? "Railroad" : isUtility ? "Utility" : "New Property",
        color: isRailroad ? "railroad" : isUtility ? "utility" : "brown",
        price: isRailroad || isUtility ? 150 : 100,
        rent: isRailroad || isUtility ? [25, 50] : [10, 50, 150, 450, 625, 750],
        id: properties.length + 1,
        owner: null,
        houses: 0
      }]);
    }
  };

  const handleUpdateProperty = (index: number, field: string, value: any) => {
    const updated = [...properties];
    updated[index] = { ...updated[index], [field]: value };
    setLocalProperties(updated);
  };

  const handleRemoveProperty = (index: number) => {
    setLocalProperties(properties.filter((_, i) => i !== index));
  };

  const handleSaveBoard = () => {
    if (properties.length >= 10) {
      setProperties(properties);
      setPhase("theme_selection");
    }
  };

  return (
    <div className="fixed inset-0 overflow-y-auto bg-gradient-to-br from-green-900 via-green-700 to-emerald-600">
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-4xl p-8 bg-white/95 backdrop-blur my-8">
          <Button
            onClick={() => setPhase("menu")}
            variant="ghost"
            className="mb-4"
          >
            ← Back to Menu
          </Button>

          <h1 className="text-4xl font-bold mb-6 text-center text-green-800">
            Custom Board Creator
          </h1>

          <div className="mb-6">
            <Label>Board Name</Label>
            <Input
              value={customBoardName}
              onChange={(e) => setCustomBoardName(e.target.value)}
              placeholder="My Custom Board"
              className="text-lg"
            />
          </div>

          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Properties ({properties.length}/28)</h2>
              <Button
                onClick={handleAddProperty}
                disabled={properties.length >= allPositions.length}
              >
                Add Property
              </Button>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {properties.map((prop, index) => (
                <Card key={index} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                    <div>
                      <Label className="text-xs">Name</Label>
                      <Input
                        value={prop.name}
                        onChange={(e) => handleUpdateProperty(index, "name", e.target.value)}
                        placeholder="Property Name"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Position</Label>
                      <Select
                        value={prop.position.toString()}
                        onValueChange={(value) => handleUpdateProperty(index, "position", parseInt(value))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {allPositions.map(pos => (
                            <SelectItem
                              key={pos}
                              value={pos.toString()}
                              disabled={properties.some((p, i) => i !== index && p.position === pos)}
                            >
                              {pos}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Color</Label>
                      <Select
                        value={prop.color}
                        onValueChange={(value) => handleUpdateProperty(index, "color", value)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="brown">Brown</SelectItem>
                          <SelectItem value="lightblue">Light Blue</SelectItem>
                          <SelectItem value="pink">Pink</SelectItem>
                          <SelectItem value="orange">Orange</SelectItem>
                          <SelectItem value="red">Red</SelectItem>
                          <SelectItem value="yellow">Yellow</SelectItem>
                          <SelectItem value="green">Green</SelectItem>
                          <SelectItem value="darkblue">Dark Blue</SelectItem>
                          <SelectItem value="railroad">Railroad</SelectItem>
                          <SelectItem value="utility">Utility</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Price</Label>
                      <div className="flex gap-2">
                        <Input
                          type="number"
                          value={prop.price}
                          onChange={(e) => handleUpdateProperty(index, "price", parseInt(e.target.value))}
                          placeholder="100"
                        />
                        <Button
                          onClick={() => handleRemoveProperty(index)}
                          variant="ghost"
                          size="sm"
                          className="text-red-600"
                        >
                          ✕
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {properties.length < 10 && (
              <div className="text-center mt-4 text-gray-600">
                Add at least 10 properties to create your board
              </div>
            )}
          </div>

          <Button
            onClick={handleSaveBoard}
            disabled={properties.length < 10}
            className="w-full bg-green-600 hover:bg-green-700 text-white py-6 text-lg"
          >
            Save & Continue to Game Setup
          </Button>
        </Card>
      </div>
    </div>
  );
}
