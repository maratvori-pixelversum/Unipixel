/**
 * Cargo System - Manages cargo capacity, storage, and inventory
 * Based on PROMPT 16: Resource System
 */

export class CargoSystem {
  constructor(maxCapacity = 100) {
    this.maxCapacity = maxCapacity;
    this.currentCapacity = 0;
    this.cargo = {}; // resourceId -> quantity
    this.cargoWeights = {}; // resourceId -> weight per unit (for capacity tracking)
    this.credits = 1000; // Starting credits
  }

  /**
   * Add item to cargo hold
   */
  addCargo(resourceId, quantity, resourceWeight = 1) {
    const totalWeight = quantity * resourceWeight;

    if (this.currentCapacity + totalWeight > this.maxCapacity) {
      // Not enough space
      const availableSpace = this.maxCapacity - this.currentCapacity;
      const maxQuantity = Math.floor(availableSpace / resourceWeight);

      if (maxQuantity > 0) {
        // Add what we can
        this.cargo[resourceId] = (this.cargo[resourceId] || 0) + maxQuantity;
        this.currentCapacity += maxQuantity * resourceWeight;
        return { success: 'partial', added: maxQuantity, requested: quantity };
      }

      return { success: false, reason: 'cargo_full', available: availableSpace };
    }

    // Add full quantity
    this.cargo[resourceId] = (this.cargo[resourceId] || 0) + quantity;
    this.cargoWeights[resourceId] = resourceWeight; // Store weight for removal
    this.currentCapacity += totalWeight;
    return { success: true, added: quantity };
  }

  /**
   * Remove item from cargo hold
   */
  removeCargo(resourceId, quantity) {
    if (!this.cargo[resourceId] || this.cargo[resourceId] < quantity) {
      return { success: false, reason: 'insufficient_quantity' };
    }

    // Use stored weight, default to 1 if not found
    const resourceWeight = this.cargoWeights[resourceId] || 1;
    const totalWeight = quantity * resourceWeight;

    this.cargo[resourceId] -= quantity;
    this.currentCapacity -= totalWeight;

    if (this.cargo[resourceId] === 0) {
      delete this.cargo[resourceId];
      delete this.cargoWeights[resourceId]; // Clean up weight tracking
    }

    return { success: true, removed: quantity };
  }

  /**
   * Get quantity of specific cargo
   */
  getCargoQuantity(resourceId) {
    return this.cargo[resourceId] || 0;
  }

  /**
   * Get cargo usage percentage
   */
  getCapacityUsage() {
    return (this.currentCapacity / this.maxCapacity) * 100;
  }

  /**
   * Check if there's space for more cargo
   */
  hasSpace(requiredSpace = 1) {
    return (this.currentCapacity + requiredSpace) <= this.maxCapacity;
  }

  /**
   * Get available space
   */
  getAvailableSpace() {
    return this.maxCapacity - this.currentCapacity;
  }

  /**
   * Upgrade cargo capacity
   */
  upgradeCapacity(additionalCapacity, cost) {
    if (this.credits >= cost) {
      this.maxCapacity += additionalCapacity;
      this.credits -= cost;
      return { success: true, newCapacity: this.maxCapacity };
    }
    return { success: false, reason: 'insufficient_credits' };
  }

  /**
   * Add credits
   */
  addCredits(amount) {
    this.credits += amount;
  }

  /**
   * Remove credits
   */
  removeCredits(amount) {
    if (this.credits >= amount) {
      this.credits -= amount;
      return true;
    }
    return false;
  }

  /**
   * Get all cargo items
   */
  getAllCargo() {
    const items = [];
    for (const resourceId in this.cargo) {
      items.push({
        resourceId,
        quantity: this.cargo[resourceId]
      });
    }
    return items;
  }

  /**
   * Clear all cargo (emergency jettison)
   */
  jettison() {
    this.cargo = {};
    this.cargoWeights = {}; // Clear weight tracking too
    this.currentCapacity = 0;
    return { success: true, message: 'All cargo jettisoned' };
  }

  /**
   * Serialize cargo for saving
   */
  serialize() {
    return {
      maxCapacity: this.maxCapacity,
      currentCapacity: this.currentCapacity,
      cargo: { ...this.cargo },
      cargoWeights: { ...this.cargoWeights },
      credits: this.credits
    };
  }

  /**
   * Load cargo from saved data
   */
  deserialize(data) {
    this.maxCapacity = data.maxCapacity || 100;
    this.currentCapacity = data.currentCapacity || 0;
    this.cargo = data.cargo || {};
    this.cargoWeights = data.cargoWeights || {}; // Load weight tracking
    this.credits = data.credits || 1000;
  }
}
