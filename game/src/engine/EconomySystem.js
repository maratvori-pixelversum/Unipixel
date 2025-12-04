/**
 * Economy System
 * Manages player credits, fuel, trading, prices, and economic simulation
 */

export class EconomySystem {
  constructor(game) {
    this.game = game;

    // Player economic state
    this.credits = 10000; // Starting credits
    this.fuel = 100; // Starting fuel (0-100%)
    this.maxFuel = 100;
    this.cargoCapacity = 50;
    this.cargo = []; // Items player is carrying

    // Commodity types and base prices
    this.commodities = this.initializeCommodities();

    // System-specific market data
    this.systemMarkets = new Map(); // systemIndex -> market data
  }

  /**
   * Initialize commodity types with base prices
   */
  initializeCommodities() {
    return {
      // Basic Resources
      water: {
        id: 'water',
        name: 'Water',
        category: 'basic',
        basePrice: 10,
        volume: 2,
        description: 'Essential for life support'
      },
      minerals: {
        id: 'minerals',
        name: 'Minerals',
        category: 'basic',
        basePrice: 25,
        volume: 3,
        description: 'Raw minerals for industry'
      },
      food: {
        id: 'food',
        name: 'Food',
        category: 'basic',
        basePrice: 15,
        volume: 2,
        description: 'Agricultural products'
      },

      // Industrial Goods
      metals: {
        id: 'metals',
        name: 'Refined Metals',
        category: 'industrial',
        basePrice: 50,
        volume: 4,
        description: 'Processed metal alloys'
      },
      electronics: {
        id: 'electronics',
        name: 'Electronics',
        category: 'industrial',
        basePrice: 80,
        volume: 1,
        description: 'Advanced electronics and circuits'
      },
      machinery: {
        id: 'machinery',
        name: 'Machinery',
        category: 'industrial',
        basePrice: 120,
        volume: 5,
        description: 'Industrial equipment'
      },

      // Luxury Goods
      luxuries: {
        id: 'luxuries',
        name: 'Luxury Goods',
        category: 'luxury',
        basePrice: 200,
        volume: 1,
        description: 'High-end consumer products'
      },
      art: {
        id: 'art',
        name: 'Artworks',
        category: 'luxury',
        basePrice: 300,
        volume: 1,
        description: 'Cultural artifacts and art'
      },

      // Special Goods
      medicine: {
        id: 'medicine',
        name: 'Medicine',
        category: 'special',
        basePrice: 150,
        volume: 1,
        description: 'Medical supplies and drugs'
      },
      weapons: {
        id: 'weapons',
        name: 'Weapons',
        category: 'special',
        basePrice: 250,
        volume: 2,
        description: 'Military armaments'
      },
      fuel_cells: {
        id: 'fuel_cells',
        name: 'Fuel Cells',
        category: 'special',
        basePrice: 100,
        volume: 3,
        description: 'Starship fuel'
      },

      // Contraband
      narcotics: {
        id: 'narcotics',
        name: 'Narcotics',
        category: 'contraband',
        basePrice: 400,
        volume: 1,
        description: 'Illegal substances',
        illegal: true
      },
      stolen_tech: {
        id: 'stolen_tech',
        name: 'Stolen Technology',
        category: 'contraband',
        basePrice: 500,
        volume: 2,
        description: 'Black market tech',
        illegal: true
      },

      // Rare Resources
      exotic_matter: {
        id: 'exotic_matter',
        name: 'Exotic Matter',
        category: 'rare',
        basePrice: 1000,
        volume: 1,
        description: 'Rare quantum materials'
      },
      alien_artifacts: {
        id: 'alien_artifacts',
        name: 'Alien Artifacts',
        category: 'rare',
        basePrice: 2000,
        volume: 1,
        description: 'Ancient alien technology'
      }
    };
  }

  /**
   * Generate market for a star system
   */
  generateSystemMarket(systemIndex, systemData, factionData) {
    // Check if market already exists
    if (this.systemMarkets.has(systemIndex)) {
      return this.systemMarkets.get(systemIndex);
    }

    const market = {
      systemIndex,
      lastUpdate: Date.now(),
      supply: {}, // commodity -> quantity available
      demand: {}, // commodity -> demand multiplier
      prices: {} // commodity -> actual price
    };

    // Generate supply and demand based on system type and faction
    for (const [commodityId, commodity] of Object.entries(this.commodities)) {
      // Base supply (random)
      let supply = Math.floor(Math.random() * 100) + 50;
      let demandMultiplier = 0.8 + Math.random() * 0.4; // 0.8 to 1.2

      // Modify based on system characteristics
      if (systemData.inhabited) {
        // Inhabited systems have more trade
        supply *= 1.5;

        // Agricultural worlds produce food
        if (systemData.planetTypes && systemData.planetTypes.includes('terran')) {
          if (commodityId === 'food') {
            supply *= 3;
            demandMultiplier *= 0.6; // Low prices
          }
          if (commodityId === 'water') {
            supply *= 2;
            demandMultiplier *= 0.7;
          }
        }

        // Industrial systems
        if (systemData.dangerLevel < 2) {
          if (commodity.category === 'industrial') {
            supply *= 2;
            demandMultiplier *= 0.8;
          }
        }

        // Rich systems demand luxuries
        if (systemData.resources === 'high') {
          if (commodity.category === 'luxury') {
            demandMultiplier *= 1.5;
          }
        }
      } else {
        // Uninhabited systems have minimal trade
        supply *= 0.3;
      }

      // Faction modifiers
      if (factionData) {
        if (factionData.type === 'pirates' || factionData.type === 'raiders') {
          // Pirates have contraband
          if (commodity.illegal) {
            supply *= 3;
            demandMultiplier *= 0.5; // Cheap black market
          }
          // Pirates lack luxuries
          if (commodity.category === 'luxury') {
            supply *= 0.3;
            demandMultiplier *= 1.8;
          }
        }

        if (factionData.type === 'merchant_guild') {
          // Merchants have everything
          supply *= 1.5;
          demandMultiplier *= 0.9;
        }

        if (factionData.traits?.includes('militaristic')) {
          // Military factions want weapons
          if (commodityId === 'weapons') {
            demandMultiplier *= 1.5;
          }
        }
      }

      // Calculate final price
      const basePrice = commodity.basePrice;
      const supplyFactor = Math.max(0.5, Math.min(2.0, 100 / supply));
      const finalPrice = Math.round(basePrice * demandMultiplier * supplyFactor);

      market.supply[commodityId] = Math.floor(supply);
      market.demand[commodityId] = demandMultiplier;
      market.prices[commodityId] = finalPrice;
    }

    // Add fuel pricing
    market.fuelPrice = this.calculateFuelPrice(systemData, factionData);

    this.systemMarkets.set(systemIndex, market);
    return market;
  }

  /**
   * Calculate fuel price for a system
   */
  calculateFuelPrice(systemData, factionData) {
    let basePrice = 50; // Base price per fuel unit

    // Remote systems have expensive fuel
    if (systemData.dangerLevel > 3) {
      basePrice *= 1.5;
    }

    // Inhabited systems have cheaper fuel
    if (systemData.inhabited) {
      basePrice *= 0.8;
    }

    // Faction modifiers
    if (factionData) {
      basePrice *= factionData.tradeModifier || 1.0;
    }

    return Math.round(basePrice);
  }

  /**
   * Buy commodity
   */
  buyCommodity(commodityId, quantity, systemIndex) {
    const market = this.systemMarkets.get(systemIndex);
    if (!market) return { success: false, message: 'No market available' };

    const commodity = this.commodities[commodityId];
    if (!commodity) return { success: false, message: 'Invalid commodity' };

    // Check supply
    const available = market.supply[commodityId] || 0;
    if (available < quantity) {
      return { success: false, message: `Only ${available} units available` };
    }

    // Check cargo space
    const spaceNeeded = commodity.volume * quantity;
    const spaceUsed = this.getCargoSpaceUsed();
    if (spaceUsed + spaceNeeded > this.cargoCapacity) {
      return { success: false, message: 'Not enough cargo space' };
    }

    // Check credits
    const price = market.prices[commodityId];
    const totalCost = price * quantity;
    if (this.credits < totalCost) {
      return { success: false, message: 'Not enough credits' };
    }

    // Execute purchase
    this.credits -= totalCost;
    market.supply[commodityId] -= quantity;

    // Add to cargo
    const existingItem = this.cargo.find(item => item.commodityId === commodityId);
    if (existingItem) {
      existingItem.quantity += quantity;
      existingItem.totalValue += totalCost;
    } else {
      this.cargo.push({
        commodityId,
        commodity,
        quantity,
        purchasePrice: price,
        totalValue: totalCost
      });
    }

    return {
      success: true,
      message: `Purchased ${quantity} ${commodity.name} for ${totalCost} credits`,
      totalCost
    };
  }

  /**
   * Sell commodity
   */
  sellCommodity(commodityId, quantity, systemIndex) {
    const market = this.systemMarkets.get(systemIndex);
    if (!market) return { success: false, message: 'No market available' };

    const commodity = this.commodities[commodityId];
    if (!commodity) return { success: false, message: 'Invalid commodity' };

    // Check if player has the commodity
    const cargoItem = this.cargo.find(item => item.commodityId === commodityId);
    if (!cargoItem || cargoItem.quantity < quantity) {
      return { success: false, message: 'Not enough in cargo' };
    }

    // Calculate sale price
    const price = market.prices[commodityId];
    const totalValue = price * quantity;

    // Execute sale
    this.credits += totalValue;
    market.supply[commodityId] += quantity;

    // Remove from cargo
    cargoItem.quantity -= quantity;
    if (cargoItem.quantity <= 0) {
      const index = this.cargo.indexOf(cargoItem);
      this.cargo.splice(index, 1);
    }

    const profit = totalValue - (cargoItem.purchasePrice * quantity);

    return {
      success: true,
      message: `Sold ${quantity} ${commodity.name} for ${totalValue} credits`,
      totalValue,
      profit
    };
  }

  /**
   * Refuel ship
   */
  refuel(amount, systemIndex) {
    const market = this.systemMarkets.get(systemIndex);
    if (!market) return { success: false, message: 'No refueling available' };

    // Calculate how much fuel needed
    const currentFuel = this.fuel;
    const maxRefuel = this.maxFuel - currentFuel;
    const actualAmount = Math.min(amount, maxRefuel);

    if (actualAmount <= 0) {
      return { success: false, message: 'Fuel tank is full' };
    }

    // Calculate cost
    const fuelPrice = market.fuelPrice;
    const totalCost = Math.round(fuelPrice * actualAmount);

    if (this.credits < totalCost) {
      return { success: false, message: 'Not enough credits for fuel' };
    }

    // Execute refuel
    this.credits -= totalCost;
    this.fuel += actualAmount;

    return {
      success: true,
      message: `Refueled ${actualAmount.toFixed(1)} units for ${totalCost} credits`,
      totalCost,
      fuelAdded: actualAmount
    };
  }

  /**
   * Consume fuel for travel
   */
  consumeFuel(amount) {
    this.fuel = Math.max(0, this.fuel - amount);
    return this.fuel;
  }

  /**
   * Get cargo space used
   */
  getCargoSpaceUsed() {
    let used = 0;
    for (const item of this.cargo) {
      used += item.commodity.volume * item.quantity;
    }
    return used;
  }

  /**
   * Get cargo space remaining
   */
  getCargoSpaceRemaining() {
    return this.cargoCapacity - this.getCargoSpaceUsed();
  }

  /**
   * Check if player can afford something
   */
  canAfford(cost) {
    return this.credits >= cost;
  }
}
