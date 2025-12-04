export const ENGINE_CONFIG = {
  baseResolution: { width: 1920, height: 1080 },
  pixelDensity: 1,
  targetFrameRate: 60,
  physicsTickRate: 120,
  renderingMode: 'pixel-perfect'
};

export const RETRO_PALETTE = {
  // Darker background tones
  deepBlack: '#000000',
  voidBlack: '#050508',
  shadowGray: '#0f0f12',
  darkGray: '#1a1a20',
  mediumGray: '#2a2a35',

  // Darker hull colors (more vintage gray-blue)
  hullPrimary: '#4a4a55',
  hullSecondary: '#38383f',
  hullHighlight: '#5a5a66',

  // Muted status colors (vintage CRT monitor style)
  statusBlue: '#2a4a66',
  warpBlue: '#3366aa',
  alertRed: '#aa2828',
  cautionOrange: '#aa4422',
  statusGreen: '#2a8844',

  // Darker engine colors
  engineOrange: '#cc5500',
  engineBright: '#dd8822',

  // Muted weapon colors
  plasmaGreen: '#2acc55',
  laserRed: '#cc2222',

  // Deeper space colors
  spaceBlue: '#000a15',
  nebulaBlue: '#0f1a2a',
  nebulaPurple: '#2a1528',

  // Dimmer celestial colors
  starWhite: '#eeeef5',
  starYellow: '#dddd88',
  planetBlue: '#1a5588',
  planetGreen: '#2a8855',
  planetRed: '#884433',

  // Darker object colors
  asteroidGray: '#3a3a42',
  enemyRed: '#aa2a44',

  // Muted special effects
  warpPurple: '#8833cc',
  shieldCyan: '#2abbcc'
};
