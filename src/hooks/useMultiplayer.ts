import { useEffect, useRef, useState, useCallback } from 'react';
import { useMonopoly } from '@/lib/stores/useMonopoly';

interface MultiplayerConfig {
  serverUrl?: string;
}

interface MultiplayerState {
  connected: boolean;
  roomCode: string | null;
  playerId: string | null;
  isHost: boolean;
  players: any[];
  error: string | null;
}

export function useMultiplayer(config: MultiplayerConfig = {}) {
  const ws = useRef<WebSocket | null>(null);
  const [state, setState] = useState<MultiplayerState>({
    connected: false,
    roomCode: null,
    playerId: null,
    isHost: false,
    players: [],
    error: null,
  });

  const { setPhase, updatePlayer, setProperties } = useMonopoly();

  const serverUrl = config.serverUrl || 
    (typeof window !== 'undefined' 
      ? `${window.location.protocol === 'https:' ? 'wss:' : 'ws:'}//${window.location.host}/ws`
      : 'ws://localhost:3001/ws');

  const connect = useCallback(() => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      return;
    }

    ws.current = new WebSocket(serverUrl);

    ws.current.onopen = () => {
      console.log('WebSocket connected');
      setState(prev => ({ ...prev, connected: true, error: null }));
    };

    ws.current.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data);
        handleMessage(message);
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    };

    ws.current.onerror = (error) => {
      console.error('WebSocket error:', error);
      setState(prev => ({ ...prev, error: 'Connection error' }));
    };

    ws.current.onclose = () => {
      console.log('WebSocket disconnected');
      setState(prev => ({ ...prev, connected: false }));
      
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (state.roomCode) {
          connect();
        }
      }, 3000);
    };
  }, [serverUrl, state.roomCode]);

  const handleMessage = (message: any) => {
    const { type, payload } = message;

    switch (type) {
      case 'ROOM_CREATED':
        setState(prev => ({
          ...prev,
          roomCode: payload.code,
          playerId: payload.playerId,
          isHost: true,
          players: payload.room.players,
        }));
        break;

      case 'ROOM_JOINED':
        setState(prev => ({
          ...prev,
          roomCode: payload.room.code,
          playerId: payload.playerId,
          isHost: false,
          players: payload.room.players,
        }));
        break;

      case 'PLAYER_JOINED':
        setState(prev => ({
          ...prev,
          players: [...prev.players, payload.player],
        }));
        break;

      case 'PLAYER_LEFT':
        setState(prev => ({
          ...prev,
          players: prev.players.filter(p => p.id !== payload.playerId),
        }));
        break;

      case 'HOST_CHANGED':
        setState(prev => ({
          ...prev,
          isHost: prev.playerId === payload.newHostId,
          players: prev.players.map(p => ({
            ...p,
            isHost: p.id === payload.newHostId,
          })),
        }));
        break;

      case 'GAME_STATE_UPDATED':
        // Update local game state
        if (payload.gameState.properties) {
          setProperties(payload.gameState.properties);
        }
        break;

      case 'DICE_ROLLED':
        // Handle dice roll from another player
        console.log('Dice rolled:', payload);
        break;

      case 'CHAT_MESSAGE':
        // Handle chat message
        console.log('Chat:', payload);
        break;

      case 'RULES_UPDATED':
        // Handle rules update
        console.log('Rules updated:', payload.rules);
        break;

      case 'GAME_STARTED':
        setPhase('playing');
        break;

      case 'ERROR':
        setState(prev => ({ ...prev, error: payload.error }));
        break;

      default:
        console.log('Unknown message type:', type);
    }
  };

  const send = useCallback((message: any) => {
    if (ws.current?.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket not connected');
    }
  }, []);

  const createRoom = useCallback((playerName: string, color: string, tokenUrl?: string, properties?: any[]) => {
    send({
      type: 'CREATE_ROOM',
      payload: { playerName, color, tokenUrl, properties },
    });
  }, [send]);

  const joinRoom = useCallback((code: string, playerName: string, color: string, tokenUrl?: string) => {
    send({
      type: 'JOIN_ROOM',
      payload: { code, playerName, color, tokenUrl },
    });
  }, [send]);

  const leaveRoom = useCallback(() => {
    if (state.roomCode && state.playerId) {
      send({
        type: 'LEAVE_ROOM',
        payload: { code: state.roomCode, playerId: state.playerId },
      });
      setState(prev => ({
        ...prev,
        roomCode: null,
        playerId: null,
        isHost: false,
        players: [],
      }));
    }
  }, [send, state.roomCode, state.playerId]);

  const updateGameState = useCallback((gameState: any) => {
    send({
      type: 'UPDATE_GAME_STATE',
      payload: { code: state.roomCode, gameState },
    });
  }, [send, state.roomCode]);

  const rollDice = useCallback(() => {
    send({
      type: 'ROLL_DICE',
      payload: { code: state.roomCode, playerId: state.playerId },
    });
  }, [send, state.roomCode, state.playerId]);

  const sendChatMessage = useCallback((message: string) => {
    send({
      type: 'CHAT_MESSAGE',
      payload: { code: state.roomCode, playerId: state.playerId, message },
    });
  }, [send, state.roomCode, state.playerId]);

  const updateRules = useCallback((rules: any) => {
    send({
      type: 'UPDATE_RULES',
      payload: { code: state.roomCode, playerId: state.playerId, rules },
    });
  }, [send, state.roomCode, state.playerId]);

  const startGame = useCallback(() => {
    send({
      type: 'START_GAME',
      payload: { code: state.roomCode, playerId: state.playerId },
    });
  }, [send, state.roomCode, state.playerId]);

  useEffect(() => {
    connect();

    return () => {
      if (ws.current) {
        ws.current.close();
      }
    };
  }, [connect]);

  return {
    ...state,
    createRoom,
    joinRoom,
    leaveRoom,
    updateGameState,
    rollDice,
    sendChatMessage,
    updateRules,
    startGame,
  };
}