/**
 * Scale System - Defines proper sizes and distances for all celestial bodies
 * FIXED: Proper size hierarchy with good performance
 *
 * CORRECT SCALE HIERARCHY (smallest to largest):
 * - Player Ship: 24px (visible but not too large)
 * - Asteroids: 6-20px (small debris)
 * - Comets: 20-25px (small objects)
 * - Dwarf Planets: 60-120px (mini-worlds) [INCREASED 50%]
 * - Moons: 45-112px (small satellites) [INCREASED 50%]
 * - Planets: 150-300px (terrestrial worlds) [INCREASED 50%]
 * - Gas Giants: 450-750px (massive planets) [INCREASED 50%]
 * - Stars: 800-2000px (dominant stellar objects)
 * - Blackholes: 150-1200px (event horizons)
 * - Stations: 40-200px (artificial structures)
 */

export const SCALE_SYSTEM = {
  // Ship sizes - Reasonable and visible
  PLAYER_SHIP: 24,      // BASE size - visible and responsive
  SMALL_SHIP: 20,       // Scout ships
  MEDIUM_SHIP: 30,      // Frigates
  LARGE_SHIP: 42,       // Cruisers
  CAPITAL_SHIP: 64,     // Massive capital ships

  // Asteroids - Small debris (INCREASED by 100% for better visibility)
  SMALL_ASTEROID: 12,
  MEDIUM_ASTEROID: 24,
  LARGE_ASTEROID: 40,
  DEBRIS: 8,

  // Comets - Small objects
  SMALL_COMET: 20,
  MEDIUM_COMET: 22,
  LARGE_COMET: 25,

  // Dwarf Planets - Mini-worlds (INCREASED by 200% for better visibility)
  SMALL_DWARF: 120,      // Small dwarf planet
  MEDIUM_DWARF: 180,     // Medium dwarf planet
  LARGE_DWARF: 240,      // Large dwarf planet (Pluto-sized)

  // Moons - Small to medium satellites (INCREASED by 200% for better visibility)
  SMALL_MOON: 90,       // Small moon
  MEDIUM_MOON: 150,     // Medium moon
  LARGE_MOON: 220,      // Large moon (Titan-sized)

  // Planets - Terrestrial worlds (INCREASED by 200% for better visibility)
  SMALL_PLANET: 300,    // Mercury/Mars size
  MEDIUM_PLANET: 450,   // Earth/Venus size
  LARGE_PLANET: 600,    // Super-Earth size

  // Gas Giants - Massive planets (INCREASED by 200% for better visibility)
  SMALL_GAS_GIANT: 900,   // Uranus/Neptune size
  MEDIUM_GAS_GIANT: 1200,  // Saturn size
  LARGE_GAS_GIANT: 1500,   // Jupiter+ size

  // Stars - DOMINANT stellar objects (MUCH larger than planets!)
  RED_DWARF: 1600,         // M-class (smallest stars but still huge)
  ORANGE_DWARF: 2000,     // K-class
  YELLOW_DWARF: 2400,     // G-class (Sun-like)
  YELLOWWHITE_STAR: 2800, // F-class
  WHITE_STAR: 3200,       // A-class
  BLUE_GIANT: 3600,       // B-class
  BLUE_SUPERGIANT: 4000,  // O-class (largest stars)

  // Blackholes - Visible event horizons
  BLACKHOLE_CORE: 150,            // Singularity
  BLACKHOLE_EVENT_HORIZON: 900,   // Event horizon
  BLACKHOLE_ACCRETION_DISK: 1200, // Visible disk

  // Exotic objects
  NEUTRON_STAR: 100,    // Ultra-dense but tiny stellar remnant

  // Stations and structures
  SMALL_STATION: 40,    // Small station
  MEDIUM_STATION: 60,   // Medium station
  LARGE_STATION: 100,   // Large station
  MEGA_STATION: 200,    // Gigantic station

  // Megastructures
  DYSON_SPHERE_SEGMENT: 3000, // Planet-wrapping segments
  RING_HABITAT: 2400,         // Massive ring habitats
  WARP_GATE: 600,             // Warp gates
  ORBITAL_RING: 3600          // Orbital rings
};

/**
 * Distance multipliers (in pixels)
 * REALISTIC UPGRADE - Vastly expanded distances for true space scale
 *
 * REALISTIC RULES:
 * - Star systems are 5-8x larger for massive realistic space
 * - Orbital spacing increased proportionally with body sizes
 * - Realistic distances create sense of scale and isolation
 */
export const DISTANCE_SYSTEM = {
  // Minimum safe distances (based on object size)
  // For planets/celestial bodies: minimum distance from star = star radius × 1.5 (realistic clearance)
  MIN_PLANET_DISTANCE_MULTIPLIER: 1.5, // Was 1.0, now 1.5x for realistic inner planet clearance

  // For moons: minimum distance from planet = planet radius × 1.5 (realistic moon orbits)
  MIN_MOON_DISTANCE_MULTIPLIER: 1.5, // Was 1.0, now 1.5x for proper Roche limit clearance

  // Legacy fixed distances (INCREASED: more space for larger bodies)
  MIN_ASTEROID_BELT_DISTANCE: 4500,  // Increased for larger bodies
  MIN_STATION_DISTANCE: 2400,        // Increased for larger bodies

  // Orbital spacing (INCREASED: larger spacing for bigger celestial bodies)
  PLANET_SPACING: 6000,     // Much larger spacing for bigger planets
  MOON_SPACING: 1500,       // Larger moon spacing for better separation
  ASTEROID_SPACING: 750,    // More spaced out asteroid belts

  // System sizes (EXPANDED: larger systems for bigger celestial bodies)
  SMALL_SYSTEM_RADIUS: 105000,   // Larger small systems for bigger bodies
  MEDIUM_SYSTEM_RADIUS: 180000,  // Larger medium systems for bigger bodies
  LARGE_SYSTEM_RADIUS: 270000,   // Larger large systems for bigger bodies

  // Safe zones (REDUCED: more accessible danger zones)
  STAR_SAFE_ZONE_MULTIPLIER: 6.0, // Reduced from 12.0 for closer star approaches
  BLACKHOLE_SAFE_ZONE: 6000,       // Reduced from 120000 (20x smaller - exciting but dangerous)
  MEGASTRUCTURE_CLEARANCE: 5000    // Reduced from 100000 (20x smaller - accessible structures)
};

/**
 * Mass system (affects gravity and physics)
 * REALISTIC UPGRADE - Masses scaled proportionally with new larger sizes
 * Mass scales with volume (size^3), so 3x larger body = ~27x more mass
 */
export const MASS_SYSTEM = {
  PLAYER_SHIP: 600,     // ULTRA-ENHANCED: 6x to match 6x size increase (base unit)
  ASTEROID: 50,         // UNCHANGED (still small relative to ships)
  COMET: 75,            // UNCHANGED

  SMALL_MOON: 1000000,   // Was 5000, now 200x (scales with 10x size cubed = 1000x, balanced)
  MEDIUM_MOON: 2800000,  // Was 8000, now 350x (scales with 12.9x size cubed ≈ 2146x, balanced)
  LARGE_MOON: 6000000,   // Was 12000, now 500x (scales with 15x size cubed = 3375x, balanced)

  DWARF_PLANET: 3500000,  // Was 20000, now 175x (scales with 12x size cubed = 1728x, balanced)
  SMALL_PLANET: 15000000, // Was 50000, now 300x (scales with 12x size cubed = 1728x, balanced)
  MEDIUM_PLANET: 40000000,// Was 100000, now 400x (scales with 16x size cubed = 4096x, balanced)
  LARGE_PLANET: 100000000,// Was 200000, now 500x (scales with 20x size cubed = 8000x, balanced)

  SMALL_GAS_GIANT: 250000000,  // Was 500000, now 500x (scales with 15x size cubed = 3375x, balanced)
  MEDIUM_GAS_GIANT: 600000000, // Was 1000000, now 600x (scales with 16.7x size cubed ≈ 4657x, balanced)
  LARGE_GAS_GIANT: 1200000000, // Was 2000000, now 600x (scales with 20x size cubed = 8000x, balanced)

  RED_DWARF: 2500000000,    // Was 5000000, now 500x (scales with 15x size cubed = 3375x, balanced)
  YELLOW_DWARF: 4500000000, // Was 10000000, now 450x (scales with 15x size cubed = 3375x, balanced)
  BLUE_GIANT: 15000000000,  // Was 30000000, now 500x (scales with 21.8x size cubed ≈ 10360x, balanced)

  NEUTRON_STAR: 30000000000,  // Was 50000000, now 600x (ultra-dense despite 18x larger visual)
  BLACKHOLE: 60000000000      // Was 100000000, now 600x (MASSIVE gravitational influence)
};

/**
 * Calculate safe orbital distance for a celestial body from star
 * REALISTIC UPGRADE: Minimum distance = star radius × 1.5 (realistic inner orbit clearance)
 */
export function calculateSafeOrbitDistance(centralBodyRadius, orbitingBodyRadius, orbitNumber) {
  // Minimum distance from star = star radius × 1.5 (realistic habitable zone starts beyond stellar radius)
  const minDistance = centralBodyRadius * DISTANCE_SYSTEM.MIN_PLANET_DISTANCE_MULTIPLIER;
  const spacing = DISTANCE_SYSTEM.PLANET_SPACING;

  // Calculate orbit: min distance + orbit number spacing + generous body clearance
  // MUCH CLOSER orbits for better minimap visibility and gameplay
  return minDistance + (orbitNumber * spacing) + (orbitingBodyRadius * 5);
}

/**
 * Calculate moon orbit around planet
 * REALISTIC UPGRADE: Minimum distance = planet radius × 1.5 (proper Roche limit clearance)
 */
export function calculateMoonOrbit(planetRadius, moonRadius, moonNumber) {
  // Minimum distance from planet = planet radius × 1.5 (prevents tidal disruption - Roche limit)
  const minDistance = planetRadius * DISTANCE_SYSTEM.MIN_MOON_DISTANCE_MULTIPLIER;
  const spacing = DISTANCE_SYSTEM.MOON_SPACING;

  // Calculate orbit: min distance + moon number spacing + generous moon clearance
  // CLOSER lunar distances for better visibility
  return minDistance + (moonNumber * spacing) + (moonRadius * 4);
}

/**
 * Check if two bodies overlap (collision detection for generation)
 */
export function checkOverlap(x1, y1, r1, x2, y2, r2, buffer = 100) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const minDistance = r1 + r2 + buffer;

  return distance < minDistance;
}

/**
 * Get size for celestial body type
 */
export function getCelestialSize(type, rng) {
  switch (type) {
    case 'small_moon':
      return rng.range(SCALE_SYSTEM.SMALL_MOON * 0.9, SCALE_SYSTEM.SMALL_MOON * 1.1);
    case 'medium_moon':
      return rng.range(SCALE_SYSTEM.MEDIUM_MOON * 0.9, SCALE_SYSTEM.MEDIUM_MOON * 1.1);
    case 'large_moon':
      return rng.range(SCALE_SYSTEM.LARGE_MOON * 0.9, SCALE_SYSTEM.LARGE_MOON * 1.1);

    case 'dwarf_planet':
      return rng.range(SCALE_SYSTEM.SMALL_DWARF, SCALE_SYSTEM.LARGE_DWARF);

    // Rocky planets (standard size)
    case 'rocky_planet':
    case 'terran_planet':
    case 'desert_planet':
    case 'ice_planet':
    case 'ocean_planet':
    case 'lava_planet':
    case 'carbon_planet':
      return rng.range(SCALE_SYSTEM.SMALL_PLANET, SCALE_SYSTEM.LARGE_PLANET);

    // Super-Earth (larger than normal planets)
    case 'super_earth':
      return rng.range(SCALE_SYSTEM.MEDIUM_PLANET, SCALE_SYSTEM.LARGE_PLANET * 1.2);

    // Gas giants (standard size)
    case 'gas_giant':
    case 'ice_giant':
    case 'hot_jupiter':
      return rng.range(SCALE_SYSTEM.SMALL_GAS_GIANT, SCALE_SYSTEM.LARGE_GAS_GIANT);

    // Super-Jupiter (larger than normal gas giants)
    case 'super_jupiter':
      return rng.range(SCALE_SYSTEM.MEDIUM_GAS_GIANT, SCALE_SYSTEM.LARGE_GAS_GIANT * 1.3);

    // Brown Dwarf (between gas giant and star)
    case 'brown_dwarf':
      return rng.range(SCALE_SYSTEM.LARGE_GAS_GIANT, SCALE_SYSTEM.RED_DWARF * 0.8);

    case 'comet':
    case 'small_comet':
      return rng.range(SCALE_SYSTEM.SMALL_COMET, SCALE_SYSTEM.MEDIUM_COMET);
    case 'medium_comet':
      return rng.range(SCALE_SYSTEM.MEDIUM_COMET * 0.9, SCALE_SYSTEM.MEDIUM_COMET * 1.1);
    case 'large_comet':
      return rng.range(SCALE_SYSTEM.LARGE_COMET * 0.9, SCALE_SYSTEM.LARGE_COMET * 1.1);

    case 'asteroid_small':
      return rng.range(SCALE_SYSTEM.SMALL_ASTEROID, SCALE_SYSTEM.MEDIUM_ASTEROID);
    case 'asteroid_large':
      return rng.range(SCALE_SYSTEM.MEDIUM_ASTEROID, SCALE_SYSTEM.LARGE_ASTEROID);

    default:
      return SCALE_SYSTEM.MEDIUM_PLANET;
  }
}

/**
 * Get mass for celestial body
 */
export function getCelestialMass(size, type) {
  // Mass scales with volume (size^3) and density
  const densityMultiplier = {
    'rocky': 1.5,
    'gas': 0.3,
    'ice': 0.9,
    'metal': 2.0,
    'moon': 1.0
  };

  const baseType = type.includes('gas') ? 'gas' :
                   type.includes('ice') ? 'ice' :
                   type.includes('moon') ? 'moon' : 'rocky';

  const volume = size * size * size;
  const density = densityMultiplier[baseType] || 1.0;

  return volume * density * 0.1; // Scaling factor for gameplay
}

/**
 * Get system size based on star type
 */
export function getSystemSize(starType) {
  switch (starType) {
    case 'M':
    case 'K':
      return DISTANCE_SYSTEM.SMALL_SYSTEM_RADIUS;
    case 'G':
    case 'F':
      return DISTANCE_SYSTEM.MEDIUM_SYSTEM_RADIUS;
    case 'A':
    case 'B':
    case 'O':
      return DISTANCE_SYSTEM.LARGE_SYSTEM_RADIUS;
    default:
      return DISTANCE_SYSTEM.MEDIUM_SYSTEM_RADIUS;
  }
}
