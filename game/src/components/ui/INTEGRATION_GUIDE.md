# UI System Integration Guide

## Overview

The Pixelversum UI system is now fully integrated with the game engine. All screens use the Alien (1979) industrial aesthetic with an amber/orange color scheme.

## Architecture

```
App.jsx
  └─ ErrorBoundary
      └─ GameContainer (manages state & screens)
          ├─ UIManager (handles UI navigation)
          │   ├─ LoadingScreen
          │   ├─ MainMenu
          │   ├─ NewGameSetup
          │   ├─ LoadGameScreen
          │   ├─ SaveGameScreen
          │   ├─ SettingsScreen
          │   ├─ InGameMenu
          │   ├─ StatisticsScreen
          │   └─ CreditsScreen
          └─ SpaceGame (game canvas)
```

## Components

### GameContainer
**Location:** `src/components/GameContainer.jsx`

Top-level container that manages:
- UI visibility state
- Game active/paused state
- Game state (credits, playtime, statistics)
- Save/load operations
- Auto-save (every 5 minutes)
- Settings persistence

**Key Methods:**
- `handleNewGame(setupData)` - Start new game
- `handleLoadGame(saveData)` - Load saved game
- `handleSaveGame(saveId, saveData)` - Save game
- `handleAutoSave()` - Auto-save current state
- `handleResumeGame()` - Resume from pause
- `handleQuitGame(quitToDesktop)` - Quit game

### UIManager
**Location:** `src/components/ui/UIManager.jsx`

Manages all UI screen navigation and state:
- Screen state management (currentScreen, previousScreen)
- ESC key listener for in-game menu
- Navigation callbacks
- Theme provider wrapper

**Screens:**
- `loading` - Initial loading screen
- `mainMenu` - Main menu
- `newGameSetup` - New game configuration
- `loadGame` - Load saved game
- `saveGame` - Save current game
- `settings` - Game settings
- `inGameMenu` - Pause menu
- `statistics` - Player statistics
- `credits` - Game credits
- `game` - Active gameplay (null, rendered separately)

### GameStateManager
**Location:** `src/utils/GameStateManager.js`

Utility for save/load operations:

```javascript
// Save game
saveGame(saveId, gameState, saveName)

// Load game
loadGame(saveId)

// Get all saves
getAllSaves()

// Delete save
deleteSave(saveId)

// Auto-save
autoSave(gameState)

// Quick save
quickSave(gameState)

// Settings
saveSettings(settings)
loadSettings()

// Statistics
saveStatistics(statistics)
loadStatistics()

// Export/Import
exportSave(saveId)
importSave(file)

// Admin
clearAllSaves()
```

### SpaceGame
**Location:** `src/components/SpaceGame.jsx`

Game canvas component (forwardRef):

**Props:**
- `initialState` - Initial game state
- `onStateChange` - Callback for state updates

**Exposed Methods (via ref):**
- `getGameState()` - Get current game state
- `loadGameState(state)` - Load saved state
- `applySettings(settings)` - Apply settings
- `destroy()` - Cleanup

## Navigation Flow

### From Main Menu
```
Main Menu
  ├─ New Game → New Game Setup → Game
  ├─ Load Game → Load Game Screen → Game
  ├─ Settings → Settings Screen → Main Menu
  ├─ Credits → Credits Screen → Main Menu
  └─ Quit → Exit
```

### In-Game
```
Game
  └─ Press ESC → In-Game Menu
                    ├─ Resume → Game
                    ├─ Save → Save Game Screen → In-Game Menu
                    ├─ Load → Load Game Screen → Game
                    ├─ Settings → Settings Screen → In-Game Menu
                    ├─ Statistics → Statistics Screen → In-Game Menu
                    ├─ Main Menu → Main Menu (with confirmation)
                    └─ Quit → Desktop (with confirmation)
```

## Save System

### Save Data Structure
```javascript
{
  id: 'unique_save_id',
  name: 'CUSTOM_SAVE_NAME',
  timestamp: 1234567890000,

  // Player info
  callsign: 'NOVA-7',
  shipName: 'WANDERER',
  shipColor: 'blue',

  // Game progress
  playtime: 3600000, // milliseconds
  currentSystem: 'system_12345',
  systemsExplored: 15,
  galaxySize: 'medium',
  difficulty: 'adventurer',
  seed: 'custom_seed',

  // Player state
  player: {
    x: 1000,
    y: 2000,
    hp: 85,
    maxHp: 100,
    shield: 60,
    maxShield: 100,
    // ... more player properties
  },

  // Economy
  credits: 5000,
  cargo: [...],

  // Statistics
  statistics: {
    enemiesDestroyed: 25,
    shotsFired: 500,
    shotsHit: 300,
    // ... more stats
  },

  // Status
  crewAlive: true,
  gameOver: false,
}
```

### LocalStorage Keys
- `pixelversum_save_{id}` - Save game data
- `pixelversum_settings` - Game settings
- `pixelversum_statistics` - Global statistics
- `pixelversum_theme` - UI theme preference
- `pixelversum_crt_enabled` - CRT effects enabled
- `pixelversum_crt_intensity` - CRT effects intensity

## Keyboard Controls

### Global
- **ESC** - Toggle in-game menu (when game active)

### Game Controls
- **WASD/Arrows** - Move ship
- **Space/Click** - Fire weapons
- **Shift** - Warp drive
- **X** - Brake
- **Z** - Shield
- **F** - Mine
- **M** - Map
- **I** - Inventory

## Settings

### Graphics
- Display theme (4 themes available)
- CRT effects (on/off, intensity)
- Resolution
- Pixel-perfect rendering
- V-Sync

### Audio
- Master volume
- Music volume
- SFX volume
- Ambient volume
- Individual mute controls

### Controls
- Mouse sensitivity
- Invert Y-axis
- Edge scrolling
- Keyboard scroll speed
- Key bindings (display only)

### Gameplay
- Auto-save (on/off, interval)
- UI scale
- Show tutorials
- Difficulty indicators
- Pause when unfocused

## Statistics Tracked

### Mission
- Total playtime
- Missions completed
- Systems explored
- Planets visited
- Stations visited
- Jumps executed

### Combat
- Enemies destroyed
- Shots fired
- Shots hit
- Accuracy percentage
- Damage dealt
- Damage taken
- K/D ratio

### Economy
- Current credits
- Total earned
- Total spent
- Resources mined
- Items purchased
- Items sold

### Exploration
- Artifacts found
- Megastructures discovered
- Blackholes encountered
- Asteroids mined
- Jump gates used

### Achievements
- First Jump
- Explorer (10 systems)
- Combatant (25 enemies)
- Survivor (1 hour)
- Wealthy (10,000 credits)
- Artifact Hunter (5 artifacts)

## Adding New Screens

1. Create screen component in `src/components/ui/`
2. Create corresponding CSS file
3. Add screen to UIManager's `renderScreen()` switch
4. Add navigation handlers in UIManager
5. Update screen state enum
6. Add to navigation flow

Example:
```javascript
// 1. Create MyNewScreen.jsx
const MyNewScreen = ({ onClose, data }) => {
  // ... screen implementation
};

// 2. Add to UIManager
import MyNewScreen from './MyNewScreen';

// In renderScreen():
case 'myNewScreen':
  return <MyNewScreen onClose={handleClose} data={gameState} />;
```

## Theme System

All screens use ThemeContext for consistent theming:
```javascript
import { useContext } from 'react';
import { ThemeContext } from './ThemeContext';

const MyComponent = () => {
  const { theme, crtEnabled, crtIntensity } = useContext(ThemeContext);

  return (
    <div style={{
      '--my-bg': theme.background,
      '--my-text': theme.text,
      '--my-accent': theme.primary,
      '--my-glow': theme.glowStrong,
    }}>
      <CRTOverlay enabled={crtEnabled} intensity={crtIntensity} />
      {/* ... */}
    </div>
  );
};
```

## Testing

1. **New Game Flow:**
   - Start app → Loading screen appears
   - After loading → Main menu appears
   - Click "New Game" → Setup screen
   - Configure and start → Game begins

2. **Save/Load:**
   - In game, press ESC → In-game menu
   - Click "Save" → Enter name → Save
   - Click "Load" → Select save → Load

3. **Settings:**
   - Change theme → Theme persists
   - Change volume → Volume persists
   - Adjust CRT → Effects update

4. **Statistics:**
   - Play game, perform actions
   - Check statistics → Values update
   - Achievements unlock when conditions met

## Troubleshooting

### UI not showing
- Check GameContainer `showUI` state
- Verify UIManager `currentScreen` value
- Check console for errors

### Save/load not working
- Check browser localStorage permissions
- Verify GameStateManager functions
- Check console for errors

### ESC key not working
- Verify `isGameActive` state
- Check UIManager ESC key listener
- Ensure no other handlers blocking

### Theme not applying
- Verify ThemeProvider wraps components
- Check CSS custom properties
- Verify theme.js exports

## Future Enhancements

- [ ] Cloud save integration
- [ ] Multiple save slots with thumbnails
- [ ] Achievement notifications
- [ ] Statistics graphs/charts
- [ ] Mod support
- [ ] Localization
- [ ] Controller support
- [ ] Accessibility improvements
- [ ] Tutorial system
- [ ] Achievement rewards

## Files Modified/Created

**New Files:**
- `src/components/GameContainer.jsx`
- `src/components/ui/UIManager.jsx`
- `src/utils/GameStateManager.js`
- `src/components/ui/SaveGameScreen.jsx`
- `src/components/ui/InGameMenu.jsx`
- `src/components/ui/StatisticsScreen.jsx`
- `src/components/ui/CreditsScreen.jsx`
- All corresponding CSS files

**Modified Files:**
- `src/App.jsx` - Now uses GameContainer
- `src/components/SpaceGame.jsx` - Now uses forwardRef
- `src/components/ui/theme.js` - Added new symbols

## Credits

UI System designed with Alien (1979) industrial aesthetic.
All screens use retro terminal styling with CRT effects.
Font: DigitalDisco (custom retro terminal font)
