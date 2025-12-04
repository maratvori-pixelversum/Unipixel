/**
 * ShipDamageSystem - Advanced segmented ship damage and repair system
 *
 * Features:
 * - Ship divided into 7 critical sections
 * - Each section has independent damage tracking
 * - Damaged sections affect ship performance
 * - Repair system with time-based mechanics
 * - Destroyed sections require station repair
 * - Visual damage feedback in HUD
 */

export class ShipDamageSystem {
  constructor(game, shipType = 'explorer') {
    this.game = game;
    this.shipType = shipType;

    // Ship section definitions with health pools based on ship type
    this.sections = {
      engine: {
        name: 'Engine',
        maxHealth: 100,
        currentHealth: 100,
        destroyed: false,
        repairing: false,
        repairProgress: 0,
        repairTimeBase: 10, // Base seconds to repair from 0 to 100%
        criticalThreshold: 30, // Below this, performance is severely affected
        warningThreshold: 60,
        effect: 'Reduces maximum speed and maneuverability',
        icon: '[ENG]'
      },
      reactor: {
        name: 'Reactor',
        maxHealth: 120,
        currentHealth: 120,
        destroyed: false,
        repairing: false,
        repairProgress: 0,
        repairTimeBase: 15,
        criticalThreshold: 25,
        warningThreshold: 50,
        effect: 'Reduces power generation and weapon effectiveness',
        icon: '[RCT]'
      },
      bridge: {
        name: 'Control Bridge',
        maxHealth: 80,
        currentHealth: 80,
        destroyed: false,
        repairing: false,
        repairProgress: 0,
        repairTimeBase: 12,
        criticalThreshold: 20,
        warningThreshold: 50,
        effect: 'Reduces scanner range and targeting accuracy',
        icon: '[BRG]'
      },
      frontSection: {
        name: 'Front Section',
        maxHealth: 90,
        currentHealth: 90,
        destroyed: false,
        repairing: false,
        repairProgress: 0,
        repairTimeBase: 8,
        criticalThreshold: 30,
        warningThreshold: 60,
        effect: 'Reduces weapon mounting stability',
        icon: '[FRT]'
      },
      middleSection: {
        name: 'Middle Section',
        maxHealth: 100,
        currentHealth: 100,
        destroyed: false,
        repairing: false,
        repairProgress: 0,
        repairTimeBase: 10,
        criticalThreshold: 30,
        warningThreshold: 60,
        effect: 'Reduces cargo capacity and system efficiency',
        icon: '[MID]'
      },
      backSection: {
        name: 'Back Section',
        maxHealth: 85,
        currentHealth: 85,
        destroyed: false,
        repairing: false,
        repairProgress: 0,
        repairTimeBase: 9,
        criticalThreshold: 30,
        warningThreshold: 60,
        effect: 'Reduces engine thrust efficiency',
        icon: '[BAK]'
      },
      shieldGenerator: {
        name: 'Shield Generator',
        maxHealth: 70,
        currentHealth: 70,
        destroyed: false,
        repairing: false,
        repairProgress: 0,
        repairTimeBase: 14,
        criticalThreshold: 20,
        warningThreshold: 50,
        effect: 'Reduces shield capacity and recharge rate',
        icon: '[SHD]'
      }
    };

    // Active repair queue
    this.repairQueue = [];
    this.activeRepair = null;

    // Statistics
    this.totalDamageTaken = 0;
    this.totalRepairs = 0;
    this.sectionsDestroyed = 0;
  }

  /**
   * Apply damage to a specific section or random section
   */
  applyDamage(damage, sectionName = null) {
    // If no section specified, select based on damage source
    if (!sectionName) {
      sectionName = this.selectRandomSection();
    }

    const section = this.sections[sectionName];
    if (!section || section.destroyed) return;

    // Apply damage
    const actualDamage = Math.min(damage, section.currentHealth);
    section.currentHealth -= actualDamage;
    this.totalDamageTaken += actualDamage;

    // Check if section is destroyed
    if (section.currentHealth <= 0) {
      section.currentHealth = 0;
      section.destroyed = true;
      section.repairing = false;
      section.repairProgress = 0;
      this.sectionsDestroyed++;

      // Trigger visual feedback and notification
      this.game.showNotification(
        `⚠ ${section.name.toUpperCase()} DESTROYED! Seek station repairs immediately!`,
        'critical'
      );

      // Camera shake for emphasis
      if (this.game.camera) {
        this.game.camera.shake = Math.max(this.game.camera.shake, 15);
      }
    } else if (section.currentHealth < section.criticalThreshold) {
      // Critical damage warning
      this.game.showNotification(
        `⚠ ${section.name.toUpperCase()} at ${Math.floor(this.getHealthPercent(sectionName))}% - CRITICAL!`,
        'warning'
      );
    }

    // Apply performance penalties
    this.applyPerformancePenalties();

    return actualDamage;
  }

  /**
   * Select random section based on hit location
   */
  selectRandomSection() {
    const sections = Object.keys(this.sections);

    // Weighted selection - front sections more likely to be hit
    const weights = {
      engine: 0.15,
      reactor: 0.10,
      bridge: 0.12,
      frontSection: 0.25,
      middleSection: 0.18,
      backSection: 0.10,
      shieldGenerator: 0.10
    };

    const rand = Math.random();
    let cumulative = 0;

    for (const [section, weight] of Object.entries(weights)) {
      cumulative += weight;
      if (rand < cumulative) {
        return section;
      }
    }

    return 'middleSection';
  }

  /**
   * Start repairing a section
   */
  startRepair(sectionName) {
    const section = this.sections[sectionName];
    if (!section) return false;

    // Can't repair destroyed sections without station
    if (section.destroyed) {
      this.game.showNotification(
        `${section.name} is DESTROYED. Dock at station for repairs.`,
        'warning'
      );
      return false;
    }

    // Already at full health
    if (section.currentHealth >= section.maxHealth) {
      this.game.showNotification(`${section.name} is already at full health.`, 'info');
      return false;
    }

    // Already repairing
    if (section.repairing) {
      this.game.showNotification(`${section.name} is already being repaired.`, 'info');
      return false;
    }

    // Start repair
    section.repairing = true;
    section.repairProgress = 0;
    this.activeRepair = sectionName;

    this.game.showNotification(`Repairing ${section.name}...`, 'info');
    return true;
  }

  /**
   * Cancel current repair
   */
  cancelRepair(sectionName) {
    const section = this.sections[sectionName];
    if (!section || !section.repairing) return;

    section.repairing = false;
    section.repairProgress = 0;

    if (this.activeRepair === sectionName) {
      this.activeRepair = null;
    }

    this.game.showNotification(`Repair of ${section.name} cancelled.`, 'info');
  }

  /**
   * Update repair progress
   */
  update(dt) {
    if (!this.activeRepair) return;

    const section = this.sections[this.activeRepair];
    if (!section || !section.repairing) {
      this.activeRepair = null;
      return;
    }

    // Calculate repair speed based on damage amount
    const damagePercent = 1 - (section.currentHealth / section.maxHealth);
    const repairTime = section.repairTimeBase * damagePercent;

    if (repairTime === 0) {
      section.repairing = false;
      section.repairProgress = 0;
      this.activeRepair = null;
      return;
    }

    // Update repair progress
    section.repairProgress += dt / repairTime;

    // Complete repair
    if (section.repairProgress >= 1.0) {
      section.currentHealth = section.maxHealth;
      section.repairing = false;
      section.repairProgress = 0;
      this.totalRepairs++;
      this.activeRepair = null;

      this.game.showNotification(`${section.name} repaired to 100%!`, 'success');
      this.applyPerformancePenalties(); // Update ship performance
    }
  }

  /**
   * Apply performance penalties based on damaged sections
   */
  applyPerformancePenalties() {
    const player = this.game.player;
    if (!player) return;

    // Reset modifiers
    player.speedModifier = 1.0;
    player.powerModifier = 1.0;
    player.weaponModifier = 1.0;
    player.shieldModifier = 1.0;
    player.scannerModifier = 1.0;
    player.cargoModifier = 1.0;

    // Apply penalties for each damaged/destroyed section
    for (const [key, section] of Object.entries(this.sections)) {
      const healthPercent = section.currentHealth / section.maxHealth;

      if (section.destroyed || healthPercent < section.criticalThreshold / 100) {
        // Severe penalties for destroyed or critical sections
        switch (key) {
          case 'engine':
            player.speedModifier *= section.destroyed ? 0.3 : 0.5;
            break;
          case 'reactor':
            player.powerModifier *= section.destroyed ? 0.4 : 0.6;
            player.weaponModifier *= section.destroyed ? 0.5 : 0.7;
            break;
          case 'bridge':
            player.scannerModifier *= section.destroyed ? 0.3 : 0.5;
            player.weaponModifier *= section.destroyed ? 0.6 : 0.8;
            break;
          case 'shieldGenerator':
            player.shieldModifier *= section.destroyed ? 0.2 : 0.4;
            break;
          case 'backSection':
            player.speedModifier *= section.destroyed ? 0.6 : 0.8;
            break;
          case 'middleSection':
            player.cargoModifier *= section.destroyed ? 0.5 : 0.7;
            player.powerModifier *= section.destroyed ? 0.8 : 0.9;
            break;
          case 'frontSection':
            player.weaponModifier *= section.destroyed ? 0.7 : 0.85;
            break;
        }
      } else if (healthPercent < section.warningThreshold / 100) {
        // Minor penalties for warning-level damage
        switch (key) {
          case 'engine':
            player.speedModifier *= 0.9;
            break;
          case 'reactor':
            player.powerModifier *= 0.95;
            break;
          case 'shieldGenerator':
            player.shieldModifier *= 0.85;
            break;
        }
      }
    }
  }

  /**
   * Repair all sections at station (costs credits)
   */
  stationRepairAll(costMultiplier = 1.0) {
    let totalCost = 0;
    let repairedSections = [];

    for (const [key, section] of Object.entries(this.sections)) {
      if (section.destroyed || section.currentHealth < section.maxHealth) {
        const damagePercent = 1 - (section.currentHealth / section.maxHealth);
        const baseCost = section.destroyed ? 500 : 100;
        const cost = Math.floor(baseCost * damagePercent * costMultiplier);

        totalCost += cost;
        repairedSections.push(section.name);

        // Fully repair
        section.currentHealth = section.maxHealth;
        section.destroyed = false;
        section.repairing = false;
        section.repairProgress = 0;
      }
    }

    if (repairedSections.length > 0) {
      this.totalRepairs += repairedSections.length;
      this.applyPerformancePenalties();

      this.game.showNotification(
        `Station repairs complete: ${repairedSections.length} sections. Cost: ₢${totalCost}`,
        'success'
      );

      return { success: true, cost: totalCost, sections: repairedSections };
    }

    return { success: false, cost: 0, sections: [] };
  }

  /**
   * Repair specific section at station
   */
  stationRepairSection(sectionName, costMultiplier = 1.0) {
    const section = this.sections[sectionName];
    if (!section) return { success: false, cost: 0 };

    if (!section.destroyed && section.currentHealth >= section.maxHealth) {
      return { success: false, cost: 0, message: 'Section already at full health' };
    }

    const damagePercent = 1 - (section.currentHealth / section.maxHealth);
    const baseCost = section.destroyed ? 500 : 100;
    const cost = Math.floor(baseCost * damagePercent * costMultiplier);

    // Fully repair
    section.currentHealth = section.maxHealth;
    section.destroyed = false;
    section.repairing = false;
    section.repairProgress = 0;

    this.totalRepairs++;
    this.applyPerformancePenalties();

    this.game.showNotification(
      `${section.name} repaired at station. Cost: ₢${cost}`,
      'success'
    );

    return { success: true, cost, message: 'Repair complete' };
  }

  /**
   * Get health percentage for a section
   */
  getHealthPercent(sectionName) {
    const section = this.sections[sectionName];
    if (!section) return 0;
    return (section.currentHealth / section.maxHealth) * 100;
  }

  /**
   * Get overall ship health percentage
   */
  getOverallHealth() {
    let total = 0;
    let current = 0;

    for (const section of Object.values(this.sections)) {
      total += section.maxHealth;
      current += section.currentHealth;
    }

    return (current / total) * 100;
  }

  /**
   * Get critical sections (destroyed or below critical threshold)
   */
  getCriticalSections() {
    const critical = [];

    for (const [key, section] of Object.entries(this.sections)) {
      if (section.destroyed || section.currentHealth < section.criticalThreshold) {
        critical.push({
          key,
          name: section.name,
          health: section.currentHealth,
          maxHealth: section.maxHealth,
          destroyed: section.destroyed
        });
      }
    }

    return critical;
  }

  /**
   * Get warning sections (below warning threshold but not critical)
   */
  getWarningSections() {
    const warnings = [];

    for (const [key, section] of Object.entries(this.sections)) {
      if (!section.destroyed &&
          section.currentHealth >= section.criticalThreshold &&
          section.currentHealth < section.warningThreshold) {
        warnings.push({
          key,
          name: section.name,
          health: section.currentHealth,
          maxHealth: section.maxHealth
        });
      }
    }

    return warnings;
  }

  /**
   * Check if ship is critically damaged (any section destroyed or multiple critical)
   */
  isCriticallyDamaged() {
    const critical = this.getCriticalSections();
    return critical.some(s => s.destroyed) || critical.length >= 3;
  }

  /**
   * Save state for save system
   */
  getSaveData() {
    return {
      sections: JSON.parse(JSON.stringify(this.sections)),
      totalDamageTaken: this.totalDamageTaken,
      totalRepairs: this.totalRepairs,
      sectionsDestroyed: this.sectionsDestroyed
    };
  }

  /**
   * Load state from save data
   */
  loadSaveData(data) {
    if (!data) return;

    this.sections = JSON.parse(JSON.stringify(data.sections || this.sections));
    this.totalDamageTaken = data.totalDamageTaken || 0;
    this.totalRepairs = data.totalRepairs || 0;
    this.sectionsDestroyed = data.sectionsDestroyed || 0;

    // Apply current performance penalties
    this.applyPerformancePenalties();
  }

  /**
   * Reset all ship sections to full health (called on respawn)
   */
  resetAllSections() {
    for (const section of Object.values(this.sections)) {
      section.currentHealth = section.maxHealth;
      section.destroyed = false;
      section.repairing = false;
      section.repairProgress = 0;
    }

    // Clear active repair
    this.activeRepair = null;

    // Reset performance penalties
    this.applyPerformancePenalties();

    console.log('Ship damage system reset - all sections restored to full health');
  }
}
