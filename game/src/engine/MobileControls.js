/**
 * Mobile Touch Controls
 * Virtual buttons for mobile gameplay:
 * - Warp drive toggle
 * - Shield controls
 * - Map toggle
 * - Inventory screen (INV)
 * - Trading screen (TRD)
 * - Diplomacy screen (DIP)
 * - Weapon selection
 * - Movement joystick
 * - Fire button
 *
 * Designed to be small and non-intrusive on mobile screens
 */

export class MobileControls {
  constructor(canvas, game) {
    this.canvas = canvas;
    this.game = game;
    this.ctx = canvas.getContext('2d');

    // Touch tracking
    this.touches = new Map();
    this.activeButtons = new Set();

    // Virtual joystick (enlarged for better visibility)
    this.joystick = {
      active: false,
      centerX: 0,
      centerY: 0,
      currentX: 0,
      currentY: 0,
      radius: 80,
      handleRadius: 30,
      deadZone: 10
    };

    // Button configurations (enlarged for better touch targeting)
    this.buttons = {
      // Right side controls
      fire: {
        x: 0, y: 0, width: 90, height: 90,
        label: 'FIRE',
        position: 'bottom-right', offsetX: -100, offsetY: -100,
        action: () => this.game.input.firing = true,
        releaseAction: () => this.game.input.firing = false
      },
      warp: {
        x: 0, y: 0, width: 80, height: 80,
        label: 'WARP',
        position: 'bottom-right', offsetX: -100, offsetY: -200,
        toggle: true,
        active: false,
        action: () => {
          this.buttons.warp.active = !this.buttons.warp.active;
          this.game.input.warp = this.buttons.warp.active;
        }
      },
      shields: {
        x: 0, y: 0, width: 80, height: 80,
        label: 'SHLD',
        position: 'bottom-right', offsetX: -200, offsetY: -100,
        toggle: true,
        active: false,
        action: () => {
          this.buttons.shields.active = !this.buttons.shields.active;
          this.game.input.shield = this.buttons.shields.active;
        }
      },

      // Top controls
      map: {
        x: 0, y: 0, width: 70, height: 70,
        label: 'MAP',
        position: 'top-right', offsetX: -80, offsetY: 10,
        toggle: true,
        active: false,
        action: () => {
          this.buttons.map.active = !this.buttons.map.active;
          this.game.uiState.showGalaxyMap = this.buttons.map.active;
          // Close other UIs
          if (this.buttons.map.active) {
            this.game.uiState.showInventory = false;
            this.game.uiState.showTrading = false;
            this.game.uiState.showDiplomacy = false;
            this.buttons.inventory.active = false;
            this.buttons.trade.active = false;
            this.buttons.diplomacy.active = false;
          }
        }
      },

      // Weapon selection (larger buttons)
      weaponPrev: {
        x: 0, y: 0, width: 60, height: 60,
        label: '◀',
        position: 'top-right', offsetX: -240, offsetY: 10,
        action: () => this.cycleWeapon(-1)
      },
      weaponNext: {
        x: 0, y: 0, width: 60, height: 60,
        label: '▶',
        position: 'top-right', offsetX: -170, offsetY: 10,
        action: () => this.cycleWeapon(1)
      },

      // Additional utility buttons
      brake: {
        x: 0, y: 0, width: 70, height: 70,
        label: 'BRK',
        position: 'bottom-left', offsetX: 100, offsetY: -200,
        action: () => this.game.input.brake = true,
        releaseAction: () => this.game.input.brake = false
      },

      // Tactical options
      target: {
        x: 0, y: 0, width: 60, height: 60,
        label: 'TGT',
        position: 'top-left', offsetX: 10, offsetY: 10,
        action: () => this.targetNearestEnemy()
      },

      // Inventory and interaction buttons
      inventory: {
        x: 0, y: 0, width: 70, height: 70,
        label: 'INV',
        position: 'top-left', offsetX: 80, offsetY: 10,
        toggle: true,
        active: false,
        action: () => {
          this.buttons.inventory.active = !this.buttons.inventory.active;
          this.game.uiState.showInventory = this.buttons.inventory.active;
          // Close other UIs
          if (this.buttons.inventory.active) {
            this.game.uiState.showGalaxyMap = false;
            this.game.uiState.showTrading = false;
            this.game.uiState.showDiplomacy = false;
            this.buttons.map.active = false;
            this.buttons.trade.active = false;
            this.buttons.diplomacy.active = false;
          }
        }
      },
      trade: {
        x: 0, y: 0, width: 70, height: 70,
        label: 'TRD',
        position: 'top-left', offsetX: 160, offsetY: 10,
        toggle: true,
        active: false,
        action: () => {
          this.buttons.trade.active = !this.buttons.trade.active;
          this.game.uiState.showTrading = this.buttons.trade.active;
          // Close other UIs
          if (this.buttons.trade.active) {
            this.game.uiState.showGalaxyMap = false;
            this.game.uiState.showInventory = false;
            this.game.uiState.showDiplomacy = false;
            this.buttons.map.active = false;
            this.buttons.inventory.active = false;
            this.buttons.diplomacy.active = false;
          }
        }
      },
      diplomacy: {
        x: 0, y: 0, width: 70, height: 70,
        label: 'DIP',
        position: 'top-left', offsetX: 240, offsetY: 10,
        toggle: true,
        active: false,
        action: () => {
          this.buttons.diplomacy.active = !this.buttons.diplomacy.active;
          this.game.uiState.showDiplomacy = this.buttons.diplomacy.active;
          // Close other UIs
          if (this.buttons.diplomacy.active) {
            this.game.uiState.showGalaxyMap = false;
            this.game.uiState.showInventory = false;
            this.game.uiState.showTrading = false;
            this.buttons.map.active = false;
            this.buttons.inventory.active = false;
            this.buttons.trade.active = false;
          }
        }
      },
      interact: {
        x: 0, y: 0, width: 70, height: 70,
        label: 'INT',
        position: 'top-left', offsetX: 320, offsetY: 10,
        action: () => this.attemptInteraction()
      },
      mine: {
        x: 0, y: 0, width: 70, height: 70,
        label: 'MINE',
        position: 'bottom-left', offsetX: 10, offsetY: -200,
        action: () => this.game.input.mining = true,
        releaseAction: () => this.game.input.mining = false
      }
    };

    // Mobile detection
    this.isMobile = this.detectMobile();

    // Only initialize if mobile
    if (this.isMobile) {
      this.initializeTouchControls();
    }
  }

  /**
   * Detect if device is mobile
   * Only enable touch controls on actual mobile devices, not desktop browsers with touch support
   */
  detectMobile() {
    // Check for mobile user agent first
    const mobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

    // Check for touch capability combined with small screen size
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    const isSmallScreen = window.innerWidth <= 1024 || window.innerHeight <= 768;

    // Only enable mobile controls if it's a mobile UA OR (touch device AND small screen)
    return mobileUA || (isTouchDevice && isSmallScreen);
  }

  /**
   * Initialize touch event listeners
   */
  initializeTouchControls() {
    this.canvas.addEventListener('touchstart', this.handleTouchStart.bind(this), { passive: false });
    this.canvas.addEventListener('touchmove', this.handleTouchMove.bind(this), { passive: false });
    this.canvas.addEventListener('touchend', this.handleTouchEnd.bind(this), { passive: false });
    this.canvas.addEventListener('touchcancel', this.handleTouchEnd.bind(this), { passive: false });

    this.updateButtonPositions();
  }

  /**
   * Update button positions based on canvas size
   */
  updateButtonPositions() {
    const width = this.canvas.width;
    const height = this.canvas.height;

    for (const [key, button] of Object.entries(this.buttons)) {
      switch (button.position) {
        case 'top-left':
          button.x = button.offsetX;
          button.y = button.offsetY;
          break;
        case 'top-right':
          button.x = width + button.offsetX;
          button.y = button.offsetY;
          break;
        case 'bottom-left':
          button.x = button.offsetX;
          button.y = height + button.offsetY;
          break;
        case 'bottom-right':
          button.x = width + button.offsetX;
          button.y = height + button.offsetY;
          break;
      }
    }

    // Joystick position (bottom-left, adjusted for larger size)
    this.joystick.centerX = 100;
    this.joystick.centerY = height - 100;
  }

  /**
   * Handle touch start
   */
  handleTouchStart(event) {
    event.preventDefault();

    for (const touch of event.changedTouches) {
      const rect = this.canvas.getBoundingClientRect();

      // Account for canvas scaling
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;

      const x = (touch.clientX - rect.left) * scaleX;
      const y = (touch.clientY - rect.top) * scaleY;

      // PRIORITY 1: Check popup buttons FIRST (if popup is showing)
      if (this.game.uiState.showPopup && this.game.popupButtonBounds) {
        let popupButtonClicked = false;
        for (const button of this.game.popupButtonBounds) {
          if (x >= button.x && x <= button.x + button.w &&
              y >= button.y && y <= button.y + button.h) {
            // Execute popup button action
            if (typeof button.action === 'function') {
              button.action();
            } else {
              this.game.handlePopupAction(button.action);
            }
            popupButtonClicked = true;
            break;
          }
        }
        // If popup button was clicked, don't process other controls
        if (popupButtonClicked) {
          continue;
        }
        // If popup is showing but touch wasn't on a button, ignore this touch
        // (don't activate joystick/buttons while popup is open)
        continue;
      }

      // PRIORITY 2: Check UI screen buttons (if a UI screen is showing)
      if (this.game.uiState.showInventory && this.game.inventoryButtonBounds) {
        let uiButtonClicked = false;
        for (const button of this.game.inventoryButtonBounds) {
          if (x >= button.x && x <= button.x + button.w &&
              y >= button.y && y <= button.y + button.h) {
            if (typeof button.action === 'function') {
              button.action();
            }
            uiButtonClicked = true;
            break;
          }
        }
        if (uiButtonClicked) {
          continue;
        }
      }

      if (this.game.uiState.showGalaxyMap && this.game.galaxyMapButtonBounds) {
        let uiButtonClicked = false;
        for (const button of this.game.galaxyMapButtonBounds) {
          if (x >= button.x && x <= button.x + button.w &&
              y >= button.y && y <= button.y + button.h) {
            if (typeof button.action === 'function') {
              button.action();
            }
            uiButtonClicked = true;
            break;
          }
        }
        if (uiButtonClicked) {
          continue;
        }
      }

      if (this.game.uiState.showTrading && this.game.tradingButtonBounds) {
        let uiButtonClicked = false;
        for (const button of this.game.tradingButtonBounds) {
          if (x >= button.x && x <= button.x + button.w &&
              y >= button.y && y <= button.y + button.h) {
            if (typeof button.action === 'function') {
              button.action();
            }
            uiButtonClicked = true;
            break;
          }
        }
        if (uiButtonClicked) {
          continue;
        }
      }

      if (this.game.uiState.showDiplomacy && this.game.diplomacyButtonBounds) {
        let uiButtonClicked = false;
        for (const button of this.game.diplomacyButtonBounds) {
          if (x >= button.x && x <= button.x + button.w &&
              y >= button.y && y <= button.y + button.h) {
            if (typeof button.action === 'function') {
              button.action();
            }
            uiButtonClicked = true;
            break;
          }
        }
        if (uiButtonClicked) {
          continue;
        }
      }

      if (this.game.uiState.showSaveScreen && this.game.saveScreenButtonBounds) {
        let uiButtonClicked = false;
        for (const button of this.game.saveScreenButtonBounds) {
          if (x >= button.x && x <= button.x + button.w &&
              y >= button.y && y <= button.y + button.h) {
            if (typeof button.action === 'function') {
              button.action();
            }
            uiButtonClicked = true;
            break;
          }
        }
        if (uiButtonClicked) {
          continue;
        }
      }

      if (this.game.uiState.showLoadScreen && this.game.loadScreenButtonBounds) {
        let uiButtonClicked = false;
        for (const button of this.game.loadScreenButtonBounds) {
          if (x >= button.x && x <= button.x + button.w &&
              y >= button.y && y <= button.y + button.h) {
            if (typeof button.action === 'function') {
              button.action();
            }
            uiButtonClicked = true;
            break;
          }
        }
        if (uiButtonClicked) {
          continue;
        }
      }

      // PRIORITY 3: Check mobile control buttons (buttons have priority over joystick)
      let buttonPressed = false;
      for (const [key, button] of Object.entries(this.buttons)) {
        if (this.isPointInButton(x, y, button)) {
          this.activeButtons.add(key);
          if (button.action) button.action();
          buttonPressed = true;
          this.touches.set(touch.identifier, { type: 'button', key, x, y });
          break;
        }
      }

      // PRIORITY 3: Check joystick area (only if no button pressed)
      if (!buttonPressed && this.isPointInJoystick(x, y)) {
        this.joystick.active = true;
        this.joystick.currentX = x;
        this.joystick.currentY = y;
        this.touches.set(touch.identifier, { type: 'joystick', x, y });
      }
    }
  }

  /**
   * Handle touch move
   */
  handleTouchMove(event) {
    event.preventDefault();

    for (const touch of event.changedTouches) {
      const touchData = this.touches.get(touch.identifier);
      if (!touchData) continue;

      const rect = this.canvas.getBoundingClientRect();

      // Account for canvas scaling
      const scaleX = this.canvas.width / rect.width;
      const scaleY = this.canvas.height / rect.height;

      const x = (touch.clientX - rect.left) * scaleX;
      const y = (touch.clientY - rect.top) * scaleY;

      if (touchData.type === 'joystick') {
        this.joystick.currentX = x;
        this.joystick.currentY = y;
        this.updateJoystickInput();
      }
    }
  }

  /**
   * Handle touch end
   */
  handleTouchEnd(event) {
    event.preventDefault();

    for (const touch of event.changedTouches) {
      const touchData = this.touches.get(touch.identifier);
      if (!touchData) continue;

      if (touchData.type === 'joystick') {
        this.joystick.active = false;
        this.game.input.thrust = 0;
        this.game.input.rotation = 0;
      } else if (touchData.type === 'button') {
        // Release button actions
        for (const key of this.activeButtons) {
          const button = this.buttons[key];
          if (button.releaseAction) button.releaseAction();
        }
        this.activeButtons.clear();
      }

      this.touches.delete(touch.identifier);
    }
  }

  /**
   * Check if point is in button
   */
  isPointInButton(x, y, button) {
    return x >= button.x && x <= button.x + button.width &&
           y >= button.y && y <= button.y + button.height;
  }

  /**
   * Check if point is in joystick area
   */
  isPointInJoystick(x, y) {
    const dx = x - this.joystick.centerX;
    const dy = y - this.joystick.centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    // Use radius * 1.5 for slightly larger hit area but not overlapping buttons
    return distance <= this.joystick.radius * 1.5;
  }

  /**
   * Update joystick input to game controls
   */
  updateJoystickInput() {
    if (!this.joystick.active) return;

    const dx = this.joystick.currentX - this.joystick.centerX;
    const dy = this.joystick.currentY - this.joystick.centerY;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Apply dead zone
    if (distance < this.joystick.deadZone) {
      this.game.input.thrust = 0;
      this.game.input.rotation = 0;
      return;
    }

    // Clamp to max radius
    const maxDistance = this.joystick.radius;
    const clampedDistance = Math.min(distance, maxDistance);

    // Calculate thrust (forward/backward from vertical component)
    const thrustMagnitude = (dy / maxDistance);
    this.game.input.thrust = -thrustMagnitude; // Negative because down is positive Y

    // Calculate rotation (from horizontal component)
    const rotationMagnitude = (dx / maxDistance);
    this.game.input.rotation = rotationMagnitude;
  }

  /**
   * Cycle weapon selection
   */
  cycleWeapon(direction) {
    if (!this.game.player.weaponSystem) return;

    const weapons = this.game.player.weaponSystem.weapons;
    if (weapons.length === 0) return;

    const currentIndex = this.game.player.weaponSystem.activeWeaponIndex;
    let newIndex = currentIndex + direction;

    if (newIndex < 0) newIndex = weapons.length - 1;
    if (newIndex >= weapons.length) newIndex = 0;

    this.game.player.weaponSystem.activeWeaponIndex = newIndex;
  }

  /**
   * Target nearest enemy
   */
  targetNearestEnemy() {
    // Find nearest enemy and set as target
    if (!this.game.enemies || this.game.enemies.length === 0) return;

    const player = this.game.player;
    let nearest = null;
    let minDist = Infinity;

    for (const enemy of this.game.enemies) {
      const dx = enemy.x - player.x;
      const dy = enemy.y - player.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < minDist) {
        minDist = dist;
        nearest = enemy;
      }
    }

    if (nearest) {
      this.game.targetedEnemy = nearest;
    }
  }

  /**
   * Attempt interaction with nearby entities
   * Now uses the new two-stage interaction system
   */
  attemptInteraction() {
    // Use the new interaction system - activate full popup if prompt is showing
    if (this.game.interactionSystem && this.game.uiState.showInteractionPrompt) {
      this.game.interactionSystem.activateFullPopup();
      return;
    }

    // Fallback: Try to find nearby interactive objects manually
    const player = this.game.player;
    if (!player) return;

    const interactionRange = 150;

    // Check for nearby stations
    if (this.game.stations) {
      for (const station of this.game.stations) {
        const dx = (this.game.star.x + Math.cos(station.angle) * station.distance) - player.x;
        const dy = (this.game.star.y + Math.sin(station.angle) * station.distance) - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < interactionRange) {
          // Show popup for station
          if (this.game.interactionSystem) {
            this.game.interactionSystem.showFullPopup({
              type: 'station',
              object: station,
              x: this.game.star.x + Math.cos(station.angle) * station.distance,
              y: this.game.star.y + Math.sin(station.angle) * station.distance,
              distance: dist
            });
          }
          return;
        }
      }
    }

    // Check for nearby planets
    if (this.game.planets) {
      for (const planet of this.game.planets) {
        const px = this.game.star.x + Math.cos(planet.angle) * planet.distance;
        const py = this.game.star.y + Math.sin(planet.angle) * planet.distance;
        const dx = px - player.x;
        const dy = py - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < planet.radius + interactionRange) {
          // Show popup for planet
          if (this.game.interactionSystem) {
            this.game.interactionSystem.showFullPopup({
              type: 'planet',
              object: planet,
              x: px,
              y: py,
              distance: dist
            });
          }
          return;
        }
      }
    }

    // Check for nearby asteroids
    if (this.game.asteroids) {
      for (const asteroid of this.game.asteroids) {
        if (asteroid.destroyed) continue;
        const ax = this.game.star.x + Math.cos(asteroid.angle) * asteroid.distance;
        const ay = this.game.star.y + Math.sin(asteroid.angle) * asteroid.distance;
        const dx = ax - player.x;
        const dy = ay - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < 100) {
          // Show popup for asteroid
          if (this.game.interactionSystem) {
            this.game.interactionSystem.showFullPopup({
              type: 'asteroid',
              object: asteroid,
              x: ax,
              y: ay,
              distance: dist
            });
          }
          return;
        }
      }
    }

    // No interaction target found
    console.log('[Mobile] No nearby interactive objects');
  }

  /**
   * Render mobile controls
   */
  render(ctx) {
    if (!this.isMobile) return;

    ctx.save();
    ctx.globalAlpha = 0.6;

    // Render virtual joystick
    if (this.joystick.active || true) { // Always show for visibility
      this.renderJoystick(ctx);
    }

    // Render buttons
    for (const [key, button] of Object.entries(this.buttons)) {
      this.renderButton(ctx, button, this.activeButtons.has(key));
    }

    ctx.restore();
  }

  /**
   * Render virtual joystick
   */
  renderJoystick(ctx) {
    const j = this.joystick;

    // Outer circle (background)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillStyle = 'rgba(100, 100, 100, 0.2)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(j.centerX, j.centerY, j.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Handle
    let handleX = j.centerX;
    let handleY = j.centerY;

    if (j.active) {
      const dx = j.currentX - j.centerX;
      const dy = j.currentY - j.centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);

      if (distance > 0) {
        const clampedDist = Math.min(distance, j.radius);
        handleX = j.centerX + (dx / distance) * clampedDist;
        handleY = j.centerY + (dy / distance) * clampedDist;
      }
    }

    ctx.fillStyle = j.active ? 'rgba(255, 255, 100, 0.8)' : 'rgba(200, 200, 200, 0.6)';
    ctx.beginPath();
    ctx.arc(handleX, handleY, j.handleRadius, 0, Math.PI * 2);
    ctx.fill();

    // Center dot
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.arc(j.centerX, j.centerY, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  /**
   * Render button
   */
  renderButton(ctx, button, isActive) {
    // Button background
    ctx.fillStyle = isActive ?
      'rgba(255, 200, 100, 0.7)' :
      (button.toggle && button.active) ?
        'rgba(100, 200, 255, 0.6)' :
        'rgba(100, 100, 100, 0.5)';

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
    ctx.lineWidth = 2;

    // Rounded rectangle
    this.roundRect(ctx, button.x, button.y, button.width, button.height, 8);
    ctx.fill();
    ctx.stroke();

    // Label (centered, no icons)
    if (button.label && button.label.length > 0) {
      ctx.fillStyle = 'white';
      ctx.font = 'bold 16px DigitalDisco, Arial';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(button.label, button.x + button.width / 2, button.y + button.height / 2);
    }
  }

  /**
   * Helper: Draw rounded rectangle
   */
  roundRect(ctx, x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  }

  /**
   * Update (called each frame)
   */
  update() {
    // Update button positions if canvas resized
    if (this.canvas.width !== this.lastWidth || this.canvas.height !== this.lastHeight) {
      this.updateButtonPositions();
      this.lastWidth = this.canvas.width;
      this.lastHeight = this.canvas.height;
    }

    // Sync button active states with UI state
    this.syncButtonStates();

    // Update joystick input
    if (this.joystick.active) {
      this.updateJoystickInput();
    }
  }

  /**
   * Sync button visual states with actual UI states
   */
  syncButtonStates() {
    this.buttons.map.active = this.game.uiState.showGalaxyMap || false;
    this.buttons.inventory.active = this.game.uiState.showInventory || false;
    this.buttons.trade.active = this.game.uiState.showTrading || false;
    this.buttons.diplomacy.active = this.game.uiState.showDiplomacy || false;
    this.buttons.shields.active = this.game.input.shield || false;
    this.buttons.warp.active = this.game.input.warp || false;
  }

  /**
   * Enable/disable mobile controls
   */
  setEnabled(enabled) {
    this.isMobile = enabled;
  }

  /**
   * Get mobile control status
   */
  getStatus() {
    return {
      enabled: this.isMobile,
      joystickActive: this.joystick.active,
      activeButtons: Array.from(this.activeButtons),
      touchCount: this.touches.size
    };
  }
}
