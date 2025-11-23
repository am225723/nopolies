import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export type PropertyColor = "brown" | "lightblue" | "pink" | "orange" | "red" | "yellow" | "green" | "darkblue" | "railroad" | "utility";

export interface Property {
  id: number;
  name: string;
  color: PropertyColor;
  price: number;
  rent: number[];
  owner: number | null;
  houses: number;
  position: number;
}

export interface Player {
  id: number;
  name: string;
  color: string;
  position: number;
  money: number;
  properties: number[];
  inJail: boolean;
  tokenUrl?: string;
}

export type GamePhase = "menu" | "theme_selection" | "board_creator" | "token_creator" | "playing" | "property_action";

export interface CustomBoard {
  name: string;
  properties: Property[];
}

export interface MonopolyState {
  phase: GamePhase;
  selectedTheme: string | null;
  players: Player[];
  currentPlayerIndex: number;
  properties: Property[];
  diceValues: [number, number];
  selectedProperty: Property | null;
  customBoard: CustomBoard;
  
  setPhase: (phase: GamePhase) => void;
  setTheme: (theme: string) => void;
  addPlayer: (player: Omit<Player, "id">) => void;
  removePlayer: (id: number) => void;
  updatePlayer: (id: number, updates: Partial<Player>) => void;
  rollDice: () => void;
  movePlayer: (playerId: number, spaces: number) => void;
  buyProperty: (playerId: number, propertyId: number) => void;
  nextTurn: () => void;
  selectProperty: (property: Property | null) => void;
  setProperties: (properties: Property[]) => void;
  setCustomBoard: (board: CustomBoard) => void;
  startGame: () => void;
  resetGame: () => void;
}

const initialPlayers: Player[] = [
  { id: 1, name: "Player 1", color: "#FF0000", position: 0, money: 1500, properties: [], inJail: false },
  { id: 2, name: "Player 2", color: "#0000FF", position: 0, money: 1500, properties: [], inJail: false },
];

export const useMonopoly = create<MonopolyState>()(
  subscribeWithSelector((set, get) => ({
    phase: "menu",
    selectedTheme: null,
    players: initialPlayers,
    currentPlayerIndex: 0,
    properties: [],
    diceValues: [1, 1],
    selectedProperty: null,
    customBoard: {
      name: "My Custom Board",
      properties: []
    },
    
    setPhase: (phase) => set({ phase }),
    
    setTheme: (theme) => set({ selectedTheme: theme }),
    
    addPlayer: (player) => {
      const players = get().players;
      const newPlayer = { ...player, id: players.length + 1 };
      set({ players: [...players, newPlayer] });
    },
    
    removePlayer: (id) => {
      set({ players: get().players.filter(p => p.id !== id) });
    },
    
    updatePlayer: (id, updates) => {
      set({
        players: get().players.map(p => p.id === id ? { ...p, ...updates } : p)
      });
    },
    
    rollDice: () => {
      const dice1 = Math.floor(Math.random() * 6) + 1;
      const dice2 = Math.floor(Math.random() * 6) + 1;
      set({ diceValues: [dice1, dice2] });
      
      const currentPlayer = get().players[get().currentPlayerIndex];
      get().movePlayer(currentPlayer.id, dice1 + dice2);
    },
    
    movePlayer: (playerId, spaces) => {
      const players = get().players;
      const player = players.find(p => p.id === playerId);
      if (!player) return;
      
      let newPosition = (player.position + spaces) % 40;
      
      if (newPosition < player.position) {
        get().updatePlayer(playerId, { money: player.money + 200 });
      }
      
      get().updatePlayer(playerId, { position: newPosition });
      
      const property = get().properties.find(p => p.position === newPosition);
      if (property && property.owner === null) {
        set({ selectedProperty: property, phase: "property_action" });
      }
    },
    
    buyProperty: (playerId, propertyId) => {
      const player = get().players.find(p => p.id === playerId);
      const property = get().properties.find(p => p.id === propertyId);
      
      if (!player || !property || player.money < property.price) return;
      
      get().updatePlayer(playerId, {
        money: player.money - property.price,
        properties: [...player.properties, propertyId]
      });
      
      set({
        properties: get().properties.map(p =>
          p.id === propertyId ? { ...p, owner: playerId } : p
        ),
        selectedProperty: null,
        phase: "playing"
      });
    },
    
    nextTurn: () => {
      const currentIndex = get().currentPlayerIndex;
      const nextIndex = (currentIndex + 1) % get().players.length;
      set({ currentPlayerIndex: nextIndex, phase: "playing" });
    },
    
    selectProperty: (property) => set({ selectedProperty: property }),
    
    setProperties: (properties) => set({ properties }),
    
    setCustomBoard: (board) => set({ customBoard: board }),
    
    startGame: () => set({ phase: "playing" }),
    
    resetGame: () => set({
      phase: "menu",
      selectedTheme: null,
      players: initialPlayers,
      currentPlayerIndex: 0,
      diceValues: [1, 1],
      selectedProperty: null,
      customBoard: {
        name: "My Custom Board",
        properties: []
      }
    })
  }))
);
