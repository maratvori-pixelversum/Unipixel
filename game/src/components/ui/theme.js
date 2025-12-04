/**
 * Retro-Futuristic Terminal Themes (Alien 1979 inspired)
 * Industrial, grimy, isolated space station aesthetic
 */

export const HORROR_THEMES = {
  // Default: MOTHER Terminal (Alien 1979 style - industrial green CRT)
  mother: {
    name: 'MOTHER Terminal',
    primary: '#33aa33',        // Retro green CRT
    secondary: '#1a4d1a',      // Dark industrial green
    accent: '#44cc44',         // Bright green accent
    highlight: '#66ee66',      // Green highlight
    background: '#0a0f0a',     // Almost black with green tint
    bgSecondary: '#0f140f',    // Slightly lighter
    text: '#88cc88',           // Readable green
    textDim: '#4a6b4a',        // Dimmed green
    glow: 'rgba(51, 170, 51, 0.3)',
    glowStrong: 'rgba(51, 170, 51, 0.6)',
    border: '#2a5a2a',
    warning: '#ccaa33',        // Industrial yellow
    danger: '#aa5533',         // Rust orange
    success: '#33aa33',        // Green
  },

  // Amber Terminal (retro computer amber monochrome)
  amber: {
    name: 'Amber Terminal',
    primary: '#ffaa00',        // Amber CRT
    secondary: '#885500',      // Dark amber
    accent: '#ffcc33',         // Bright amber
    highlight: '#ffdd66',      // Light amber
    background: '#0f0a05',     // Almost black with amber tint
    bgSecondary: '#1a1008',    // Slightly lighter
    text: '#ddaa66',           // Readable amber
    textDim: '#997744',        // Dimmed amber
    glow: 'rgba(255, 170, 0, 0.3)',
    glowStrong: 'rgba(255, 170, 0, 0.6)',
    border: '#aa7733',
    warning: '#ff6600',        // Orange warning
    danger: '#cc4400',         // Red-orange
    success: '#88aa44',        // Olive green
  },

  // Nostromo Terminal (cold industrial blue-gray)
  nostromo: {
    name: 'Nostromo Terminal',
    primary: '#6688aa',        // Industrial blue-gray
    secondary: '#334455',      // Dark blue-gray
    accent: '#88aacc',         // Light blue-gray
    highlight: '#aaccee',      // Bright blue
    background: '#080a0c',     // Almost black with blue tint
    bgSecondary: '#0f1214',    // Slightly lighter
    text: '#99aabb',           // Readable blue-gray
    textDim: '#556677',        // Dimmed blue-gray
    glow: 'rgba(102, 136, 170, 0.3)',
    glowStrong: 'rgba(102, 136, 170, 0.6)',
    border: '#445566',
    warning: '#cc9944',        // Industrial yellow
    danger: '#cc6644',         // Rust red
    success: '#66aa88',        // Muted teal
  },

  // Rust Terminal (industrial decay - Sevastopol station aesthetic)
  rust: {
    name: 'Rust Terminal',
    primary: '#aa6633',        // Rust orange
    secondary: '#663311',      // Dark rust
    accent: '#cc8844',         // Light rust
    highlight: '#ddaa66',      // Orange-tan
    background: '#0d0805',     // Almost black with brown tint
    bgSecondary: '#1a1008',    // Slightly lighter
    text: '#bb9966',           // Tan-brown
    textDim: '#886644',        // Dimmed brown
    glow: 'rgba(170, 102, 51, 0.3)',
    glowStrong: 'rgba(170, 102, 51, 0.6)',
    border: '#885533',
    warning: '#ffaa44',        // Orange warning
    danger: '#cc5522',         // Red-orange
    success: '#88aa66',        // Muted green
  },
};

// Default theme - Amber Terminal (retro computer aesthetic)
export const DEFAULT_THEME = HORROR_THEMES.amber;

// CRT Effect settings - ENHANCED for ultra-retro pixelated aesthetic
export const CRT_EFFECTS = {
  scanlineOpacity: 0.35,          // More visible scanlines
  scanlineHeight: 1,               // Thinner, more numerous scanlines
  glowBlur: 30,                   // Stronger phosphor glow
  glowIntensity: 0.85,            // More intense glow
  noiseOpacity: 0.15,             // More visible static noise
  flickerIntensity: 0.05,         // More noticeable flicker
  flickerSpeed: 50,               // Faster flicker (ms)
  glitchSpeed: 3000,              // Occasional glitches (ms)
  vignetteStrength: 0.85,         // Stronger edge darkening
  curvatureDistortion: 0.25,      // More CRT curve
  chromaticAberration: 3,         // More color separation at edges
  pixelation: true,               // Enable pixelated rendering
  pixelSize: 1,                   // Pixel grid size
};

// Typography
export const TYPOGRAPHY = {
  fontFamily: '"DigitalDisco", "Courier New", monospace',
  fontFamilyThin: '"DigitalDisco-Thin", "Courier New", monospace',
  sizes: {
    xxs: '10px',
    xs: '12px',
    sm: '14px',
    md: '16px',
    lg: '18px',
    xl: '24px',
    xxl: '32px',
    xxxl: '48px',
  },
  weight: {
    normal: 400,
    bold: 700,
  },
  lineHeight: 1.4,
  letterSpacing: '0.05em',
};

// Box drawing characters for borders
export const BOX_CHARS = {
  // Double line
  topLeft: '╔',
  topRight: '╗',
  bottomLeft: '╚',
  bottomRight: '╝',
  horizontal: '═',
  vertical: '║',
  horizontalDown: '╦',
  horizontalUp: '╩',
  verticalRight: '╠',
  verticalLeft: '╣',
  cross: '╬',

  // Single line
  sTopLeft: '┌',
  sTopRight: '┐',
  sBottomLeft: '└',
  sBottomRight: '┘',
  sHorizontal: '─',
  sVertical: '│',
  sHorizontalDown: '┬',
  sHorizontalUp: '┴',
  sVerticalRight: '├',
  sVerticalLeft: '┤',
  sCross: '┼',

  // Rounded
  rTopLeft: '╭',
  rTopRight: '╮',
  rBottomLeft: '╰',
  rBottomRight: '╯',
};

// UI symbols
export const SYMBOLS = {
  arrow: '►',
  bullet: '•',
  check: '☑',
  uncheck: '☐',
  radio: '◉',
  radioEmpty: '◯',
  cursor: '█',
  filled: '█',
  empty: '░',
  halfFilled: '▒',
  loading: ['|', '/', '-', '\\'],
  skull: '☠',
  warning: '⚠',
  dead: '✕',
  cross: '✕',
  star: '★',
  folder: '📁',
  monitor: '▣',
  speaker: '♫',
  gear: '⚙',
  settings: '⚙',
};

// Responsive breakpoints
export const BREAKPOINTS = {
  mobile: '600px',
  tablet: '900px',
  desktop: '1200px',
  wide: '1600px',
};

// Animation durations (ms)
export const ANIMATIONS = {
  fast: 150,
  normal: 300,
  slow: 500,
  verySlow: 800,
  scanlineSpeed: 8000,
  flickerSpeed: 100,
  glitchSpeed: 3000,
};

// Z-index layers
export const Z_INDEX = {
  background: 0,
  content: 1,
  overlay: 10,
  modal: 20,
  crtEffects: 30,
  tooltip: 40,
  notification: 50,
};
