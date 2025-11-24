import { create } from 'zustand';
import { devtools } from 'zustand/middleware';

export type GamePhase = "menu" | "theme_selection" | "board_creator" | "token_creator" | "player_setup" | "multiplayer_lobby" | "playing" | "property_action";

export interface CustomBoard {
  name: string;
  properties: Property[];
}

export interface Property {
  id: string;
  name: string;
  type: "property" | "railroad" | "utility" | "special";
  price?: number;
  rent?: number[];
  color?: string;
  position: number;
  houses?: number;
  hasHotel?: boolean;
  owner?: string | null;
}

export interface Player {
  id: string;
  name: string;
  money: number;
  position: number;
  properties: string[];
  token: string;
  color: string;
  isAI?: boolean;
  inJail?: boolean;
}

export interface GameSettings {
  startingMoney: number;
  rules: {
    doubleRentOnMonopoly: boolean;
    freeParkingJackpot: boolean;
    snakeEyesBonus: boolean;
  };
}

interface MonopolyStore {
  phase: GamePhase;
  players: Player[];
  currentPlayerIndex: number;
  board: Property[];
  settings: GameSettings;
  currentTheme: string;
  diceValues: [number, number];
  isRolling: boolean;
  selectedProperty: Property | null;
  winner: Player | null;
  customBoard: CustomBoard;
  customTokens: string[];
  properties: Property[];
  selectedTheme: string;
  
  // Actions
  setPhase: (phase: GamePhase) => void;
  setPlayers: (players: Player[]) => void;
  setCustomBoard: (board: CustomBoard) => void;
  addCustomToken: (token: string) => void;
  setTheme: (theme: string) => void;
  setProperties: (properties: Property[]) => void;
  addPlayer: (player: Player) => void;
  updatePlayer: (playerId: string, data: Partial<Player>) => void;
  removePlayer: (playerId: string) => void;
  setCurrentPlayer: (index: number) => void;
  setBoard: (board: Property[]) => void;
  setSettings: (settings: Partial<GameSettings>) => void;
  setCurrentTheme: (theme: string) => void;
  rollDice: () => void;
  setIsRolling: (rolling: boolean) => void;
  setSelectedProperty: (property: Property | null) => void;
  setWinner: (player: Player | null) => void;
  resetGame: () => void;
  movePlayer: (playerId: string, steps: number) => void;
  buyProperty: (playerId: string, propertyId: string) => void;
  passTurn: () => void;
  payRent: (fromPlayerId: string, toPlayerId: string, amount: number) => void;
}

const defaultProperties: Property[] = [
  { id: 'go', name: 'GO', type: 'special', position: 0 },
  { id: 'mediterranean', name: 'Mediterranean Avenue', type: 'property', price: 60, rent: [2, 10, 30, 90, 160, 250], color: '#8B4513', position: 1 },
  { id: 'community1', name: 'Community Chest', type: 'special', position: 2 },
  { id: 'baltic', name: 'Baltic Avenue', type: 'property', price: 60, rent: [4, 20, 60, 180, 320, 450], color: '#8B4513', position: 3 },
  { id: 'income', name: 'Income Tax', type: 'special', position: 4 },
  { id: 'reading', name: 'Reading Railroad', type: 'railroad', price: 200, rent: [25, 50, 100, 200], position: 5 },
  { id: 'oriental', name: 'Oriental Avenue', type: 'property', price: 100, rent: [6, 30, 90, 270, 400, 550], color: '#87CEEB', position: 6 },
  { id: 'chance1', name: 'Chance', type: 'special', position: 7 },
  { id: 'vermont', name: 'Vermont Avenue', type: 'property', price: 100, rent: [6, 30, 90, 270, 400, 550], color: '#87CEEB', position: 8 },
  { id: 'connecticut', name: 'Connecticut Avenue', type: 'property', price: 120, rent: [8, 40, 100, 300, 450, 600], color: '#87CEEB', position: 9 },
  { id: 'jail', name: 'Jail', type: 'special', position: 10 },
  { id: 'stcharles', name: 'St. Charles Place', type: 'property', price: 140, rent: [10, 50, 150, 450, 625, 750], color: '#FF69B4', position: 11 },
  { id: 'electric', name: 'Electric Company', type: 'utility', price: 150, rent: [4, 10], position: 12 },
  { id: 'states', name: 'States Avenue', type: 'property', price: 140, rent: [10, 50, 150, 450, 625, 750], color: '#FF69B4', position: 13 },
  { id: 'virginia', name: 'Virginia Avenue', type: 'property', price: 160, rent: [12, 60, 180, 500, 700, 900], color: '#FF69B4', position: 14 },
  { id: 'pennsylvania', name: 'Pennsylvania Railroad', type: 'railroad', price: 200, rent: [25, 50, 100, 200], position: 15 },
  { id: 'stjames', name: 'St. James Place', type: 'property', price: 180, rent: [14, 70, 200, 550, 750, 950], color: '#FFA500', position: 16 },
  { id: 'community2', name: 'Community Chest', type: 'special', position: 17 },
  { id: 'tennessee', name: 'Tennessee Avenue', type: 'property', price: 180, rent: [14, 70, 200, 550, 750, 950], color: '#FFA500', position: 18 },
  { id: 'newyork', name: 'New York Avenue', type: 'property', price: 200, rent: [16, 80, 220, 600, 800, 1000], color: '#FFA500', position: 19 },
  { id: 'freeparking', name: 'Free Parking', type: 'special', position: 20 },
  { id: 'kentucky', name: 'Kentucky Avenue', type: 'property', price: 220, rent: [18, 90, 250, 700, 875, 1050], color: '#FF0000', position: 21 },
  { id: 'chance2', name: 'Chance', type: 'special', position: 22 },
  { id: 'indiana', name: 'Indiana Avenue', type: 'property', price: 220, rent: [18, 90, 250, 700, 875, 1050], color: '#FF0000', position: 23 },
  { id: 'illinois', name: 'Illinois Avenue', type: 'property', price: 240, rent: [20, 100, 300, 750, 925, 1100], color: '#FF0000', position: 24 },
  { id: 'borailroad', name: 'B&O Railroad', type: 'railroad', price: 200, rent: [25, 50, 100, 200], position: 25 },
  { id: 'atlantic', name: 'Atlantic Avenue', type: 'property', price: 260, rent: [22, 110, 330, 800, 975, 1150], color: '#FFFF00', position: 26 },
  { id: 'ventnor', name: 'Ventnor Avenue', type: 'property', price: 260, rent: [22, 110, 330, 800, 975, 1150], color: '#FFFF00', position: 27 },
  { id: 'water', name: 'Water Works', type: 'utility', price: 150, rent: [4, 10], position: 28 },
  { id: 'marvin', name: 'Marvin Gardens', type: 'property', price: 280, rent: [24, 120, 360, 850, 1025, 1200], color: '#FFFF00', position: 29 },
  { id: 'gotojail', name: 'Go To Jail', type: 'special', position: 30 },
  { id: 'pacific', name: 'Pacific Avenue', type: 'property', price: 300, rent: [26, 130, 390, 900, 1100, 1275], color: '#008000', position: 31 },
  { id: 'carolina', name: 'North Carolina Avenue', type: 'property', price: 300, rent: [26, 130, 390, 900, 1100, 1275], color: '#008000', position: 32 },
  { id: 'community3', name: 'Community Chest', type: 'special', position: 33 },
  { id: 'pennsylvaniaave', name: 'Pennsylvania Avenue', type: 'property', price: 320, rent: [28, 150, 450, 1000, 1200, 1400], color: '#008000', position: 34 },
  { id: 'shortline', name: 'Short Line Railroad', type: 'railroad', price: 200, rent: [25, 50, 100, 200], position: 35 },
  { id: 'chance3', name: 'Chance', type: 'special', position: 36 },
  { id: 'parkplace', name: 'Park Place', type: 'property', price: 350, rent: [35, 175, 500, 1100, 1300, 1500], color: '#0000FF', position: 37 },
  { id: 'luxury', name: 'Luxury Tax', type: 'special', position: 38 },
  { id: 'boardwalk', name: 'Boardwalk', type: 'property', price: 400, rent: [50, 200, 600, 1400, 1700, 2000], color: '#0000FF', position: 39 },
];

const defaultSettings: GameSettings = {
  startingMoney: 1500,
  rules: {
    doubleRentOnMonopoly: true,
    freeParkingJackpot: false,
    snakeEyesBonus: true,
  },
};

const useMonopolyStore = create<MonopolyStore>()(
  devtools(
    (set, get) => ({
      phase: 'menu',
      players: [],
      currentPlayerIndex: 0,
      board: defaultProperties,
      settings: defaultSettings,
      currentTheme: 'classic',
      diceValues: [1, 1],
      isRolling: false,
      selectedProperty: null,
      winner: null,
      customBoard: { name: 'Custom Board', properties: [] },
      customTokens: [],
      properties: defaultProperties,
      selectedTheme: 'classic',

      setPhase: (phase) => set({ phase }),
      
      setPlayers: (players) => set({ players }),
      
      setCustomBoard: (board) => set({ customBoard: board }),

      addCustomToken: (token) => set((state) => ({
        customTokens: [...state.customTokens, token]
      })),
      
      setTheme: (theme) => set({ selectedTheme: theme }),
      
      setProperties: (properties) => set({ properties, board: properties }),
      
      addPlayer: (player) => set((state) => ({
        players: [...state.players, player],
      })),

      updatePlayer: (playerId, data) => set((state) => ({
        players: state.players.map((p) =>
          p.id === playerId ? { ...p, ...data } : p
        ),
      })),
      
      removePlayer: (playerId) => set((state) => ({
        players: state.players.filter((p) => p.id !== playerId),
      })),
      
      setCurrentPlayer: (index) => set({ currentPlayerIndex: index }),
      
      setBoard: (board) => set({ board }),
      
      setSettings: (newSettings) => set((state) => ({
        settings: { ...state.settings, ...newSettings },
      })),
      
      setCurrentTheme: (theme) => set({ currentTheme: theme }),
      
      rollDice: () => {
        if (get().isRolling) return;
        
        set({ isRolling: true });
        const dice1 = Math.floor(Math.random() * 6) + 1;
        const dice2 = Math.floor(Math.random() * 6) + 1;
        set({ diceValues: [dice1, dice2] });
        
        // Simulate rolling animation
        setTimeout(() => {
          set({ isRolling: false });
        }, 1000);
      },
      
      setIsRolling: (rolling) => set({ isRolling: rolling }),
      
      setSelectedProperty: (property) => set({ selectedProperty: property }),
      
      setWinner: (winner) => set({ winner }),
      
      resetGame: () => set({
        phase: 'menu',
        players: [],
        currentPlayerIndex: 0,
        diceValues: [1, 1],
        isRolling: false,
        selectedProperty: null,
        winner: null,
      }),
      
      movePlayer: (playerId, steps) => {
        const state = get();
        const player = state.players.find((p) => p.id === playerId);
        if (!player) return;
        
        const newPosition = (player.position + steps) % 40;
        set((state) => ({
          players: state.players.map((p) =>
            p.id === playerId ? { ...p, position: newPosition } : p
          ),
        }));
      },
      
      buyProperty: (playerId, propertyId) => {
        const state = get();
        const player = state.players.find((p) => p.id === playerId);
        const property = state.board.find((p) => p.id === propertyId);
        
        if (!player || !property || !property.price) return;
        
        if (player.money >= property.price) {
          set((state) => ({
            players: state.players.map((p) =>
              p.id === playerId
                ? { ...p, money: p.money - property.price!, properties: [...p.properties, propertyId] }
                : p
            ),
          }));
        }
      },
      
      passTurn: () => {
        const state = get();
        const nextPlayerIndex = (state.currentPlayerIndex + 1) % state.players.length;
        set({ currentPlayerIndex: nextPlayerIndex });
      },
      
      payRent: (fromPlayerId, toPlayerId, amount) => {
        set((state) => ({
          players: state.players.map((p) => {
            if (p.id === fromPlayerId) {
              return { ...p, money: p.money - amount };
            }
            if (p.id === toPlayerId) {
              return { ...p, money: p.money + amount };
            }
            return p;
          }),
        }));
      },
    }),
    {
      name: 'monopoly-store',
    }
  )
);

export { useMonopolyStore as useMonopoly };
export default useMonopolyStore;