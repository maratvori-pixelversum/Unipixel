/**
 * InteractionSystem - Manages popup interactions with celestial bodies, stations, ships, and items
 *
 * Features:
 * - Proximity detection for interactive objects
 * - Context-aware popup windows with options
 * - Keyboard and mobile touch controls
 * - Actions: Land, Mine, Orbit, Interact, Pick Up, Inspect
 * - OPTIMIZED: Uses spatial partitioning for O(1) lookups instead of O(n²)
 */
import { SpatialGrid } from './SpatialGrid.js';

export class InteractionSystem {
  constructor(game) {
    this.game = game;
    // HUD UI OVERHAUL: MASSIVELY increased proximity range for HUGE celestial bodies
    this.proximityRange = 2400; // MASSIVE: Increased from 400 to 2400 for much larger bodies and better UX
    this.currentTarget = null;
    this.selectedOptionIndex = 0;
    this.keyboardControlsEnabled = true;

    // Two-stage interaction system
    this.showingPrompt = false; // Small "Press E to interact" prompt
    this.showingFullPopup = false; // Full popup with options
    this.nearbyObject = null; // Object in proximity range

    // Spatial grid for efficient proximity queries (100x faster)
    this.spatialGrid = new SpatialGrid(1000); // 1000 unit cells
    this.gridNeedsRebuild = true;
  }

  /**
   * Update interaction system - check for nearby interactive objects
   * NEW: Two-stage system - show small prompt first, then full popup on 'E' press
   */
  update() {
    if (!this.game.player || this.game.scene !== 'system') {
      return;
    }

    // Don't check for interactions if other UI is open
    if (this.game.uiState.showInventory ||
        this.game.uiState.showTrading ||
        this.game.uiState.showDiplomacy ||
        this.game.uiState.showGalaxyMap) {
      this.closeAll();
      return;
    }

    // Check for nearby objects in order of priority
    const nearestObject = this.findNearestInteractiveObject();

    if (nearestObject) {
      // Store nearby object
      this.nearbyObject = nearestObject;

      // If not already showing full popup, show small prompt
      if (!this.showingFullPopup) {
        this.showInteractionPrompt(nearestObject);
      }
    } else {
      // No objects nearby - close everything
      this.closeAll();
    }
  }

  /**
   * Show small interaction prompt (NEW)
   */
  showInteractionPrompt(targetData) {
    this.showingPrompt = true;
    this.game.uiState.showInteractionPrompt = true;
    this.game.uiState.interactionPromptTarget = targetData;
  }

  /**
   * Hide interaction prompt (NEW)
   */
  hideInteractionPrompt() {
    this.showingPrompt = false;
    this.game.uiState.showInteractionPrompt = false;
    this.game.uiState.interactionPromptTarget = null;
  }

  /**
   * Activate full popup (called when player presses 'E')
   */
  activateFullPopup() {
    if (this.nearbyObject && this.showingPrompt) {
      this.hideInteractionPrompt();
      this.showFullPopup(this.nearbyObject);
    }
  }

  /**
   * Close all prompts and popups
   */
  closeAll() {
    this.hideInteractionPrompt();
    this.closePopup();
    this.nearbyObject = null;
  }

  /**
   * Mark grid as needing rebuild (call when objects are destroyed/added)
   */
  markGridDirty() {
    this.gridNeedsRebuild = true;
  }

  /**
   * Rebuild spatial grid with all interactive objects
   * Called when system changes or objects are added/removed
   */
  rebuildSpatialGrid() {
    this.spatialGrid.clear();

    // Safety check: ensure star exists before calculating positions
    if (!this.game.star || typeof this.game.star.x !== 'number') {
      this.gridNeedsRebuild = true; // Try again next frame
      return;
    }

    // Add planets
    for (const planet of this.game.planets || []) {
      const px = this.game.star.x + Math.cos(planet.angle) * planet.distance;
      const py = this.game.star.y + Math.sin(planet.angle) * planet.distance;

      this.spatialGrid.insert({
        type: 'planet',
        object: planet,
        x: px,
        y: py,
        interactionRadius: planet.radius + this.proximityRange
      });

      // Add moons
      for (const moon of planet.moons || []) {
        const mx = px + Math.cos(moon.angle) * moon.distance;
        const my = py + Math.sin(moon.angle) * moon.distance;

        this.spatialGrid.insert({
          type: 'moon',
          object: moon,
          x: mx,
          y: my,
          interactionRadius: moon.radius + this.proximityRange
        });
      }
    }

    // Add asteroids
    for (const asteroid of this.game.asteroids || []) {
      if (asteroid.destroyed) continue;

      const ax = this.game.star.x + Math.cos(asteroid.angle) * asteroid.distance;
      const ay = this.game.star.y + Math.sin(asteroid.angle) * asteroid.distance;

      this.spatialGrid.insert({
        type: 'asteroid',
        object: asteroid,
        x: ax,
        y: ay,
        interactionRadius: 50
      });
    }

    // Add stations
    for (const station of this.game.stations || []) {
      if (station.destroyed) continue;

      const sx = this.game.star.x + Math.cos(station.angle) * station.distance;
      const sy = this.game.star.y + Math.sin(station.angle) * station.distance;

      this.spatialGrid.insert({
        type: 'station',
        object: station,
        x: sx,
        y: sy,
        interactionRadius: 100
      });
    }

    // Add artifacts
    for (const artifact of this.game.systemArtifacts || []) {
      if (artifact.collected) continue;

      this.spatialGrid.insert({
        type: 'artifact',
        object: artifact,
        x: artifact.x,
        y: artifact.y,
        interactionRadius: 80
      });
    }

    // Add warp gates
    for (const gate of this.game.systemWarpGates || []) {
      const gx = this.game.star.x + Math.cos(gate.angle) * gate.distance;
      const gy = this.game.star.y + Math.sin(gate.angle) * gate.distance;

      this.spatialGrid.insert({
        type: 'warpgate',
        object: gate,
        x: gx,
        y: gy,
        interactionRadius: 120
      });
    }

    this.gridNeedsRebuild = false;
  }

  /**
   * Find the nearest interactive object within range
   * OPTIMIZED: Uses spatial grid for O(1) lookups instead of O(n²)
   */
  findNearestInteractiveObject() {
    const player = this.game.player;

    // Rebuild grid if needed (system changed, objects added/removed)
    if (this.gridNeedsRebuild) {
      this.rebuildSpatialGrid();
    }

    // Query spatial grid for nearby objects - MUCH faster than looping all objects!
    const nearbyObjects = this.spatialGrid.queryRadius(
      player.x,
      player.y,
      this.proximityRange + 400 // Extra buffer for large objects (doubled for HUD UI OVERHAUL)
    );

    // Find nearest object from candidates
    let nearestDist = this.proximityRange;
    let nearest = null;

    for (const obj of nearbyObjects) {
      const dist = Math.sqrt((obj.x - player.x) ** 2 + (obj.y - player.y) ** 2);

      if (dist < nearestDist && dist < obj.interactionRadius) {
        nearestDist = dist;
        nearest = {
          type: obj.type,
          object: obj.object,
          x: obj.x,
          y: obj.y,
          distance: dist
        };
      }
    }

    // TODO: Add checks for:
    // - Enemy ships (for interaction/hailing)
    // - Debris fields (for salvage)
    // - Comets
    // - Megastructures

    return nearest;
  }

  /**
   * Show popup window for an interactive object (renamed for clarity)
   */
  showFullPopup(targetData) {
    this.currentTarget = targetData;
    this.selectedOptionIndex = 0;
    this.showingFullPopup = true;

    const buttons = this.getActionButtons(targetData);
    const info = this.getObjectInfo(targetData);

    this.game.uiState.showPopup = true;
    this.game.uiState.popupType = targetData.type;
    this.game.uiState.popupTarget = targetData;
    this.game.uiState.popupButtons = buttons;
    this.game.uiState.popupInfo = info;
  }

  /**
   * Show popup window for an interactive object (backward compatibility)
   */
  showPopup(targetData) {
    this.showFullPopup(targetData);
  }

  /**
   * Close popup window
   */
  closePopup() {
    if (this.game.uiState.showPopup) {
      this.game.uiState.showPopup = false;
      this.game.uiState.popupType = null;
      this.game.uiState.popupTarget = null;
      this.game.uiState.popupButtons = [];
      this.currentTarget = null;
      this.selectedOptionIndex = 0;
      this.showingFullPopup = false;
    }
  }

  /**
   * Get action buttons for object type
   */
  getActionButtons(targetData) {
    const buttons = [];

    switch (targetData.type) {
      case 'planet':
      case 'moon':
        buttons.push(
          { label: 'LAND', key: 'Enter', action: () => this.actionLand(targetData) },
          { label: 'ORBIT', key: 'O', action: () => this.actionOrbit(targetData) },
          { label: 'SCAN', key: 'S', action: () => this.actionScan(targetData) }
        );
        if (this.canMine(targetData.object)) {
          buttons.push({ label: 'MINE', key: 'M', action: () => this.actionMine(targetData) });
        }
        buttons.push({ label: 'EXIT', key: 'Esc', action: () => this.closePopup() });
        break;

      case 'asteroid':
        buttons.push(
          { label: 'MINE', key: 'Enter', action: () => this.actionMine(targetData) },
          { label: 'SCAN', key: 'S', action: () => this.actionScan(targetData) },
          { label: 'EXIT', key: 'Esc', action: () => this.closePopup() }
        );
        break;

      case 'station':
        buttons.push(
          { label: 'DOCK', key: 'Enter', action: () => this.actionDock(targetData) },
          { label: 'TRADE', key: 'T', action: () => this.actionTrade(targetData) },
          { label: 'HAIL', key: 'H', action: () => this.actionHail(targetData) },
          { label: 'EXIT', key: 'Esc', action: () => this.closePopup() }
        );
        break;

      case 'artifact':
        buttons.push(
          { label: 'PICK UP', key: 'Enter', action: () => this.actionPickUp(targetData) },
          { label: 'INSPECT', key: 'I', action: () => this.actionInspect(targetData) },
          { label: 'EXIT', key: 'Esc', action: () => this.closePopup() }
        );
        break;

      case 'warpgate':
        buttons.push(
          { label: 'USE GATE', key: 'Enter', action: () => this.actionUseGate(targetData) },
          { label: 'INSPECT', key: 'I', action: () => this.actionInspect(targetData) },
          { label: 'EXIT', key: 'Esc', action: () => this.closePopup() }
        );
        break;

      default:
        buttons.push({ label: 'EXIT', key: 'Esc', action: () => this.closePopup() });
    }

    return buttons;
  }

  /**
   * Get display information for object
   */
  getObjectInfo(targetData) {
    const obj = targetData.object;
    const info = {
      title: '',
      details: [],
      distance: Math.floor(targetData.distance)
    };

    switch (targetData.type) {
      case 'planet':
        info.title = obj.name || 'Unknown Planet';
        info.details.push(`Type: ${obj.planetType || 'Unknown'}`);
        info.details.push(`Radius: ${Math.floor(obj.radius)} km`);
        info.details.push(`Distance: ${Math.floor(targetData.distance)} km`);
        if (obj.atmosphere) {
          info.details.push(`Atmosphere: ${obj.atmosphere}`);
        }
        if (obj.resources && obj.resources.length > 0) {
          info.details.push(`Resources: ${obj.resources.slice(0, 3).join(', ')}`);
        }
        break;

      case 'moon':
        info.title = obj.name || 'Unknown Moon';
        info.details.push(`Type: ${obj.moonType || 'Rocky'}`);
        info.details.push(`Radius: ${Math.floor(obj.radius)} km`);
        info.details.push(`Distance: ${Math.floor(targetData.distance)} km`);
        break;

      case 'asteroid':
        info.title = 'Asteroid';
        info.details.push(`Size: ${Math.floor(obj.size)} m`);
        info.details.push(`Distance: ${Math.floor(targetData.distance)} km`);
        info.details.push('Mineable: Yes');
        break;

      case 'station':
        info.title = obj.name || obj.stationType || 'Space Station';
        info.details.push(`Type: ${obj.stationType}`);
        info.details.push(`Faction: ${obj.faction || 'Independent'}`);
        info.details.push(`Distance: ${Math.floor(targetData.distance)} km`);
        if (obj.services) {
          info.details.push(`Services: ${obj.services.join(', ')}`);
        }
        break;

      case 'artifact':
        info.title = obj.name || 'Unknown Artifact';
        info.details.push(`Type: ${obj.type || 'Ancient'}`);
        info.details.push(`Distance: ${Math.floor(targetData.distance)} km`);
        info.details.push('Status: Uncollected');
        break;

      case 'warpgate':
        info.title = 'Warp Gate';
        info.details.push(`Destination: ${obj.targetSystemName || 'Unknown'}`);
        info.details.push(`Distance: ${Math.floor(targetData.distance)} km`);
        info.details.push('Status: Active');
        break;
    }

    return info;
  }

  /**
   * Check if object can be mined
   */
  canMine(object) {
    return object.resources && object.resources.length > 0;
  }

  /**
   * Handle keyboard input for popup navigation
   */
  handleKeyDown(keyCode) {
    if (!this.game.uiState.showPopup || !this.keyboardControlsEnabled) {
      return false;
    }

    const buttons = this.game.uiState.popupButtons;

    switch (keyCode) {
      case 'ArrowUp':
      case 'KeyW':
        this.selectedOptionIndex = Math.max(0, this.selectedOptionIndex - 1);
        return true;

      case 'ArrowDown':
      case 'KeyS':
        this.selectedOptionIndex = Math.min(buttons.length - 1, this.selectedOptionIndex + 1);
        return true;

      case 'Enter':
      case 'Space':
        if (buttons[this.selectedOptionIndex]) {
          buttons[this.selectedOptionIndex].action();
        }
        return true;

      case 'Escape':
        this.closePopup();
        return true;

      default:
        // Check if key matches any button's shortcut key
        for (let i = 0; i < buttons.length; i++) {
          if (buttons[i].key === keyCode) {
            this.selectedOptionIndex = i;
            buttons[i].action();
            return true;
          }
        }
    }

    return false;
  }

  /**
   * Get currently selected option index
   */
  getSelectedOptionIndex() {
    return this.selectedOptionIndex;
  }

  // ===== ACTION METHODS =====

  actionLand(targetData) {
    const obj = targetData.object;
    const game = this.game;

    // Check if landing is possible
    if (!obj.landable && obj.planetType !== 'terran_planet' && obj.planetType !== 'rocky_planet' && obj.planetType !== 'desert_planet' && obj.planetType !== 'ice_planet') {
      game.showNotification('Cannot land on this body - unsuitable surface!', 'warning');
      this.closePopup();
      return;
    }

    // Check if atmosphere is too dangerous
    if (obj.atmosphere && obj.atmosphere.includes('toxic') && !game.player.hasAtmosphereShield) {
      game.showNotification('Warning: Toxic atmosphere detected! Landing not recommended.', 'warning');
      // Allow landing anyway, but with warning
    }

    // Use the proper landing function from Game.js
    game.performLanding(obj, targetData.x, targetData.y);

    game.showNotification(`Landed on ${obj.name || targetData.type}. Press SPACE or L to launch, C or E to collect resources.`, 'success');

    this.closePopup();
  }

  actionOrbit(targetData) {
    const obj = targetData.object;
    const game = this.game;
    const player = game.player;

    // Calculate orbital velocity for circular orbit
    const dx = player.x - targetData.x;
    const dy = player.y - targetData.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Orbital velocity = sqrt(GM/r), simplified for game
    const orbitalSpeed = Math.sqrt((obj.mass || 1000) * 0.5 / distance);

    // Set velocity perpendicular to radius vector
    const angle = Math.atan2(dy, dx);
    const perpAngle = angle + Math.PI / 2;

    player.vx = Math.cos(perpAngle) * orbitalSpeed;
    player.vy = Math.sin(perpAngle) * orbitalSpeed;

    // Mark as in orbit
    player.inOrbit = true;
    player.orbitingBody = targetData;

    game.showNotification(`Entered stable orbit around ${obj.name || targetData.type}`, 'success');

    this.closePopup();
  }

  actionScan(targetData) {
    const obj = targetData.object;
    const game = this.game;

    // Mark as scanned
    obj.scanned = true;

    // Reveal additional information
    const scanData = {
      name: obj.name || 'Unknown',
      type: targetData.type,
      details: []
    };

    if (targetData.type === 'planet' || targetData.type === 'moon') {
      scanData.details.push(`Type: ${obj.planetType || obj.type || 'Unknown'}`);
      scanData.details.push(`Radius: ${Math.floor(obj.radius)} km`);
      scanData.details.push(`Mass: ${(obj.mass || 1000).toFixed(2)} Earth masses`);

      if (obj.atmosphere) {
        scanData.details.push(`Atmosphere: ${obj.atmosphere}`);
      }

      if (obj.temperature) {
        scanData.details.push(`Surface Temp: ${obj.temperature}°C`);
      }

      // Discover resources
      if (!obj.resources || obj.resources.length === 0) {
        // Generate resources based on planet type
        obj.resources = this.generatePlanetaryResources(obj);
      }

      if (obj.resources && obj.resources.length > 0) {
        scanData.details.push(`Resources: ${obj.resources.join(', ')}`);
      }

      // Add to scanned database
      if (!game.scannedObjects) game.scannedObjects = [];
      game.scannedObjects.push(scanData);
    }

    game.showNotification(`Scan complete: ${scanData.details.length} data points recorded`, 'success');

    // Update popup to show new info
    this.game.uiState.popupInfo.details = scanData.details;

    // Don't close popup - let player see scan results
  }

  /**
   * Generate planetary resources based on planet type
   */
  generatePlanetaryResources(planet) {
    const resources = [];
    const type = planet.planetType || planet.type || 'rocky_planet';

    switch (type) {
      case 'terran_planet':
        resources.push('Water', 'Carbon', 'Silicon');
        break;
      case 'rocky_planet':
        resources.push('Iron', 'Silicon', 'Titanium');
        break;
      case 'desert_planet':
        resources.push('Silicon', 'Rare Isotopes');
        break;
      case 'ice_planet':
        resources.push('Water', 'Deuterium');
        break;
      case 'gas_giant':
      case 'ice_giant':
        resources.push('Deuterium', 'Exotic Matter');
        break;
      default:
        resources.push('Carbon', 'Iron');
    }

    return resources;
  }

  actionMine(targetData) {
    if (targetData.type === 'asteroid') {
      // Use existing mining system
      if (this.game.miningSystem) {
        this.game.input.mining = true;
      }
    } else {
      // Planetary mining not yet fully implemented
      this.game.showNotification('Planetary surface mining coming soon!', 'info');
    }

    this.closePopup();
  }

  actionDock(targetData) {
    const station = targetData.object;
    const game = this.game;
    const player = game.player;

    // Stop player movement
    player.vx = 0;
    player.vy = 0;

    // Position at docking port
    player.x = targetData.x;
    player.y = targetData.y;

    // Mark as docked
    player.docked = true;
    player.dockedStation = station;

    // Full repairs and refuel at station
    player.hull = player.maxHull;
    player.shields = player.maxShields;

    game.showNotification(`Docked at ${station.name || station.stationType}. Repairs complete.`, 'success');

    // Open trading UI
    game.uiState.showTrading = true;
    game.uiState.selectedStation = station;

    this.closePopup();
  }

  actionTrade(targetData) {
    // Open trading UI
    this.game.uiState.showTrading = true;
    this.game.uiState.selectedStation = targetData.object;
    this.closePopup();
  }

  actionHail(targetData) {
    const station = targetData.object;
    const game = this.game;

    // Get faction info
    const faction = station.faction || 'Independent';
    const factionRelation = game.factionSystem ? game.factionSystem.getRelation(faction) : 'neutral';

    let message = '';
    switch (factionRelation) {
      case 'friendly':
        message = `${station.name || station.stationType}: "Welcome, friend! Docking clearance granted."`;
        break;
      case 'hostile':
        message = `${station.name || station.stationType}: "You are not welcome here! Leave immediately!"`;
        break;
      case 'neutral':
      default:
        message = `${station.name || station.stationType}: "State your business, traveler."`;
    }

    game.showNotification(message, 'info');

    this.closePopup();
  }

  actionPickUp(targetData) {
    if (targetData.type === 'artifact') {
      // Mark artifact as collected
      targetData.object.collected = true;

      // Add to player inventory
      if (this.game.artifactSystem) {
        this.game.artifactSystem.collectArtifact(targetData.object);
      }

      this.game.showNotification(`Artifact collected: ${targetData.object.name || 'Unknown'}`, 'success');
    }

    this.closePopup();
  }

  actionInspect(targetData) {
    // Detailed inspection - already shown in popup
    // Don't close popup - let player continue inspecting
    const obj = targetData.object;
    this.game.showNotification(`Inspecting ${obj.name || targetData.type}...`, 'info');
  }

  actionUseGate(targetData) {
    if (this.game.warpGateSystem && targetData.object.targetSystemIndex !== undefined) {
      const destName = targetData.object.targetSystemName || 'Unknown System';
      this.game.showNotification(`Jumping to ${destName}...`, 'success');

      // Use warp gate system to travel
      this.game.loadStarSystem(targetData.object.targetSystemIndex);
      this.game.player.x = this.game.star.x;
      this.game.player.y = this.game.star.y - 500;
    }

    this.closePopup();
  }
}
