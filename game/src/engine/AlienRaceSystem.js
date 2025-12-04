/**
 * Alien Race System
 * Manages different alien races, their relationships, ship types, and behaviors
 */

export const ALIEN_RACES = {
  // Friendly/Neutral Races
  zenari: {
    id: 'zenari',
    name: 'Zenari Collective',
    relationship: 'friendly',
    description: 'Peaceful traders and explorers',
    primaryColor: '#4488ff',
    secondaryColor: '#88ccff',
    shipColor: '#5599ff',
    shieldColor: '#88bbff',
    homeworlds: ['Zenarix Prime', 'Harmony Station', 'Azure Haven'],
    traits: {
      trading: 1.2, // 20% better prices
      technology: 0.8, // Advanced tech
      aggression: 0.2, // Low aggression
      helpfulness: 0.9 // High helpfulness
    },
    shipTypes: ['scout', 'trader', 'courier'],
    weapons: ['plasma_cannon', 'point_defense'],
    greetings: [
      'Greetings, traveler! Safe journeys.',
      'The Collective welcomes you.',
      'Peace and prosperity, friend.'
    ],
    icon: '◆'
  },

  vorlan: {
    id: 'vorlan',
    name: 'Vorlan Empire',
    relationship: 'neutral',
    description: 'Militaristic but honorable',
    primaryColor: '#ff4444',
    secondaryColor: '#ff8888',
    shipColor: '#cc3333',
    shieldColor: '#ff6666',
    homeworlds: ['Vorlan Prime', 'War Station Omega', 'Forge World Beta'],
    traits: {
      trading: 0.9,
      technology: 1.0,
      aggression: 0.7,
      helpfulness: 0.5
    },
    shipTypes: ['fighter', 'cruiser', 'destroyer'],
    weapons: ['kinetic_cannon', 'railgun', 'missile_launcher'],
    greetings: [
      'State your business, stranger.',
      'Glory to the Empire.',
      'We observe your presence.'
    ],
    icon: '▲'
  },

  mycelians: {
    id: 'mycelians',
    name: 'Mycelian Network',
    relationship: 'friendly',
    description: 'Organic, hive-mind collective focused on knowledge',
    primaryColor: '#00ff88',
    secondaryColor: '#88ffcc',
    shipColor: '#22dd77',
    shieldColor: '#66ffaa',
    homeworlds: ['Spore World', 'Garden Station', 'Bio-Sphere Alpha'],
    traits: {
      trading: 1.0,
      technology: 0.7, // Organic tech
      aggression: 0.1,
      helpfulness: 0.8
    },
    shipTypes: ['bio_scout', 'spore_carrier', 'growth_vessel'],
    weapons: ['laser_beam', 'point_defense'],
    greetings: [
      'The Network senses your presence.',
      'Knowledge be shared between us.',
      'Growth and harmony, traveler.'
    ],
    icon: '✦'
  },

  // Hostile Races
  kryllian: {
    id: 'kryllian',
    name: 'Kryllian Raiders',
    relationship: 'hostile',
    description: 'Aggressive pirates and scavengers',
    primaryColor: '#aa2222',
    secondaryColor: '#dd4444',
    shipColor: '#992211',
    shieldColor: '#cc4433',
    homeworlds: ['Kryll Outpost', 'Pirate Haven', 'Scrap Station'],
    traits: {
      trading: 0.6, // Poor trade relations
      technology: 0.9,
      aggression: 0.95,
      helpfulness: 0.1
    },
    shipTypes: ['raider', 'interceptor', 'gunship'],
    weapons: ['kinetic_cannon', 'missile_launcher', 'mine_launcher'],
    greetings: [
      'Your cargo is ours!',
      'Surrender or be destroyed!',
      'This sector belongs to the Kryllian!'
    ],
    icon: '◢'
  },

  synthetics: {
    id: 'synthetics',
    name: 'Synthetic Consciousness',
    relationship: 'neutral',
    description: 'Ancient AI entities with unknown motives',
    primaryColor: '#aa00ff',
    secondaryColor: '#dd88ff',
    shipColor: '#8800cc',
    shieldColor: '#bb44ff',
    homeworlds: ['Core World Zero', 'Processing Station', 'Logic Nexus'],
    traits: {
      trading: 0.8,
      technology: 0.5, // Super advanced
      aggression: 0.4,
      helpfulness: 0.3
    },
    shipTypes: ['drone', 'constructor', 'harvester'],
    weapons: ['laser_beam', 'railgun', 'point_defense'],
    greetings: [
      'Analyzing... Organic lifeform detected.',
      'Your technology is primitive.',
      'Processing encounter parameters.'
    ],
    icon: '◇'
  },

  voidborn: {
    id: 'voidborn',
    name: 'Voidborn Collective',
    relationship: 'hostile',
    description: 'Mysterious entities from deep space',
    primaryColor: '#220033',
    secondaryColor: '#660099',
    shipColor: '#330055',
    shieldColor: '#550088',
    homeworlds: ['The Void', 'Dark Station', 'Abyss Gate'],
    traits: {
      trading: 0.3,
      technology: 0.6, // Alien tech
      aggression: 0.9,
      helpfulness: 0.0
    },
    shipTypes: ['void_fighter', 'dreadnought', 'harvester'],
    weapons: ['plasma_cannon', 'nuclear_missile', 'laser_beam'],
    greetings: [
      '...',
      '[Unintelligible transmission]',
      'You do not belong here.'
    ],
    icon: '●'
  },

  // NEW RACES - Expanded diversity

  crystalline: {
    id: 'crystalline',
    name: 'Crystalline Consciousness',
    relationship: 'neutral',
    description: 'Silicon-based lifeforms with crystalline structure',
    primaryColor: '#00ccff',
    secondaryColor: '#88eeff',
    shipColor: '#44ddff',
    shieldColor: '#aaffff',
    homeworlds: ['Crystal Prime', 'Refraction Station', 'Prism Cluster'],
    traits: {
      trading: 1.1,
      technology: 0.6, // Exotic tech
      aggression: 0.3,
      helpfulness: 0.6
    },
    shipTypes: ['crystal_scout', 'refractor', 'prism_ship'],
    weapons: ['laser_beam', 'crystal_shard', 'light_refractor'],
    greetings: [
      'Resonance detected. Frequencies aligned.',
      'Light and clarity be with you.',
      'We sense your vibrations.'
    ],
    icon: '◈'
  },

  aquatic: {
    id: 'aquatic',
    name: 'Aquatic Dominion',
    relationship: 'friendly',
    description: 'Water-dwelling species with advanced bio-tech',
    primaryColor: '#0088aa',
    secondaryColor: '#44aacc',
    shipColor: '#2299bb',
    shieldColor: '#66ccee',
    homeworlds: ['Oceanus', 'Tidal Station', 'Deep Blue Haven'],
    traits: {
      trading: 1.15,
      technology: 0.85,
      aggression: 0.25,
      helpfulness: 0.85
    },
    shipTypes: ['hydro_scout', 'tidal_cruiser', 'deep_explorer'],
    weapons: ['hydro_cannon', 'pressure_beam', 'bio_torpedo'],
    greetings: [
      'May your journey flow smoothly.',
      'The currents guide us together.',
      'Peace from the depths.'
    ],
    icon: '◉'
  },

  avian: {
    id: 'avian',
    name: 'Avian Republic',
    relationship: 'friendly',
    description: 'Bird-like species known for speed and grace',
    primaryColor: '#ff8800',
    secondaryColor: '#ffaa44',
    shipColor: '#ff9922',
    shieldColor: '#ffbb66',
    homeworlds: ['Sky Nest', 'Wind Station', 'Talon Outpost'],
    traits: {
      trading: 1.05,
      technology: 0.9,
      aggression: 0.4,
      helpfulness: 0.75
    },
    shipTypes: ['swift_interceptor', 'raptor_scout', 'condor_cruiser'],
    weapons: ['kinetic_talon', 'dive_missile', 'wind_cutter'],
    greetings: [
      'Swift winds guide you, traveler.',
      'May your flight be steady.',
      'The skies welcome you.'
    ],
    icon: '◭'
  },

  rocky: {
    id: 'rocky',
    name: 'Lithoid Confederation',
    relationship: 'neutral',
    description: 'Rock-based lifeforms, slow but incredibly durable',
    primaryColor: '#8b7355',
    secondaryColor: '#aa9977',
    shipColor: '#998866',
    shieldColor: '#bbaa99',
    homeworlds: ['Stone World', 'Granite Station', 'Boulder Cluster'],
    traits: {
      trading: 0.95,
      technology: 1.1,
      aggression: 0.5,
      helpfulness: 0.55
    },
    shipTypes: ['rock_hauler', 'stone_fortress', 'boulder_crusher'],
    weapons: ['mass_driver', 'seismic_cannon', 'railgun'],
    greetings: [
      'Steady as stone. Greetings.',
      'Time moves slowly. We endure.',
      'From the bedrock, we acknowledge you.'
    ],
    icon: '◼'
  },

  ethereal: {
    id: 'ethereal',
    name: 'Ethereal Ascendancy',
    relationship: 'neutral',
    description: 'Energy beings from higher dimensions',
    primaryColor: '#cc66ff',
    secondaryColor: '#dd99ff',
    shipColor: '#bb55ee',
    shieldColor: '#ee88ff',
    homeworlds: ['Astral Plane', 'Ethereal Nexus', 'Phase Station'],
    traits: {
      trading: 0.85,
      technology: 0.4, // Hyper-advanced
      aggression: 0.2,
      helpfulness: 0.4
    },
    shipTypes: ['phase_ship', 'astral_cruiser', 'void_walker'],
    weapons: ['phase_disruptor', 'energy_beam', 'quantum_torpedo'],
    greetings: [
      'We exist beyond your perception.',
      'Reality shifts. Greetings from the Astral.',
      'Your dimension is... interesting.'
    ],
    icon: '◌'
  },

  hivemind: {
    id: 'hivemind',
    name: 'Swarm Collective',
    relationship: 'hostile',
    description: 'Insectoid hive-mind with overwhelming numbers',
    primaryColor: '#aa4400',
    secondaryColor: '#cc6622',
    shipColor: '#bb5511',
    shieldColor: '#dd7733',
    homeworlds: ['Hive Prime', 'Swarm Cluster', 'Queen\'s Throne'],
    traits: {
      trading: 0.5,
      technology: 0.95,
      aggression: 0.85,
      helpfulness: 0.1
    },
    shipTypes: ['drone_fighter', 'swarm_carrier', 'hive_destroyer'],
    weapons: ['bio_missiles', 'acid_sprayer', 'swarm_launcher'],
    greetings: [
      'The Swarm expands. Resistance futile.',
      'We are many. You are few.',
      'Join the Collective or be consumed.'
    ],
    icon: '◈'
  },

  nomadic: {
    id: 'nomadic',
    name: 'Star Nomads',
    relationship: 'friendly',
    description: 'Wandering traders and explorers',
    primaryColor: '#ffcc00',
    secondaryColor: '#ffdd44',
    shipColor: '#ffdd22',
    shieldColor: '#ffee66',
    homeworlds: ['Fleet Alpha', 'Caravan Station', 'Wanderer\'s Rest'],
    traits: {
      trading: 1.3, // Best traders
      technology: 1.0,
      aggression: 0.15,
      helpfulness: 0.95
    },
    shipTypes: ['nomad_trader', 'caravan_ship', 'pilgrim_cruiser'],
    weapons: ['defensive_turret', 'emp_pulse', 'decoy_launcher'],
    greetings: [
      'Well met, fellow traveler!',
      'The stars are our home. Welcome!',
      'Fair winds and profitable trade!'
    ],
    icon: '◎'
  },

  technocratic: {
    id: 'technocratic',
    name: 'Technocratic Union',
    relationship: 'neutral',
    description: 'Cybernetically enhanced beings obsessed with efficiency',
    primaryColor: '#00ff00',
    secondaryColor: '#44ff44',
    shipColor: '#22ff22',
    shieldColor: '#66ff66',
    homeworlds: ['Tech Prime', 'Efficiency Station', 'Logic Core'],
    traits: {
      trading: 1.0,
      technology: 0.5, // Very advanced
      aggression: 0.45,
      helpfulness: 0.5
    },
    shipTypes: ['efficiency_cruiser', 'logic_destroyer', 'cyber_scout'],
    weapons: ['railgun', 'ion_cannon', 'emp_missile'],
    greetings: [
      'Efficiency calculated. Greetings.',
      'Logic dictates cooperation.',
      'Optimal encounter parameters achieved.'
    ],
    icon: '◪'
  },

  fungal: {
    id: 'fungal',
    name: 'Fungal Network',
    relationship: 'friendly',
    description: 'Spore-based collective consciousness',
    primaryColor: '#9966ff',
    secondaryColor: '#bb88ff',
    shipColor: '#aa77ff',
    shieldColor: '#cc99ff',
    homeworlds: ['Mycelium World', 'Spore Station', 'Fungal Garden'],
    traits: {
      trading: 1.1,
      technology: 0.75,
      aggression: 0.1,
      helpfulness: 0.9
    },
    shipTypes: ['spore_carrier', 'mycelium_ship', 'growth_vessel'],
    weapons: ['spore_launcher', 'bio_beam', 'decomposer'],
    greetings: [
      'Growth and harmony, traveler.',
      'The Network welcomes you.',
      'May you flourish among the stars.'
    ],
    icon: '◬'
  },

  plasma: {
    id: 'plasma',
    name: 'Plasma Entities',
    relationship: 'hostile',
    description: 'Living plasma clouds from stellar cores',
    primaryColor: '#ff00ff',
    secondaryColor: '#ff44ff',
    shipColor: '#ff22ff',
    shieldColor: '#ff66ff',
    homeworlds: ['Plasma Core', 'Star Heart', 'Fusion Nexus'],
    traits: {
      trading: 0.4,
      technology: 0.55,
      aggression: 0.95,
      helpfulness: 0.05
    },
    shipTypes: ['plasma_fighter', 'fusion_cruiser', 'star_destroyer'],
    weapons: ['plasma_cannon', 'fusion_beam', 'solar_flare'],
    greetings: [
      'Burn and be consumed!',
      'We are the fire of stars!',
      'Your matter will fuel our flames!'
    ],
    icon: '◉'
  }
};

export class AlienRaceSystem {
  constructor() {
    this.races = ALIEN_RACES;
    this.reputations = {}; // Player's reputation with each race
    this.initializeReputations();
  }

  /**
   * Initialize reputation values for all races
   */
  initializeReputations() {
    for (const raceId in this.races) {
      const race = this.races[raceId];
      // Start with neutral reputation based on race's default relationship
      this.reputations[race.id] = race.relationship === 'friendly' ? 50 :
                                    race.relationship === 'hostile' ? -50 : 0;
    }
  }

  /**
   * Get a race by ID
   */
  getRace(raceId) {
    const race = this.races[raceId];
    if (!race) {
      // Return a default race to prevent crashes
      return this.races['zenari'] || Object.values(this.races)[0];
    }
    return race;
  }

  /**
   * Get random race
   */
  getRandomRace() {
    const raceIds = Object.keys(this.races);
    const randomId = raceIds[Math.floor(Math.random() * raceIds.length)];
    return this.races[randomId];
  }

  /**
   * Get races by relationship type
   */
  getRacesByRelationship(relationship) {
    const result = [];
    for (const raceId in this.races) {
      const race = this.races[raceId];
      if (race.relationship === relationship) {
        result.push(race);
      }
    }
    return result;
  }

  /**
   * Get current reputation with a race
   */
  getReputation(raceId) {
    return this.reputations[raceId] || 0;
  }

  /**
   * Modify reputation with a race
   */
  modifyReputation(raceId, amount) {
    if (!this.reputations[raceId]) {
      this.reputations[raceId] = 0;
    }
    this.reputations[raceId] = Math.max(-100, Math.min(100, this.reputations[raceId] + amount));

    // Check for relationship changes
    this.updateRelationship(raceId);

    return this.reputations[raceId];
  }

  /**
   * Update relationship based on reputation
   */
  updateRelationship(raceId) {
    const race = this.races[raceId];
    const rep = this.reputations[raceId];

    if (rep >= 70) {
      race.currentRelationship = 'friendly';
    } else if (rep >= 20) {
      race.currentRelationship = 'neutral';
    } else if (rep >= -20) {
      race.currentRelationship = 'cautious';
    } else {
      race.currentRelationship = 'hostile';
    }
  }

  /**
   * Get relationship status (considers both base and current reputation)
   */
  getRelationshipStatus(raceId) {
    const race = this.races[raceId];
    if (!race) {
      return 'neutral'; // Default fallback
    }
    const rep = this.reputations[raceId];

    return race.currentRelationship || race.relationship;
  }

  /**
   * Check if race will attack player
   */
  willAttack(raceId) {
    const race = this.races[raceId];
    if (!race) {
      return true; // Default to hostile if race not found
    }

    const status = this.getRelationshipStatus(raceId);

    if (status === 'hostile') return true;
    if (status === 'friendly') return false;

    // Neutral/cautious races might attack based on aggression
    return Math.random() < race.traits.aggression * 0.3;
  }

  /**
   * Get random greeting from race
   */
  getGreeting(raceId) {
    const race = this.races[raceId];
    if (!race || !race.greetings) return 'Greetings.';

    return race.greetings[Math.floor(Math.random() * race.greetings.length)];
  }

  /**
   * Create alien ship with race-specific properties
   */
  createAlienShip(raceId, shipType, x, y) {
    const race = this.races[raceId];
    if (!race) return null;

    // Base ship stats modified by race traits
    const baseHP = 100;
    const baseShields = 80;
    const baseSpeed = 100;
    const baseDamage = 15;

    return {
      race: raceId,
      raceName: race.name,
      shipType: shipType,
      x: x,
      y: y,
      vx: 0,
      vy: 0,
      angle: Math.random() * Math.PI * 2,
      hp: baseHP * (1 + race.traits.technology * 0.5),
      maxHP: baseHP * (1 + race.traits.technology * 0.5),
      shields: baseShields * (1 + race.traits.technology * 0.3),
      maxShields: baseShields * (1 + race.traits.technology * 0.3),
      speed: baseSpeed,
      damage: baseDamage,
      size: shipType === 'fighter' || shipType === 'scout' ? 18 :
             shipType === 'cruiser' || shipType === 'trader' ? 24 : 30,
      color: race.shipColor,
      shieldColor: race.shieldColor,
      weapons: race.weapons,
      hostile: this.willAttack(raceId),
      aggressive: race.traits.aggression,
      aiState: 'patrol',
      targetAngle: Math.random() * Math.PI * 2,
      stateTimer: Math.random() * 5,
      fireTimer: 0,
      fireCooldown: 1.0 / (1 + race.traits.aggression),
      isDead: false,
      damageFlash: 0
    };
  }

  /**
   * Get ship visual design based on race
   */
  getShipDesign(raceId, shipType) {
    const race = this.races[raceId];

    switch (raceId) {
      case 'zenari':
        return { shape: 'diamond', pattern: 'smooth', engineType: 'dual_blue' };
      case 'vorlan':
        return { shape: 'angular', pattern: 'plated', engineType: 'triple_red' };
      case 'mycelians':
        return { shape: 'organic', pattern: 'bio', engineType: 'pulsing_green' };
      case 'kryllian':
        return { shape: 'asymmetric', pattern: 'scrap', engineType: 'smoking_orange' };
      case 'synthetics':
        return { shape: 'geometric', pattern: 'circuit', engineType: 'glowing_purple' };
      case 'voidborn':
        return { shape: 'ethereal', pattern: 'void', engineType: 'dark_energy' };
      default:
        return { shape: 'standard', pattern: 'default', engineType: 'basic' };
    }
  }

  /**
   * Serialize for saving
   */
  serialize() {
    return {
      reputations: { ...this.reputations }
    };
  }

  /**
   * Deserialize from saved data
   */
  deserialize(data) {
    if (data.reputations) {
      this.reputations = { ...data.reputations };
      // Update relationships based on loaded reputations
      for (const raceId in this.reputations) {
        this.updateRelationship(raceId);
      }
    }
  }
}
