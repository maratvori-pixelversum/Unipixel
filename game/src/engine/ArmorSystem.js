/**
 * Advanced Armor System
 * Multiple armor types with unique characteristics:
 * 1. Ablative Armor - Absorbs damage, degrades over time
 * 2. Reactive Armor - Reduces explosive damage, triggers on hit
 * 3. Composite Armor - Balanced protection against all damage types
 * 4. Kinetic Plating - Superior vs physical projectiles
 * 5. Energy Diffuser - Superior vs energy weapons
 * 6. Regenerative Armor - Slowly repairs itself
 * 7. Reflective Armor - Chance to deflect beam weapons
 */

export class ArmorSystem {
  constructor() {
    this.plates = [];
    this.totalArmorPoints = 0;
    this.maxArmorPoints = 0;
    this.armorRating = 0; // Overall damage reduction %
    this.regenerationRate = 0; // HP per second
  }

  /**
   * Add armor plate to the system
   */
  addArmorPlate(armorType, tier = 1) {
    const plate = this.createArmorPlate(armorType, tier);
    this.plates.push(plate);
    this.recalculateArmorStats();
    return plate;
  }

  /**
   * Create armor plate based on type and tier
   */
  createArmorPlate(type, tier) {
    const baseHP = 100 + (tier - 1) * 50;
    const baseRating = 0.1 + (tier - 1) * 0.05;

    switch (type) {
      case 'ablative':
        return {
          type: 'ablative',
          name: `Ablative Armor Mk${tier}`,
          tier,
          hp: baseHP * 1.5,
          maxHp: baseHP * 1.5,
          armorRating: baseRating * 1.2,
          kineticResistance: 0.8, // 80% effective vs kinetic
          energyResistance: 0.4, // 40% effective vs energy
          explosiveResistance: 0.6,
          degradationRate: 1.0, // Loses effectiveness as it takes damage
          weight: 150 + tier * 30,
          description: 'Sacrificial armor that absorbs damage but degrades. Best against kinetic weapons.'
        };

      case 'reactive':
        return {
          type: 'reactive',
          name: `Reactive Armor Mk${tier}`,
          tier,
          hp: baseHP * 0.8,
          maxHp: baseHP * 0.8,
          armorRating: baseRating,
          kineticResistance: 0.5,
          energyResistance: 0.5,
          explosiveResistance: 1.5, // 150% effective vs explosives
          reactiveCharges: 3 + tier, // Number of reactive charges
          maxCharges: 3 + tier,
          chargeRegenTime: 10, // Seconds to regen one charge
          weight: 120 + tier * 25,
          description: 'Explosive reactive armor. Triggers on hit to reduce explosive damage.'
        };

      case 'composite':
        return {
          type: 'composite',
          name: `Composite Armor Mk${tier}`,
          tier,
          hp: baseHP,
          maxHp: baseHP,
          armorRating: baseRating * 1.1,
          kineticResistance: 0.7,
          energyResistance: 0.7,
          explosiveResistance: 0.7,
          weight: 100 + tier * 20,
          description: 'Balanced multi-layer armor. Good all-around protection.'
        };

      case 'kinetic_plating':
        return {
          type: 'kinetic_plating',
          name: `Kinetic Plating Mk${tier}`,
          tier,
          hp: baseHP * 1.2,
          maxHp: baseHP * 1.2,
          armorRating: baseRating,
          kineticResistance: 1.4, // 140% effective vs kinetic
          energyResistance: 0.3, // 30% effective vs energy
          explosiveResistance: 0.5,
          weight: 180 + tier * 35,
          description: 'Dense plating optimized against physical projectiles.'
        };

      case 'energy_diffuser':
        return {
          type: 'energy_diffuser',
          name: `Energy Diffuser Mk${tier}`,
          tier,
          hp: baseHP * 0.9,
          maxHp: baseHP * 0.9,
          armorRating: baseRating,
          kineticResistance: 0.3,
          energyResistance: 1.4, // 140% effective vs energy
          explosiveResistance: 0.4,
          heatDissipation: 0.2, // Reduces heat buildup
          weight: 90 + tier * 18,
          description: 'Diffuses energy weapons. Reduces heat buildup.'
        };

      case 'regenerative':
        return {
          type: 'regenerative',
          name: `Regenerative Armor Mk${tier}`,
          tier,
          hp: baseHP * 0.7,
          maxHp: baseHP * 0.7,
          armorRating: baseRating * 0.8,
          kineticResistance: 0.5,
          energyResistance: 0.5,
          explosiveResistance: 0.5,
          regenerationRate: 2 + tier * 1.5, // HP per second
          regenerationDelay: 5, // Seconds after taking damage
          lastDamageTime: 0,
          weight: 110 + tier * 22,
          description: 'Self-repairing armor. Regenerates after avoiding damage.'
        };

      case 'reflective':
        return {
          type: 'reflective',
          name: `Reflective Armor Mk${tier}`,
          tier,
          hp: baseHP * 0.8,
          maxHp: baseHP * 0.8,
          armorRating: baseRating * 0.9,
          kineticResistance: 0.4,
          energyResistance: 0.9,
          explosiveResistance: 0.3,
          reflectChance: 0.15 + tier * 0.05, // Chance to reflect beams
          weight: 85 + tier * 17,
          description: 'Reflective coating. Chance to deflect energy beams.'
        };

      default:
        return this.createArmorPlate('composite', tier);
    }
  }

  /**
   * Recalculate total armor stats from all plates
   */
  recalculateArmorStats() {
    this.totalArmorPoints = 0;
    this.maxArmorPoints = 0;
    this.armorRating = 0;
    this.regenerationRate = 0;

    let totalWeight = 0;
    const resistances = {
      kinetic: 0,
      energy: 0,
      explosive: 0
    };

    for (const plate of this.plates) {
      this.totalArmorPoints += plate.hp;
      this.maxArmorPoints += plate.maxHp;
      this.armorRating += plate.armorRating;
      totalWeight += plate.weight;

      // Average resistances
      resistances.kinetic += plate.kineticResistance;
      resistances.energy += plate.energyResistance;
      resistances.explosive += plate.explosiveResistance;

      if (plate.regenerationRate) {
        this.regenerationRate += plate.regenerationRate;
      }
    }

    // Store averaged resistances
    const plateCount = this.plates.length || 1;
    this.kineticResistance = resistances.kinetic / plateCount;
    this.energyResistance = resistances.energy / plateCount;
    this.explosiveResistance = resistances.explosive / plateCount;
    this.totalWeight = totalWeight;

    // Cap armor rating at 90%
    this.armorRating = Math.min(0.9, this.armorRating);
  }

  /**
   * Process incoming damage through armor system
   * Returns actual damage to apply to hull
   */
  processDamage(damage, damageType, armorPenetration = 1.0, dt) {
    if (this.plates.length === 0) {
      return damage; // No armor, full damage
    }

    // Determine resistance based on damage type
    let resistance = 0.5; // Default
    switch (damageType) {
      case 'kinetic':
      case 'railgun':
        resistance = this.kineticResistance;
        break;
      case 'plasma':
      case 'laser':
      case 'beam':
        resistance = this.energyResistance;
        break;
      case 'missile':
      case 'nuclear_missile':
      case 'mine':
        resistance = this.explosiveResistance;
        break;
    }

    // Apply armor penetration
    const effectiveResistance = resistance * (1.0 - Math.min(0.9, armorPenetration * 0.5));

    // Calculate damage reduction from armor rating
    const damageReduction = this.armorRating * effectiveResistance;

    // Apply armor
    const reducedDamage = damage * (1.0 - damageReduction);
    const armorDamage = damage - reducedDamage;

    // Distribute armor damage across plates
    this.damageArmorPlates(armorDamage, damageType);

    return reducedDamage;
  }

  /**
   * Distribute damage across armor plates
   */
  damageArmorPlates(damage, damageType) {
    if (this.plates.length === 0) return;

    // Find plates with HP
    const activePlates = this.plates.filter(p => p.hp > 0);
    if (activePlates.length === 0) {
      this.recalculateArmorStats();
      return;
    }

    // Distribute damage evenly
    const damagePerPlate = damage / activePlates.length;

    for (const plate of activePlates) {
      plate.hp -= damagePerPlate;

      // Track last damage time for regenerative armor
      if (plate.type === 'regenerative') {
        plate.lastDamageTime = Date.now() / 1000;
      }

      // Consume reactive charge
      if (plate.type === 'reactive' && damageType.includes('missile') || damageType.includes('mine')) {
        if (plate.reactiveCharges > 0) {
          plate.reactiveCharges--;
          // Additional damage reduction already factored into explosiveResistance
        }
      }

      // Clamp HP
      plate.hp = Math.max(0, plate.hp);
    }

    this.recalculateArmorStats();
  }

  /**
   * Update armor system (regeneration, etc.)
   */
  update(dt) {
    const currentTime = Date.now() / 1000;

    for (const plate of this.plates) {
      // Regenerative armor
      if (plate.type === 'regenerative' && plate.hp < plate.maxHp) {
        const timeSinceHit = currentTime - (plate.lastDamageTime || 0);
        if (timeSinceHit >= plate.regenerationDelay) {
          plate.hp = Math.min(plate.maxHp, plate.hp + plate.regenerationRate * dt);
        }
      }

      // Reactive armor charge regeneration
      if (plate.type === 'reactive' && plate.reactiveCharges < plate.maxCharges) {
        plate.chargeTimer = (plate.chargeTimer || 0) + dt;
        if (plate.chargeTimer >= plate.chargeRegenTime) {
          plate.reactiveCharges++;
          plate.chargeTimer = 0;
        }
      }
    }

    // Recalculate if any regeneration occurred
    if (this.regenerationRate > 0) {
      this.recalculateArmorStats();
    }
  }

  /**
   * Get armor integrity percentage
   */
  getIntegrity() {
    if (this.maxArmorPoints === 0) return 0;
    return this.totalArmorPoints / this.maxArmorPoints;
  }

  /**
   * Get armor info for UI display
   */
  getArmorInfo() {
    return {
      hp: Math.floor(this.totalArmorPoints),
      maxHp: Math.floor(this.maxArmorPoints),
      rating: Math.floor(this.armorRating * 100),
      plates: this.plates.length,
      integrity: this.getIntegrity(),
      kineticRes: Math.floor(this.kineticResistance * 100),
      energyRes: Math.floor(this.energyResistance * 100),
      explosiveRes: Math.floor(this.explosiveResistance * 100),
      regen: this.regenerationRate > 0 ? this.regenerationRate.toFixed(1) : 0
    };
  }

  /**
   * Repair all armor plates
   */
  repair(amount) {
    const repairPerPlate = amount / this.plates.length;

    for (const plate of this.plates) {
      plate.hp = Math.min(plate.maxHp, plate.hp + repairPerPlate);
    }

    this.recalculateArmorStats();
  }

  /**
   * Switch weapon cooldowns
   */
  updateCooldowns(dt) {
    // No cooldowns for armor, but included for consistency with other systems
  }
}
