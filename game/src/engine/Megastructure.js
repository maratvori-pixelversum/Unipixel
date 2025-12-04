/**
 * Megastructure System
 * Renders and manages EIGHT types of megastructures:
 * 1. Dyson Sphere Segments - Partial shell around star (energy harvesting)
 * 2. Ring Habitats - Massive rotating rings in orbit (biome exploration)
 * 3. Warp Gates - Instant travel portals between systems
 * 4. Star Lifter (Stellar Engine) - Star mining for exotic fuel
 * 5. Orbital Ring - Massive trading habitat with unique goods
 * 6. Space Cities - Massive orbital cities (thousands of inhabitants)
 * 7. Planet Ring - Artificial ring around a planet
 * 8. Death Star - Massive weapon platform (ONE per galaxy!)
 */

export class Megastructure {
  constructor(type, star, systemData) {
    this.type = type; // 'dyson', 'ring', 'warp_gate', 'star_lifter', 'orbital_ring', 'space_city', 'planet_ring', 'death_star'
    this.star = star;
    this.systemData = systemData;
    this.active = true;
    this.animationPhase = 0;

    // Interaction state
    this.harvestCooldown = 0;
    this.lastHarvestTime = 0;

    // Initialize based on type
    this.initialize();
  }

  initialize() {
    switch (this.type) {
      case 'dyson':
      case 'dyson_sphere':
        this.initializeDysonSphere();
        break;
      case 'ring':
      case 'ring_habitat':
        this.initializeRingHabitat();
        break;
      case 'warp_gate':
        this.initializeWarpGate();
        break;
      case 'star_lifter':
      case 'stellar_engine':
        this.initializeStarLifter();
        break;
      case 'orbital_ring':
        this.initializeOrbitalRing();
        break;
      case 'space_city':
        this.initializeSpaceCity();
        break;
      case 'planet_ring':
        this.initializePlanetRing();
        break;
      case 'death_star':
        this.initializeDeathStar();
        break;
    }
  }

  /**
   * Initialize Dyson Sphere Segments
   * Partial shell around the star (30-60% coverage)
   */
  initializeDysonSphere() {
    this.radius = this.star.radius * 3; // 3x star radius
    this.segments = [];

    // Create 8-12 arc segments
    const segmentCount = Math.floor(8 + Math.random() * 5);
    const coveragePercent = 0.3 + Math.random() * 0.3; // 30-60%

    for (let i = 0; i < segmentCount; i++) {
      const startAngle = (Math.random() * Math.PI * 2);
      const arcLength = (Math.PI * 2 * coveragePercent) / segmentCount;

      this.segments.push({
        startAngle,
        endAngle: startAngle + arcLength,
        thickness: 15 + Math.random() * 10,
        energyFlow: Math.random(), // Animation phase
        color: '#ffaa00',
        glowColor: '#ff6600'
      });
    }

    this.energyCollected = 0;
    this.maxEnergy = 10000;
    this.powerLevel = 0.7 + Math.random() * 0.3; // 70-100%
  }

  /**
   * Initialize Ring Habitat
   * Massive rotating ring structure
   */
  initializeRingHabitat() {
    // Ring orbits at safe distance from star
    const orbitDistance = this.star.radius * 5 + Math.random() * 1000;

    this.x = Math.cos(Math.random() * Math.PI * 2) * orbitDistance;
    this.y = Math.sin(Math.random() * Math.PI * 2) * orbitDistance;
    this.orbitDistance = orbitDistance;
    this.orbitAngle = Math.atan2(this.y, this.x);
    this.orbitSpeed = 0.0001;

    this.outerRadius = 800 + Math.random() * 400; // 800-1200px
    this.innerRadius = this.outerRadius * 0.85;
    this.thickness = this.outerRadius - this.innerRadius;

    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = 0.002; // Visible rotation

    this.spokes = Math.floor(12 + Math.random() * 8); // 12-20 spokes
    this.habitats = Math.floor(20 + Math.random() * 30); // 20-50 habitat sections

    this.population = Math.floor(100000 + Math.random() * 900000);
    this.condition = 0.6 + Math.random() * 0.4; // 60-100% intact
  }

  /**
   * Initialize Warp Gate
   * Portal for instant travel between systems
   * ENHANCED: Ancient, complex ring design with activation mechanics
   */
  initializeWarpGate() {
    // Warp gate at edge of system
    const orbitDistance = 8000 + Math.random() * 2000;

    this.x = Math.cos(Math.random() * Math.PI * 2) * orbitDistance;
    this.y = Math.sin(Math.random() * Math.PI * 2) * orbitDistance;
    this.orbitDistance = orbitDistance;
    this.orbitAngle = Math.atan2(this.y, this.x);
    this.orbitSpeed = 0.00005;

    // ENHANCED: Multi-ring ancient design
    this.outerRingRadius = 350;
    this.middleRingRadius = 280;
    this.innerRingRadius = 210;
    this.portalRadius = 180;

    this.rotation = 0;
    this.rotationSpeed = 0.008;
    this.middleRingRotation = Math.PI / 4;
    this.innerRingRotation = Math.PI / 2;

    // Gate status
    this.isActive = false; // Starts inactive
    this.isPowered = true; // Has power
    this.destinationSystem = null; // Will be set when paired
    this.pairedGateId = null; // ID of connected gate

    // ENHANCED: Activation mechanics
    this.activationProgress = 0; // 0 to 1
    this.activationTime = 5000; // 5 seconds to activate
    this.activating = false;
    this.cooldownTime = 0;
    this.maxCooldown = 10000; // 10 second cooldown after use

    // Visual effects
    this.pulsePhase = 0;
    this.particleCount = 100; // More particles
    this.particles = [];

    for (let i = 0; i < this.particleCount; i++) {
      this.particles.push({
        angle: Math.random() * Math.PI * 2,
        distance: Math.random() * this.portalRadius,
        speed: 0.01 + Math.random() * 0.02,
        size: 1 + Math.random() * 3,
        orbitRadius: 50 + Math.random() * 150
      });
    }

    // ENHANCED: Ancient glyphs/runes on rings
    this.glyphs = [];
    for (let i = 0; i < 12; i++) {
      this.glyphs.push({
        angle: (i / 12) * Math.PI * 2,
        active: false,
        activationDelay: i * 0.1
      });
    }

    // Energy conduits
    this.conduits = [];
    for (let i = 0; i < 8; i++) {
      this.conduits.push({
        angle: (i / 8) * Math.PI * 2,
        energyFlow: Math.random()
      });
    }
  }

  /**
   * Initialize Star Lifter (Stellar Engine)
   * Massive structure that mines star material for exotic fuel
   */
  initializeStarLifter() {
    // Positioned near the star's corona
    const starRadius = this.star.radius;
    const orbitDistance = starRadius * 2.5 + Math.random() * 500;

    this.x = Math.cos(Math.random() * Math.PI * 2) * orbitDistance;
    this.y = Math.sin(Math.random() * Math.PI * 2) * orbitDistance;
    this.orbitDistance = orbitDistance;
    this.orbitAngle = Math.atan2(this.y, this.x);
    this.orbitSpeed = 0.00008;

    this.width = 300;
    this.height = 600;
    this.rotation = this.orbitAngle + Math.PI / 2;

    // Mining arrays (solar collectors)
    this.miningArrays = [];
    for (let i = 0; i < 6; i++) {
      this.miningArrays.push({
        angle: (i / 6) * Math.PI * 2,
        extension: 0.5 + Math.random() * 0.5,
        glowPhase: Math.random()
      });
    }

    // Fuel collection stats
    this.fuelCollected = 0;
    this.maxFuel = 1000;
    this.collectionRate = 0.8 + Math.random() * 0.2; // 80-100% efficiency
    this.fuelType = 'Stellar Plasma';

    // Magnetic containment fields
    this.fieldStrength = 0.7 + Math.random() * 0.3;
    this.beamActive = true;
  }

  /**
   * Initialize Orbital Ring
   * Massive trading habitat encircling a planet or star
   */
  initializeOrbitalRing() {
    // Orbits at moderate distance
    const orbitDistance = this.star.radius * 4 + Math.random() * 2000;

    this.x = Math.cos(Math.random() * Math.PI * 2) * orbitDistance;
    this.y = Math.sin(Math.random() * Math.PI * 2) * orbitDistance;
    this.orbitDistance = orbitDistance;
    this.orbitAngle = Math.atan2(this.y, this.x);
    this.orbitSpeed = 0.00007;

    this.outerRadius = 600 + Math.random() * 300;
    this.innerRadius = this.outerRadius * 0.9;
    this.thickness = this.outerRadius - this.innerRadius;

    // Trading stations along the ring
    this.tradingPorts = [];
    const portCount = 8 + Math.floor(Math.random() * 8); // 8-16 ports
    for (let i = 0; i < portCount; i++) {
      this.tradingPorts.push({
        angle: (i / portCount) * Math.PI * 2,
        size: 20 + Math.random() * 15,
        type: Math.random() > 0.5 ? 'market' : 'depot',
        active: Math.random() > 0.2, // 80% active
        glowPhase: Math.random()
      });
    }

    // Unique trade goods available here
    this.tradeGoods = this.generateUniqueGoods();
    this.marketPrice = 0.8 + Math.random() * 0.4; // 0.8x - 1.2x standard prices
    this.reputation = 50 + Math.floor(Math.random() * 50); // 50-100 reputation
  }

  /**
   * Generate unique trade goods for orbital ring
   */
  generateUniqueGoods() {
    const goodsPool = [
      { name: 'Exotic Spices', rarity: 0.7, value: 500 },
      { name: 'Alien Artifacts', rarity: 0.9, value: 2000 },
      { name: 'Quantum Processors', rarity: 0.8, value: 1500 },
      { name: 'Terraforming Nano-Machines', rarity: 0.85, value: 1800 },
      { name: 'Bio-Engineered Seeds', rarity: 0.6, value: 300 },
      { name: 'Antimatter Containment Units', rarity: 0.95, value: 5000 },
      { name: 'Crystalline Data Cores', rarity: 0.75, value: 800 },
      { name: 'Hyperspace Navigational Charts', rarity: 0.65, value: 400 }
    ];

    // Select 3-5 random goods
    const count = 3 + Math.floor(Math.random() * 3);
    const selected = [];
    const available = [...goodsPool];

    for (let i = 0; i < count && available.length > 0; i++) {
      const index = Math.floor(Math.random() * available.length);
      selected.push(available[index]);
      available.splice(index, 1);
    }

    return selected;
  }

  /**
   * Update megastructure state
   */
  update(dt) {
    this.animationPhase += dt * 0.001;

    // Update cooldowns
    if (this.harvestCooldown > 0) {
      this.harvestCooldown -= dt;
    }

    switch (this.type) {
      case 'dyson':
      case 'dyson_sphere':
        this.updateDysonSphere(dt);
        break;
      case 'ring':
      case 'ring_habitat':
        this.updateRingHabitat(dt);
        break;
      case 'warp_gate':
        this.updateWarpGate(dt);
        break;
      case 'star_lifter':
      case 'stellar_engine':
        this.updateStarLifter(dt);
        break;
      case 'orbital_ring':
        this.updateOrbitalRing(dt);
        break;
      case 'space_city':
        this.updateSpaceCity(dt);
        break;
      case 'planet_ring':
        this.updatePlanetRing(dt);
        break;
      case 'death_star':
        this.updateDeathStar(dt);
        break;
    }
  }

  updateDysonSphere(dt) {
    // Update energy flow animation
    for (const segment of this.segments) {
      segment.energyFlow += dt * 0.001;
      if (segment.energyFlow > 1) segment.energyFlow = 0;
    }

    // Collect energy from star
    this.energyCollected = Math.min(
      this.energyCollected + dt * this.powerLevel,
      this.maxEnergy
    );
  }

  updateRingHabitat(dt) {
    // Orbit around star
    this.orbitAngle += this.orbitSpeed * dt;
    this.x = Math.cos(this.orbitAngle) * this.orbitDistance;
    this.y = Math.sin(this.orbitAngle) * this.orbitDistance;

    // Rotate ring
    this.rotation += this.rotationSpeed * dt;
    if (this.rotation > Math.PI * 2) this.rotation -= Math.PI * 2;
  }

  updateWarpGate(dt) {
    // Orbit slowly
    this.orbitAngle += this.orbitSpeed * dt;
    this.x = Math.cos(this.orbitAngle) * this.orbitDistance;
    this.y = Math.sin(this.orbitAngle) * this.orbitDistance;

    // ENHANCED: Counter-rotating rings for ancient mechanism effect
    this.rotation += this.rotationSpeed * dt;
    if (this.rotation > Math.PI * 2) this.rotation -= Math.PI * 2;

    this.middleRingRotation -= this.rotationSpeed * 0.7 * dt;
    if (this.middleRingRotation < 0) this.middleRingRotation += Math.PI * 2;

    this.innerRingRotation += this.rotationSpeed * 1.5 * dt;
    if (this.innerRingRotation > Math.PI * 2) this.innerRingRotation -= Math.PI * 2;

    // Update cooldown
    if (this.cooldownTime > 0) {
      this.cooldownTime -= dt;
    }

    // ENHANCED: Activation sequence
    if (this.activating) {
      this.activationProgress += dt / this.activationTime;
      if (this.activationProgress >= 1) {
        this.activationProgress = 1;
        this.isActive = true;
        this.activating = false;
      }

      // Activate glyphs sequentially
      for (const glyph of this.glyphs) {
        if (this.activationProgress >= glyph.activationDelay && this.activationProgress < glyph.activationDelay + 0.15) {
          glyph.active = true;
        }
      }
    }

    // Update portal pulse
    this.pulsePhase += dt * 0.002;
    if (this.pulsePhase > 1) this.pulsePhase = 0;

    // Update particles (faster when active)
    const particleSpeed = this.isActive ? 1.5 : 0.5;
    for (const particle of this.particles) {
      particle.angle += particle.speed * dt * 0.001 * particleSpeed;
      if (particle.angle > Math.PI * 2) particle.angle -= Math.PI * 2;
    }

    // Update energy conduits
    for (const conduit of this.conduits) {
      conduit.energyFlow += dt * 0.003;
      if (conduit.energyFlow > 1) conduit.energyFlow = 0;
    }
  }

  /**
   * Activate warp gate (called when player approaches)
   */
  activateGate() {
    if (!this.isPowered || this.isActive || this.activating || this.cooldownTime > 0) {
      return false;
    }

    this.activating = true;
    this.activationProgress = 0;
    return true;
  }

  /**
   * Deactivate gate after use
   */
  deactivateGate() {
    this.isActive = false;
    this.activating = false;
    this.activationProgress = 0;
    this.cooldownTime = this.maxCooldown;

    // Reset glyphs
    for (const glyph of this.glyphs) {
      glyph.active = false;
    }
  }

  updateStarLifter(dt) {
    // Orbit around star
    this.orbitAngle += this.orbitSpeed * dt;
    this.x = Math.cos(this.orbitAngle) * this.orbitDistance;
    this.y = Math.sin(this.orbitAngle) * this.orbitDistance;
    this.rotation = this.orbitAngle + Math.PI / 2;

    // Update mining array animations
    for (const array of this.miningArrays) {
      array.glowPhase += dt * 0.002;
      if (array.glowPhase > 1) array.glowPhase = 0;
    }

    // Collect fuel from star
    if (this.beamActive) {
      this.fuelCollected = Math.min(
        this.fuelCollected + dt * this.collectionRate * 0.1,
        this.maxFuel
      );
    }
  }

  updateOrbitalRing(dt) {
    // Orbit around star
    this.orbitAngle += this.orbitSpeed * dt;
    this.x = Math.cos(this.orbitAngle) * this.orbitDistance;
    this.y = Math.sin(this.orbitAngle) * this.orbitDistance;

    // Update trading port animations
    for (const port of this.tradingPorts) {
      if (port.active) {
        port.glowPhase += dt * 0.003;
        if (port.glowPhase > 1) port.glowPhase = 0;
      }
    }
  }

  /**
   * Render megastructure
   */
  render(ctx, camera) {
    ctx.save();

    switch (this.type) {
      case 'dyson':
      case 'dyson_sphere':
        this.renderDysonSphere(ctx, camera);
        break;
      case 'ring':
      case 'ring_habitat':
        this.renderRingHabitat(ctx, camera);
        break;
      case 'warp_gate':
        this.renderWarpGate(ctx, camera);
        break;
      case 'star_lifter':
      case 'stellar_engine':
        this.renderStarLifter(ctx, camera);
        break;
      case 'orbital_ring':
        this.renderOrbitalRing(ctx, camera);
        break;
      case 'space_city':
        this.renderSpaceCity(ctx, camera);
        break;
      case 'planet_ring':
        this.renderPlanetRing(ctx, camera);
        break;
      case 'death_star':
        this.renderDeathStar(ctx, camera);
        break;
    }

    ctx.restore();
  }

  renderDysonSphere(ctx, camera) {
    // Dyson sphere is centered on the star (0, 0)
    const screenX = camera.width / 2;
    const screenY = camera.height / 2;

    // Draw segments
    for (const segment of this.segments) {
      // Outer arc
      ctx.strokeStyle = segment.color;
      ctx.lineWidth = segment.thickness;
      ctx.globalAlpha = 0.3;
      ctx.beginPath();
      ctx.arc(screenX, screenY, this.radius, segment.startAngle, segment.endAngle);
      ctx.stroke();

      // Energy flow glow
      ctx.strokeStyle = segment.glowColor;
      ctx.lineWidth = segment.thickness * 0.5;
      ctx.globalAlpha = 0.2 + segment.energyFlow * 0.3;
      ctx.beginPath();
      ctx.arc(screenX, screenY, this.radius, segment.startAngle, segment.endAngle);
      ctx.stroke();

      // Inner structural line
      ctx.strokeStyle = '#886600';
      ctx.lineWidth = 3;
      ctx.globalAlpha = 0.5;
      ctx.beginPath();
      ctx.arc(screenX, screenY, this.radius - segment.thickness / 2,
              segment.startAngle, segment.endAngle);
      ctx.stroke();

      // Support beams (radial lines)
      const beamCount = 8;
      for (let i = 0; i <= beamCount; i++) {
        const angle = segment.startAngle +
                     (segment.endAngle - segment.startAngle) * (i / beamCount);
        const innerR = this.radius - segment.thickness;
        const outerR = this.radius;

        ctx.strokeStyle = '#664400';
        ctx.lineWidth = 2;
        ctx.globalAlpha = 0.4;
        ctx.beginPath();
        ctx.moveTo(
          screenX + Math.cos(angle) * innerR,
          screenY + Math.sin(angle) * innerR
        );
        ctx.lineTo(
          screenX + Math.cos(angle) * outerR,
          screenY + Math.sin(angle) * outerR
        );
        ctx.stroke();
      }
    }

    ctx.globalAlpha = 1;
  }

  renderRingHabitat(ctx, camera) {
    const screenX = camera.width / 2 + (this.x - camera.x);
    const screenY = camera.height / 2 + (this.y - camera.y);

    ctx.save();
    ctx.translate(screenX, screenY);
    ctx.rotate(this.rotation);

    // Outer ring structure
    ctx.strokeStyle = '#557788';
    ctx.lineWidth = this.thickness;
    ctx.globalAlpha = 0.8;
    ctx.beginPath();
    ctx.arc(0, 0, (this.outerRadius + this.innerRadius) / 2, 0, Math.PI * 2);
    ctx.stroke();

    // Inner habitat band (where people live)
    ctx.strokeStyle = '#88aacc';
    ctx.lineWidth = this.thickness * 0.7;
    ctx.globalAlpha = 0.6;
    ctx.beginPath();
    ctx.arc(0, 0, (this.outerRadius + this.innerRadius) / 2, 0, Math.PI * 2);
    ctx.stroke();

    // Spokes (structural supports)
    ctx.strokeStyle = '#335566';
    ctx.lineWidth = 4;
    ctx.globalAlpha = 0.7;
    for (let i = 0; i < this.spokes; i++) {
      const angle = (i / this.spokes) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(0, 0); // Center hub
      ctx.lineTo(
        Math.cos(angle) * this.innerRadius,
        Math.sin(angle) * this.innerRadius
      );
      ctx.stroke();
    }

    // Habitat sections (lit windows)
    ctx.globalAlpha = 1;
    for (let i = 0; i < this.habitats; i++) {
      const angle = (i / this.habitats) * Math.PI * 2;
      const radius = (this.outerRadius + this.innerRadius) / 2;

      // Occasional lit windows (yellow)
      if (Math.random() < this.condition) {
        ctx.fillStyle = Math.random() > 0.3 ? '#ffff88' : '#ff8800';
        ctx.fillRect(
          Math.cos(angle) * radius - 3,
          Math.sin(angle) * radius - 3,
          6, 6
        );
      }
    }

    // Central hub
    ctx.fillStyle = '#446688';
    ctx.globalAlpha = 0.9;
    ctx.beginPath();
    ctx.arc(0, 0, 30, 0, Math.PI * 2);
    ctx.fill();

    // Hub glow
    const hubGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, 60);
    hubGradient.addColorStop(0, '#6688aa');
    hubGradient.addColorStop(1, 'transparent');
    ctx.fillStyle = hubGradient;
    ctx.globalAlpha = 0.4;
    ctx.beginPath();
    ctx.arc(0, 0, 60, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  renderWarpGate(ctx, camera) {
    const screenX = camera.width / 2 + (this.x - camera.x);
    const screenY = camera.height / 2 + (this.y - camera.y);

    ctx.save();
    ctx.translate(screenX, screenY);

    // ENHANCED: Portal energy field (active/activating)
    if (this.isActive || this.activating) {
      const portalAlpha = this.activating ? this.activationProgress : 1.0;

      // Outer energy corona
      const pulseSize = this.portalRadius * (0.9 + this.pulsePhase * 0.3);
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, pulseSize);
      gradient.addColorStop(0, `rgba(100, 200, 255, ${0.4 * portalAlpha})`);
      gradient.addColorStop(0.4, `rgba(150, 100, 255, ${0.3 * portalAlpha})`);
      gradient.addColorStop(0.7, `rgba(200, 150, 255, ${0.2 * portalAlpha})`);
      gradient.addColorStop(1, 'transparent');

      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, pulseSize, 0, Math.PI * 2);
      ctx.fill();

      // Swirling portal particles (heavily pixelated)
      for (const particle of this.particles) {
        const spiralFactor = this.activating ? this.activationProgress : 1.0;
        const radius = particle.orbitRadius * spiralFactor;
        const x = Math.cos(particle.angle) * radius;
        const y = Math.sin(particle.angle) * radius;

        ctx.fillStyle = this.isActive ? '#ccddff' : '#8899ff';
        ctx.globalAlpha = 0.7 * portalAlpha;
        ctx.fillRect(x - particle.size, y - particle.size, particle.size * 2, particle.size * 2);
      }

      // Inner vortex (when fully active)
      if (this.isActive) {
        const vortexGrad = ctx.createRadialGradient(0, 0, 0, 0, 0, this.portalRadius * 0.6);
        vortexGrad.addColorStop(0, 'rgba(255, 255, 255, 0.8)');
        vortexGrad.addColorStop(0.5, 'rgba(150, 200, 255, 0.4)');
        vortexGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = vortexGrad;
        ctx.beginPath();
        ctx.arc(0, 0, this.portalRadius * 0.6, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    ctx.globalAlpha = 1;

    // ENHANCED: Outer ring (ancient stone-like appearance, heavily pixelated)
    ctx.save();
    ctx.rotate(this.rotation);

    const ringColor = this.isPowered ? '#4a5a6a' : '#2a2a2a';
    ctx.strokeStyle = ringColor;
    ctx.lineWidth = 25;
    ctx.beginPath();
    ctx.arc(0, 0, this.outerRingRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Outer ring detail panels (heavily pixelated)
    ctx.fillStyle = '#3a4a5a';
    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const x = Math.cos(angle) * this.outerRingRadius;
      const y = Math.sin(angle) * this.outerRingRadius;
      ctx.fillRect(x - 8, y - 12, 16, 24);
    }

    // Ancient glyphs on outer ring
    for (let i = 0; i < this.glyphs.length; i++) {
      const glyph = this.glyphs[i];
      const x = Math.cos(glyph.angle) * this.outerRingRadius;
      const y = Math.sin(glyph.angle) * this.outerRingRadius;

      // Glyph base (stone carving)
      ctx.fillStyle = '#2a3a4a';
      ctx.fillRect(x - 10, y - 10, 20, 20);

      // Glyph symbol (lit when active)
      if (glyph.active || (this.activating && this.activationProgress >= glyph.activationDelay)) {
        ctx.fillStyle = '#00ffff';
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 8;

        // Draw ancient symbol (pixelated rune)
        ctx.fillRect(x - 6, y - 6, 4, 12);
        ctx.fillRect(x + 2, y - 6, 4, 12);
        ctx.fillRect(x - 6, y - 2, 12, 4);

        ctx.shadowBlur = 0;
      }
    }

    ctx.restore();

    // ENHANCED: Middle ring (counter-rotating, heavily pixelated)
    ctx.save();
    ctx.rotate(this.middleRingRotation);

    ctx.strokeStyle = this.isPowered ? '#5a6a7a' : '#3a3a3a';
    ctx.lineWidth = 18;
    ctx.beginPath();
    ctx.arc(0, 0, this.middleRingRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Middle ring segments (geometric patterns)
    ctx.fillStyle = '#4a5a6a';
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2;
      const x = Math.cos(angle) * this.middleRingRadius;
      const y = Math.sin(angle) * this.middleRingRadius;
      ctx.fillRect(x - 6, y - 10, 12, 20);
    }

    ctx.restore();

    // ENHANCED: Inner ring (fastest rotation, heavily pixelated)
    ctx.save();
    ctx.rotate(this.innerRingRotation);

    ctx.strokeStyle = this.isPowered ? '#6a7a8a' : '#4a4a4a';
    ctx.lineWidth = 12;
    ctx.beginPath();
    ctx.arc(0, 0, this.innerRingRadius, 0, Math.PI * 2);
    ctx.stroke();

    // Inner ring detail segments
    ctx.fillStyle = '#5a6a7a';
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const x = Math.cos(angle) * this.innerRingRadius;
      const y = Math.sin(angle) * this.innerRingRadius;
      ctx.fillRect(x - 5, y - 8, 10, 16);
    }

    ctx.restore();

    // ENHANCED: Energy conduits (connecting rings)
    for (const conduit of this.conduits) {
      const flowAlpha = this.isPowered ? Math.sin(conduit.energyFlow * Math.PI * 2) * 0.3 + 0.5 : 0.2;

      ctx.strokeStyle = this.isActive ? `rgba(0, 200, 255, ${flowAlpha})` : `rgba(100, 150, 200, ${flowAlpha * 0.5})`;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(Math.cos(conduit.angle) * this.innerRingRadius, Math.sin(conduit.angle) * this.innerRingRadius);
      ctx.lineTo(Math.cos(conduit.angle) * this.outerRingRadius, Math.sin(conduit.angle) * this.outerRingRadius);
      ctx.stroke();

      // Energy pulses along conduits
      if (this.isPowered && conduit.energyFlow < 0.8) {
        const pulsePos = this.innerRingRadius + (this.outerRingRadius - this.innerRingRadius) * conduit.energyFlow;
        ctx.fillStyle = this.isActive ? '#00ffff' : '#4488ff';
        ctx.shadowColor = this.isActive ? '#00ffff' : '#4488ff';
        ctx.shadowBlur = 6;
        ctx.fillRect(
          Math.cos(conduit.angle) * pulsePos - 3,
          Math.sin(conduit.angle) * pulsePos - 3,
          6, 6
        );
        ctx.shadowBlur = 0;
      }
    }

    // ENHANCED: Central hub structures (ancient pillars)
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2;
      const hubRadius = 40;
      const x = Math.cos(angle) * hubRadius;
      const y = Math.sin(angle) * hubRadius;

      ctx.fillStyle = '#3a4a5a';
      ctx.fillRect(x - 8, y - 12, 16, 24);

      // Hub lights (when powered)
      if (this.isPowered) {
        ctx.fillStyle = this.isActive ? '#00ffff' : '#4488ff';
        ctx.fillRect(x - 3, y - 4, 6, 8);
      }
    }

    // Activation progress indicator (ring)
    if (this.activating) {
      ctx.strokeStyle = '#00ffff';
      ctx.lineWidth = 4;
      ctx.globalAlpha = 0.8;
      ctx.beginPath();
      ctx.arc(0, 0, this.outerRingRadius + 30, 0, this.activationProgress * Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  renderStarLifter(ctx, camera) {
    const screenX = camera.width / 2 + (this.x - camera.x);
    const screenY = camera.height / 2 + (this.y - camera.y);

    ctx.save();
    ctx.translate(screenX, screenY);
    ctx.rotate(this.rotation);

    // Main body (vertical structure)
    ctx.fillStyle = '#667788';
    ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);

    // Mining arrays (extending toward star)
    for (const array of this.miningArrays) {
      const angle = array.angle;
      const extend = array.extension * 200;

      ctx.strokeStyle = '#ff8844';
      ctx.lineWidth = 8;
      ctx.globalAlpha = 0.3 + array.glowPhase * 0.3;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * extend, Math.sin(angle) * extend);
      ctx.stroke();

      // Array collectors
      ctx.fillStyle = '#ffaa44';
      ctx.globalAlpha = 0.6 + array.glowPhase * 0.4;
      ctx.fillRect(
        Math.cos(angle) * extend - 15,
        Math.sin(angle) * extend - 15,
        30, 30
      );
    }

    // Collection beam (toward star)
    if (this.beamActive) {
      ctx.strokeStyle = '#ff6600';
      ctx.lineWidth = 20;
      ctx.globalAlpha = 0.2;
      ctx.beginPath();
      ctx.moveTo(0, this.height / 2);
      ctx.lineTo(0, this.height / 2 + 500);
      ctx.stroke();

      // Beam glow
      ctx.strokeStyle = '#ffaa00';
      ctx.lineWidth = 10;
      ctx.globalAlpha = 0.4 + Math.sin(this.animationPhase * 3) * 0.2;
      ctx.stroke();
    }

    // Containment fields
    ctx.strokeStyle = '#00ffff';
    ctx.lineWidth = 3;
    ctx.globalAlpha = 0.5;
    ctx.strokeRect(-this.width / 2 - 20, -this.height / 2 - 20,
                   this.width + 40, this.height + 40);

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  renderOrbitalRing(ctx, camera) {
    const screenX = camera.width / 2 + (this.x - camera.x);
    const screenY = camera.height / 2 + (this.y - camera.y);

    ctx.save();
    ctx.translate(screenX, screenY);

    // Main ring structure
    ctx.strokeStyle = '#668899';
    ctx.lineWidth = this.thickness;
    ctx.globalAlpha = 0.7;
    ctx.beginPath();
    ctx.arc(0, 0, (this.outerRadius + this.innerRadius) / 2, 0, Math.PI * 2);
    ctx.stroke();

    // Trading ports along ring
    for (const port of this.tradingPorts) {
      const radius = (this.outerRadius + this.innerRadius) / 2;
      const x = Math.cos(port.angle) * radius;
      const y = Math.sin(port.angle) * radius;

      if (port.active) {
        // Port glow
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, port.size * 2);
        gradient.addColorStop(0, port.type === 'market' ? '#ffdd00' : '#00ddff');
        gradient.addColorStop(1, 'transparent');
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.3 + port.glowPhase * 0.3;
        ctx.beginPath();
        ctx.arc(x, y, port.size * 2, 0, Math.PI * 2);
        ctx.fill();

        // Port structure
        ctx.fillStyle = port.type === 'market' ? '#ffaa00' : '#0088ff';
        ctx.globalAlpha = 0.9;
        ctx.fillRect(x - port.size / 2, y - port.size / 2, port.size, port.size);
      } else {
        // Inactive port
        ctx.fillStyle = '#555555';
        ctx.globalAlpha = 0.5;
        ctx.fillRect(x - port.size / 2, y - port.size / 2, port.size, port.size);
      }
    }

    // Ring lights
    ctx.globalAlpha = 0.8;
    const lightCount = 40;
    for (let i = 0; i < lightCount; i++) {
      const angle = (i / lightCount) * Math.PI * 2;
      const radius = (this.outerRadius + this.innerRadius) / 2;
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;

      ctx.fillStyle = Math.random() > 0.3 ? '#88aaff' : '#ffaa88';
      ctx.fillRect(x - 2, y - 2, 4, 4);
    }

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  /**
   * Check if ship is near megastructure (for interaction)
   */
  isShipNear(ship, distance = 500) {
    if (this.type === 'dyson' || this.type === 'dyson_sphere') {
      // Check distance from star center
      const dx = ship.x;
      const dy = ship.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return Math.abs(dist - this.radius) < distance;
    } else {
      // Other types have positions
      const dx = ship.x - this.x;
      const dy = ship.y - this.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      return dist < distance;
    }
  }

  /**
   * Harvest energy from Dyson Sphere
   */
  harvestEnergy(player) {
    if (this.harvestCooldown > 0) {
      return { success: false, message: `Cooldown: ${Math.ceil(this.harvestCooldown / 1000)}s remaining` };
    }

    const harvestAmount = Math.floor(500 + Math.random() * 500); // 500-1000 energy
    this.harvestCooldown = 30000; // 30 second cooldown

    return {
      success: true,
      resource: 'Solar Energy',
      amount: harvestAmount,
      message: `Harvested ${harvestAmount} units of Solar Energy!`
    };
  }

  /**
   * Collect fuel from Star Lifter
   */
  collectFuel(player) {
    if (this.harvestCooldown > 0) {
      return { success: false, message: `Cooldown: ${Math.ceil(this.harvestCooldown / 1000)}s remaining` };
    }

    const fuelAmount = Math.floor(100 + Math.random() * 200); // 100-300 fuel
    this.harvestCooldown = 45000; // 45 second cooldown

    return {
      success: true,
      resource: this.fuelType,
      amount: fuelAmount,
      message: `Collected ${fuelAmount} units of ${this.fuelType}!`
    };
  }

  /**
   * Explore Ring Habitat biome
   */
  exploreBiome(player) {
    if (this.harvestCooldown > 0) {
      return { success: false, message: `Cooldown: ${Math.ceil(this.harvestCooldown / 1000)}s remaining` };
    }

    const biomes = [
      { name: 'Agricultural Sector', resource: 'Bio-Matter', amount: [200, 400] },
      { name: 'Industrial Zone', resource: 'Rare Metals', amount: [100, 250] },
      { name: 'Residential District', resource: 'Trade Goods', amount: [150, 300] },
      { name: 'Research Labs', resource: 'Technology', amount: [50, 150] },
      { name: 'Hydroponic Gardens', resource: 'Organic Compounds', amount: [300, 500] }
    ];

    const biome = biomes[Math.floor(Math.random() * biomes.length)];
    const amount = Math.floor(biome.amount[0] + Math.random() * (biome.amount[1] - biome.amount[0]));
    this.harvestCooldown = 60000; // 60 second cooldown

    return {
      success: true,
      biome: biome.name,
      resource: biome.resource,
      amount: amount,
      message: `Explored ${biome.name}: Found ${amount} units of ${biome.resource}!`
    };
  }

  /**
   * Trade at Orbital Ring
   */
  tradeAtPort(player) {
    const availableGoods = this.tradeGoods.filter(g => Math.random() < g.rarity);

    if (availableGoods.length === 0) {
      return { success: false, message: 'No rare goods available at this time.' };
    }

    return {
      success: true,
      goods: availableGoods,
      priceModifier: this.marketPrice,
      message: `${availableGoods.length} unique items available for trade!`
    };
  }

  /**
   * Initialize Space City - Massive orbital metropolis
   */
  initializeSpaceCity() {
    // Position in stable orbit
    const orbitDistance = this.star.radius * 6 + Math.random() * 3000;

    this.x = Math.cos(Math.random() * Math.PI * 2) * orbitDistance;
    this.y = Math.sin(Math.random() * Math.PI * 2) * orbitDistance;
    this.orbitDistance = orbitDistance;
    this.orbitAngle = Math.atan2(this.y, this.x);
    this.orbitSpeed = 0.00006;

    this.radius = 1000 + Math.random() * 500; // 1000-1500px diameter
    this.population = Math.floor(5000000 + Math.random() * 15000000); // 5-20 million

    // City structure
    this.districts = [];
    const districtCount = 12 + Math.floor(Math.random() * 8); // 12-20 districts
    for (let i = 0; i < districtCount; i++) {
      this.districts.push({
        angle: (i / districtCount) * Math.PI * 2,
        distance: 300 + Math.random() * 700,
        size: 100 + Math.random() * 200,
        type: ['residential', 'commercial', 'industrial', 'governmental'][Math.floor(Math.random() * 4)],
        lights: Math.random(),
        height: 50 + Math.random() * 150
      });
    }

    // Docking ports
    this.dockingPorts = 20 + Math.floor(Math.random() * 20); // 20-40 ports
    this.traffic = 0.6 + Math.random() * 0.4; // 60-100% traffic activity

    this.rotation = Math.random() * Math.PI * 2;
    this.rotationSpeed = 0.001;
  }

  /**
   * Initialize Planet Ring - Artificial ring around a planet
   */
  initializePlanetRing() {
    // Position around a planet (if available in system)
    const orbitDistance = this.star.radius * 4 + Math.random() * 2000;

    this.x = Math.cos(Math.random() * Math.PI * 2) * orbitDistance;
    this.y = Math.sin(Math.random() * Math.PI * 2) * orbitDistance;
    this.orbitDistance = orbitDistance;
    this.orbitAngle = Math.atan2(this.y, this.x);
    this.orbitSpeed = 0.00009;

    // Ring dimensions (around a planet)
    this.innerRadius = 500 + Math.random() * 200;
    this.outerRadius = this.innerRadius + 200 + Math.random() * 300;
    this.thickness = this.outerRadius - this.innerRadius;

    // Ring segments (not continuous - debris/habitat sections)
    this.segments = [];
    const segmentCount = 30 + Math.floor(Math.random() * 30); // 30-60 segments
    for (let i = 0; i < segmentCount; i++) {
      const startAngle = Math.random() * Math.PI * 2;
      const arcLength = 0.05 + Math.random() * 0.15; // 5-15 degrees each

      this.segments.push({
        startAngle,
        endAngle: startAngle + arcLength,
        radius: this.innerRadius + Math.random() * this.thickness,
        type: Math.random() > 0.5 ? 'habitat' : 'debris',
        lights: Math.random()
      });
    }

    this.rotation = 0;
    this.rotationSpeed = 0.003;
  }

  /**
   * Initialize Death Star - Massive weapon platform (UNIQUE!)
   */
  initializeDeathStar() {
    // Position in deep space
    const orbitDistance = this.star.radius * 10 + Math.random() * 5000;

    this.x = Math.cos(Math.random() * Math.PI * 2) * orbitDistance;
    this.y = Math.sin(Math.random() * Math.PI * 2) * orbitDistance;
    this.orbitDistance = orbitDistance;
    this.orbitAngle = Math.atan2(this.y, this.x);
    this.orbitSpeed = 0.00003;

    this.radius = 800; // Massive spherical station

    // Superlaser (main weapon)
    this.superlaserCharge = 0;
    this.superlaserMaxCharge = 100;
    this.superlaserReady = false;

    // Surface features
    this.surfacePanels = [];
    for (let i = 0; i < 100; i++) {
      this.surfacePanels.push({
        x: (Math.random() - 0.5) * 2,
        y: (Math.random() - 0.5) * 2,
        size: 20 + Math.random() * 40,
        type: ['panel', 'trench', 'tower', 'hanger'][Math.floor(Math.random() * 4)]
      });
    }

    // Equatorial trench
    this.trenchWidth = 60;

    // Superlaser dish (iconic concave dish)
    this.dishRotation = 0;

    this.rotation = 0;
    this.rotationSpeed = 0.0005;

    this.weaponActive = false;
  }

  updateSpaceCity(dt) {
    // Orbit around star
    this.orbitAngle += this.orbitSpeed * dt;
    this.x = Math.cos(this.orbitAngle) * this.orbitDistance;
    this.y = Math.sin(this.orbitAngle) * this.orbitDistance;

    // Rotate city
    this.rotation += this.rotationSpeed * dt;
    if (this.rotation > Math.PI * 2) this.rotation -= Math.PI * 2;

    // Update district lights
    for (const district of this.districts) {
      district.lights += dt * 0.002;
      if (district.lights > 1) district.lights = 0;
    }
  }

  updatePlanetRing(dt) {
    // Orbit around star
    this.orbitAngle += this.orbitSpeed * dt;
    this.x = Math.cos(this.orbitAngle) * this.orbitDistance;
    this.y = Math.sin(this.orbitAngle) * this.orbitDistance;

    // Rotate ring
    this.rotation += this.rotationSpeed * dt;
    if (this.rotation > Math.PI * 2) this.rotation -= Math.PI * 2;
  }

  updateDeathStar(dt) {
    // Orbit slowly
    this.orbitAngle += this.orbitSpeed * dt;
    this.x = Math.cos(this.orbitAngle) * this.orbitDistance;
    this.y = Math.sin(this.orbitAngle) * this.orbitDistance;

    // Rotate Death Star
    this.rotation += this.rotationSpeed * dt;
    if (this.rotation > Math.PI * 2) this.rotation -= Math.PI * 2;

    // Charge superlaser
    if (this.superlaserCharge < this.superlaserMaxCharge) {
      this.superlaserCharge += dt * 0.1;
    } else {
      this.superlaserReady = true;
    }

    // Update dish rotation (targeting)
    this.dishRotation += dt * 0.0003;
    if (this.dishRotation > Math.PI * 2) this.dishRotation -= Math.PI * 2;
  }

  renderSpaceCity(ctx, camera) {
    const screenX = camera.width / 2 + (this.x - camera.x);
    const screenY = camera.height / 2 + (this.y - camera.y);

    ctx.save();
    ctx.translate(screenX, screenY);
    ctx.rotate(this.rotation);

    // Central core (massive sphere)
    ctx.fillStyle = '#334455';
    ctx.beginPath();
    ctx.arc(0, 0, 150, 0, Math.PI * 2);
    ctx.fill();

    // Core details (panels)
    ctx.fillStyle = '#445566';
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const x = Math.cos(angle) * 120;
      const y = Math.sin(angle) * 120;
      ctx.fillRect(x - 20, y - 25, 40, 50);
    }

    // Districts (extending outward)
    for (const district of this.districts) {
      const dx = Math.cos(district.angle) * district.distance;
      const dy = Math.sin(district.angle) * district.distance;

      // District building (heavily pixelated tower)
      let districtColor = '#445566';
      if (district.type === 'residential') districtColor = '#554466';
      if (district.type === 'commercial') districtColor = '#664455';
      if (district.type === 'industrial') districtColor = '#554455';
      if (district.type === 'governmental') districtColor = '#555566';

      ctx.fillStyle = districtColor;
      ctx.fillRect(dx - district.size / 2, dy - district.height / 2, district.size, district.height);

      // Pixelated windows (heavily pixelated)
      ctx.fillStyle = '#ffff88';
      const windowSize = 4;
      for (let wx = 0; wx < district.size; wx += 8) {
        for (let wy = 0; wy < district.height; wy += 8) {
          if (Math.random() > 0.3) { // 70% windows lit
            ctx.fillRect(dx - district.size / 2 + wx + 2, dy - district.height / 2 + wy + 2, windowSize, windowSize);
          }
        }
      }

      // Connection spokes
      ctx.strokeStyle = '#223344';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(dx, dy);
      ctx.stroke();
    }

    // Docking ring
    ctx.strokeStyle = '#556677';
    ctx.lineWidth = 20;
    ctx.beginPath();
    ctx.arc(0, 0, 250, 0, Math.PI * 2);
    ctx.stroke();

    // Docking ports (blinking lights)
    for (let i = 0; i < this.dockingPorts; i++) {
      const angle = (i / this.dockingPorts) * Math.PI * 2;
      const isActive = Math.random() < this.traffic;
      ctx.fillStyle = isActive ? '#00ff00' : '#003300';
      ctx.fillRect(
        Math.cos(angle) * 250 - 4,
        Math.sin(angle) * 250 - 4,
        8, 8
      );
    }

    // City beacon (center)
    ctx.fillStyle = '#ffaa00';
    ctx.shadowColor = '#ffaa00';
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(0, 0, 20, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  renderPlanetRing(ctx, camera) {
    const screenX = camera.width / 2 + (this.x - camera.x);
    const screenY = camera.height / 2 + (this.y - camera.y);

    ctx.save();
    ctx.translate(screenX, screenY);
    ctx.rotate(this.rotation);

    // Render ring segments
    for (const segment of this.segments) {
      if (segment.type === 'habitat') {
        // Habitat section (metallic)
        ctx.strokeStyle = '#556677';
        ctx.lineWidth = 15;
        ctx.globalAlpha = 0.9;
        ctx.beginPath();
        ctx.arc(0, 0, segment.radius, segment.startAngle, segment.endAngle);
        ctx.stroke();

        // Lights on habitat
        const lightCount = Math.floor((segment.endAngle - segment.startAngle) * segment.radius / 20);
        for (let i = 0; i < lightCount; i++) {
          const angle = segment.startAngle + (segment.endAngle - segment.startAngle) * (i / lightCount);
          const lx = Math.cos(angle) * segment.radius;
          const ly = Math.sin(angle) * segment.radius;

          ctx.fillStyle = Math.random() < segment.lights ? '#ffff88' : '#664400';
          ctx.globalAlpha = 1;
          ctx.fillRect(lx - 2, ly - 2, 4, 4);
        }
      } else {
        // Debris section (darker, incomplete)
        ctx.strokeStyle = '#333333';
        ctx.lineWidth = 8;
        ctx.globalAlpha = 0.6;
        ctx.beginPath();
        ctx.arc(0, 0, segment.radius, segment.startAngle, segment.endAngle);
        ctx.stroke();
      }
    }

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  renderDeathStar(ctx, camera) {
    const screenX = camera.width / 2 + (this.x - camera.x);
    const screenY = camera.height / 2 + (this.y - camera.y);

    ctx.save();
    ctx.translate(screenX, screenY);

    // Main sphere (dark gray - heavily pixelated)
    ctx.fillStyle = '#2a2a2a';
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Shadow gradient for 3D effect
    const shadowGrad = ctx.createRadialGradient(-this.radius * 0.3, -this.radius * 0.3, 0, 0, 0, this.radius);
    shadowGrad.addColorStop(0, '#3a3a3a');
    shadowGrad.addColorStop(1, '#1a1a1a');
    ctx.fillStyle = shadowGrad;
    ctx.beginPath();
    ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
    ctx.fill();

    // Equatorial trench (iconic feature)
    ctx.fillStyle = '#0a0a0a';
    ctx.fillRect(-this.radius, -this.trenchWidth / 2, this.radius * 2, this.trenchWidth);

    // Trench details (pixelated panels)
    ctx.fillStyle = '#151515';
    for (let x = -this.radius; x < this.radius; x += 40) {
      ctx.fillRect(x, -this.trenchWidth / 2 + 5, 35, this.trenchWidth - 10);
    }

    // Surface panels (heavily pixelated texture)
    ctx.fillStyle = '#252525';
    for (const panel of this.surfacePanels) {
      const px = panel.x * this.radius * 0.8;
      const py = panel.y * this.radius * 0.8;
      const dist = Math.sqrt(px * px + py * py);

      if (dist < this.radius * 0.9) {
        if (panel.type === 'panel') {
          ctx.fillRect(px - panel.size / 2, py - panel.size / 2, panel.size, panel.size);
        } else if (panel.type === 'tower') {
          ctx.fillStyle = '#353535';
          ctx.fillRect(px - 6, py - 8, 12, 16);
          ctx.fillStyle = '#252525';
        }
      }
    }

    // Superlaser dish (north hemisphere)
    ctx.save();
    ctx.translate(0, -this.radius * 0.4);
    ctx.rotate(this.dishRotation);

    // Dish crater (concave)
    ctx.fillStyle = '#1a1a1a';
    ctx.beginPath();
    ctx.arc(0, 0, 200, 0, Math.PI * 2);
    ctx.fill();

    // Dish segments (8 segments)
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      ctx.strokeStyle = '#252525';
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(Math.cos(angle) * 200, Math.sin(angle) * 200);
      ctx.stroke();
    }

    // Central lens (weapon focus)
    const chargeGlow = this.superlaserCharge / this.superlaserMaxCharge;
    ctx.fillStyle = `rgba(0, 255, 0, ${chargeGlow * 0.8})`;
    ctx.shadowColor = '#00ff00';
    ctx.shadowBlur = chargeGlow * 20;
    ctx.beginPath();
    ctx.arc(0, 0, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // Targeting grid (when charging)
    if (chargeGlow > 0.5) {
      ctx.strokeStyle = `rgba(255, 0, 0, ${(chargeGlow - 0.5) * 2 * 0.6})`;
      ctx.lineWidth = 2;
      for (let r = 60; r < 200; r += 40) {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.restore();

    // Defense turrets (around equator)
    const turretCount = 16;
    for (let i = 0; i < turretCount; i++) {
      const angle = (i / turretCount) * Math.PI * 2 + this.rotation;
      const tx = Math.cos(angle) * this.radius * 0.95;
      const ty = Math.sin(angle) * this.radius * 0.95;

      // Check if turret is on visible hemisphere
      const isVisible = ty > -this.radius * 0.2;
      if (isVisible) {
        ctx.fillStyle = '#3a3a3a';
        ctx.fillRect(tx - 8, ty - 10, 16, 20);

        // Turret barrel
        ctx.fillStyle = '#555555';
        ctx.fillRect(tx - 4, ty - 15, 8, 10);
      }
    }

    // Warning lights (red blinking)
    const warningBlink = Math.floor(this.animationPhase * 5) % 2;
    if (warningBlink) {
      ctx.fillStyle = '#ff0000';
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        ctx.fillRect(
          Math.cos(angle) * this.radius * 0.9 - 3,
          Math.sin(angle) * this.radius * 0.9 - 3,
          6, 6
        );
      }
    }

    ctx.restore();
    ctx.globalAlpha = 1;
  }

  /**
   * Get info for UI display
   */
  getInfo() {
    const cooldownText = this.harvestCooldown > 0 ?
      `Cooldown: ${Math.ceil(this.harvestCooldown / 1000)}s` :
      'Ready';

    switch (this.type) {
      case 'dyson':
      case 'dyson_sphere':
        return {
          name: 'Dyson Sphere Segments',
          type: 'Energy Collection',
          status: `${Math.floor(this.powerLevel * 100)}% Operational`,
          coverage: `${Math.floor((this.segments.length / 20) * 100)}% Complete`,
          energy: `${Math.floor(this.energyCollected)} / ${this.maxEnergy} Units`,
          cooldown: cooldownText,
          description: 'Partial shell around star collecting solar energy',
          actions: ['Harvest Energy']
        };

      case 'ring':
      case 'ring_habitat':
        return {
          name: 'Ring Habitat',
          type: 'Orbital Habitat',
          status: `${Math.floor(this.condition * 100)}% Intact`,
          population: `${Math.floor(this.population / 1000)}K Inhabitants`,
          radius: `${Math.floor(this.outerRadius * 2)}m Diameter`,
          cooldown: cooldownText,
          description: 'Massive rotating habitat ring with artificial gravity - explore multiple biomes',
          actions: ['Explore Biome']
        };

      case 'warp_gate':
        return {
          name: 'Warp Gate',
          type: 'FTL Transit',
          status: this.isActive ? 'ACTIVE' : 'INACTIVE',
          destination: this.destinationSystem ?
            `Portal to ${this.destinationSystem.name}` :
            'Destination Unknown',
          description: 'Ancient portal network for instant system travel',
          actions: this.isActive ? ['Use Gate'] : []
        };

      case 'star_lifter':
      case 'stellar_engine':
        return {
          name: 'Star Lifter',
          type: 'Stellar Mining',
          status: this.beamActive ? 'MINING ACTIVE' : 'STANDBY',
          efficiency: `${Math.floor(this.collectionRate * 100)}% Collection Rate`,
          fuel: `${Math.floor(this.fuelCollected)} / ${this.maxFuel} Units`,
          fuelType: this.fuelType,
          cooldown: cooldownText,
          description: 'Massive structure mining exotic fuel directly from the star',
          actions: ['Collect Fuel']
        };

      case 'orbital_ring':
        return {
          name: 'Orbital Ring Trading Hub',
          type: 'Interstellar Commerce',
          status: 'OPERATIONAL',
          ports: `${this.tradingPorts.filter(p => p.active).length}/${this.tradingPorts.length} Ports Active`,
          market: `Price Modifier: ${Math.floor(this.marketPrice * 100)}%`,
          reputation: `Reputation: ${this.reputation}/100`,
          goods: `${this.tradeGoods.length} Unique Items`,
          description: 'Massive trading habitat with rare and exotic goods from across the galaxy',
          actions: ['Trade Goods', 'View Market']
        };

      default:
        return {};
    }
  }
}
