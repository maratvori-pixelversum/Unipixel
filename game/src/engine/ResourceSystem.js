/**
 * Resource System - Manages resource types, definitions, and values
 * Based on PROMPT 16: Resource System
 */

export const RESOURCE_TYPES = {
  // Common Resources
  IRON: {
    id: 'iron',
    name: 'Iron',
    rarity: 'common',
    baseValue: 10,
    description: 'Basic construction material',
    color: '#886644',
    icon: '⛏'
  },
  SILICON: {
    id: 'silicon',
    name: 'Silicon',
    rarity: 'common',
    baseValue: 15,
    description: 'Electronics and computer components',
    color: '#888888',
    icon: '🔧'
  },
  WATER: {
    id: 'water',
    name: 'Water',
    rarity: 'common',
    baseValue: 8,
    description: 'Life support and fuel production',
    color: '#4488ff',
    icon: '💧'
  },
  CARBON: {
    id: 'carbon',
    name: 'Carbon',
    rarity: 'common',
    baseValue: 12,
    description: 'Versatile building material',
    color: '#333333',
    icon: '◆'
  },

  // Uncommon Resources
  TITANIUM: {
    id: 'titanium',
    name: 'Titanium',
    rarity: 'uncommon',
    baseValue: 50,
    description: 'Strong, lightweight hull material',
    color: '#cccccc',
    icon: '🔩'
  },
  PLATINUM: {
    id: 'platinum',
    name: 'Platinum',
    rarity: 'uncommon',
    baseValue: 75,
    description: 'Advanced electronics and catalysts',
    color: '#e5e4e2',
    icon: '💎'
  },
  DEUTERIUM: {
    id: 'deuterium',
    name: 'Deuterium',
    rarity: 'uncommon',
    baseValue: 60,
    description: 'Fusion reactor fuel',
    color: '#44ffff',
    icon: '⚛'
  },
  COPPER: {
    id: 'copper',
    name: 'Copper',
    rarity: 'uncommon',
    baseValue: 40,
    description: 'Electrical wiring and components',
    color: '#b87333',
    icon: '⚡'
  },

  // Rare Resources
  EXOTIC_MATTER: {
    id: 'exotic_matter',
    name: 'Exotic Matter',
    rarity: 'rare',
    baseValue: 250,
    description: 'Unknown properties, valuable research material',
    color: '#ff00ff',
    icon: '✦'
  },
  ANTIMATTER: {
    id: 'antimatter',
    name: 'Antimatter',
    rarity: 'rare',
    baseValue: 500,
    description: 'Extremely powerful energy source',
    color: '#ffff00',
    icon: '☢'
  },
  RARE_ISOTOPES: {
    id: 'rare_isotopes',
    name: 'Rare Isotopes',
    rarity: 'rare',
    baseValue: 180,
    description: 'Essential for advanced technology',
    color: '#00ff88',
    icon: '☣'
  },
  CRYSTALLINE_MATRIX: {
    id: 'crystalline_matrix',
    name: 'Crystalline Matrix',
    rarity: 'rare',
    baseValue: 300,
    description: 'Quantum computing substrate',
    color: '#88ffff',
    icon: '💠'
  }
};

export class ResourceSystem {
  constructor() {
    this.resources = {};
    this.initializeResources();
  }

  /**
   * Initialize all resource types with zero quantities
   */
  initializeResources() {
    for (const resourceId in RESOURCE_TYPES) {
      const resource = RESOURCE_TYPES[resourceId];
      this.resources[resource.id] = {
        ...resource,
        quantity: 0
      };
    }
  }

  /**
   * Add resource to inventory
   */
  addResource(resourceId, quantity) {
    if (this.resources[resourceId]) {
      this.resources[resourceId].quantity += quantity;
      return true;
    }
    return false;
  }

  /**
   * Remove resource from inventory
   */
  removeResource(resourceId, quantity) {
    if (this.resources[resourceId] && this.resources[resourceId].quantity >= quantity) {
      this.resources[resourceId].quantity -= quantity;
      return true;
    }
    return false;
  }

  /**
   * Get resource quantity
   */
  getQuantity(resourceId) {
    return this.resources[resourceId]?.quantity || 0;
  }

  /**
   * Get total value of all resources
   */
  getTotalValue() {
    let total = 0;
    for (const resourceId in this.resources) {
      const resource = this.resources[resourceId];
      total += resource.quantity * resource.baseValue;
    }
    return total;
  }

  /**
   * Get resources by rarity
   */
  getResourcesByRarity(rarity) {
    const result = [];
    for (const resourceId in this.resources) {
      const resource = this.resources[resourceId];
      if (resource.rarity === rarity) {
        result.push(resource);
      }
    }
    return result;
  }

  /**
   * Get all resources with non-zero quantities
   */
  getOwnedResources() {
    const result = [];
    for (const resourceId in this.resources) {
      const resource = this.resources[resourceId];
      if (resource.quantity > 0) {
        result.push(resource);
      }
    }
    return result;
  }

  /**
   * Get resource by ID
   */
  getResource(resourceId) {
    return this.resources[resourceId];
  }

  /**
   * Serialize resources for saving
   */
  serialize() {
    const data = {};
    for (const resourceId in this.resources) {
      data[resourceId] = this.resources[resourceId].quantity;
    }
    return data;
  }

  /**
   * Load resources from saved data
   */
  deserialize(data) {
    for (const resourceId in data) {
      if (this.resources[resourceId]) {
        this.resources[resourceId].quantity = data[resourceId];
      }
    }
  }
}
