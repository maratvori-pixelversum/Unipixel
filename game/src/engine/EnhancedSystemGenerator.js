import { SeededRandom } from '../utils/SeededRandom.js';
import {
  SCALE_SYSTEM,
  DISTANCE_SYSTEM,
  MASS_SYSTEM,
  getCelestialSize,
  getCelestialMass,
  calculateSafeOrbitDistance,
  calculateMoonOrbit,
  checkOverlap
} from './ScaleSystem.js';

/**
 * Enhanced Star System Generator
 * Uses proper scaling and prevents overlaps
 */
export class EnhancedSystemGenerator {
  constructor(systemData) {
    this.systemData = systemData;
    this.rng = new SeededRandom(systemData.seed);
    this.celestialBodies = [];
    this.star = null;
  }

  /**
   * Generate the complete star system
   */
  generate() {
    // Generate central body (star or blackhole)
    if (this.systemData.hasBlackhole || this.systemData.systemType === 'blackhole') {
      this.star = this.generateBlackhole();
    } else {
      this.star = this.generateStar();
    }

    // Generate rocky planets (min 3, max 7)
    const planets = this.generateRockyPlanets();

    // Generate gas giants (min 3, max 5)
    const gasGiants = this.generateGasGiants();

    // Generate dwarf planets (min 0, max 5)
    const dwarfPlanets = this.generateDwarfPlanets();

    // Combine all planetary bodies
    const allPlanets = [...planets, ...gasGiants, ...dwarfPlanets];
    console.log(`[EnhancedSystemGenerator] Generated planets: Rocky=${planets.length}, Gas=${gasGiants.length}, Dwarf=${dwarfPlanets.length}, Total=${allPlanets.length}`);

    // Generate asteroid belts
    const asteroidBelts = this.generateAsteroidBelts();

    // Generate stations
    const stations = this.generateStations();

    // Generate comets
    const comets = this.generateComets();

    // Generate blackhole if system has one (in addition to star)
    // NEW: 2% chance for any system to have a black hole
    let blackhole = null;
    if (this.systemData.hasBlackhole && this.systemData.systemType !== 'blackhole') {
      blackhole = this.generateBlackhole(true);
    } else if (this.rng.next() < 0.02) {
      // 2% random chance for black hole in system
      blackhole = this.generateBlackhole(true);
    }

    return {
      star: this.star,
      planets: allPlanets,
      asteroidBelts,
      stations,
      comets,
      blackhole,
      celestialBodies: this.celestialBodies
    };
  }

  /**
   * Generate the central star
   * ENHANCED: Supports exotic star types with spawn chances
   */
  generateStar() {
    const starData = this.systemData;

    // NEW: 5% chance for exotic star type variations
    let stellarClass = starData.starType.name;
    const exoticRoll = this.rng.next();

    // Determine base radius first
    // ENHANCED: Increased all star sizes by 100% for better visibility and pixelation
    let radius;
    switch (stellarClass) {
      case 'M':
        radius = SCALE_SYSTEM.RED_DWARF * 2.0;
        // 3% chance for Brown Dwarf instead of M class
        if (exoticRoll < 0.03) {
          stellarClass = 'BrownDwarf';
        }
        break;
      case 'K':
        radius = SCALE_SYSTEM.ORANGE_DWARF * 2.0;
        // 2% chance for Orange Giant
        if (exoticRoll < 0.02) {
          stellarClass = 'OrangeGiant';
          radius = SCALE_SYSTEM.RED_GIANT * 0.8 * 2.0; // Smaller than red giant
        }
        break;
      case 'G':
        radius = SCALE_SYSTEM.YELLOW_DWARF * 2.0;
        // 2% chance for Yellow Giant
        if (exoticRoll < 0.02) {
          stellarClass = 'YellowGiant';
          radius = SCALE_SYSTEM.RED_GIANT * 0.7 * 2.0;
        }
        break;
      case 'F':
        radius = SCALE_SYSTEM.YELLOWWHITE_STAR * 2.0;
        break;
      case 'A':
        radius = SCALE_SYSTEM.WHITE_STAR * 2.0;
        // 1% chance for White Dwarf
        if (exoticRoll < 0.01) {
          stellarClass = 'WhiteDwarf';
          radius = SCALE_SYSTEM.WHITE_DWARF * 2.0;
        }
        break;
      case 'B':
        radius = SCALE_SYSTEM.BLUE_GIANT * 2.0;
        // 1% chance for Neutron Star (rare remnant)
        if (exoticRoll < 0.01) {
          stellarClass = 'NeutronStar';
          radius = SCALE_SYSTEM.WHITE_DWARF * 0.5 * 2.0;
        }
        // 1.5% chance for Pulsar (even rarer!)
        else if (exoticRoll < 0.025) {
          stellarClass = 'Pulsar';
          radius = SCALE_SYSTEM.WHITE_DWARF * 0.5 * 2.0;
        }
        break;
      case 'O':
        radius = SCALE_SYSTEM.BLUE_SUPERGIANT * 2.0;
        break;
      default:
        radius = SCALE_SYSTEM.YELLOW_DWARF * 2.0;
    }

    // Add some variation
    radius *= this.rng.range(0.9, 1.1);

    const star = {
      x: 0, // Center of system
      y: 0,
      radius,
      mass: starData.starMass,
      luminosity: starData.starLuminosity,
      color: starData.starColor,
      temperature: starData.starTemperature,
      type: starData.starType.name,
      stellarClass, // NEW: Track actual stellar class for sprite generation
      coronaPhase: 0,
      rotationSpeed: this.rng.range(0.0001, 0.0005),
      isPulsar: stellarClass === 'Pulsar', // Special flag for pulsing animation
      isNeutronStar: stellarClass === 'NeutronStar'
    };

    this.celestialBodies.push(star);
    return star;
  }

  /**
   * Generate a blackhole (can be central body or orbiting)
   * ENHANCED: 2% chance for black hole to spawn in any star system
   */
  generateBlackhole(isOrbiting = false) {
    const coreRadius = SCALE_SYSTEM.BLACKHOLE_CORE * this.rng.range(0.9, 1.1);
    const eventHorizonRadius = SCALE_SYSTEM.BLACKHOLE_EVENT_HORIZON * this.rng.range(0.9, 1.1);
    const diskRadius = SCALE_SYSTEM.BLACKHOLE_ACCRETION_DISK * this.rng.range(0.9, 1.1);

    // Position (center if central body, random orbit if not)
    let x = 0, y = 0, angle = 0, distance = 0;
    if (isOrbiting && this.star) {
      angle = this.rng.next() * Math.PI * 2;
      distance = this.star.radius * 3 + this.rng.range(1000, 3000);
      x = Math.cos(angle) * distance;
      y = Math.sin(angle) * distance;
    }

    const blackhole = {
      x,
      y,
      angle,
      distance,
      coreRadius,
      eventHorizonRadius,
      diskRadius,
      radius: diskRadius, // For collision/rendering purposes
      mass: MASS_SYSTEM.BLACKHOLE,
      type: 'blackhole',
      isBlackhole: true,
      rotationSpeed: this.rng.range(0.001, 0.003),
      color: '#000000',
      luminosity: 0,
      temperature: 0,
      // NEW: Add accretion disk animation properties
      accretionDiskPhase: 0,
      accretionDiskSpeed: this.rng.range(0.002, 0.005)
    };

    this.celestialBodies.push(blackhole);
    return blackhole;
  }

  /**
   * Generate rocky planets (min 3, max 7)
   */
  generateRockyPlanets() {
    const planets = [];
    const planetCount = this.rng.int(3, 7); // NEW STRICT RULE: min 3, max 7

    for (let i = 0; i < planetCount; i++) {
      const planet = this.generatePlanet(i, planets, 'rocky');
      if (planet) {
        planets.push(planet);
        this.celestialBodies.push(planet);
      } else {
        console.warn(`[EnhancedSystemGenerator] Failed to generate rocky planet ${i + 1}/${planetCount} (overlap)`);
      }
    }

    return planets;
  }

  /**
   * Generate gas giants (min 3, max 5)
   */
  generateGasGiants() {
    const gasGiants = [];
    const gasGiantCount = this.rng.int(3, 5); // NEW STRICT RULE: min 3, max 5

    // Get all existing planets (rocky + gas giants already added)
    const allExistingPlanets = this.celestialBodies.filter(body => body.type && body.type.includes('planet'));

    for (let i = 0; i < gasGiantCount; i++) {
      const gasGiant = this.generatePlanet(allExistingPlanets.length + i, allExistingPlanets, 'gas_giant');
      if (gasGiant) {
        gasGiants.push(gasGiant);
        this.celestialBodies.push(gasGiant);
        allExistingPlanets.push(gasGiant); // Add to existing planets for next iteration
      } else {
        console.warn(`[EnhancedSystemGenerator] Failed to generate gas giant ${i + 1}/${gasGiantCount} (overlap)`);
      }
    }

    return gasGiants;
  }

  /**
   * Generate dwarf planets (min 0, max 5)
   */
  generateDwarfPlanets() {
    const dwarfPlanets = [];
    const dwarfPlanetCount = this.rng.int(0, 5); // NEW STRICT RULE: min 0, max 5

    // Get all existing planets (rocky + gas giants + dwarf already added)
    const allExistingPlanets = this.celestialBodies.filter(body => body.type && body.type.includes('planet'));

    for (let i = 0; i < dwarfPlanetCount; i++) {
      const dwarfPlanet = this.generatePlanet(allExistingPlanets.length + i, allExistingPlanets, 'dwarf');
      if (dwarfPlanet) {
        dwarfPlanets.push(dwarfPlanet);
        this.celestialBodies.push(dwarfPlanet);
        allExistingPlanets.push(dwarfPlanet); // Add to existing planets for next iteration
      } else {
        console.warn(`[EnhancedSystemGenerator] Failed to generate dwarf planet ${i + 1}/${dwarfPlanetCount} (overlap)`);
      }
    }

    return dwarfPlanets;
  }

  /**
   * Generate a single planet
   */
  generatePlanet(index, existingPlanets, forceType = null) {
    // Determine planet type based on distance from star or forced type
    const planetType = forceType ? this.determinePlanetTypeForced(index, forceType) : this.determinePlanetType(index);

    // Get size for this planet type
    const radius = getCelestialSize(planetType, this.rng);

    // Calculate safe orbital distance
    const baseDistance = calculateSafeOrbitDistance(
      this.star.radius,
      radius,
      index
    );

    // Add some random variation
    const distance = baseDistance + this.rng.range(-200, 200);

    // Try multiple angles to find a non-overlapping position
    let angle, x, y;
    let attempts = 0;
    const maxAttempts = 20;  // Try up to 20 different angles
    let hasOverlap = true;

    while (hasOverlap && attempts < maxAttempts) {
      // Random starting angle
      angle = this.rng.next() * Math.PI * 2;

      // Calculate position
      x = Math.cos(angle) * distance;
      y = Math.sin(angle) * distance;

      // Check for overlaps with existing planets
      hasOverlap = false;
      for (const existing of existingPlanets) {
        const existingX = Math.cos(existing.angle) * existing.distance;
        const existingY = Math.sin(existing.angle) * existing.distance;

        if (checkOverlap(x, y, radius, existingX, existingY, existing.radius, 300)) {
          hasOverlap = true;
          break;
        }
      }

      attempts++;
    }

    // If we couldn't find a non-overlapping position after max attempts, skip this planet
    if (hasOverlap) {
      return null;
    }

    // Calculate mass
    const mass = getCelestialMass(radius, planetType);

    // Orbital speed (Kepler's third law approximation)
    const orbitSpeed = 0.015 / Math.sqrt(distance);

    // Generate color based on type
    const color = this.getPlanetColor(planetType);

    // Generate moons
    const moons = this.generateMoons(radius, planetType);

    // Determine if planet has atmosphere
    // Gas giants: ALWAYS have thick atmosphere
    // Planets: Only 10% have atmosphere
    // Other bodies: NO atmosphere
    let hasAtmosphere = false;
    let atmosphereThickness = 10;
    if (planetType.includes('gas')) {
      // Gas giants ALWAYS have thick, visible atmosphere
      hasAtmosphere = true;
      atmosphereThickness = this.rng.range(25, 40); // Much thicker for gas giants
    } else if (planetType.includes('planet')) {
      // Only 10% of rocky/terran planets have atmosphere
      hasAtmosphere = this.rng.next() < 0.1;
      atmosphereThickness = hasAtmosphere ? this.rng.range(8, 15) : 0;
    }

    const planet = {
      type: planetType,
      distance,
      angle,
      orbitSpeed,
      radius,
      mass,
      color,
      name: `${this.systemData.name}-${String.fromCharCode(98 + index)}`, // a, b, c, etc.
      hasAtmosphere,
      atmosphereGlow: atmosphereThickness,
      atmosphereThickness, // For gas giants
      rotation: 0,
      rotationSpeed: this.rng.range(0.001, 0.004),
      hasRings: planetType.includes('gas') && this.rng.next() > 0.5,
      ringColor: this.rng.next() > 0.5 ? '#887766' : '#665544',
      moons,
      temperature: this.calculatePlanetTemperature(distance),
      habitability: this.calculateHabitability(planetType, distance)
    };

    return planet;
  }

  /**
   * Determine planet type based on distance from star
   */
  determinePlanetType(index) {
    const roll = this.rng.next();

    // Inner system (hot)
    if (index < 2) {
      if (roll < 0.5) return 'rocky_planet';
      if (roll < 0.8) return 'desert_planet';
      return 'dwarf_planet';
    }

    // Habitable zone
    if (index < 5) {
      if (roll < 0.3) return 'terran_planet';
      if (roll < 0.6) return 'rocky_planet';
      if (roll < 0.8) return 'desert_planet';
      return 'ice_planet';
    }

    // Outer system (cold)
    if (roll < 0.4) return 'gas_giant';
    if (roll < 0.6) return 'ice_giant';
    if (roll < 0.8) return 'ice_planet';
    return 'dwarf_planet';
  }

  /**
   * Determine planet type with forced category
   */
  determinePlanetTypeForced(index, forceType) {
    const roll = this.rng.next();

    if (forceType === 'rocky') {
      // Rocky planets only - EXPANDED TYPES
      if (index < 2) {
        // Inner system: hot planets
        if (roll < 0.3) return 'lava_planet';        // NEW: Molten surface
        if (roll < 0.6) return 'rocky_planet';
        return roll < 0.8 ? 'desert_planet' : 'carbon_planet'; // NEW: Carbon planet
      } else if (index < 5) {
        // Habitable zone: varied planets
        if (roll < 0.15) return 'ocean_planet';      // NEW: Water world
        if (roll < 0.30) return 'terran_planet';
        if (roll < 0.50) return 'super_earth';       // NEW: Large rocky planet
        if (roll < 0.70) return 'rocky_planet';
        return roll < 0.85 ? 'desert_planet' : 'ice_planet';
      } else {
        // Outer system: cold planets
        return roll < 0.5 ? 'ice_planet' : 'rocky_planet';
      }
    } else if (forceType === 'gas_giant') {
      // Gas giants only - EXPANDED TYPES
      if (roll < 0.25) return 'hot_jupiter';         // NEW: Close-orbit gas giant
      if (roll < 0.50) return 'gas_giant';
      if (roll < 0.75) return 'ice_giant';
      if (roll < 0.90) return 'super_jupiter';       // NEW: Massive gas giant
      return 'brown_dwarf';                          // NEW: Failed star
    } else if (forceType === 'dwarf') {
      // Dwarf planets only
      return 'dwarf_planet';
    }

    return this.determinePlanetType(index);
  }

  /**
   * Get planet color based on type (EXPANDED PALETTE)
   */
  getPlanetColor(type) {
    const colors = {
      // Rocky planets
      'rocky_planet': '#aa6644',
      'terran_planet': '#4488aa',
      'desert_planet': '#cc8844',
      'ice_planet': '#aaddff',
      'dwarf_planet': '#888888',

      // NEW planet types
      'ocean_planet': '#2266aa',      // Deep blue water world
      'lava_planet': '#ff4400',       // Molten orange/red
      'carbon_planet': '#444466',     // Dark gray/black with diamond glints
      'super_earth': '#557733',       // Greenish-brown large rocky

      // Gas giants
      'gas_giant': '#cc9966',
      'ice_giant': '#88bbdd',
      'hot_jupiter': '#dd8855',       // Warmer gas giant
      'super_jupiter': '#bb8844',     // Massive brownish gas giant
      'brown_dwarf': '#663300'        // Dark brown failed star
    };
    return colors[type] || '#888888';
  }

  /**
   * Generate moons for a planet
   */
  generateMoons(planetRadius, planetType) {
    const moons = [];

    // NEW STRICT RULES: Moons per planet: min 0, max 4; Moons per gas giant: min 4, max 20
    let moonCount;
    if (planetType.includes('gas')) {
      moonCount = this.rng.int(4, 20);      // NEW RULE: Gas giants have 4-20 moons
    } else if (planetType === 'dwarf_planet') {
      moonCount = this.rng.int(0, 1);       // Dwarf planets rarely have moons
    } else {
      moonCount = this.rng.int(0, 4);       // NEW RULE: Regular planets have 0-4 moons
    }

    for (let i = 0; i < moonCount; i++) {
      const moonTypeRoll = this.rng.next();

      // Determine moon size
      const moonType = moonTypeRoll > 0.7 ? 'large_moon' :
                       moonTypeRoll > 0.4 ? 'medium_moon' : 'small_moon';

      // Determine moon subtype (NEW: more variety)
      let moonSubtype, moonColor;
      const subtypeRoll = this.rng.next();
      if (subtypeRoll < 0.25) {
        moonSubtype = 'ice_moon';           // NEW: Europa-like ice moon
        moonColor = '#ccddff';
      } else if (subtypeRoll < 0.45) {
        moonSubtype = 'volcanic_moon';      // NEW: Io-like volcanic moon
        moonColor = '#ffaa44';
      } else if (subtypeRoll < 0.60) {
        moonSubtype = 'titan_moon';         // NEW: Titan-like with atmosphere
        moonColor = '#ccaa66';
      } else if (subtypeRoll < 0.75) {
        moonSubtype = 'captured_asteroid';  // NEW: Captured asteroid moon
        moonColor = '#777777';
      } else {
        moonSubtype = 'rocky_moon';         // Standard rocky moon
        moonColor = this.rng.next() > 0.5 ? '#aaaaaa' : '#999999';
      }

      const moonRadius = getCelestialSize(moonType, this.rng);
      const distance = calculateMoonOrbit(planetRadius, moonRadius, i);

      moons.push({
        distance,
        angle: this.rng.next() * Math.PI * 2,
        orbitSpeed: 0.02 / (i + 1),
        radius: moonRadius,
        color: moonColor,
        subtype: moonSubtype,
        mass: getCelestialMass(moonRadius, 'moon'),
        name: `Moon-${i + 1}`
      });
    }

    return moons;
  }

  /**
   * Generate asteroid belts
   */
  generateAsteroidBelts() {
    const belts = [];
    const beltCount = this.systemData.asteroidBelts;

    for (let b = 0; b < beltCount; b++) {
      const beltDistance = DISTANCE_SYSTEM.MIN_ASTEROID_BELT_DISTANCE +
                          (b * 800) + // Much closer belt spacing (was 1500)
                          this.rng.range(-200, 200);

      const asteroidCount = this.rng.int(30, 120); // NEW STRICT RULE: min 30, max 120 asteroids total per belt
      const asteroids = [];

      for (let i = 0; i < asteroidCount; i++) {
        const distance = beltDistance + this.rng.range(-200, 200);
        const angle = this.rng.next() * Math.PI * 2;
        const size = this.rng.next() > 0.7 ?
          getCelestialSize('asteroid_large', this.rng) :
          getCelestialSize('asteroid_small', this.rng);

        // NEW: Determine asteroid composition type
        const typeRoll = this.rng.next();
        let asteroidType, asteroidColor;
        if (typeRoll < 0.40) {
          asteroidType = 'C-type';        // Carbonaceous (most common)
          asteroidColor = '#444444';
        } else if (typeRoll < 0.75) {
          asteroidType = 'S-type';        // Silicate (rocky)
          asteroidColor = '#888877';
        } else {
          asteroidType = 'M-type';        // Metallic (rare, valuable)
          asteroidColor = '#aaaaaa';
        }

        asteroids.push({
          distance,
          angle,
          orbitSpeed: 0.008 / Math.sqrt(distance),
          size,
          rotation: this.rng.next() * Math.PI * 2,
          rotationSpeed: this.rng.range(-0.03, 0.03),
          mass: size * 5,
          vertices: this.generateAsteroidShape(),
          type: asteroidType,
          color: asteroidColor,
          hp: asteroidType === 'M-type' ? this.rng.int(60, 120) : this.rng.int(30, 80), // Metal asteroids are tougher
          resources: asteroidType === 'M-type' ? this.rng.int(40, 100) : this.rng.int(15, 50) // Metal asteroids have more resources
        });
      }

      belts.push({
        distance: beltDistance,
        asteroids,
        density: asteroidCount / 100
      });
    }

    return belts;
  }

  /**
   * Generate asteroid shape
   */
  generateAsteroidShape() {
    const vertices = [];
    const sides = this.rng.int(6, 12);

    for (let i = 0; i < sides; i++) {
      const angle = (i / sides) * Math.PI * 2;
      const radius = this.rng.range(0.6, 1.4);
      vertices.push({
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius
      });
    }

    return vertices;
  }

  /**
   * Generate space stations
   */
  generateStations() {
    const stations = [];
    const stationCount = this.systemData.stationCount;

    for (let i = 0; i < stationCount; i++) {
      const distance = this.rng.range(
        DISTANCE_SYSTEM.MIN_STATION_DISTANCE,
        DISTANCE_SYSTEM.MEDIUM_SYSTEM_RADIUS * 0.7
      );

      const angle = this.rng.next() * Math.PI * 2;

      // ENHANCED: Expanded from 5 to 12 station types (added 7 new types)
      const stationTypeIndex = this.rng.int(0, 11); // 0-11: all station types
      const stationTypeNames = [
        'trading', 'military', 'research', 'mining', 'refinery',
        'orbital_shipyard', 'medical_station', 'agricultural_station',
        'science_outpost', 'listening_post', 'habitat_ring', 'fuel_depot'
      ];
      const stationType = stationTypeNames[stationTypeIndex];

      // Determine size based on station type
      const size = stationType === 'military' ? SCALE_SYSTEM.LARGE_STATION :
                   stationType === 'orbital_shipyard' ? SCALE_SYSTEM.LARGE_STATION :
                   stationType === 'habitat_ring' ? SCALE_SYSTEM.LARGE_STATION :
                   stationType === 'research' ? SCALE_SYSTEM.MEDIUM_STATION :
                   stationType === 'science_outpost' ? SCALE_SYSTEM.MEDIUM_STATION :
                   stationType === 'medical_station' ? SCALE_SYSTEM.MEDIUM_STATION :
                   SCALE_SYSTEM.SMALL_STATION;

      stations.push({
        distance,
        angle,
        orbitSpeed: 0.01 / Math.sqrt(distance),
        rotation: 0,
        rotationSpeed: this.rng.range(0.005, 0.015),
        type: stationTypeIndex, // Keep numeric for compatibility
        stationType: stationType, // Add string type for renderer
        size,
        hp: 500 + (size * 2),
        hostile: this.systemData.dangerLevel > 6 && this.rng.next() > 0.7,
        name: this.getStationName(stationType, i)
      });
    }

    return stations;
  }

  /**
   * Get station name based on type
   */
  getStationName(type, index) {
    const names = {
      'trading': ['Trade Hub', 'Commerce Station', 'Exchange Point'],
      'military': ['Military Outpost', 'Defense Platform', 'Garrison'],
      'research': ['Research Station', 'Science Lab', 'Observatory'],
      'mining': ['Mining Station', 'Ore Processor', 'Extraction Platform'],
      'refinery': ['Refinery', 'Processing Center', 'Fuel Depot'],
      // ENHANCED: New station type names
      'orbital_shipyard': ['Orbital Shipyard', 'Construction Dock', 'Naval Yard'],
      'medical_station': ['Medical Center', 'Hospital Station', 'Trauma Bay'],
      'agricultural_station': ['Agri-Station', 'Hydroponic Farm', 'Bio-Dome'],
      'science_outpost': ['Deep Space Observatory', 'Research Outpost', 'Telescope Array'],
      'listening_post': ['Listening Post', 'Surveillance Station', 'Signal Intercept'],
      'habitat_ring': ['Habitat Ring', 'Residential Wheel', 'Colony Station'],
      'fuel_depot': ['Fuel Depot', 'Refueling Station', 'Energy Storage']
    };

    const typeNames = names[type] || names['trading'];
    const name = typeNames[this.rng.int(0, typeNames.length - 1)];

    return `${name} ${String.fromCharCode(65 + index)}`;
  }

  /**
   * Generate comets
   */
  generateComets() {
    const comets = [];
    const cometCount = this.rng.int(2, 8); // NEW STRICT RULE: min 2, max 8 comets

    for (let i = 0; i < cometCount; i++) {
      const distance = this.rng.range(
        DISTANCE_SYSTEM.LARGE_SYSTEM_RADIUS * 0.5,
        DISTANCE_SYSTEM.LARGE_SYSTEM_RADIUS * 1.5
      );

      comets.push({
        distance,
        angle: this.rng.next() * Math.PI * 2,
        orbitSpeed: 0.005 / Math.sqrt(distance),
        radius: SCALE_SYSTEM.COMET,
        eccentricity: this.rng.range(0.5, 0.95), // Highly elliptical
        mass: 100,
        tailLength: this.rng.range(100, 300),
        active: this.rng.next() > 0.5
      });
    }

    return comets;
  }

  /**
   * Calculate planet temperature based on distance from star
   */
  calculatePlanetTemperature(distance) {
    const starLuminosity = this.star.luminosity || 1.0;
    const temperature = (starLuminosity * 1000) / Math.sqrt(distance);
    return Math.min(temperature, 2000);
  }

  /**
   * Calculate habitability score (0-1)
   */
  calculateHabitability(planetType, distance) {
    if (planetType !== 'terran_planet' && planetType !== 'rocky_planet') {
      return 0;
    }

    const temperature = this.calculatePlanetTemperature(distance);

    // Habitable zone: 273-373K (0-100°C)
    if (temperature < 200 || temperature > 400) return 0;

    const idealTemp = 300;
    const tempDiff = Math.abs(temperature - idealTemp);

    return Math.max(0, 1 - (tempDiff / 100));
  }
}
