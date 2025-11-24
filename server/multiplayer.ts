import { WebSocketServer, WebSocket } from 'ws';
import { Server } from 'http';
import { nanoid } from 'nanoid';

export interface Player {
  id: string;
  name: string;
  color: string;
  position: number;
  money: number;
  properties: number[];
  inJail: boolean;
  tokenUrl?: string;
  isHost: boolean;
}

export interface GameRoom {
  code: string;
  hostId: string;
  players: Map<string, Player>;
  gameState: {
    currentPlayerIndex: number;
    diceValues: [number, number];
    phase: string;
    properties: any[];
    customRules: CustomRules;
  };
  createdAt: Date;
}

export interface CustomRules {
  redDiceEnabled: boolean;
  moneyToFreeParking: boolean;
  snakeEyesBonus: number;
  doubleGoSalary: boolean;
  auctionProperties: boolean;
  fastBuild: boolean;
}

const DEFAULT_RULES: CustomRules = {
  redDiceEnabled: false,
  moneyToFreeParking: false,
  snakeEyesBonus: 0,
  doubleGoSalary: false,
  auctionProperties: false,
  fastBuild: false,
};

export class MultiplayerManager {
  private wss: WebSocketServer;
  private rooms: Map<string, GameRoom> = new Map();
  private playerConnections: Map<string, WebSocket> = new Map();

  constructor(server: Server) {
    this.wss = new WebSocketServer({ server, path: '/ws' });
    this.setupWebSocket();
    this.startCleanupInterval();
  }

  private setupWebSocket() {
    this.wss.on('connection', (ws: WebSocket) => {
      console.log('New WebSocket connection');

      ws.on('message', (data: string) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(ws, message);
        } catch (error) {
          console.error('Error parsing message:', error);
          this.sendError(ws, 'Invalid message format');
        }
      });

      ws.on('close', () => {
        this.handleDisconnect(ws);
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
      });
    });
  }

  private handleMessage(ws: WebSocket, message: any) {
    const { type, payload } = message;

    switch (type) {
      case 'CREATE_ROOM':
        this.createRoom(ws, payload);
        break;
      case 'JOIN_ROOM':
        this.joinRoom(ws, payload);
        break;
      case 'LEAVE_ROOM':
        this.leaveRoom(ws, payload);
        break;
      case 'UPDATE_GAME_STATE':
        this.updateGameState(ws, payload);
        break;
      case 'ROLL_DICE':
        this.handleDiceRoll(ws, payload);
        break;
      case 'CHAT_MESSAGE':
        this.handleChatMessage(ws, payload);
        break;
      case 'UPDATE_RULES':
        this.updateRules(ws, payload);
        break;
      case 'START_GAME':
        this.startGame(ws, payload);
        break;
      default:
        this.sendError(ws, 'Unknown message type');
    }
  }

  private createRoom(ws: WebSocket, payload: any) {
    const code = this.generateRoomCode();
    const playerId = nanoid();
    
    const player: Player = {
      id: playerId,
      name: payload.playerName || 'Player 1',
      color: payload.color || '#FF0000',
      position: 0,
      money: 1500,
      properties: [],
      inJail: false,
      tokenUrl: payload.tokenUrl,
      isHost: true,
    };

    const room: GameRoom = {
      code,
      hostId: playerId,
      players: new Map([[playerId, player]]),
      gameState: {
        currentPlayerIndex: 0,
        diceValues: [1, 1],
        phase: 'lobby',
        properties: payload.properties || [],
        customRules: { ...DEFAULT_RULES },
      },
      createdAt: new Date(),
    };

    this.rooms.set(code, room);
    this.playerConnections.set(playerId, ws);

    this.send(ws, {
      type: 'ROOM_CREATED',
      payload: {
        code,
        playerId,
        room: this.serializeRoom(room),
      },
    });

    console.log(`Room created: ${code}`);
  }

  private joinRoom(ws: WebSocket, payload: any) {
    const { code, playerName, color, tokenUrl } = payload;
    const room = this.rooms.get(code);

    if (!room) {
      this.sendError(ws, 'Room not found');
      return;
    }

    if (room.players.size >= 8) {
      this.sendError(ws, 'Room is full');
      return;
    }

    if (room.gameState.phase !== 'lobby') {
      this.sendError(ws, 'Game already in progress');
      return;
    }

    const playerId = nanoid();
    const player: Player = {
      id: playerId,
      name: playerName || `Player ${room.players.size + 1}`,
      color: color || this.getAvailableColor(room),
      position: 0,
      money: 1500,
      properties: [],
      inJail: false,
      tokenUrl,
      isHost: false,
    };

    room.players.set(playerId, player);
    this.playerConnections.set(playerId, ws);

    this.send(ws, {
      type: 'ROOM_JOINED',
      payload: {
        playerId,
        room: this.serializeRoom(room),
      },
    });

    this.broadcastToRoom(code, {
      type: 'PLAYER_JOINED',
      payload: {
        player: this.serializePlayer(player),
      },
    }, playerId);

    console.log(`Player ${playerId} joined room ${code}`);
  }

  private leaveRoom(ws: WebSocket, payload: any) {
    const { playerId, code } = payload;
    const room = this.rooms.get(code);

    if (!room) return;

    room.players.delete(playerId);
    this.playerConnections.delete(playerId);

    if (room.players.size === 0) {
      this.rooms.delete(code);
      console.log(`Room ${code} deleted (empty)`);
    } else if (playerId === room.hostId) {
      // Transfer host to another player
      const newHost = Array.from(room.players.values())[0];
      room.hostId = newHost.id;
      newHost.isHost = true;

      this.broadcastToRoom(code, {
        type: 'HOST_CHANGED',
        payload: { newHostId: newHost.id },
      });
    }

    this.broadcastToRoom(code, {
      type: 'PLAYER_LEFT',
      payload: { playerId },
    });

    console.log(`Player ${playerId} left room ${code}`);
  }

  private updateGameState(ws: WebSocket, payload: any) {
    const { code, gameState } = payload;
    const room = this.rooms.get(code);

    if (!room) {
      this.sendError(ws, 'Room not found');
      return;
    }

    room.gameState = { ...room.gameState, ...gameState };

    this.broadcastToRoom(code, {
      type: 'GAME_STATE_UPDATED',
      payload: { gameState: room.gameState },
    });
  }

  private handleDiceRoll(ws: WebSocket, payload: any) {
    const { code, playerId } = payload;
    const room = this.rooms.get(code);

    if (!room) return;

    const dice1 = Math.floor(Math.random() * 6) + 1;
    const dice2 = Math.floor(Math.random() * 6) + 1;

    // Check for snake eyes bonus
    let bonus = 0;
    if (dice1 === 1 && dice2 === 1 && room.gameState.customRules.snakeEyesBonus > 0) {
      bonus = room.gameState.customRules.snakeEyesBonus;
      const player = room.players.get(playerId);
      if (player) {
        player.money += bonus;
      }
    }

    room.gameState.diceValues = [dice1, dice2];

    this.broadcastToRoom(code, {
      type: 'DICE_ROLLED',
      payload: {
        playerId,
        dice1,
        dice2,
        bonus,
        isSnakeEyes: dice1 === 1 && dice2 === 1,
      },
    });
  }

  private handleChatMessage(ws: WebSocket, payload: any) {
    const { code, playerId, message } = payload;
    const room = this.rooms.get(code);

    if (!room) return;

    const player = room.players.get(playerId);
    if (!player) return;

    this.broadcastToRoom(code, {
      type: 'CHAT_MESSAGE',
      payload: {
        playerId,
        playerName: player.name,
        message,
        timestamp: new Date().toISOString(),
      },
    });
  }

  private updateRules(ws: WebSocket, payload: any) {
    const { code, playerId, rules } = payload;
    const room = this.rooms.get(code);

    if (!room) {
      this.sendError(ws, 'Room not found');
      return;
    }

    if (playerId !== room.hostId) {
      this.sendError(ws, 'Only host can update rules');
      return;
    }

    room.gameState.customRules = { ...room.gameState.customRules, ...rules };

    this.broadcastToRoom(code, {
      type: 'RULES_UPDATED',
      payload: { rules: room.gameState.customRules },
    });
  }

  private startGame(ws: WebSocket, payload: any) {
    const { code, playerId } = payload;
    const room = this.rooms.get(code);

    if (!room) {
      this.sendError(ws, 'Room not found');
      return;
    }

    if (playerId !== room.hostId) {
      this.sendError(ws, 'Only host can start game');
      return;
    }

    if (room.players.size < 2) {
      this.sendError(ws, 'Need at least 2 players to start');
      return;
    }

    room.gameState.phase = 'playing';

    this.broadcastToRoom(code, {
      type: 'GAME_STARTED',
      payload: { gameState: room.gameState },
    });
  }

  private handleDisconnect(ws: WebSocket) {
    // Find player by connection
    for (const [playerId, connection] of this.playerConnections.entries()) {
      if (connection === ws) {
        // Find room containing this player
        for (const [code, room] of this.rooms.entries()) {
          if (room.players.has(playerId)) {
            this.leaveRoom(ws, { playerId, code });
            break;
          }
        }
        break;
      }
    }
  }

  private generateRoomCode(): string {
    let code: string;
    do {
      code = Math.random().toString(36).substring(2, 8).toUpperCase();
    } while (this.rooms.has(code));
    return code;
  }

  private getAvailableColor(room: GameRoom): string {
    const colors = ['#FF0000', '#0000FF', '#00FF00', '#FFFF00', '#FF00FF', '#00FFFF', '#FFA500', '#800080'];
    const usedColors = new Set(Array.from(room.players.values()).map(p => p.color));
    return colors.find(c => !usedColors.has(c)) || colors[0];
  }

  private broadcastToRoom(code: string, message: any, excludePlayerId?: string) {
    const room = this.rooms.get(code);
    if (!room) return;

    for (const [playerId, player] of room.players.entries()) {
      if (playerId !== excludePlayerId) {
        const ws = this.playerConnections.get(playerId);
        if (ws && ws.readyState === WebSocket.OPEN) {
          this.send(ws, message);
        }
      }
    }
  }

  private send(ws: WebSocket, message: any) {
    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(message));
    }
  }

  private sendError(ws: WebSocket, error: string) {
    this.send(ws, {
      type: 'ERROR',
      payload: { error },
    });
  }

  private serializeRoom(room: GameRoom) {
    return {
      code: room.code,
      hostId: room.hostId,
      players: Array.from(room.players.values()).map(p => this.serializePlayer(p)),
      gameState: room.gameState,
      createdAt: room.createdAt,
    };
  }

  private serializePlayer(player: Player) {
    return {
      id: player.id,
      name: player.name,
      color: player.color,
      position: player.position,
      money: player.money,
      properties: player.properties,
      inJail: player.inJail,
      tokenUrl: player.tokenUrl,
      isHost: player.isHost,
    };
  }

  private startCleanupInterval() {
    // Clean up empty rooms every 5 minutes
    setInterval(() => {
      const now = new Date();
      for (const [code, room] of this.rooms.entries()) {
        const age = now.getTime() - room.createdAt.getTime();
        if (room.players.size === 0 || age > 3600000) { // 1 hour
          this.rooms.delete(code);
          console.log(`Room ${code} cleaned up`);
        }
      }
    }, 300000); // 5 minutes
  }

  public getRoomCount(): number {
    return this.rooms.size;
  }

  public getPlayerCount(): number {
    let count = 0;
    for (const room of this.rooms.values()) {
      count += room.players.size;
    }
    return count;
  }
}