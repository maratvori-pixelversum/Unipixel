# Pixelversum Dark Horror UI System

A complete dark horror-themed UI system with vintage CRT terminal aesthetics.

## Features

### ✨ Dark Horror Atmosphere
- 4 vintage horror color schemes (Blood, Decay, Void, Rust)
- Muted dark colors (no bright neons)
- Scary, ominous visual effects
- Pixelated 3D depth rendering

### 📺 CRT Effects
- Animated scanlines
- Phosphor glow
- Static/noise overlay
- Flicker simulation
- Dark vignette
- Chromatic aberration
- Screen curvature

### 🎮 Touch & Mobile Support
- All components touch-friendly
- Minimum 44x44px touch targets
- Responsive breakpoints
- Mobile/tablet/desktop layouts

### 🎨 Components

#### Core Components
- **TerminalPanel** - Bordered panels with box-drawing characters
- **TerminalButton** - Touch-friendly buttons with variants
- **CRTOverlay** - Vintage CRT effects overlay
- **ThemeContext** - Theme management system

#### Screen Components
- **LoadingScreen** - Horror-themed loading with progress
- **MainMenu** - Main navigation with keyboard/touch controls

## Quick Start

### 1. Wrap your app with ThemeProvider

\`\`\`jsx
import { ThemeProvider } from './components/ui/ThemeContext';
import CRTOverlay from './components/ui/common/CRTOverlay';

function App() {
  return (
    <ThemeProvider>
      <CRTOverlay enabled={true} intensity={1.0} />
      <YourComponents />
    </ThemeProvider>
  );
}
\`\`\`

### 2. Use components

\`\`\`jsx
import { useContext } from 'react';
import { ThemeContext } from './components/ui/ThemeContext';
import TerminalPanel from './components/ui/common/TerminalPanel';
import TerminalButton from './components/ui/common/TerminalButton';

function MyComponent() {
  const { theme } = useContext(ThemeContext);

  return (
    <TerminalPanel
      title="SYSTEM STATUS"
      width="400px"
      borderStyle="double"
      glow={true}
      depth3d={true}
    >
      <p>Content goes here...</p>
      <TerminalButton
        variant="primary"
        onClick={() => console.log('Clicked!')}
        glowing={true}
      >
        CONFIRM
      </TerminalButton>
    </TerminalPanel>
  );
}
\`\`\`

### 3. Change themes

\`\`\`jsx
const { changeTheme, availableThemes } = useContext(ThemeContext);

// Change to Decay theme
changeTheme('decay');

// Available: 'blood', 'decay', 'void', 'rust'
\`\`\`

## Component Reference

### TerminalPanel

\`\`\`jsx
<TerminalPanel
  title="Panel Title"           // Optional title
  borderStyle="double"            // 'double', 'single', 'rounded'
  width="auto"                    // CSS width
  height="auto"                   // CSS height
  glow={true}                     // Enable glow effect
  depth3d={true}                  // Enable 3D depth
  className=""                    // Additional classes
  style={{}}                      // Additional styles
>
  {children}
</TerminalPanel>
\`\`\`

### TerminalButton

\`\`\`jsx
<TerminalButton
  onClick={handleClick}           // Click handler
  disabled={false}                // Disabled state
  variant="primary"               // 'primary', 'secondary', 'danger'
  size="medium"                   // 'small', 'medium', 'large'
  icon={SYMBOLS.arrow}            // Optional icon
  fullWidth={false}               // Full width button
  glowing={false}                 // Glowing animation
  className=""                    // Additional classes
>
  Button Text
</TerminalButton>
\`\`\`

### LoadingScreen

\`\`\`jsx
<LoadingScreen
  onLoadComplete={() => console.log('Loading complete')}
  skipEnabled={true}              // Allow space to skip
/>
\`\`\`

### MainMenu

\`\`\`jsx
<MainMenu
  onNewGame={() => {}}            // New game handler
  onContinue={() => {}}           // Continue handler
  onLoadGame={() => {}}           // Load game handler
  onSettings={() => {}}           // Settings handler
  onCredits={() => {}}            // Credits handler
  onExit={() => {}}               // Exit handler
  hasSaveData={false}             // Enable/disable continue
/>
\`\`\`

### CRTOverlay

\`\`\`jsx
<CRTOverlay
  enabled={true}                  // Enable effects
  intensity={1.0}                 // 0.0 - 1.0
/>
\`\`\`

## Theme Configuration

### Available Themes

1. **blood** (Default) - Dark blood red
2. **decay** - Sickly olive green
3. **void** - Deep purple-blue
4. **rust** - Orange-brown industrial

### Theme Context API

\`\`\`jsx
const {
  theme,              // Current theme object
  themeName,          // Current theme name
  changeTheme,        // Change theme function
  availableThemes,    // Array of theme names
  crtEnabled,         // CRT effects enabled
  setCrtEnabled,      // Set CRT enabled
  toggleCRT,          // Toggle CRT
  crtIntensity,       // CRT intensity (0-1)
  setCrtIntensity,    // Set CRT intensity
} = useContext(ThemeContext);
\`\`\`

## Styling

All components use CSS custom properties (CSS variables) for theming:

\`\`\`css
.my-component {
  color: var(--menu-text);
  background: var(--menu-bg);
  border-color: var(--menu-accent);
  text-shadow: 0 0 10px var(--menu-glow);
}
\`\`\`

## Accessibility

- Keyboard navigation support
- ARIA labels (when applicable)
- Minimum 44x44px touch targets on mobile
- High contrast horror color schemes
- Screen reader friendly

## Performance

- CSS animations (GPU accelerated)
- Optimized for mobile devices
- Reduced effects on low-end devices
- Lazy loading where possible

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## Next Steps

Screens to implement:
- NewGameSetup
- LoadGameScreen
- SaveGameScreen
- SettingsScreen
- InGameMenu
- StatisticsScreen
- CreditsScreen

See `UI_SCREENS_PLAN.md` for complete specifications.
