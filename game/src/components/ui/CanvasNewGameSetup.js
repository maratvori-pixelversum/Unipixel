import { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import fontLoader from '../../utils/FontLoader';
import CockpitFrame from './common/CockpitFrame';
// REMOVED: Portrait components - portraits now drawn directly on canvas for better integration
import {
  generate3DBackgroundTexture,
  generate3DPanel,
  generate3DButton
} from '../../utils/Pixelated3DGenerators';
import {
  drawMetalPanel,
  drawCRTScreen,
  drawCockpitButton,
  drawToggleSwitch,
  drawRivet,
  COCKPIT_COLORS,
} from './common/CockpitAssets';

// Move static data outside component to prevent re-creation
const SHIP_CLASSES = [
  { value: 'scout', label: 'SC-CLASS SCOUT', desc: 'Fast & agile reconnaissance', stats: { speed: 10, armor: 3, cargo: 4, weapons: 4 } },
  { value: 'explorer', label: 'EX-CLASS EXPLORER', desc: 'Balanced deep space [RECOMMENDED]', stats: { speed: 7, armor: 6, cargo: 7, weapons: 6 } },
  { value: 'fighter', label: 'FT-CLASS INTERCEPTOR', desc: 'Heavy combat superiority', stats: { speed: 8, armor: 8, cargo: 3, weapons: 10 } },
  { value: 'trader', label: 'TR-CLASS HAULER', desc: 'Large cargo capacity', stats: { speed: 4, armor: 5, cargo: 10, weapons: 4 } },
  { value: 'research', label: 'RS-CLASS RESEARCH', desc: 'Science & exploration', stats: { speed: 5, armor: 4, cargo: 6, weapons: 3 } },
  { value: 'military', label: 'ML-CLASS DESTROYER', desc: 'Military assault vessel', stats: { speed: 6, armor: 10, cargo: 5, weapons: 9 } },
];

const GALAXY_SIZES = [
  { value: 'tiny', label: 'TINY', desc: '25 systems - Tutorial', details: 'Perfect for learning mechanics, 30-60 min' },
  { value: 'small', label: 'SMALL', desc: '50 systems - Quick game', details: 'Fast-paced experience, 1-2 hours' },
  { value: 'medium', label: 'MEDIUM', desc: '100 systems [RECOMMENDED]', details: 'Balanced exploration, 3-5 hours' },
  { value: 'large', label: 'LARGE', desc: '200 systems - Extended', details: 'Deep space odyssey, 6-10 hours' },
  { value: 'huge', label: 'HUGE', desc: '500 systems - Epic', details: 'Massive galaxy conquest, 15+ hours' },
  { value: 'infinite', label: 'INFINITE', desc: '∞ Procedural - Endless', details: 'Unlimited procedural generation' },
];

const DIFFICULTIES = [
  { value: 'story', label: 'STORY MODE', desc: 'Narrative focus, minimal combat', details: 'No permadeath, auto-saves, unlimited resources' },
  { value: 'explorer', label: 'EXPLORER', desc: 'Casual exploration, forgiving', details: 'Easy combat, generous resources, frequent saves' },
  { value: 'adventurer', label: 'ADVENTURER', desc: 'Balanced challenge [RECOMMENDED]', details: 'Normal combat, balanced economy, manual saves' },
  { value: 'veteran', label: 'VETERAN', desc: 'Hardcore survival mode', details: 'Hard combat, scarce resources, limited saves' },
  { value: 'hardcore', label: 'HARDCORE', desc: 'Extreme difficulty', details: 'Very hard combat, brutal economy, rare saves' },
  { value: 'nightmare', label: 'NIGHTMARE', desc: 'Permadeath nightmare', details: 'One life only, extreme difficulty, no saves' },
];

const RACES = [
  { value: 'human', label: 'HUMAN', traits: '+10% Trading, +5% Diplomacy' },
  { value: 'alien_grey', label: 'GREY', traits: '+15% Research, +10% Sensors' },
  { value: 'alien_reptilian', label: 'REPTILIAN', traits: '+10% Combat, +5% Armor' },
  { value: 'alien_insectoid', label: 'INSECTOID', traits: '+15% Mining, +10% Speed' },
  { value: 'crystalline', label: 'CRYSTALLINE', traits: '+20% Energy, +10% Shields' },
  { value: 'aquatic', label: 'AQUATIC', traits: '+15% Bio-tech, +10% Adaptation' },
  { value: 'avian', label: 'AVIAN', traits: '+20% Speed, +15% Evasion' },
  { value: 'rocky', label: 'LITHOID', traits: '+25% Armor, +15% Durability' },
  { value: 'ethereal', label: 'ETHEREAL', traits: '+30% Tech, +20% Sensors' },
  { value: 'fungal', label: 'FUNGAL', traits: '+20% Healing, +15% Growth' },
  { value: 'nomadic', label: 'NOMAD', traits: '+25% Trading, +20% Diplomacy' },
  { value: 'technocratic', label: 'TECHNOCRAT', traits: '+25% Efficiency, +15% Tech' },
];

const GENDERS = [
  { value: 'male', label: 'MALE' },
  { value: 'female', label: 'FEMALE' },
  { value: 'other', label: 'OTHER' },
];

const CREW_ROLES = [
  { key: 'engineer', label: 'ENGINEER', desc: 'Systems & repairs', skills: 'Repair +20%, Efficiency +15%' },
  { key: 'pilot', label: 'PILOT', desc: 'Navigation expert', skills: 'Maneuver +25%, Evasion +20%' },
  { key: 'scientist', label: 'SCIENTIST', desc: 'Research specialist', skills: 'Research +30%, Analysis +25%' },
  { key: 'medic', label: 'MEDIC', desc: 'Medical officer', skills: 'Healing +35%, Survival +20%' },
];

const STARTING_BONUSES = [
  { value: 'credits', label: '+5000 CREDITS', desc: 'Extra starting funds' },
  { value: 'fuel', label: '+50% FUEL', desc: 'Extended jump range' },
  { value: 'weapons', label: '+1 WEAPON SLOT', desc: 'Additional armament' },
  { value: 'crew', label: '+1 CREW MEMBER', desc: 'Extra specialist' },
  { value: 'cargo', label: '+20 CARGO SPACE', desc: 'More storage capacity' },
  { value: 'reputation', label: '+2 REPUTATION', desc: 'Better faction standing' },
  { value: 'shields', label: '+25% SHIELDS', desc: 'Enhanced protection' },
  { value: 'engines', label: '+15% SPEED', desc: 'Faster engines' },
  { value: 'scanner', label: 'ADVANCED SCANNER', desc: 'Better detection range' },
  { value: 'diplomacy', label: 'DIPLOMAT TRAIT', desc: '+20% negotiation bonus' },
];

const FACTIONS = [
  { value: 'independent', label: 'INDEPENDENT', desc: 'No faction allegiance, neutral standing' },
  { value: 'federation', label: 'FEDERATION', desc: 'United planets alliance, +trade -combat' },
  { value: 'pirates', label: 'PIRATES', desc: 'Outlaw syndicate, +combat -reputation' },
  { value: 'merchants', label: 'MERCHANTS GUILD', desc: 'Trading conglomerate, +credits -military' },
  { value: 'explorers', label: 'EXPLORERS', desc: 'Discovery corps, +sensors +fuel' },
  { value: 'military', label: 'MILITARY', desc: 'Armed forces, +weapons +armor' },
];

const TRAITS = [
  { value: 'lucky', label: 'LUCKY', desc: '+10% rare loot, +5% crit chance' },
  { value: 'veteran', label: 'VETERAN', desc: '+15% combat XP, -10% repair costs' },
  { value: 'engineer', label: 'ENGINEER', desc: '+20% repair speed, +ship efficiency' },
  { value: 'trader', label: 'TRADER', desc: '+25% trade profits, better prices' },
  { value: 'explorer', label: 'EXPLORER', desc: '+30% discovery XP, +scan range' },
  { value: 'survivor', label: 'SURVIVOR', desc: '+20% health, +damage resistance' },
];

/**
 * MASSIVELY ENHANCED Portrait Generation - Hundreds of pixels, complex details
 * Supports ALL 12 races with unique features and realistic rendering
 */
function generateDarkPortrait(ctx, x, y, width, height, race, gender, seed) {
  const pixelSize = 1.5;  // MUCH smaller pixels for thousands of details

  // Seeded random
  let s = seed;
  const rng = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const rngInt = (min, max) => Math.floor(rng() * (max - min + 1)) + min;

  // Dark background
  ctx.fillStyle = '#0a0805';
  ctx.fillRect(x, y, width, height);

  const cx = x + width / 2;
  const cy = y + height / 2;  // FIXED: Center vertically without offset

  // Race-specific color palettes and features (DARK THEME)
  let skinBase, skinMid, skinDark, hairBase, hairDark, eyeWhite, eyeColor, features;

  switch (race) {
    case 'human':
      skinBase = '#4a3a2a'; skinMid = '#3a2a1a'; skinDark = '#2a1a0a';
      hairBase = gender === 'female' ? '#2a1a08' : '#1a1008'; hairDark = '#0a0805';
      eyeWhite = '#4a4a4a'; eyeColor = '#6a4a2a';
      features = { hasHair: true, hasEars: true, noseType: 'normal' };
      break;
    case 'alien_grey':
      skinBase = '#3a3a3a'; skinMid = '#2a2a2a'; skinDark = '#1a1a1a';
      hairBase = '#2a2a2a'; hairDark = '#1a1a1a';
      eyeWhite = '#1a1a1a'; eyeColor = '#0a0a0a'; // BLACK eyes
      features = { hasHair: false, largeEyes: true, smallNose: true };
      break;
    case 'alien_reptilian':
      skinBase = '#2a3a1a'; skinMid = '#1a2a0a'; skinDark = '#0a1a00';
      hairBase = '#1a2a0a'; hairDark = '#0a1a00';
      eyeWhite = '#4a4a2a'; eyeColor = '#6a5a1a'; // YELLOW eyes
      features = { hasScales: true, verticalPupils: true, ridges: true };
      break;
    case 'alien_insectoid':
      skinBase = '#2a2a3a'; skinMid = '#1a1a2a'; skinDark = '#0a0a1a';
      hairBase = '#1a1a2a'; hairDark = '#0a0a1a';
      eyeWhite = '#2a3a3a'; eyeColor = '#1a2a2a'; // COMPOUND eyes
      features = { compoundEyes: true, mandibles: true, antennae: true };
      break;
    case 'crystalline':
      skinBase = '#2a3a3a'; skinMid = '#1a2a2a'; skinDark = '#0a1a1a';
      hairBase = '#1a2a2a'; hairDark = '#0a1a1a';
      eyeWhite = '#2a3a3a'; eyeColor = '#1a2a2a'; // CRYSTALLINE glow
      features = { crystalline: true, faceted: true };
      break;
    case 'aquatic':
      skinBase = '#1a2a3a'; skinMid = '#0a1a2a'; skinDark = '#00081a';
      hairBase = '#0a1a2a'; hairDark = '#00081a';
      eyeWhite = '#2a3a4a'; eyeColor = '#1a2a3a'; // BLUE eyes
      features = { gills: true, finLike: true, smoothSkin: true };
      break;
    case 'avian':
      skinBase = '#3a2a1a'; skinMid = '#2a1a0a'; skinDark = '#1a0a00';
      hairBase = '#2a1a08'; hairDark = '#1a0a00';
      eyeWhite = '#3a3a2a'; eyeColor = '#2a2a1a'; // SHARP eyes
      features = { beak: true, feathers: true, sharpEyes: true };
      break;
    case 'rocky':
      skinBase = '#3a3a2a'; skinMid = '#2a2a1a'; skinDark = '#1a1a0a';
      hairBase = '#2a2a1a'; hairDark = '#1a1a0a';
      eyeWhite = '#2a2a1a'; eyeColor = '#1a1a08'; // STONE texture
      features = { rocky: true, angular: true, heavyBrow: true };
      break;
    case 'ethereal':
      skinBase = '#2a1a3a'; skinMid = '#1a0a2a'; skinDark = '#0a001a';
      hairBase = '#1a0a2a'; hairDark = '#0a001a';
      eyeWhite = '#3a2a4a'; eyeColor = '#2a1a3a'; // GLOWING purple
      features = { ethereal: true, glowing: true, translucent: true };
      break;
    case 'fungal':
      skinBase = '#2a1a2a'; skinMid = '#1a0a1a'; skinDark = '#0a000a';
      hairBase = '#1a0a1a'; hairDark = '#0a000a';
      eyeWhite = '#2a1a2a'; eyeColor = '#1a0a1a'; // SPORE eyes
      features = { fungal: true, spores: true, organic: true };
      break;
    case 'nomadic':
      skinBase = '#3a3a1a'; skinMid = '#2a2a0a'; skinDark = '#1a1a00';
      hairBase = '#2a2a0a'; hairDark = '#1a1a00';
      eyeWhite = '#3a3a2a'; eyeColor = '#2a2a1a'; // WARM eyes
      features = { hasHair: true, weathered: true, scars: true };
      break;
    case 'technocratic':
      skinBase = '#2a3a2a'; skinMid = '#1a2a1a'; skinDark = '#0a1a0a';
      hairBase = '#1a2a1a'; hairDark = '#0a1a0a';
      eyeWhite = '#2a3a2a'; eyeColor = '#1a2a1a'; // CYBER eyes
      features = { cybernetic: true, implants: true, mechanical: true };
      break;
    default:
      skinBase = '#3a2a1a'; skinMid = '#2a1a0a'; skinDark = '#1a0a00';
      hairBase = '#1a1008'; hairDark = '#0a0805';
      eyeWhite = '#4a4a4a'; eyeColor = '#6a4a2a';
      features = { hasHair: true, hasEars: true };
  }

  // LAYER 1: Base face shape with COMPLEX 3D shading (HUNDREDS OF PIXELS)
  for (let py = 0; py < height; py += pixelSize) {
    for (let px = 0; px < width; px += pixelSize) {
      const dx = px - width / 2;
      const dy = py - height / 2;

      // Complex face shape based on race
      const yNorm = (py - 10) / (height - 20);
      let faceWidth;

      if (features.largeEyes) { // Grey aliens - large head
        faceWidth = width * (0.48 - Math.abs(yNorm - 0.35) * 0.25);
      } else if (features.angular || features.rocky) { // Angular races
        faceWidth = width * (0.38 - Math.abs(yNorm - 0.5) * 0.12);
      } else if (features.beak) { // Avian - pointed
        faceWidth = width * (0.35 - Math.abs(yNorm - 0.6) * 0.18);
      } else { // Normal humanoid
        faceWidth = width * (0.42 - Math.abs(yNorm - 0.5) * 0.15);
      }

      const dist = Math.abs(dx);

      if (dist < faceWidth && py > 10 && py < height - 10) {
        // ULTRA-COMPLEX multi-layer 3D shading
        const lightDist = (dx + faceWidth) / (faceWidth * 2);
        const depthShade = Math.abs(dx) / faceWidth;
        const verticalShade = Math.abs(dy) / (height / 2);

        // 5-layer shading for maximum realism
        let color;
        if (lightDist < 0.2 || depthShade > 0.85) {
          color = skinDark;  // Deep shadow
        } else if (lightDist < 0.35 || depthShade > 0.7) {
          color = skinMid;   // Mid shadow
        } else if (lightDist < 0.5) {
          color = skinMid;   // Mid-tone
        } else if (lightDist < 0.7) {
          color = skinBase;  // Lit area
        } else {
          color = skinBase;  // Highlight
        }

        ctx.fillStyle = color;
        ctx.fillRect(x + px, y + py, pixelSize, pixelSize);

        // Add texture details
        if (features.hasScales && rng() > 0.93) {
          ctx.fillStyle = skinDark;
          ctx.fillRect(x + px, y + py, pixelSize, pixelSize);
        } else if (features.crystalline && (px + py) % 6 === 0) {
          ctx.fillStyle = skinMid;
          ctx.fillRect(x + px, y + py, pixelSize * 1.5, pixelSize * 1.5);
        } else if (features.rocky && rng() > 0.92) {
          ctx.fillStyle = skinDark;
          ctx.fillRect(x + px, y + py, pixelSize * 2, pixelSize);
        }
      }
    }
  }

  // LAYER 2: Neck
  ctx.fillStyle = skinDark;
  ctx.fillRect(cx - width * 0.15, y + height - 15, width * 0.3, 20);

  // LAYER 3: Hair/head features
  if (features.hasHair && race !== 'alien_grey') {
    const hairStyle = gender === 'female' ? 'long' : rngInt(0, 1) === 0 ? 'short' : 'medium';
    ctx.fillStyle = hairBase;

    if (hairStyle === 'long') {
      ctx.fillRect(cx - width * 0.48, cy - height * 0.48, width * 0.96, height * 0.75);
    } else if (hairStyle === 'short') {
      ctx.fillRect(cx - width * 0.43, cy - height * 0.48, width * 0.86, height * 0.38);
    } else {
      ctx.fillRect(cx - width * 0.45, cy - height * 0.48, width * 0.9, height * 0.52);
    }

    // Hair texture (MANY strands)
    ctx.fillStyle = hairDark;
    for (let i = 0; i < 80; i++) {  // DOUBLED strands
      const hx = cx - width * 0.43 + rng() * width * 0.86;
      const hy = cy - height * 0.48 + rng() * (hairStyle === 'long' ? height * 0.75 : height * 0.4);
      ctx.fillRect(hx, hy, pixelSize, pixelSize * rngInt(3, 10));
    }
  } else if (features.antennae) {
    // Insectoid antennae
    ctx.fillStyle = skinMid;
    ctx.fillRect(cx - width * 0.25, cy - height * 0.52, pixelSize * 2, height * 0.15);
    ctx.fillRect(cx + width * 0.25, cy - height * 0.52, pixelSize * 2, height * 0.15);
  } else if (features.feathers) {
    // Avian crest
    ctx.fillStyle = hairBase;
    for (let i = 0; i < 12; i++) {
      const fx = cx - width * 0.15 + i * (width * 0.3 / 12);
      ctx.fillRect(fx, cy - height * 0.52, pixelSize * 2, height * 0.12);
    }
  }

  // LAYER 4: Eyes (MUCH MORE DETAILED)
  const eyeY = cy - height * 0.12;
  const eyeSpacing = width * (features.largeEyes ? 0.22 : 0.19);

  if (features.largeEyes) {
    // Large alien eyes (Grey)
    ctx.fillStyle = skinDark;
    ctx.fillRect(cx - eyeSpacing - 12, eyeY - 8, 24, 20);
    ctx.fillRect(cx + eyeSpacing - 12, eyeY - 8, 24, 20);
    ctx.fillStyle = eyeColor;
    ctx.fillRect(cx - eyeSpacing - 10, eyeY - 6, 20, 16);
    ctx.fillRect(cx + eyeSpacing - 10, eyeY - 6, 20, 16);
  } else if (features.compoundEyes) {
    // Compound eyes (Insectoid)
    ctx.fillStyle = eyeColor;
    for (let ey = -8; ey < 8; ey += 3) {
      for (let ex = -10; ex < 10; ex += 3) {
        ctx.fillRect(cx - eyeSpacing + ex, eyeY + ey, 2, 2);
        ctx.fillRect(cx + eyeSpacing + ex, eyeY + ey, 2, 2);
      }
    }
  } else {
    // Normal eyes with detail
    ctx.fillStyle = skinDark;
    ctx.fillRect(cx - eyeSpacing - 9, eyeY - 5, 18, 14);
    ctx.fillRect(cx + eyeSpacing - 9, eyeY - 5, 18, 14);
    ctx.fillStyle = eyeWhite;
    ctx.fillRect(cx - eyeSpacing - 7, eyeY - 3, 14, 10);
    ctx.fillRect(cx + eyeSpacing - 7, eyeY - 3, 14, 10);
    ctx.fillStyle = eyeColor;
    ctx.fillRect(cx - eyeSpacing - 3, eyeY - 1, 6, 7);
    ctx.fillRect(cx + eyeSpacing - 3, eyeY - 1, 6, 7);

    // Pupils
    ctx.fillStyle = '#0a0a0a';
    if (features.verticalPupils) {
      ctx.fillRect(cx - eyeSpacing - 1, eyeY - 1, 2, 7);
      ctx.fillRect(cx + eyeSpacing - 1, eyeY - 1, 2, 7);
    } else {
      ctx.fillRect(cx - eyeSpacing - 1.5, eyeY + 1, 3, 3);
      ctx.fillRect(cx + eyeSpacing - 1.5, eyeY + 1, 3, 3);
    }
  }

  // LAYER 5: Nose
  if (!features.beak && !features.smallNose) {
    ctx.fillStyle = skinMid;
    ctx.fillRect(cx - 5, cy + 2, 10, 15);
    ctx.fillStyle = skinDark;
    ctx.fillRect(cx - 7, cy + 12, 4, 5);
    ctx.fillRect(cx + 3, cy + 12, 4, 5);
  } else if (features.smallNose) {
    ctx.fillStyle = skinMid;
    ctx.fillRect(cx - 2, cy + 4, 4, 6);
  } else if (features.beak) {
    ctx.fillStyle = '#2a2a1a';
    ctx.fillRect(cx - 6, cy, 12, 8);
    ctx.fillRect(cx - 4, cy + 8, 8, 10);
  }

  // LAYER 6: Mouth
  if (features.mandibles) {
    // Insectoid mandibles
    ctx.fillStyle = skinDark;
    ctx.fillRect(cx - 16, cy + 22, 10, 4);
    ctx.fillRect(cx + 6, cy + 22, 10, 4);
    ctx.fillRect(cx - 8, cy + 24, 16, 3);
  } else if (!features.beak) {
    ctx.fillStyle = skinDark;
    ctx.fillRect(cx - 14, cy + 22, 28, 4);
    ctx.fillRect(cx - 12, cy + 26, 24, 2);
  }

  // LAYER 7: Special features
  if (features.hasEars) {
    ctx.fillStyle = skinMid;
    ctx.fillRect(cx - width * 0.45, cy - 2, 10, 24);
    ctx.fillRect(cx + width * 0.45 - 10, cy - 2, 10, 24);
    ctx.fillStyle = skinDark;
    ctx.fillRect(cx - width * 0.45 + 3, cy + 2, 4, 12);
    ctx.fillRect(cx + width * 0.45 - 7, cy + 2, 4, 12);
  } else if (features.gills) {
    // Aquatic gills
    ctx.fillStyle = skinDark;
    for (let g = 0; g < 4; g++) {
      ctx.fillRect(cx - width * 0.43, cy - 8 + g * 6, 8, 2);
      ctx.fillRect(cx + width * 0.43 - 8, cy - 8 + g * 6, 8, 2);
    }
  } else if (features.ridges) {
    // Reptilian ridges
    ctx.fillStyle = skinMid;
    for (let r = 0; r < 6; r++) {
      ctx.fillRect(cx - width * 0.25 + r * (width * 0.5 / 6), cy - height * 0.45, pixelSize * 2, height * 0.25);
    }
  } else if (features.implants) {
    // Cybernetic implants
    ctx.fillStyle = '#1a2a1a';
    ctx.fillRect(cx - width * 0.38, cy - 18, 6, 3);
    ctx.fillRect(cx + width * 0.38 - 6, cy - 18, 6, 3);
    ctx.fillRect(cx - 8, cy - height * 0.42, 16, 3);
  }

  // LAYER 8: Facial details (wrinkles, scars, etc.)
  ctx.fillStyle = skinDark;
  if (features.weathered || features.scars) {
    // Add weathering lines
    for (let w = 0; w < 5; w++) {
      const wx = cx - width * 0.25 + rng() * width * 0.5;
      const wy = cy - height * 0.2 + rng() * height * 0.5;
      ctx.fillRect(wx, wy, pixelSize * rngInt(4, 12), pixelSize);
    }
  }

  // Dark frame border
  ctx.strokeStyle = '#1a1208';
  ctx.lineWidth = 2;
  ctx.strokeRect(x, y, width, height);
}

/**
 * PERFORMANCE: Generate portrait to an offscreen canvas for caching
 * Returns a canvas that can be drawn with drawImage (much faster than regenerating)
 */
function generateCachedPortrait(width, height, race, gender, seed) {
  const offscreen = document.createElement('canvas');
  offscreen.width = width;
  offscreen.height = height;
  const ctx = offscreen.getContext('2d');
  if (ctx) {
    generateDarkPortrait(ctx, 0, 0, width, height, race, gender, seed);
  }
  return offscreen;
}

/**
 * CanvasNewGameSetup - Mission briefing cockpit interface
 */
const CanvasNewGameSetup = ({ onStart, onCancel }) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  // PERFORMANCE: Asset caching to avoid regenerating expensive 3D assets
  const cachedAssets = useRef({});
  // PERFORMANCE: Portrait caching - portraits are expensive to generate
  const cachedPortraits = useRef({});
  const lastDimensions = useRef({ width: 0, height: 0 });
  // PERFORMANCE: Removed animFrame state - no animations for 60fps performance
  const [activeTab, setActiveTab] = useState('profile');
  const [buttons, setButtons] = useState([]);
  const [sliders, setSliders] = useState([]);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [touchStartY, setTouchStartY] = useState(null);

  // PERFORMANCE: Use ref to avoid re-renders on every form field change
  const formStateRef = useRef({
    callsign: 'NOVA-7',
    shipClass: 'explorer',
    playerRace: 'human',
    playerGender: 'male',
    galaxySize: 'medium',
    difficulty: 'adventurer',
    ironman: false,
    permadeath: false,
    startingBonus: 'credits',
    friendlyFire: true,
    randomEvents: true,
    encounterRate: 50,
    economyDifficulty: 50,
    faction: 'independent',
    trait: 'lucky',
    shipColor: 'grey',
    autoSave: true,
    tutorialMode: true,
    combatPause: false,
    crewPermadeath: false,
    resourceScarcity: 50,
    alienEncounters: 50,
    pirateActivity: 50,
  });
  const [renderKey, setRenderKey] = useState(0);

  // PERFORMANCE: Helper to update single field - triggers only ONE re-render
  const updateFormField = useCallback((field, value) => {
    formStateRef.current = { ...formStateRef.current, [field]: value };
    setRenderKey(k => k + 1);
  }, []);

  // Destructure for easier access
  const {
    callsign, shipClass, playerRace, playerGender, galaxySize, difficulty,
    ironman, permadeath, startingBonus, friendlyFire, randomEvents,
    encounterRate, economyDifficulty, faction, trait, shipColor,
    autoSave, tutorialMode, combatPause, crewPermadeath, resourceScarcity,
    alienEncounters, pirateActivity
  } = formStateRef.current;

  const [crewMembers, setCrewMembers] = useState({
    engineer: { race: 'human', gender: 'male', seed: 11111 },
    pilot: { race: 'human', gender: 'female', seed: 22222 },
    scientist: { race: 'alien_grey', gender: 'other', seed: 33333 },
    medic: { race: 'human', gender: 'female', seed: 44444 },
  });

  // PERFORMANCE: Memoized portrait cache getter to prevent recreation
  const getCachedPortrait = useCallback((cacheKey, race, gender, seed) => {
    if (!cachedPortraits.current[cacheKey]) {
      cachedPortraits.current[cacheKey] = generateCachedPortrait(130, 130, race, gender, seed);
    }
    return cachedPortraits.current[cacheKey];
  }, []); // No dependencies - uses refs

  // PERFORMANCE: Removed animation loop - all assets are static for 60fps performance

  // Scroll handler with touch support
  useEffect(() => {
    const handleWheel = (e) => {
      e.preventDefault();
      setScrollOffset(prev => Math.max(0, prev + e.deltaY * 0.5));
    };

    const handleTouchStart = (e) => {
      if (e.touches.length === 1) {
        setTouchStartY(e.touches[0].clientY);
      }
    };

    const handleTouchMove = (e) => {
      if (e.touches.length === 1 && touchStartY !== null) {
        e.preventDefault();
        const deltaY = touchStartY - e.touches[0].clientY;
        setScrollOffset(prev => Math.max(0, prev + deltaY * 0.8));
        setTouchStartY(e.touches[0].clientY);
      }
    };

    const handleTouchEnd = () => {
      setTouchStartY(null);
    };

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.addEventListener('wheel', handleWheel, { passive: false });
      canvas.addEventListener('touchstart', handleTouchStart, { passive: false });
      canvas.addEventListener('touchmove', handleTouchMove, { passive: false });
      canvas.addEventListener('touchend', handleTouchEnd);
      return () => {
        canvas.removeEventListener('wheel', handleWheel);
        canvas.removeEventListener('touchstart', handleTouchStart);
        canvas.removeEventListener('touchmove', handleTouchMove);
        canvas.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [touchStartY]);

  // Handle clicks
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const handleClick = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      buttons.forEach(btn => {
        if (x >= btn.x && x <= btn.x + btn.width && y >= btn.y && y <= btn.y + btn.height) {
          btn.onClick();
        }
      });
    };

    const handleMouseDown = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      sliders.forEach(slider => {
        if (x >= slider.x && x <= slider.x + slider.width &&
            y >= slider.y - 8 && y <= slider.y + slider.height + 8) {
          const newValue = Math.max(0, Math.min(100, ((x - slider.x) / slider.width) * 100));
          slider.onChange(Math.round(newValue));
        }
      });
    };

    canvas.addEventListener('click', handleClick);
    canvas.addEventListener('mousedown', handleMouseDown);

    return () => {
      canvas.removeEventListener('click', handleClick);
      canvas.removeEventListener('mousedown', handleMouseDown);
    };
  }, [buttons, sliders]);

  const handleStart = useCallback(() => {
    // PERFORMANCE: Use ref to avoid dependency issues
    try {
      const form = formStateRef.current;
      const setupData = {
        callsign: form.callsign,
        shipClass: form.shipClass,
        shipName: form.callsign + '-WANDERER',
        shipColor: form.shipColor,
        playerRace: form.playerRace,
        playerGender: form.playerGender,
        faction: form.faction,
        trait: form.trait,
        galaxySize: form.galaxySize,
        difficulty: form.difficulty,
        ironman: form.ironman,
        permadeath: form.permadeath,
        startingBonus: form.startingBonus,
        friendlyFire: form.friendlyFire,
        randomEvents: form.randomEvents,
        encounterRate: form.encounterRate,
        economyDifficulty: form.economyDifficulty,
        resourceScarcity: form.resourceScarcity,
        alienEncounters: form.alienEncounters,
        pirateActivity: form.pirateActivity,
        autoSave: form.autoSave,
        tutorialMode: form.tutorialMode,
        combatPause: form.combatPause,
        crewPermadeath: form.crewPermadeath,
        crewMembers,
        timestamp: Date.now(),
      };

      if (onStart) {
        onStart(setupData);
      }
    } catch (error) {
      console.error('[NewGameSetup] Error starting game:', error.message);
      alert('Failed to start game: ' + error.message);
    }
  }, [crewMembers, onStart]);

  // Render
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = container.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);
    ctx.imageSmoothingEnabled = false;

    // PERFORMANCE: Check if dimensions changed - clear cache if so
    const dimensionsChanged = lastDimensions.current.width !== width || lastDimensions.current.height !== height;
    if (dimensionsChanged) {
      cachedAssets.current = {};
      lastDimensions.current = { width, height };
    }

    // PERFORMANCE: Cache expensive background generation
    if (!cachedAssets.current.background) {
      cachedAssets.current.background = generate3DBackgroundTexture(width, height, 36925);
    }
    ctx.drawImage(cachedAssets.current.background, 0, 0);

    const centerX = width / 2;
    const centerY = height / 2;

    // Optimize panel sizing for new thin frame
    const panelWidth = Math.min(width * 0.95, 2000);
    const panelHeight = Math.min(height * 0.92, 1300);
    const panelX = centerX - panelWidth / 2;
    const panelY = centerY - panelHeight / 2;

    // Main panel
    drawMetalPanel(ctx, panelX, panelY, panelWidth, panelHeight, {
      rustAmount: 0.4,
      scratchCount: 30,
      depth3D: true,
    });

    [[panelX + 10, panelY + 10],
     [panelX + panelWidth - 10, panelY + 10],
     [panelX + 10, panelY + panelHeight - 10],
     [panelX + panelWidth - 10, panelY + panelHeight - 10]
    ].forEach(([x, y]) => drawRivet(ctx, x, y, 5));

    // Title bar
    const titleBarH = 45;
    drawMetalPanel(ctx, panelX + 15, panelY + 15, panelWidth - 30, titleBarH, {
      rustAmount: 0.2,
      scratchCount: 10,
      depth3D: true,
    });

    ctx.font = `bold 40px ${fontLoader.getFontFamily('DigitalDisco')}`;  // INCREASED from 20px to 28px (1.4x)
    ctx.fillStyle = COCKPIT_COLORS.TEXT_BRIGHT;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('MISSION BRIEFING - NEW DEPLOYMENT', centerX, panelY + 15 + titleBarH / 2);

    // Quick start button
    const quickStartW = 160;
    const quickStartH = 35;
    const quickStartX = panelX + panelWidth - 30 - quickStartW;
    const quickStartY = panelY + titleBarH + 75;

    const newButtons = [];

    drawCockpitButton(ctx, quickStartX, quickStartY, quickStartW, quickStartH, {
      pressed: false,
      enabled: true,
    });

    ctx.font = `bold 22px ${fontLoader.getFontFamily('DigitalDisco')}`;
    ctx.fillStyle = COCKPIT_COLORS.TEXT_BRIGHT;
    ctx.textAlign = 'center';
    ctx.fillText('QUICK START', quickStartX + quickStartW / 2, quickStartY + quickStartH / 2 + 3);

    newButtons.push({
      x: quickStartX,
      y: quickStartY,
      width: quickStartW,
      height: quickStartH,
      onClick: handleStart,
    });

    // Tab panel
    const tabPanelY = panelY + titleBarH + 70;
    const tabPanelH = 50;
    drawMetalPanel(ctx, panelX + 15, tabPanelY, panelWidth - 30 - quickStartW - 20, tabPanelH, {
      rustAmount: 0.2,
      scratchCount: 8,
      depth3D: true,
    });

    const tabs = [
      { id: 'profile', label: 'PROFILE' },
      { id: 'ship', label: 'SHIP' },
      { id: 'galaxy', label: 'GALAXY' },
      { id: 'crew', label: 'CREW' },
      { id: 'advanced', label: 'ADVANCED' },
    ];

    const tabW = 130;
    const tabH = 32;
    const tabSpacing = 8;
    const tabsStartX = panelX + 25;
    const tabY = tabPanelY + 9;

    tabs.forEach((tab, index) => {
      const tabX = tabsStartX + index * (tabW + tabSpacing);
      const isActive = activeTab === tab.id;

      drawCockpitButton(ctx, tabX, tabY, tabW, tabH, {
        pressed: isActive,
        enabled: true,
        glowColor: isActive ? COCKPIT_COLORS.LED_AMBER : null,
      });

      ctx.font = `bold 28px ${fontLoader.getFontFamily('DigitalDisco')}`;  // INCREASED from 14px to 18px
      ctx.fillStyle = isActive ? COCKPIT_COLORS.TEXT_BRIGHT : COCKPIT_COLORS.TEXT_NORMAL;
      ctx.textAlign = 'center';
      ctx.fillText(tab.label, tabX + tabW / 2, tabY + tabH / 2 + 4);

      newButtons.push({
        x: tabX,
        y: tabY,
        width: tabW,
        height: tabH,
        onClick: () => {
          setActiveTab(tab.id);
          setScrollOffset(0);
        },
      });
    });

    // CRT content area
    const crtX = panelX + 15;
    const crtY = tabPanelY + tabPanelH + 20;
    const crtW = panelWidth - 30;
    const crtH = panelHeight - (crtY - panelY) - 100;

    drawMetalPanel(ctx, crtX - 8, crtY - 8, crtW + 16, crtH + 16, {
      rustAmount: 0.2,
      scratchCount: 8,
      depth3D: true,
    });

    drawCRTScreen(ctx, crtX, crtY, crtW, crtH, {
      scanlineIntensity: 0.4,
      glowAmount: 0.25,
    });

    // Content rendering with clipping
    ctx.save();
    ctx.beginPath();
    ctx.rect(crtX + 10, crtY + 10, crtW - 20, crtH - 20);
    ctx.clip();

    let yOffset = crtY + 20 - scrollOffset;
    const contentX = crtX + 25;
    const newSliders = [];

    ctx.textAlign = 'left';

    // Render tab content - ENHANCED: Larger text throughout
    if (activeTab === 'profile') {
      // Callsign
      ctx.font = `bold 28px ${fontLoader.getFontFamily('DigitalDisco')}`;  // INCREASED from 14px to 18px
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT_BRIGHT;
      ctx.fillText('CALLSIGN:', contentX, yOffset);

      ctx.font = `bold 26px ${fontLoader.getFontFamily('DigitalDisco')}`;  // INCREASED from 13px to 17px
      ctx.fillStyle = COCKPIT_COLORS.TEXT_BRIGHT;
      ctx.fillText(callsign, contentX + 110, yOffset);

      ctx.font = `22px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;  // INCREASED from 14px to 15px
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT;
      ctx.fillText('Your unique pilot identifier', contentX, yOffset + 18);

      yOffset += 35;

      // Race
      ctx.font = `bold 28px ${fontLoader.getFontFamily('DigitalDisco')}`;  // INCREASED from 14px to 18px
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT_BRIGHT;
      ctx.fillText('SPECIES:', contentX, yOffset);

      yOffset += 18;

      RACES.forEach((race, index) => {
        const raceX = contentX + (index % 2) * 360;
        const raceY = yOffset + Math.floor(index / 2) * 28;
        const isSelected = playerRace === race.value;

        drawToggleSwitch(ctx, raceX, raceY - 8, 12, isSelected);

        ctx.font = `24px ${fontLoader.getFontFamily('DigitalDisco')}`;  // INCREASED from 13px to 16px
        ctx.fillStyle = isSelected ? COCKPIT_COLORS.SCREEN_TEXT_BRIGHT : COCKPIT_COLORS.SCREEN_TEXT;
        ctx.fillText(race.label, raceX + 20, raceY);

        ctx.font = `22px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;  // INCREASED from 14px to 15px
        ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT;
        ctx.fillText(race.traits, raceX + 130, raceY);

        newButtons.push({
          x: raceX,
          y: raceY - 12,
          width: 340,
          height: 20,
          onClick: () => updateFormField('playerRace', race.value),
        });
      });

      yOffset += 65;

      // Gender
      ctx.font = `bold 20px ${fontLoader.getFontFamily('DigitalDisco')}`;
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT_BRIGHT;
      ctx.fillText('GENDER:', contentX, yOffset);

      yOffset += 18;

      GENDERS.forEach((gender, index) => {
        const genderX = contentX + index * 140;
        const genderY = yOffset;
        const isSelected = playerGender === gender.value;

        drawToggleSwitch(ctx, genderX, genderY - 8, 12, isSelected);

        ctx.font = `18px ${fontLoader.getFontFamily('DigitalDisco')}`;
        ctx.fillStyle = isSelected ? COCKPIT_COLORS.SCREEN_TEXT_BRIGHT : COCKPIT_COLORS.SCREEN_TEXT;
        ctx.fillText(gender.label, genderX + 20, genderY);

        newButtons.push({
          x: genderX,
          y: genderY - 12,
          width: 130,
          height: 20,
          onClick: () => updateFormField('playerGender', gender.value),
        });
      });

      yOffset += 35;

      // Faction
      ctx.font = `bold 20px ${fontLoader.getFontFamily('DigitalDisco')}`;
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT_BRIGHT;
      ctx.fillText('FACTION ALLEGIANCE:', contentX, yOffset);

      ctx.font = `20px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT;
      ctx.fillText('Starting political allegiance - affects reputation and missions', contentX, yOffset + 14);

      yOffset += 28;

      FACTIONS.forEach((fac, index) => {
        const facX = contentX + (index % 2) * 360;
        const facY = yOffset + Math.floor(index / 2) * 26;
        const isSelected = faction === fac.value;

        drawToggleSwitch(ctx, facX, facY - 8, 12, isSelected);

        ctx.font = `18px ${fontLoader.getFontFamily('DigitalDisco')}`;
        ctx.fillStyle = isSelected ? COCKPIT_COLORS.SCREEN_TEXT_BRIGHT : COCKPIT_COLORS.SCREEN_TEXT;
        ctx.fillText(fac.label, facX + 20, facY);

        ctx.font = `20px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;
        ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT;
        ctx.fillText(fac.desc, facX + 180, facY);

        newButtons.push({
          x: facX,
          y: facY - 12,
          width: 340,
          height: 20,
          onClick: () => updateFormField('faction', fac.value),
        });
      });

      yOffset += 85;

      // Trait
      ctx.font = `bold 20px ${fontLoader.getFontFamily('DigitalDisco')}`;
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT_BRIGHT;
      ctx.fillText('SPECIALIZATION:', contentX, yOffset);

      ctx.font = `20px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT;
      ctx.fillText('Personal training focus - permanent bonuses', contentX, yOffset + 14);

      yOffset += 28;

      TRAITS.forEach((tr, index) => {
        const trX = contentX + (index % 2) * 360;
        const trY = yOffset + Math.floor(index / 2) * 26;
        const isSelected = trait === tr.value;

        drawToggleSwitch(ctx, trX, trY - 8, 12, isSelected);

        ctx.font = `18px ${fontLoader.getFontFamily('DigitalDisco')}`;
        ctx.fillStyle = isSelected ? COCKPIT_COLORS.SCREEN_TEXT_BRIGHT : COCKPIT_COLORS.SCREEN_TEXT;
        ctx.fillText(tr.label, trX + 20, trY);

        ctx.font = `20px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;
        ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT;
        ctx.fillText(tr.desc, trX + 120, trY);

        newButtons.push({
          x: trX,
          y: trY - 12,
          width: 340,
          height: 20,
          onClick: () => updateFormField('trait', tr.value),
        });
      });

      // PERFORMANCE: Portraits removed for better performance

    } else if (activeTab === 'ship') {
      ctx.font = `bold 20px ${fontLoader.getFontFamily('DigitalDisco')}`;
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT_BRIGHT;
      ctx.fillText('SHIP CLASS:', contentX, yOffset);

      ctx.font = `20px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT;
      ctx.fillText('Determines speed, armor, cargo, and weapons', contentX, yOffset + 14);

      yOffset += 28;

      SHIP_CLASSES.forEach((ship, index) => {
        const shipY = yOffset + index * 38;
        const isSelected = shipClass === ship.value;

        drawToggleSwitch(ctx, contentX, shipY - 8, 12, isSelected);

        ctx.font = `18px ${fontLoader.getFontFamily('DigitalDisco')}`;
        ctx.fillStyle = isSelected ? COCKPIT_COLORS.SCREEN_TEXT_BRIGHT : COCKPIT_COLORS.SCREEN_TEXT;
        ctx.fillText(ship.label, contentX + 20, shipY);

        ctx.font = `20px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;
        ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT;
        ctx.fillText(ship.desc, contentX + 240, shipY);

        const stats = ship.stats;
        ctx.fillText(`SPD:${stats.speed} ARM:${stats.armor} CRG:${stats.cargo} WPN:${stats.weapons}`, contentX + 20, shipY + 14);

        newButtons.push({
          x: contentX,
          y: shipY - 12,
          width: 700,
          height: 32,
          onClick: () => updateFormField('shipClass', ship.value),
        });
      });

      yOffset += SHIP_CLASSES.length * 38 + 25;

      ctx.font = `bold 20px ${fontLoader.getFontFamily('DigitalDisco')}`;
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT_BRIGHT;
      ctx.fillText('STARTING BONUS:', contentX, yOffset);

      ctx.font = `20px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT;
      ctx.fillText('Choose one initial advantage', contentX, yOffset + 14);

      yOffset += 28;

      STARTING_BONUSES.forEach((bonus, index) => {
        const bonusX = contentX + (index % 2) * 360;
        const bonusY = yOffset + Math.floor(index / 2) * 26;
        const isSelected = startingBonus === bonus.value;

        drawToggleSwitch(ctx, bonusX, bonusY - 8, 12, isSelected);

        ctx.font = `18px ${fontLoader.getFontFamily('DigitalDisco')}`;
        ctx.fillStyle = isSelected ? COCKPIT_COLORS.SCREEN_TEXT_BRIGHT : COCKPIT_COLORS.SCREEN_TEXT;
        ctx.fillText(bonus.label, bonusX + 20, bonusY);

        ctx.font = `20px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;
        ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT;
        ctx.fillText(bonus.desc, bonusX + 180, bonusY);

        newButtons.push({
          x: bonusX,
          y: bonusY - 12,
          width: 340,
          height: 20,
          onClick: () => updateFormField('startingBonus', bonus.value),
        });
      });

    } else if (activeTab === 'galaxy') {
      ctx.font = `bold 20px ${fontLoader.getFontFamily('DigitalDisco')}`;
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT_BRIGHT;
      ctx.fillText('GALAXY SIZE:', contentX, yOffset);

      ctx.font = `20px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT;
      ctx.fillText('Mission scope and estimated playtime', contentX, yOffset + 14);

      yOffset += 28;

      GALAXY_SIZES.forEach((size, index) => {
        const sizeY = yOffset + index * 32;
        const isSelected = galaxySize === size.value;

        drawToggleSwitch(ctx, contentX, sizeY - 8, 12, isSelected);

        ctx.font = `18px ${fontLoader.getFontFamily('DigitalDisco')}`;
        ctx.fillStyle = isSelected ? COCKPIT_COLORS.SCREEN_TEXT_BRIGHT : COCKPIT_COLORS.SCREEN_TEXT;
        ctx.fillText(size.label, contentX + 20, sizeY);

        ctx.font = `20px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;
        ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT;
        ctx.fillText(`${size.desc} (${size.details})`, contentX + 140, sizeY);

        newButtons.push({
          x: contentX,
          y: sizeY - 12,
          width: 720,
          height: 26,
          onClick: () => updateFormField('galaxySize', size.value),
        });
      });

      yOffset += GALAXY_SIZES.length * 32 + 25;

      ctx.font = `bold 20px ${fontLoader.getFontFamily('DigitalDisco')}`;
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT_BRIGHT;
      ctx.fillText('DIFFICULTY:', contentX, yOffset);

      ctx.font = `20px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT;
      ctx.fillText('Combat intensity, resources, and save system', contentX, yOffset + 14);

      yOffset += 28;

      DIFFICULTIES.forEach((diff, index) => {
        const diffY = yOffset + index * 32;
        const isSelected = difficulty === diff.value;

        drawToggleSwitch(ctx, contentX, diffY - 8, 12, isSelected);

        ctx.font = `18px ${fontLoader.getFontFamily('DigitalDisco')}`;
        ctx.fillStyle = isSelected ? COCKPIT_COLORS.SCREEN_TEXT_BRIGHT : COCKPIT_COLORS.SCREEN_TEXT;
        ctx.fillText(diff.label, contentX + 20, diffY);

        ctx.font = `20px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;
        ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT;
        ctx.fillText(`${diff.desc} (${diff.details})`, contentX + 200, diffY);

        newButtons.push({
          x: contentX,
          y: diffY - 12,
          width: 720,
          height: 26,
          onClick: () => updateFormField('difficulty', diff.value),
        });
      });

    } else if (activeTab === 'crew') {
      ctx.font = `bold 20px ${fontLoader.getFontFamily('DigitalDisco')}`;
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT_BRIGHT;
      ctx.fillText('CREW ROSTER:', contentX, yOffset);

      ctx.font = `20px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT;
      ctx.fillText('Assigned crew members - essential ship functions and bonuses', contentX, yOffset + 14);

      yOffset += 35;

      CREW_ROLES.forEach((role, index) => {
        const crewX = contentX + (index % 2) * 360;
        const crewY = yOffset + Math.floor(index / 2) * 165;

        ctx.font = `bold 18px ${fontLoader.getFontFamily('DigitalDisco')}`;
        ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT_BRIGHT;
        ctx.fillText(`[${role.label}]`, crewX, crewY);

        ctx.font = `20px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;
        ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT;
        ctx.fillText(role.desc, crewX, crewY + 14);

        const member = crewMembers[role.key];
        const infoY = crewY + 145;

        ctx.fillText(`Race: ${member.race.toUpperCase()} / ${member.gender.toUpperCase()}`, crewX, infoY);
        ctx.fillText(`Skills: ${role.skills}`, crewX, infoY + 12);

        // PERFORMANCE: Crew portraits removed for better performance
      });

    } else if (activeTab === 'advanced') {
      ctx.font = `bold 20px ${fontLoader.getFontFamily('DigitalDisco')}`;
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT_BRIGHT;
      ctx.fillText('ADVANCED CONFIGURATION:', contentX, yOffset);

      ctx.font = `20px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT;
      ctx.fillText('Fine-tune mechanics and difficulty modifiers', contentX, yOffset + 14);

      yOffset += 35;

      // Hardcore modes
      ctx.font = `bold 18px ${fontLoader.getFontFamily('DigitalDisco')}`;
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT_BRIGHT;
      ctx.fillText('[HARDCORE MODES]', contentX, yOffset);

      yOffset += 20;

      drawToggleSwitch(ctx, contentX, yOffset - 8, 12, ironman);
      ctx.font = `16px ${fontLoader.getFontFamily('DigitalDisco')}`;
      ctx.fillStyle = ironman ? COCKPIT_COLORS.SCREEN_TEXT_BRIGHT : COCKPIT_COLORS.SCREEN_TEXT;
      ctx.fillText('IRONMAN MODE', contentX + 20, yOffset);
      ctx.font = `20px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT;
      ctx.fillText('Single save, auto-save on exit, no reloading', contentX + 20, yOffset + 14);

      newButtons.push({
        x: contentX,
        y: yOffset - 12,
        width: 650,
        height: 26,
        onClick: () => updateFormField('ironman', !ironman),
      });

      yOffset += 32;

      drawToggleSwitch(ctx, contentX, yOffset - 8, 12, permadeath);
      ctx.font = `16px ${fontLoader.getFontFamily('DigitalDisco')}`;
      ctx.fillStyle = permadeath ? '#8a4a4a' : COCKPIT_COLORS.SCREEN_TEXT;
      ctx.fillText('PERMADEATH MODE', contentX + 20, yOffset);
      ctx.font = `20px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;
      ctx.fillStyle = permadeath ? '#8a4a4a' : COCKPIT_COLORS.SCREEN_TEXT;
      ctx.fillText('Game over on death - save deleted permanently!', contentX + 20, yOffset + 14);

      newButtons.push({
        x: contentX,
        y: yOffset - 12,
        width: 650,
        height: 26,
        onClick: () => updateFormField('permadeath', !permadeath),
      });

      yOffset += 42;

      // Gameplay modifiers
      ctx.font = `bold 18px ${fontLoader.getFontFamily('DigitalDisco')}`;
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT_BRIGHT;
      ctx.fillText('[GAMEPLAY MODIFIERS]', contentX, yOffset);

      yOffset += 20;

      drawToggleSwitch(ctx, contentX, yOffset - 8, 12, friendlyFire);
      ctx.font = `16px ${fontLoader.getFontFamily('DigitalDisco')}`;
      ctx.fillStyle = friendlyFire ? COCKPIT_COLORS.SCREEN_TEXT_BRIGHT : COCKPIT_COLORS.SCREEN_TEXT;
      ctx.fillText('FRIENDLY FIRE', contentX + 20, yOffset);
      ctx.font = `20px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT;
      ctx.fillText('Weapons can damage friendly vessels', contentX + 20, yOffset + 14);

      newButtons.push({
        x: contentX,
        y: yOffset - 12,
        width: 650,
        height: 26,
        onClick: () => updateFormField('friendlyFire', !friendlyFire),
      });

      yOffset += 32;

      drawToggleSwitch(ctx, contentX, yOffset - 8, 12, randomEvents);
      ctx.font = `16px ${fontLoader.getFontFamily('DigitalDisco')}`;
      ctx.fillStyle = randomEvents ? COCKPIT_COLORS.SCREEN_TEXT_BRIGHT : COCKPIT_COLORS.SCREEN_TEXT;
      ctx.fillText('RANDOM EVENTS', contentX + 20, yOffset);
      ctx.font = `20px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT;
      ctx.fillText('Unpredictable encounters and phenomena', contentX + 20, yOffset + 14);

      newButtons.push({
        x: contentX,
        y: yOffset - 12,
        width: 650,
        height: 26,
        onClick: () => updateFormField('randomEvents', !randomEvents),
      });

      yOffset += 42;

      // Sliders
      ctx.font = `bold 18px ${fontLoader.getFontFamily('DigitalDisco')}`;
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT_BRIGHT;
      ctx.fillText('[DIFFICULTY SLIDERS]', contentX, yOffset);

      yOffset += 22;

      // Encounter rate
      ctx.font = `16px ${fontLoader.getFontFamily('DigitalDisco')}`;
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT_BRIGHT;
      ctx.fillText(`ENCOUNTER RATE: ${encounterRate}%`, contentX, yOffset);
      ctx.font = `20px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT;
      ctx.fillText('Frequency of hostile encounters', contentX, yOffset + 13);

      const sliderW = 400;
      const sliderH = 8;
      let sliderY = yOffset + 26;

      ctx.fillStyle = COCKPIT_COLORS.PANEL_BG;
      ctx.fillRect(contentX, sliderY, sliderW, sliderH);
      ctx.fillStyle = COCKPIT_COLORS.LED_AMBER;
      ctx.fillRect(contentX, sliderY, (sliderW * encounterRate) / 100, sliderH);
      ctx.fillStyle = COCKPIT_COLORS.TEXT_BRIGHT;
      ctx.fillRect(contentX + (sliderW * encounterRate) / 100 - 4, sliderY - 4, 8, 16);

      newSliders.push({
        x: contentX,
        y: sliderY,
        width: sliderW,
        height: sliderH,
        onChange: (val) => updateFormField('encounterRate', val),
      });

      yOffset += 50;

      // Economy difficulty
      ctx.font = `16px ${fontLoader.getFontFamily('DigitalDisco')}`;
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT_BRIGHT;
      ctx.fillText(`ECONOMY DIFFICULTY: ${economyDifficulty}%`, contentX, yOffset);
      ctx.font = `20px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT;
      ctx.fillText('Affects prices and trade profits', contentX, yOffset + 13);

      sliderY = yOffset + 26;

      ctx.fillStyle = COCKPIT_COLORS.PANEL_BG;
      ctx.fillRect(contentX, sliderY, sliderW, sliderH);
      ctx.fillStyle = COCKPIT_COLORS.LED_AMBER;
      ctx.fillRect(contentX, sliderY, (sliderW * economyDifficulty) / 100, sliderH);
      ctx.fillStyle = COCKPIT_COLORS.TEXT_BRIGHT;
      ctx.fillRect(contentX + (sliderW * economyDifficulty) / 100 - 4, sliderY - 4, 8, 16);

      newSliders.push({
        x: contentX,
        y: sliderY,
        width: sliderW,
        height: sliderH,
        onChange: (val) => updateFormField('economyDifficulty', val),
      });

      yOffset += 50;

      // Resource scarcity
      ctx.font = `16px ${fontLoader.getFontFamily('DigitalDisco')}`;
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT_BRIGHT;
      ctx.fillText(`RESOURCE SCARCITY: ${resourceScarcity}%`, contentX, yOffset);
      ctx.font = `20px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT;
      ctx.fillText('Controls fuel, ammo availability', contentX, yOffset + 13);

      sliderY = yOffset + 26;

      ctx.fillStyle = COCKPIT_COLORS.PANEL_BG;
      ctx.fillRect(contentX, sliderY, sliderW, sliderH);
      ctx.fillStyle = COCKPIT_COLORS.LED_AMBER;
      ctx.fillRect(contentX, sliderY, (sliderW * resourceScarcity) / 100, sliderH);
      ctx.fillStyle = COCKPIT_COLORS.TEXT_BRIGHT;
      ctx.fillRect(contentX + (sliderW * resourceScarcity) / 100 - 4, sliderY - 4, 8, 16);

      newSliders.push({
        x: contentX,
        y: sliderY,
        width: sliderW,
        height: sliderH,
        onChange: (val) => updateFormField('resourceScarcity', val),
      });

      yOffset += 50;

      // Alien encounters
      ctx.font = `16px ${fontLoader.getFontFamily('DigitalDisco')}`;
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT_BRIGHT;
      ctx.fillText(`ALIEN ENCOUNTERS: ${alienEncounters}%`, contentX, yOffset);
      ctx.font = `20px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT;
      ctx.fillText('Frequency of alien species', contentX, yOffset + 13);

      sliderY = yOffset + 26;

      ctx.fillStyle = COCKPIT_COLORS.PANEL_BG;
      ctx.fillRect(contentX, sliderY, sliderW, sliderH);
      ctx.fillStyle = COCKPIT_COLORS.LED_AMBER;
      ctx.fillRect(contentX, sliderY, (sliderW * alienEncounters) / 100, sliderH);
      ctx.fillStyle = COCKPIT_COLORS.TEXT_BRIGHT;
      ctx.fillRect(contentX + (sliderW * alienEncounters) / 100 - 4, sliderY - 4, 8, 16);

      newSliders.push({
        x: contentX,
        y: sliderY,
        width: sliderW,
        height: sliderH,
        onChange: (val) => updateFormField('alienEncounters', val),
      });

      yOffset += 50;

      // Pirate activity
      ctx.font = `16px ${fontLoader.getFontFamily('DigitalDisco')}`;
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT_BRIGHT;
      ctx.fillText(`PIRATE ACTIVITY: ${pirateActivity}%`, contentX, yOffset);
      ctx.font = `20px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT;
      ctx.fillText('Hostile pirate encounters', contentX, yOffset + 13);

      sliderY = yOffset + 26;

      ctx.fillStyle = COCKPIT_COLORS.PANEL_BG;
      ctx.fillRect(contentX, sliderY, sliderW, sliderH);
      ctx.fillStyle = COCKPIT_COLORS.LED_AMBER;
      ctx.fillRect(contentX, sliderY, (sliderW * pirateActivity) / 100, sliderH);
      ctx.fillStyle = COCKPIT_COLORS.TEXT_BRIGHT;
      ctx.fillRect(contentX + (sliderW * pirateActivity) / 100 - 4, sliderY - 4, 8, 16);

      newSliders.push({
        x: contentX,
        y: sliderY,
        width: sliderW,
        height: sliderH,
        onChange: (val) => updateFormField('pirateActivity', val),
      });

      yOffset += 55;

      // QoL options
      ctx.font = `bold 18px ${fontLoader.getFontFamily('DigitalDisco')}`;
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT_BRIGHT;
      ctx.fillText('[QUALITY OF LIFE]', contentX, yOffset);

      yOffset += 22;

      drawToggleSwitch(ctx, contentX, yOffset - 8, 12, autoSave);
      ctx.font = `16px ${fontLoader.getFontFamily('DigitalDisco')}`;
      ctx.fillStyle = autoSave ? COCKPIT_COLORS.SCREEN_TEXT_BRIGHT : COCKPIT_COLORS.SCREEN_TEXT;
      ctx.fillText('AUTO-SAVE', contentX + 20, yOffset);
      ctx.font = `20px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT;
      ctx.fillText('Save every 5 minutes', contentX + 20, yOffset + 14);

      newButtons.push({
        x: contentX,
        y: yOffset - 12,
        width: 550,
        height: 26,
        onClick: () => updateFormField('autoSave', !autoSave),
      });

      yOffset += 32;

      drawToggleSwitch(ctx, contentX, yOffset - 8, 12, tutorialMode);
      ctx.font = `16px ${fontLoader.getFontFamily('DigitalDisco')}`;
      ctx.fillStyle = tutorialMode ? COCKPIT_COLORS.SCREEN_TEXT_BRIGHT : COCKPIT_COLORS.SCREEN_TEXT;
      ctx.fillText('TUTORIAL MODE', contentX + 20, yOffset);
      ctx.font = `20px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT;
      ctx.fillText('Show tips for new players', contentX + 20, yOffset + 14);

      newButtons.push({
        x: contentX,
        y: yOffset - 12,
        width: 550,
        height: 26,
        onClick: () => updateFormField('tutorialMode', !tutorialMode),
      });

      yOffset += 32;

      drawToggleSwitch(ctx, contentX, yOffset - 8, 12, combatPause);
      ctx.font = `16px ${fontLoader.getFontFamily('DigitalDisco')}`;
      ctx.fillStyle = combatPause ? COCKPIT_COLORS.SCREEN_TEXT_BRIGHT : COCKPIT_COLORS.SCREEN_TEXT;
      ctx.fillText('COMBAT AUTO-PAUSE', contentX + 20, yOffset);
      ctx.font = `20px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;
      ctx.fillStyle = COCKPIT_COLORS.SCREEN_TEXT;
      ctx.fillText('Pause when combat begins', contentX + 20, yOffset + 14);

      newButtons.push({
        x: contentX,
        y: yOffset - 12,
        width: 550,
        height: 26,
        onClick: () => updateFormField('combatPause', !combatPause),
      });

      yOffset += 32;

      drawToggleSwitch(ctx, contentX, yOffset - 8, 12, crewPermadeath);
      ctx.font = `16px ${fontLoader.getFontFamily('DigitalDisco')}`;
      ctx.fillStyle = crewPermadeath ? '#8a4a4a' : COCKPIT_COLORS.SCREEN_TEXT;
      ctx.fillText('CREW PERMADEATH', contentX + 20, yOffset);
      ctx.font = `20px ${fontLoader.getFontFamily('DigitalDisco-Thin')}`;
      ctx.fillStyle = crewPermadeath ? '#8a4a4a' : COCKPIT_COLORS.SCREEN_TEXT;
      ctx.fillText('Crew die permanently', contentX + 20, yOffset + 14);

      newButtons.push({
        x: contentX,
        y: yOffset - 12,
        width: 550,
        height: 26,
        onClick: () => updateFormField('crewPermadeath', !crewPermadeath),
      });
    }

    ctx.restore();

    // SCROLLBAR: Visible scrollbar on right side of CRT screen
    const maxScrollHeight = Math.max(0, yOffset - crtY - crtH + 100);  // Estimate total content height
    if (maxScrollHeight > 0) {
      const scrollbarX = crtX + crtW - 12;
      const scrollbarY = crtY + 10;
      const scrollbarH = crtH - 20;
      const scrollbarW = 8;

      // Scrollbar track (dark)
      ctx.fillStyle = '#0a0805';
      ctx.fillRect(scrollbarX, scrollbarY, scrollbarW, scrollbarH);

      // Scrollbar thumb (dark amber)
      const thumbHeight = Math.max(30, (crtH / (maxScrollHeight + crtH)) * scrollbarH);
      const thumbY = scrollbarY + (scrollOffset / maxScrollHeight) * (scrollbarH - thumbHeight);
      ctx.fillStyle = '#3a2a1a';
      ctx.fillRect(scrollbarX, thumbY, scrollbarW, thumbHeight);

      // Scrollbar thumb highlight
      ctx.fillStyle = '#8a5840';
      ctx.fillRect(scrollbarX + 1, thumbY + 1, scrollbarW - 2, 2);
    }

    // Bottom buttons
    const buttonY = panelY + panelHeight - 65;
    const buttonW = 200;
    const buttonH = 45;

    const startBtnX = centerX - buttonW - 15;
    const cancelBtnX = centerX + 15;

    // Start button - 3D raised button
    const startButtonCanvas = generate3DButton(buttonW, buttonH, '>>> START MISSION <<<', {
      state: 'normal',
      baseColor: '#3a2a1a',
      textColor: '#8a6a4a',
      hasLED: false,
      pixelSize: 0.8
    });
    ctx.drawImage(startButtonCanvas, startBtnX, buttonY);

    newButtons.push({
      x: startBtnX,
      y: buttonY,
      width: buttonW,
      height: buttonH,
      onClick: handleStart,
    });

    // Cancel button - 3D button
    const cancelButtonCanvas = generate3DButton(buttonW, buttonH, '[ CANCEL ]', {
      state: 'normal',
      baseColor: '#1a120a',
      textColor: '#666666',
      hasLED: false,
      pixelSize: 0.8
    });
    ctx.drawImage(cancelButtonCanvas, cancelBtnX, buttonY);

    newButtons.push({
      x: cancelBtnX,
      y: buttonY,
      width: buttonW,
      height: buttonH,
      onClick: onCancel,
    });

    // CRT effects
    ctx.save();
    ctx.globalAlpha = 0.15;
    for (let y = 0; y < height; y += 3) {
      ctx.fillStyle = '#000000';
      ctx.fillRect(0, y, width, 1);
    }
    ctx.restore();

    const vignetteGrad = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height) * 0.7);
    vignetteGrad.addColorStop(0, 'rgba(0, 0, 0, 0)');
    vignetteGrad.addColorStop(0.7, 'rgba(0, 0, 0, 0.4)');
    vignetteGrad.addColorStop(1, 'rgba(0, 0, 0, 0.8)');
    ctx.fillStyle = vignetteGrad;
    ctx.fillRect(0, 0, width, height);

    setButtons(newButtons);
    setSliders(newSliders);

  }, [activeTab, scrollOffset, renderKey, crewMembers]); // PERFORMANCE: Massively reduced dependencies from 26 to 4!

  return (
    <CockpitFrame>
      <div
        ref={containerRef}
        style={{
          position: 'relative',
          width: '100%',
          height: '100%',
        }}
      >
        {/* REMOVED: Portrait components - now drawn directly on canvas for better integration */}

        <canvas
          ref={canvasRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            imageRendering: 'pixelated',
            cursor: 'pointer',
          }}
        />
      </div>
    </CockpitFrame>
  );
};

export default CanvasNewGameSetup;
