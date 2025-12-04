export class FactionSystem {
  constructor() {
    this.factions = {
      terran_coalition: { name: 'United Terran Coalition', reputation: 50, color: '#4488ff', territory: [], attitude: 'neutral', tradeBonus: 0 },
      independent_worlds: { name: 'Independent Worlds Alliance', reputation: 50, color: '#44ff88', territory: [], attitude: 'neutral', tradeBonus: 0 },
      mining_consortium: { name: 'Deep Space Mining Consortium', reputation: 50, color: '#ffaa44', territory: [], attitude: 'neutral', tradeBonus: 0 },
      hive_collective: { name: 'Hive Collectives', reputation: 30, color: '#ff4444', territory: [], attitude: 'hostile', tradeBonus: -0.5 },
      free_traders: { name: 'Free Traders Guild', reputation: 60, color: '#ffdd44', territory: [], attitude: 'friendly', tradeBonus: 0.1 }
    };
  }

  modifyReputation(factionId, amount) {
    const faction = this.factions[factionId];
    if (!faction) return;
    faction.reputation = Math.max(0, Math.min(100, faction.reputation + amount));
    faction.attitude = faction.reputation < 20 ? 'hostile' : faction.reputation < 40 ? 'unfriendly' : faction.reputation < 70 ? 'neutral' : faction.reputation < 90 ? 'friendly' : 'allied';
    faction.tradeBonus = faction.reputation < 20 ? -0.5 : faction.reputation < 40 ? -0.2 : faction.reputation < 70 ? 0 : faction.reputation < 90 ? 0.15 : 0.25;
    return { faction: faction.name, newRep: faction.reputation, attitude: faction.attitude };
  }

  getFactionStatus() {
    return Object.entries(this.factions).map(([id, f]) => ({ id, name: f.name, reputation: Math.floor(f.reputation), attitude: f.attitude, color: f.color, tradeBonus: Math.floor(f.tradeBonus * 100) }));
  }

  assignTerritories(galaxy) {
    for (const f of Object.values(this.factions)) f.territory = [];
    galaxy.forEach((sys, i) => {
      if (!sys.discovered) return;
      if (sys.hasHiveAliens) this.factions.hive_collective.territory.push(i);
      else if (sys.resourceRichness > 0.7 && (sys.stationCount || 0) > 5) this.factions.mining_consortium.territory.push(i);
      else if (i === 0 || (sys.hasMegastructure && sys.visited)) this.factions.terran_coalition.territory.push(i);
      else this.factions.independent_worlds.territory.push(i);
    });
  }

  assignFactionsToGalaxy(galaxy) {
    // Assign each faction a center point in the galaxy
    const factionCenters = {};
    const factionIds = Object.keys(this.factions);

    // Distribute factions evenly across the galaxy
    factionIds.forEach((factionId, index) => {
      const angle = (index / factionIds.length) * Math.PI * 2;
      const distance = 200 + Math.random() * 100;
      factionCenters[factionId] = {
        x: Math.cos(angle) * distance,
        y: Math.sin(angle) * distance
      };
    });

    // Assign each system to nearest faction
    galaxy.forEach((sys, i) => {
      let nearestFaction = null;
      let nearestDistance = Infinity;

      // FIXED: Access position correctly (sys.position.x, not sys.x)
      if (!sys.position) {
        console.warn(`System ${i} has no position data, skipping faction assignment`);
        return;
      }

      factionIds.forEach(factionId => {
        const center = factionCenters[factionId];
        const dx = sys.position.x - center.x; // FIXED: Use sys.position.x
        const dy = sys.position.y - center.y; // FIXED: Use sys.position.y
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < nearestDistance) {
          nearestDistance = distance;
          nearestFaction = factionId;
        }
      });

      // Assign faction to system
      sys.faction = nearestFaction;
      sys.factionData = this.factions[nearestFaction];
    });

    return factionCenters;
  }
}
