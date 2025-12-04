import { SeededRandom } from '../utils/SeededRandom.js';

/**
 * Galaxy Generator - Creates a procedural galaxy with 20-50 star systems
 * PERFORMANCE: Supports lazy generation - only generates systems on-demand
 */
export class GalaxyGenerator {
  constructor(seed) {
    this.seed = seed;
    this.rng = new SeededRandom(seed);
    this.systems = [];
    this.generatedSystemIndices = new Set(); // Track which systems have been generated
    this.systemCount = this.rng.int(20, 50);
    this.galaxyRadius = 8000; // Compact galaxy for closer star systems (was 15000)
  }

  /**
   * Generate the entire galaxy (legacy - slow, use generateLazy instead)
   */
  generate() {
    for (let i = 0; i < this.systemCount; i++) {
      const system = this.generateStarSystem(i);
      this.systems.push(system);
    }

    return this.systems;
  }

  /**
   * PERFORMANCE: Generate galaxy lazily - only creates starting system
   * Other systems generated on-demand when accessed
   */
  generateLazy() {
    // Only generate the starting system (index 0)
    const startingSystem = this.generateStarSystem(0);
    this.systems.push(startingSystem);
    this.generatedSystemIndices.add(0);

    // Create placeholder systems for the rest (minimal data for map display)
    for (let i = 1; i < this.systemCount; i++) {
      const placeholder = this.generateSystemPlaceholder(i);
      this.systems.push(placeholder);
    }

    return this.systems;
  }

  /**
   * Generate minimal placeholder data for a system (for map display)
   */
  generateSystemPlaceholder(index) {
    const sysRng = new SeededRandom(this.seed + index * 1000);

    // Position in galaxy (spiral distribution) - same as full generation
    const angle = sysRng.next() * Math.PI * 2;
    const armOffset = (index % 4) * (Math.PI / 2);
    const spiralAngle = angle + armOffset + (sysRng.next() - 0.5) * 0.5;
    const distance = sysRng.range(500, this.galaxyRadius); // Closer minimum distance (was 1000)

    const x = Math.cos(spiralAngle) * distance;
    const y = Math.sin(spiralAngle) * distance;

    return {
      id: index,
      seed: this.seed + index * 1000,
      name: this.generateSystemName(index, sysRng),
      position: { x, y },
      isPlaceholder: true, // Flag to indicate this needs full generation
      discovered: false,
      visited: false
    };
  }

  /**
   * Generate full system data on-demand
   */
  generateSystemOnDemand(index) {
    // Check if already generated
    if (this.generatedSystemIndices.has(index)) {
      return this.systems[index];
    }

    // Generate full system data
    const fullSystem = this.generateStarSystem(index);
    this.systems[index] = fullSystem;
    this.generatedSystemIndices.add(index);

    return fullSystem;
  }

  /**
   * Generate a single star system
   */
  generateStarSystem(index) {
    const sysRng = new SeededRandom(this.seed + index * 1000);

    // Position in galaxy (spiral distribution)
    const angle = sysRng.next() * Math.PI * 2;
    const armOffset = (index % 4) * (Math.PI / 2); // 4 spiral arms
    const spiralAngle = angle + armOffset + (sysRng.next() - 0.5) * 0.5;
    const distance = sysRng.range(500, this.galaxyRadius); // Closer minimum distance (was 1000)

    const x = Math.cos(spiralAngle) * distance;
    const y = Math.sin(spiralAngle) * distance;

    // Star system properties
    const starType = this.generateStarType(sysRng);
    const systemType = this.generateSystemType(sysRng);

    return {
      id: index,
      seed: this.seed + index * 1000,
      name: this.generateSystemName(index, sysRng),
      position: { x, y },
      starType: starType,
      systemType: systemType,

      // Star properties
      starMass: starType.mass,
      starRadius: starType.radius,
      starLuminosity: starType.luminosity,
      starColor: starType.color,
      starTemperature: starType.temperature,

      // System composition - INCREASED
      planetCount: this.calculatePlanetCount(sysRng, starType),
      asteroidBelts: sysRng.int(2, 5),    // Was 0-3, now 2-5
      stationCount: sysRng.int(3, 8),     // Was 1-5, now 3-8

      // Special features
      hasBlackhole: systemType === 'blackhole',
      hasMegastructure: sysRng.next() < 0.1, // 10% chance
      megastructureType: this.selectMegastructure(sysRng),
      hasHiveAliens: sysRng.next() < 0.05, // 5% chance

      // Danger level
      dangerLevel: this.calculateDangerLevel(sysRng, systemType),

      // Resources
      resourceRichness: sysRng.next(),
      rareElements: sysRng.next() > 0.7,

      // Discovered status
      discovered: index === 0, // Start system is discovered
      visited: index === 0
    };
  }

  /**
   * Generate star type with custom distribution
   * Sun-like: 50%, Red Giant: 20%, Brown Dwarf: 10%, Blue Giant: 10%, Red Dwarf: 5%, Others: 5%
   */
  generateStarType(rng) {
    const type = rng.next();

    // Color palettes for each star type
    const redDwarfColors = ['#ff3300', '#ff5533', '#ff6644', '#ff8844', '#cc4422'];
    const blueGiantColors = ['#6699ff', '#88bbff', '#aaddff', '#ccddff', '#ffffff', '#eef5ff'];
    const redGiantColors = ['#ff2200', '#ff3311', '#ff4422', '#ff5533', '#cc3311', '#dd4422'];
    const brownDwarfColors = ['#662200', '#774433', '#885544', '#996655', '#aa5544', '#884433'];
    const sunLikeColors = ['#ffff99', '#ffffaa', '#ffffbb', '#ffffcc', '#fff5aa'];

    if (type < 0.50) {
      // G-class (Sun-like Yellow Dwarf) - 50%
      return {
        name: 'G',
        class: 'Yellow Dwarf',
        radius: rng.range(1500, 1800), // Min 1500px as requested
        mass: rng.range(45000, 60000),
        luminosity: rng.range(0.8, 1.2),
        color: sunLikeColors[rng.int(0, sunLikeColors.length - 1)],
        temperature: rng.range(5200, 6000)
      };
    } else if (type < 0.70) {
      // Red Giant - 20%
      return {
        name: 'K-Giant',
        class: 'Red Giant',
        radius: rng.range(1200, 1800),
        mass: rng.range(55000, 90000),
        luminosity: rng.range(2.0, 4.0),
        color: redGiantColors[rng.int(0, redGiantColors.length - 1)],
        temperature: rng.range(3500, 5000)
      };
    } else if (type < 0.80) {
      // Brown Dwarf - 10%
      return {
        name: 'L',
        class: 'Brown Dwarf',
        radius: 500, // Fixed 500px as requested
        mass: rng.range(15000, 25000),
        luminosity: rng.range(0.05, 0.15),
        color: brownDwarfColors[rng.int(0, brownDwarfColors.length - 1)],
        temperature: rng.range(1300, 2200)
      };
    } else if (type < 0.90) {
      // B-class (Blue Giant) - 10%
      return {
        name: 'B',
        class: 'Blue Giant',
        radius: rng.range(1400, 2000),
        mass: rng.range(95000, 150000),
        luminosity: rng.range(3.0, 7.0),
        color: blueGiantColors[rng.int(0, blueGiantColors.length - 1)],
        temperature: rng.range(10000, 30000)
      };
    } else if (type < 0.95) {
      // M-class (Red Dwarf) - 5%
      return {
        name: 'M',
        class: 'Red Dwarf',
        radius: rng.range(400, 700),
        mass: rng.range(25000, 40000),
        luminosity: rng.range(0.3, 0.6),
        color: redDwarfColors[rng.int(0, redDwarfColors.length - 1)],
        temperature: rng.range(2400, 3700)
      };
    } else {
      // Others (F, A, O-class) - 5%
      const otherType = rng.next();

      if (otherType < 0.4) {
        // F-class (Yellow-White) - 2%
        return {
          name: 'F',
          class: 'Yellow-White',
          radius: rng.range(650, 900),
          mass: rng.range(55000, 75000),
          luminosity: rng.range(1.2, 1.8),
          color: '#ffffcc',
          temperature: rng.range(6000, 7500)
        };
      } else if (otherType < 0.7) {
        // A-class (White) - 1.5%
        return {
          name: 'A',
          class: 'White',
          radius: rng.range(750, 1100),
          mass: rng.range(70000, 100000),
          luminosity: rng.range(1.8, 3.0),
          color: '#ffffff',
          temperature: rng.range(7500, 10000)
        };
      } else {
        // O-class (Blue Supergiant) - 1.5%
        return {
          name: 'O',
          class: 'Blue Supergiant',
          radius: rng.range(1800, 2200),
          mass: rng.range(140000, 200000),
          luminosity: rng.range(7.0, 15.0),
          color: '#ccddff',
          temperature: rng.range(30000, 50000)
        };
      }
    }
  }

  /**
   * Generate system type (normal, binary, blackhole, etc.)
   */
  generateSystemType(rng) {
    const roll = rng.next();

    if (roll < 0.70) return 'normal'; // 70% normal
    if (roll < 0.85) return 'binary'; // 15% binary star
    if (roll < 0.95) return 'neutron'; // 10% neutron star
    return 'blackhole'; // 5% blackhole
  }

  /**
   * Calculate planet count based on star type
   * INCREASED: More planets for dynamic systems
   */
  calculatePlanetCount(rng, starType) {
    // Larger stars tend to have more planets - DOUBLED
    const baseCount = starType.name === 'A' || starType.name === 'F' ?
      rng.int(10, 20) :    // Was 6-12, now 10-20
      starType.name === 'G' ?
      rng.int(8, 15) :     // Yellow stars like our sun
      rng.int(6, 12);      // Was 3-8, now 6-12
    return baseCount;
  }

  /**
   * Select megastructure type
   */
  selectMegastructure(rng) {
    const types = [
      'dyson_sphere',
      'ring_habitat',
      'warp_gate',
      'stellar_engine',
      'orbital_ring',
      // ENHANCED: New megastructure types
      'space_city',
      'planet_ring',
      'death_star' // Extremely rare - only one should exist in galaxy
    ];
    return types[rng.int(0, types.length - 1)];
  }

  /**
   * Calculate danger level (0-10)
   */
  calculateDangerLevel(rng, systemType) {
    let danger = rng.int(1, 5);

    if (systemType === 'blackhole') danger += 5;
    if (systemType === 'neutron') danger += 3;
    if (systemType === 'binary') danger += 2;

    return Math.min(danger, 10);
  }

  /**
   * Generate system name
   */
  generateSystemName(index, rng) {
    const prefixes = [
      'Kepler', 'Gliese', 'Proxima', 'Alpha', 'Beta', 'Gamma', 'Delta',
      'Epsilon', 'Zeta', 'Eta', 'Theta', 'Iota', 'Tau', 'Sigma',
      'Nova', 'Stellar', 'Cosmic', 'Nebula', 'Void', 'Deep'
    ];

    const suffixes = [
      'Prime', 'Secundus', 'Tertius', 'Major', 'Minor',
      'A', 'B', 'C', 'I', 'II', 'III', 'IV', 'V'
    ];

    const prefix = prefixes[rng.int(0, prefixes.length - 1)];
    const number = rng.int(100, 999);
    const suffix = rng.next() > 0.5 ? `-${suffixes[rng.int(0, suffixes.length - 1)]}` : '';

    return `${prefix}-${number}${suffix}`;
  }

  /**
   * Get a system by ID
   */
  getSystem(id) {
    return this.systems.find(s => s.id === id);
  }

  /**
   * Get nearby systems
   */
  getNearbySystems(x, y, radius) {
    return this.systems.filter(system => {
      const dx = system.position.x - x;
      const dy = system.position.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= radius;
    });
  }

  /**
   * Get all discovered systems
   */
  getDiscoveredSystems() {
    return this.systems.filter(s => s.discovered);
  }

  /**
   * Mark system as discovered
   */
  discoverSystem(id) {
    const system = this.getSystem(id);
    if (system && !system.discovered) {
      system.discovered = true;
      return true;
    }
    return false;
  }

  /**
   * Mark system as visited
   */
  visitSystem(id) {
    const system = this.getSystem(id);
    if (system) {
      system.visited = true;
      if (!system.discovered) {
        system.discovered = true;
      }
    }
  }
}
