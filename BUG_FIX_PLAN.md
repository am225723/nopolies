# Comprehensive Bug Fix Plan

## Issues Identified:

### 1. **Store Missing Properties** ❌
- `properties` not defined in store (Board3D tries to access it)
- `setTheme` not defined in store (Menu and TokenCreator try to use it)
- `selectedTheme` not defined in store (TokenSelection and TokenCreator try to use it)
- `customTokens` not defined in store (for saving custom AI tokens)

### 2. **TokenSelection Issues** ❌
- References `selectedTheme` which doesn't exist in store
- No way to handle solo play (should allow 1 player)
- Player count slider starts at 2, should allow 1 for solo

### 3. **TokenCreator Issues** ❌
- Generated tokens not saved to store
- No way to use custom tokens in game
- References `selectedTheme` which doesn't exist

### 4. **Menu Issues** ❌
- `setTheme` function doesn't exist in store
- Play Solo button calls `handleThemeSelect` which sets theme but theme isn't stored

### 5. **MultiplayerLobby Issues** ❌
- References `properties` which should be `board`
- WebSocket connection may fail

### 6. **Board3D Issues** ❌
- References `properties` which should be `board`

## Fix Strategy:

1. Add missing store properties and actions
2. Fix all component references to use correct store properties
3. Add custom token storage and usage
4. Fix solo play to allow 1 player
5. Ensure all components work together properly