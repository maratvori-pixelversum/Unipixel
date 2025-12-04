/**
 * Enhanced Items and Artifacts
 *
 * Expanded content for:
 * - More artifact types
 * - Ship upgrades
 * - Consumable items
 * - Quest items
 * - Rare collectibles
 * - Technology blueprints
 */

export const ENHANCED_ARTIFACTS = {
  // Ancient Technology (expanded)
  precursor_beacon: {
    id: 'precursor_beacon',
    name: 'Precursor Beacon',
    category: 'ancient_tech',
    rarity: 'rare',
    value: 5000,
    description: 'An ancient beacon from a long-dead civilization. Reveals nearby systems.',
    effect: 'Reveals 5 nearby undiscovered systems',
    icon: '📡',
    usable: true,
    size: 30
  },

  quantum_core: {
    id: 'quantum_core',
    name: 'Quantum Core',
    category: 'ancient_tech',
    rarity: 'epic',
    value: 15000,
    description: 'A quantum computing device of unknown origin. Boosts ship systems.',
    effect: '+20% power generation, +15% shield recharge',
    icon: '⚛',
    installable: true,
    size: 25
  },

  stasis_pod: {
    id: 'stasis_pod',
    name: 'Stasis Pod',
    category: 'ancient_tech',
    rarity: 'rare',
    value: 8000,
    description: 'Cryogenic chamber from an ancient ship. Contents unknown.',
    effect: 'Open to reveal random cargo or creature',
    icon: '🧊',
    consumable: true,
    size: 40
  },

  star_map_fragment: {
    id: 'star_map_fragment',
    name: 'Star Map Fragment',
    category: 'ancient_tech',
    rarity: 'uncommon',
    value: 3000,
    description: 'Fragment of an ancient star map. Collect all 7 fragments to complete it.',
    effect: 'Quest item - part of Ancient Navigation quest',
    icon: '🗺',
    questItem: true,
    size: 5
  },

  warp_drive_prototype: {
    id: 'warp_drive_prototype',
    name: 'Prototype Warp Drive',
    category: 'ancient_tech',
    rarity: 'legendary',
    value: 50000,
    description: 'Experimental faster-than-light drive. Doubles warp speed!',
    effect: '+100% warp speed',
    icon: '🚀',
    installable: true,
    size: 50
  },

  // Alien Relics (expanded)
  crystalline_matrix: {
    id: 'crystalline_matrix',
    name: 'Crystalline Matrix',
    category: 'alien_relic',
    rarity: 'uncommon',
    value: 3000,
    description: 'Complex crystal structure with encoded data. Valuable to researchers.',
    effect: 'Sell to scientists for bonus credits',
    icon: '💠',
    tradeable: true,
    size: 20
  },

  biomechanical_artifact: {
    id: 'biomechanical_artifact',
    name: 'Biomechanical Artifact',
    category: 'alien_relic',
    rarity: 'rare',
    value: 7000,
    description: 'Fusion of organic and mechanical technology. Collectors pay premium.',
    effect: 'Worth 2x value to collectors',
    icon: '🧬',
    tradeable: true,
    size: 25
  },

  psionic_amplifier: {
    id: 'psionic_amplifier',
    name: 'Psionic Amplifier',
    category: 'alien_relic',
    rarity: 'epic',
    value: 12000,
    description: 'Device that amplifies psychic abilities. Increases sensor range.',
    effect: '+50% sensor range, reveals hidden objects',
    icon: '🔮',
    installable: true,
    size: 15
  },

  alien_data_core: {
    id: 'alien_data_core',
    name: 'Alien Data Core',
    category: 'alien_relic',
    rarity: 'rare',
    value: 9000,
    description: 'Intact data storage from alien civilization. Contains valuable information.',
    effect: 'Unlock alien technology blueprints',
    icon: '💾',
    usable: true,
    size: 10
  },

  living_crystal: {
    id: 'living_crystal',
    name: 'Living Crystal',
    category: 'alien_relic',
    rarity: 'legendary',
    value: 35000,
    description: 'Sentient crystalline organism. Slowly grows over time.',
    effect: 'Generates 1 Crystalline Matrix per day',
    icon: '💎',
    growing: true,
    size: 15
  },

  // Anomalous Objects (expanded)
  dark_matter_sample: {
    id: 'dark_matter_sample',
    name: 'Dark Matter Sample',
    category: 'anomalous',
    rarity: 'legendary',
    value: 25000,
    description: 'Contained sample of dark matter. Highly unstable and valuable.',
    effect: 'Research grants +20% credits from scientists',
    icon: '⚫',
    dangerous: true,
    size: 10
  },

  temporal_fragment: {
    id: 'temporal_fragment',
    name: 'Temporal Fragment',
    category: 'anomalous',
    rarity: 'legendary',
    value: 30000,
    description: 'Object unstable in time. Phases in and out of reality.',
    effect: 'Unknown temporal properties',
    icon: '⏰',
    mysterious: true,
    size: 12
  },

  void_crystal: {
    id: 'void_crystal',
    name: 'Void Crystal',
    category: 'anomalous',
    rarity: 'epic',
    value: 10000,
    description: 'Crystal formed in deep space. Absorbs and stores energy.',
    effect: '+100 maximum energy capacity',
    icon: '🔷',
    installable: true,
    size: 18
  },

  graviton_sphere: {
    id: 'graviton_sphere',
    name: 'Graviton Sphere',
    category: 'anomalous',
    rarity: 'epic',
    value: 15000,
    description: 'Sphere that generates localized gravity field. Improves maneuverability.',
    effect: '+25% turn rate, +10% acceleration',
    icon: '🌐',
    installable: true,
    size: 20
  },

  // Ship Upgrades (NEW)
  advanced_shields: {
    id: 'advanced_shields',
    name: 'Advanced Shield Generator',
    category: 'ship_upgrade',
    rarity: 'rare',
    value: 8000,
    description: 'Military-grade shield generator. Doubles shield capacity.',
    effect: '+100% maximum shields',
    icon: '🛡',
    installable: true,
    size: 30
  },

  hull_plating: {
    id: 'hull_plating',
    name: 'Reinforced Hull Plating',
    category: 'ship_upgrade',
    rarity: 'uncommon',
    value: 4000,
    description: 'Titanium-alloy armor plating. Increases hull integrity.',
    effect: '+50% maximum hull points',
    icon: '🔩',
    installable: true,
    size: 40
  },

  cargo_expansion: {
    id: 'cargo_expansion',
    name: 'Cargo Bay Expansion',
    category: 'ship_upgrade',
    rarity: 'common',
    value: 2000,
    description: 'Modular cargo containers. Increases cargo capacity.',
    effect: '+100 cargo capacity',
    icon: '📦',
    installable: true,
    size: 50
  },

  targeting_computer: {
    id: 'targeting_computer',
    name: 'Advanced Targeting Computer',
    category: 'ship_upgrade',
    rarity: 'rare',
    value: 6000,
    description: 'AI-assisted targeting system. Improves weapon accuracy.',
    effect: '+30% weapon accuracy, auto-targeting',
    icon: '🎯',
    installable: true,
    size: 15
  },

  energy_converter: {
    id: 'energy_converter',
    name: 'Energy Conversion Matrix',
    category: 'ship_upgrade',
    rarity: 'epic',
    value: 12000,
    description: 'Converts excess shield energy to weapon power.',
    effect: 'Shield energy can boost weapons',
    icon: '⚡',
    installable: true,
    size: 25
  },

  // Consumables (NEW)
  repair_nanobots: {
    id: 'repair_nanobots',
    name: 'Repair Nanobots',
    category: 'consumable',
    rarity: 'uncommon',
    value: 500,
    description: 'Self-replicating repair drones. Instant hull repair.',
    effect: 'Restore 50% hull instantly',
    icon: '🔧',
    consumable: true,
    stackable: true,
    size: 5
  },

  shield_battery: {
    id: 'shield_battery',
    name: 'Shield Battery',
    category: 'consumable',
    rarity: 'uncommon',
    value: 400,
    description: 'Emergency shield power cell. Instant shield restoration.',
    effect: 'Restore 100% shields instantly',
    icon: '🔋',
    consumable: true,
    stackable: true,
    size: 5
  },

  fuel_cell: {
    id: 'fuel_cell',
    name: 'Deuterium Fuel Cell',
    category: 'consumable',
    rarity: 'common',
    value: 200,
    description: 'Refined fuel for warp drives. Refuels ship.',
    effect: '+50 fuel',
    icon: '⛽',
    consumable: true,
    stackable: true,
    size: 10
  },

  cloaking_charge: {
    id: 'cloaking_charge',
    name: 'Cloaking Charge',
    category: 'consumable',
    rarity: 'rare',
    value: 1000,
    description: 'Single-use cloaking device. Temporary invisibility.',
    effect: '30 seconds of cloaking',
    icon: '👁',
    consumable: true,
    stackable: true,
    size: 5
  },

  // Quest Items (NEW)
  distress_beacon: {
    id: 'distress_beacon',
    name: 'Distress Beacon',
    category: 'quest',
    rarity: 'quest',
    value: 0,
    description: 'Beacon from a stranded ship. Investigate coordinates.',
    effect: 'Leads to rescue mission',
    icon: '📶',
    questItem: true,
    size: 5
  },

  alien_egg: {
    id: 'alien_egg',
    name: 'Unidentified Egg',
    category: 'quest',
    rarity: 'quest',
    value: 0,
    description: 'Large egg of unknown origin. Keep at stable temperature.',
    effect: 'Will hatch after 7 days',
    icon: '🥚',
    questItem: true,
    growing: true,
    size: 20
  },

  ancient_key: {
    id: 'ancient_key',
    name: 'Ancient Vault Key',
    category: 'quest',
    rarity: 'quest',
    value: 0,
    description: 'Key to a precursor vault. Find the matching vault.',
    effect: 'Opens precursor vault',
    icon: '🔑',
    questItem: true,
    size: 5
  },

  // === WEAPONS (NEW) ===
  laser_cannon_mk1: {
    id: 'laser_cannon_mk1',
    name: 'Laser Cannon Mk I',
    category: 'weapon',
    rarity: 'common',
    value: 1500,
    description: 'Basic energy weapon. Reliable and efficient.',
    effect: '+10 laser damage',
    icon: 'LASER1',
    installable: true,
    size: 15
  },

  laser_cannon_mk2: {
    id: 'laser_cannon_mk2',
    name: 'Laser Cannon Mk II',
    category: 'weapon',
    rarity: 'uncommon',
    value: 3500,
    description: 'Improved laser weapon with better power efficiency.',
    effect: '+20 laser damage, -10% energy cost',
    icon: 'LASER2',
    installable: true,
    size: 15
  },

  laser_cannon_mk3: {
    id: 'laser_cannon_mk3',
    name: 'Laser Cannon Mk III',
    category: 'weapon',
    rarity: 'rare',
    value: 7000,
    description: 'Military-grade laser with rapid fire capability.',
    effect: '+35 laser damage, +25% fire rate',
    icon: 'LASER3',
    installable: true,
    size: 15
  },

  plasma_gun: {
    id: 'plasma_gun',
    name: 'Plasma Projector',
    category: 'weapon',
    rarity: 'rare',
    value: 6500,
    description: 'Fires superheated plasma bolts. High damage, slow fire rate.',
    effect: '+50 plasma damage, -20% fire rate',
    icon: 'PLASMA',
    installable: true,
    size: 20
  },

  ion_cannon: {
    id: 'ion_cannon',
    name: 'Ion Disruptor',
    category: 'weapon',
    rarity: 'epic',
    value: 12000,
    description: 'Disrupts shields and disables systems. Low hull damage.',
    effect: '+100 shield damage, disable systems 20%',
    icon: 'ION',
    installable: true,
    size: 25
  },

  railgun: {
    id: 'railgun',
    name: 'Electromagnetic Railgun',
    category: 'weapon',
    rarity: 'epic',
    value: 15000,
    description: 'Kinetic weapon firing metal slugs at extreme velocity.',
    effect: '+75 kinetic damage, penetrates shields 30%',
    icon: 'RAIL',
    installable: true,
    size: 30
  },

  missile_launcher: {
    id: 'missile_launcher',
    name: 'Missile Launcher',
    category: 'weapon',
    rarity: 'uncommon',
    value: 4000,
    description: 'Launches guided missiles. Requires ammunition.',
    effect: '+60 explosive damage, tracking',
    icon: 'MISSILE',
    installable: true,
    size: 25
  },

  torpedo_launcher: {
    id: 'torpedo_launcher',
    name: 'Heavy Torpedo Launcher',
    category: 'weapon',
    rarity: 'rare',
    value: 8500,
    description: 'Fires heavy torpedoes for capital ship combat.',
    effect: '+150 explosive damage, slow reload',
    icon: 'TORPEDO',
    installable: true,
    size: 40
  },

  beam_laser: {
    id: 'beam_laser',
    name: 'Continuous Beam Laser',
    category: 'weapon',
    rarity: 'legendary',
    value: 25000,
    description: 'Sustained energy beam. Cuts through armor.',
    effect: '+40 DPS beam, armor piercing',
    icon: 'BEAM',
    installable: true,
    size: 35
  },

  particle_accelerator: {
    id: 'particle_accelerator',
    name: 'Particle Beam Accelerator',
    category: 'weapon',
    rarity: 'legendary',
    value: 30000,
    description: 'Experimental weapon firing particle streams.',
    effect: '+100 particle damage, shield bypass 50%',
    icon: 'PARTICLE',
    installable: true,
    size: 45
  },

  // === RESOURCES (NEW) ===
  iron_ore: {
    id: 'iron_ore',
    name: 'Iron Ore',
    category: 'resource',
    rarity: 'common',
    value: 10,
    description: 'Common metallic ore. Used in basic construction.',
    effect: 'Crafting material',
    icon: 'ORE_IRON',
    tradeable: true,
    stackable: true,
    size: 1
  },

  copper_ore: {
    id: 'copper_ore',
    name: 'Copper Ore',
    category: 'resource',
    rarity: 'common',
    value: 15,
    description: 'Conductive metal ore. Used in electronics.',
    effect: 'Crafting material',
    icon: 'ORE_COPPER',
    tradeable: true,
    stackable: true,
    size: 1
  },

  titanium_ore: {
    id: 'titanium_ore',
    name: 'Titanium Ore',
    category: 'resource',
    rarity: 'uncommon',
    value: 50,
    description: 'Strong, lightweight metal. Hull construction.',
    effect: 'Crafting material',
    icon: 'ORE_TITANIUM',
    tradeable: true,
    stackable: true,
    size: 1
  },

  platinum_ore: {
    id: 'platinum_ore',
    name: 'Platinum Ore',
    category: 'resource',
    rarity: 'rare',
    value: 200,
    description: 'Precious metal with excellent conductivity.',
    effect: 'Crafting material',
    icon: 'ORE_PLATINUM',
    tradeable: true,
    stackable: true,
    size: 1
  },

  gold_ore: {
    id: 'gold_ore',
    name: 'Gold Ore',
    category: 'resource',
    rarity: 'rare',
    value: 180,
    description: 'Valuable precious metal. Used in high-end electronics.',
    effect: 'Crafting material',
    icon: 'ORE_GOLD',
    tradeable: true,
    stackable: true,
    size: 1
  },

  iridium_ore: {
    id: 'iridium_ore',
    name: 'Iridium Ore',
    category: 'resource',
    rarity: 'epic',
    value: 500,
    description: 'Extremely rare and dense metal. Advanced applications.',
    effect: 'Crafting material',
    icon: 'ORE_IRIDIUM',
    tradeable: true,
    stackable: true,
    size: 1
  },

  crystal_silicon: {
    id: 'crystal_silicon',
    name: 'Silicon Crystal',
    category: 'resource',
    rarity: 'uncommon',
    value: 35,
    description: 'Pure silicon crystals. Computer manufacturing.',
    effect: 'Crafting material',
    icon: 'CRYSTAL_SI',
    tradeable: true,
    stackable: true,
    size: 1
  },

  crystal_quartz: {
    id: 'crystal_quartz',
    name: 'Quartz Crystal',
    category: 'resource',
    rarity: 'uncommon',
    value: 40,
    description: 'Piezoelectric crystals. Sensor arrays.',
    effect: 'Crafting material',
    icon: 'CRYSTAL_Q',
    tradeable: true,
    stackable: true,
    size: 1
  },

  crystal_diamond: {
    id: 'crystal_diamond',
    name: 'Industrial Diamond',
    category: 'resource',
    rarity: 'rare',
    value: 250,
    description: 'Hardest known material. Cutting and drilling.',
    effect: 'Crafting material',
    icon: 'CRYSTAL_D',
    tradeable: true,
    stackable: true,
    size: 1
  },

  hydrogen_fuel: {
    id: 'hydrogen_fuel',
    name: 'Liquid Hydrogen',
    category: 'resource',
    rarity: 'common',
    value: 20,
    description: 'Compressed hydrogen fuel. Standard fuel source.',
    effect: 'Fuel source',
    icon: 'FUEL_H2',
    tradeable: true,
    stackable: true,
    size: 2
  },

  helium3: {
    id: 'helium3',
    name: 'Helium-3',
    category: 'resource',
    rarity: 'uncommon',
    value: 75,
    description: 'Rare fusion fuel. Highly efficient energy.',
    effect: 'Premium fuel source',
    icon: 'FUEL_HE3',
    tradeable: true,
    stackable: true,
    size: 2
  },

  antimatter: {
    id: 'antimatter',
    name: 'Antimatter Containment',
    category: 'resource',
    rarity: 'legendary',
    value: 10000,
    description: 'Magnetic containment of antimatter. Extremely dangerous.',
    effect: 'Ultimate energy source',
    icon: 'ANTIMATTER',
    tradeable: true,
    dangerous: true,
    size: 5
  },

  // === EQUIPMENT (NEW) ===
  engine_basic: {
    id: 'engine_basic',
    name: 'Ion Engine',
    category: 'equipment',
    rarity: 'common',
    value: 2000,
    description: 'Standard ion propulsion system.',
    effect: '+10% speed',
    icon: 'ENGINE1',
    installable: true,
    size: 30
  },

  engine_advanced: {
    id: 'engine_advanced',
    name: 'Plasma Drive',
    category: 'equipment',
    rarity: 'rare',
    value: 8000,
    description: 'Advanced plasma propulsion. High efficiency.',
    effect: '+25% speed, -15% fuel consumption',
    icon: 'ENGINE2',
    installable: true,
    size: 35
  },

  engine_quantum: {
    id: 'engine_quantum',
    name: 'Quantum Thruster',
    category: 'equipment',
    rarity: 'legendary',
    value: 40000,
    description: 'Quantum entanglement drive. Instantaneous acceleration.',
    effect: '+50% speed, +100% acceleration',
    icon: 'ENGINE3',
    installable: true,
    size: 40
  },

  sensor_basic: {
    id: 'sensor_basic',
    name: 'Basic Scanner',
    category: 'equipment',
    rarity: 'common',
    value: 1000,
    description: 'Standard detection array.',
    effect: '+500m sensor range',
    icon: 'SENSOR1',
    installable: true,
    size: 10
  },

  sensor_advanced: {
    id: 'sensor_advanced',
    name: 'Advanced Sensor Array',
    category: 'equipment',
    rarity: 'rare',
    value: 6000,
    description: 'Multi-spectrum detection system.',
    effect: '+1500m sensor range, mineral detection',
    icon: 'SENSOR2',
    installable: true,
    size: 15
  },

  sensor_quantum: {
    id: 'sensor_quantum',
    name: 'Quantum Sensor Grid',
    category: 'equipment',
    rarity: 'epic',
    value: 15000,
    description: 'Quantum entanglement sensor. Detects everything.',
    effect: '+3000m range, detects cloaked ships',
    icon: 'SENSOR3',
    installable: true,
    size: 20
  },

  computer_basic: {
    id: 'computer_basic',
    name: 'Navigation Computer',
    category: 'equipment',
    rarity: 'common',
    value: 1500,
    description: 'Basic AI computer for navigation.',
    effect: '+10% turn rate',
    icon: 'COMP1',
    installable: true,
    size: 10
  },

  computer_tactical: {
    id: 'computer_tactical',
    name: 'Tactical AI Core',
    category: 'equipment',
    rarity: 'rare',
    value: 7000,
    description: 'Combat AI with targeting assistance.',
    effect: '+20% accuracy, +15% damage',
    icon: 'COMP2',
    installable: true,
    size: 15
  },

  computer_quantum: {
    id: 'computer_quantum',
    name: 'Quantum Computing Matrix',
    category: 'equipment',
    rarity: 'legendary',
    value: 35000,
    description: 'Sentient AI with predictive algorithms.',
    effect: '+50% all stats, auto-pilot',
    icon: 'COMP3',
    installable: true,
    size: 20
  },

  reactor_fusion: {
    id: 'reactor_fusion',
    name: 'Fusion Reactor',
    category: 'equipment',
    rarity: 'uncommon',
    value: 4500,
    description: 'Nuclear fusion power plant.',
    effect: '+100 max energy, +5 energy regen',
    icon: 'REACTOR1',
    installable: true,
    size: 40
  },

  reactor_antimatter: {
    id: 'reactor_antimatter',
    name: 'Antimatter Reactor',
    category: 'equipment',
    rarity: 'epic',
    value: 20000,
    description: 'Matter-antimatter annihilation power source.',
    effect: '+250 max energy, +15 energy regen',
    icon: 'REACTOR2',
    installable: true,
    dangerous: true,
    size: 50
  },

  // === MATERIALS (NEW) ===
  steel_plate: {
    id: 'steel_plate',
    name: 'Steel Plating',
    category: 'material',
    rarity: 'common',
    value: 25,
    description: 'Basic construction material.',
    effect: 'Crafting material',
    icon: 'MAT_STEEL',
    tradeable: true,
    stackable: true,
    size: 2
  },

  alloy_titanium: {
    id: 'alloy_titanium',
    name: 'Titanium Alloy',
    category: 'material',
    rarity: 'uncommon',
    value: 120,
    description: 'Lightweight structural alloy.',
    effect: 'Crafting material',
    icon: 'MAT_TITANIUM',
    tradeable: true,
    stackable: true,
    size: 2
  },

  composite_carbon: {
    id: 'composite_carbon',
    name: 'Carbon Composite',
    category: 'material',
    rarity: 'rare',
    value: 300,
    description: 'Advanced carbon fiber composite.',
    effect: 'Crafting material',
    icon: 'MAT_CARBON',
    tradeable: true,
    stackable: true,
    size: 2
  },

  nanomaterial: {
    id: 'nanomaterial',
    name: 'Nanomaterial Sheet',
    category: 'material',
    rarity: 'epic',
    value: 800,
    description: 'Self-repairing nanomaterial.',
    effect: 'Crafting material',
    icon: 'MAT_NANO',
    tradeable: true,
    stackable: true,
    size: 1
  },

  superconductor: {
    id: 'superconductor',
    name: 'Superconductor Wire',
    category: 'material',
    rarity: 'rare',
    value: 450,
    description: 'Zero-resistance conductor for power systems.',
    effect: 'Crafting material',
    icon: 'MAT_SUPER',
    tradeable: true,
    stackable: true,
    size: 1
  },

  polymer_advanced: {
    id: 'polymer_advanced',
    name: 'Advanced Polymer',
    category: 'material',
    rarity: 'uncommon',
    value: 80,
    description: 'High-performance plastic material.',
    effect: 'Crafting material',
    icon: 'MAT_POLYMER',
    tradeable: true,
    stackable: true,
    size: 1
  },

  ceramic_armor: {
    id: 'ceramic_armor',
    name: 'Ceramic Armor Tile',
    category: 'material',
    rarity: 'rare',
    value: 350,
    description: 'Heat-resistant armor plating.',
    effect: 'Crafting material',
    icon: 'MAT_CERAMIC',
    tradeable: true,
    stackable: true,
    size: 2
  },

  // === AMMUNITION (NEW) ===
  ammo_standard: {
    id: 'ammo_standard',
    name: 'Standard Missiles',
    category: 'ammo',
    rarity: 'common',
    value: 50,
    description: 'Basic guided missiles. Pack of 10.',
    effect: 'Ammunition',
    icon: 'AMMO_MISSILE',
    consumable: true,
    stackable: true,
    size: 3
  },

  ammo_torpedo: {
    id: 'ammo_torpedo',
    name: 'Heavy Torpedoes',
    category: 'ammo',
    rarity: 'uncommon',
    value: 150,
    description: 'Anti-capital ship torpedoes. Pack of 5.',
    effect: 'Ammunition',
    icon: 'AMMO_TORPEDO',
    consumable: true,
    stackable: true,
    size: 5
  },

  ammo_emp: {
    id: 'ammo_emp',
    name: 'EMP Warheads',
    category: 'ammo',
    rarity: 'rare',
    value: 300,
    description: 'Electromagnetic pulse missiles. Disables systems.',
    effect: 'Ammunition',
    icon: 'AMMO_EMP',
    consumable: true,
    stackable: true,
    size: 3
  },

  ammo_nuke: {
    id: 'ammo_nuke',
    name: 'Nuclear Warhead',
    category: 'ammo',
    rarity: 'legendary',
    value: 5000,
    description: 'Tactical nuclear weapon. Extreme damage.',
    effect: 'Ammunition - Single use',
    icon: 'AMMO_NUKE',
    consumable: true,
    dangerous: true,
    size: 10
  },

  // === DATA & BLUEPRINTS (NEW) ===
  blueprint_weapon: {
    id: 'blueprint_weapon',
    name: 'Weapon Schematic',
    category: 'blueprint',
    rarity: 'uncommon',
    value: 2000,
    description: 'Construction plans for weapon system.',
    effect: 'Unlock weapon crafting',
    icon: 'BP_WEAPON',
    usable: true,
    size: 1
  },

  blueprint_engine: {
    id: 'blueprint_engine',
    name: 'Engine Schematic',
    category: 'blueprint',
    rarity: 'uncommon',
    value: 2500,
    description: 'Propulsion system blueprints.',
    effect: 'Unlock engine crafting',
    icon: 'BP_ENGINE',
    usable: true,
    size: 1
  },

  blueprint_shield: {
    id: 'blueprint_shield',
    name: 'Shield Schematic',
    category: 'blueprint',
    rarity: 'rare',
    value: 4000,
    description: 'Advanced shielding technology.',
    effect: 'Unlock shield crafting',
    icon: 'BP_SHIELD',
    usable: true,
    size: 1
  },

  data_fragment: {
    id: 'data_fragment',
    name: 'Encrypted Data Fragment',
    category: 'data',
    rarity: 'uncommon',
    value: 500,
    description: 'Corrupted data. Needs decryption.',
    effect: 'Unknown',
    icon: 'DATA_FRAG',
    usable: true,
    size: 1
  },

  data_complete: {
    id: 'data_complete',
    name: 'Decoded Data Archive',
    category: 'data',
    rarity: 'rare',
    value: 3000,
    description: 'Complete alien database. Valuable information.',
    effect: 'Reveals technology or locations',
    icon: 'DATA_FULL',
    usable: true,
    size: 1
  },

  // === MEDICAL & BIOLOGICAL (NEW) ===
  medkit: {
    id: 'medkit',
    name: 'Medical Kit',
    category: 'medical',
    rarity: 'common',
    value: 200,
    description: 'Basic medical supplies.',
    effect: 'Heal crew injuries',
    icon: 'MEDKIT',
    consumable: true,
    stackable: true,
    size: 3
  },

  stimpak: {
    id: 'stimpak',
    name: 'Combat Stimulant',
    category: 'medical',
    rarity: 'uncommon',
    value: 400,
    description: 'Emergency performance enhancer.',
    effect: '+50% crew performance 5min',
    icon: 'STIM',
    consumable: true,
    stackable: true,
    size: 1
  },

  alien_tissue: {
    id: 'alien_tissue',
    name: 'Alien Biological Sample',
    category: 'biological',
    rarity: 'rare',
    value: 2500,
    description: 'Xenobiological specimen. Research value.',
    effect: 'Sell to scientists',
    icon: 'BIO_TISSUE',
    tradeable: true,
    size: 2
  },

  spore_sample: {
    id: 'spore_sample',
    name: 'Fungal Spores',
    category: 'biological',
    rarity: 'uncommon',
    value: 600,
    description: 'Spores from alien fungus. Potentially useful.',
    effect: 'Pharmaceutical applications',
    icon: 'BIO_SPORE',
    tradeable: true,
    size: 1
  }
};

/**
 * Item rarity colors for UI
 */
export const RARITY_COLORS = {
  common: '#888888',
  uncommon: '#4488ff',
  rare: '#8844ff',
  epic: '#ff00ff',
  legendary: '#ffaa00',
  quest: '#00ffaa'
};

/**
 * Get random artifact based on rarity weights
 */
export function generateRandomArtifact(luck = 1.0) {
  const artifacts = Object.values(ENHANCED_ARTIFACTS);

  // Rarity weights (affected by luck)
  const rarityWeights = {
    common: 50 * (1 / luck),
    uncommon: 30 * (1 / luck),
    rare: 15 * luck,
    epic: 4 * luck,
    legendary: 1 * (luck * luck),
    quest: 0.1 * luck
  };

  // Filter artifacts by weighted random rarity
  const totalWeight = Object.values(rarityWeights).reduce((a, b) => a + b, 0);
  let roll = Math.random() * totalWeight;

  let selectedRarity = 'common';
  for (const [rarity, weight] of Object.entries(rarityWeights)) {
    roll -= weight;
    if (roll <= 0) {
      selectedRarity = rarity;
      break;
    }
  }

  // Get all artifacts of selected rarity
  const artifactsOfRarity = artifacts.filter(a => a.rarity === selectedRarity);

  if (artifactsOfRarity.length === 0) {
    return artifacts[Math.floor(Math.random() * artifacts.length)];
  }

  return artifactsOfRarity[Math.floor(Math.random() * artifactsOfRarity.length)];
}

/**
 * Check if player can use/install item
 */
export function canUseItem(item, player) {
  if (item.installable) {
    // Check if player has required tech level
    return player.techLevel >= (item.requiredTechLevel || 0);
  }

  if (item.consumable) {
    return true; // Consumables can always be used
  }

  if (item.questItem) {
    return false; // Quest items have special use conditions
  }

  return item.usable || false;
}

/**
 * Apply item effect to player/ship
 */
export function applyItemEffect(item, player, game) {
  if (!item.effect) return { success: false, message: 'No effect' };

  // Handle different item types
  if (item.id === 'repair_nanobots') {
    const healAmount = Math.floor(player.maxHull * 0.5);
    player.hull = Math.min(player.maxHull, player.hull + healAmount);
    return { success: true, message: `Repaired ${healAmount} hull points` };
  }

  if (item.id === 'shield_battery') {
    player.shields = player.maxShields;
    return { success: true, message: 'Shields fully restored' };
  }

  if (item.id === 'fuel_cell') {
    game.fuel = Math.min(100, game.fuel + 50);
    return { success: true, message: 'Refueled +50' };
  }

  if (item.id === 'precursor_beacon') {
    // Reveal nearby systems
    const revealed = game.revealNearbySystem(5);
    return { success: true, message: `Revealed ${revealed} systems` };
  }

  // Default: item used but no specific effect implemented
  return { success: true, message: item.effect };
}
