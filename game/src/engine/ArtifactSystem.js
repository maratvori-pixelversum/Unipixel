export class ArtifactSystem {
  constructor() {
    this.discoveredArtifacts = [];
    this.assembledArtifacts = [];
    
    this.artifactTypes = [
      { id: 'quantum_core', name: 'Quantum Processing Core', rarity: 0.95, value: 5000, effect: { type: 'speed', value: 1.2 }, pieces: 3 },
      { id: 'plasma_regulator', name: 'Ancient Plasma Regulator', rarity: 0.9, value: 3000, effect: { type: 'weapons', value: 1.5 }, pieces: 2 },
      { id: 'shield_matrix', name: 'Precursor Shield Matrix', rarity: 0.85, value: 4000, effect: { type: 'defense', value: 1.3 }, pieces: 3 },
      { id: 'warp_coil', name: 'Hyperdrive Warp Coil', rarity: 0.92, value: 6000, effect: { type: 'warp', value: 0.5 }, pieces: 4 },
      { id: 'nav_module', name: 'Stellar Navigation Module', rarity: 0.8, value: 2500, effect: { type: 'scanning', value: 2.0 }, pieces: 2 },
      { id: 'cursed_relic', name: 'Cursed Alien Relic', rarity: 0.98, value: 10000, effect: { type: 'damage', value: 2.0 }, curse: { type: 'health_drain', value: 0.02 }, pieces: 5 }
    ];
  }

  generateArtifact() {
    const type = this.artifactTypes[Math.floor(Math.random() * this.artifactTypes.length)];
    if (Math.random() > type.rarity) return null;
    
    const pieceIndex = Math.floor(Math.random() * type.pieces) + 1;
    return {
      typeId: type.id,
      name: type.name + ' - Piece ' + pieceIndex + '/' + type.pieces,
      fullName: type.name,
      pieceIndex,
      totalPieces: type.pieces,
      value: Math.floor(type.value * 0.3),
      effect: type.effect,
      curse: type.curse || null,
      discovered: Date.now()
    };
  }

  addArtifact(artifact) {
    this.discoveredArtifacts.push(artifact);
    return artifact;
  }

  tryAssembleArtifact(typeId) {
    const pieces = this.discoveredArtifacts.filter(a => a.typeId === typeId);
    const type = this.artifactTypes.find(t => t.id === typeId);
    const totalPieces = type ? type.pieces : 0;
    
    if (!type || pieces.length < totalPieces) {
      return { success: false, message: 'Need ' + totalPieces + ' pieces, have ' + pieces.length };
    }

    const uniquePieces = new Set(pieces.map(p => p.pieceIndex));
    if (uniquePieces.size < totalPieces) {
      return { success: false, message: 'Missing unique pieces' };
    }

    this.assembledArtifacts.push({
      typeId,
      name: type.name,
      effect: type.effect,
      curse: type.curse,
      value: type.value,
      assembled: Date.now()
    });

    this.discoveredArtifacts = this.discoveredArtifacts.filter(a => a.typeId !== typeId);
    return { success: true, message: 'Assembled ' + type.name + '!', artifact: this.assembledArtifacts[this.assembledArtifacts.length - 1] };
  }

  getActiveEffects() {
    return this.assembledArtifacts.map(a => ({ name: a.name, effect: a.effect, curse: a.curse }));
  }

  getInventory() {
    const grouped = {};
    this.discoveredArtifacts.forEach(a => {
      if (!grouped[a.typeId]) grouped[a.typeId] = { name: a.fullName, pieces: [], totalNeeded: a.totalPieces };
      grouped[a.typeId].pieces.push(a.pieceIndex);
    });
    return Object.entries(grouped).map(([id, data]) => ({
      id,
      name: data.name,
      collected: data.pieces.length,
      total: data.totalNeeded,
      canAssemble: data.pieces.length >= data.totalNeeded && new Set(data.pieces).size >= data.totalNeeded
    }));
  }

  /**
   * Generate artifacts for a star system
   * Returns an array of artifacts positioned in the system
   */
  generateSystemArtifacts(systemData, systemIndex, seed) {
    const artifacts = [];

    // Use seed to make artifact generation deterministic for each system
    const rng = () => {
      seed = (seed * 9301 + 49297) % 233280;
      return seed / 233280;
    };

    // Chance of artifacts appearing in a system (rare)
    // Higher chance in special systems (black holes, nebula, megastructures)
    let artifactChance = 0.05; // 5% base chance

    if (systemData.hasBlackhole) artifactChance += 0.15;
    if (systemData.hasNebula) artifactChance += 0.10;
    if (systemData.hasMegastructure) artifactChance += 0.20;
    if (systemData.hasAnomalies) artifactChance += 0.10;

    // Check if this system should have artifacts
    if (rng() > artifactChance) {
      return artifacts; // No artifacts in this system
    }

    // Generate 1-3 artifacts for this system
    const numArtifacts = Math.floor(rng() * 3) + 1;

    for (let i = 0; i < numArtifacts; i++) {
      const artifact = this.generateArtifact();
      if (artifact) {
        // Position artifact in orbit around the star
        // Artifacts orbit at various distances
        const orbitRadius = 1500 + rng() * 2000; // Between 1500-3500 distance
        const angle = rng() * Math.PI * 2;

        artifacts.push({
          ...artifact,
          x: Math.cos(angle) * orbitRadius,
          y: Math.sin(angle) * orbitRadius,
          orbitRadius,
          orbitAngle: angle,
          orbitSpeed: 0.0001 + rng() * 0.0002, // Slow orbital rotation
          systemIndex
        });
      }
    }

    return artifacts;
  }

  /**
   * Render an artifact in the system view
   */
  renderArtifact(ctx, artifact, starX, starY, camera, time) {
    // Update artifact orbital position
    const currentAngle = artifact.orbitAngle + time * artifact.orbitSpeed;
    const px = Math.floor(starX + Math.cos(currentAngle) * artifact.orbitRadius - camera.x);
    const py = Math.floor(starY + Math.sin(currentAngle) * artifact.orbitRadius - camera.y);

    const size = 30;
    const pulse = Math.sin(time * 0.004) * 0.3 + 0.7;

    // Artifact glow color based on rarity
    let glowColor = '#ffaa00'; // Common - orange
    if (artifact.fullName && artifact.fullName.includes('Quantum')) glowColor = '#00ffff'; // Cyan
    if (artifact.fullName && artifact.fullName.includes('Precursor')) glowColor = '#ff00ff'; // Magenta
    if (artifact.fullName && artifact.fullName.includes('Ancient')) glowColor = '#00ff88'; // Green
    if (artifact.fullName && artifact.fullName.includes('Cursed')) glowColor = '#ff0000'; // Red

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(time * 0.002);

    // Outer glow
    ctx.shadowBlur = 20;
    ctx.shadowColor = glowColor;
    ctx.fillStyle = `${glowColor}${Math.floor(pulse * 100).toString(16).padStart(2, '0')}`;
    ctx.beginPath();
    ctx.arc(0, 0, size * 1.5, 0, Math.PI * 2);
    ctx.fill();

    // Inner crystal structure
    ctx.shadowBlur = 0;
    ctx.fillStyle = `${glowColor}${Math.floor(pulse * 255).toString(16).padStart(2, '0')}`;
    ctx.beginPath();
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2;
      const r = i % 2 === 0 ? size : size * 0.6;
      const x = Math.cos(angle) * r;
      const y = Math.sin(angle) * r;
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.fill();

    // Core
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    // Label
    ctx.font = '10px DigitalDisco, monospace';
    ctx.fillStyle = glowColor;
    ctx.textAlign = 'center';
    ctx.fillText('ARTIFACT', px, py + size + 15);
  }

  /**
   * Create particle effects around artifacts
   */
  createArtifactParticles(artifact, starX, starY, particles, time) {
    // Update artifact position for particle generation
    const currentAngle = artifact.orbitAngle + time * artifact.orbitSpeed;
    const artifactX = starX + Math.cos(currentAngle) * artifact.orbitRadius;
    const artifactY = starY + Math.sin(currentAngle) * artifact.orbitRadius;

    // Generate glowing particles occasionally
    if (Math.random() < 0.2) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 20 + Math.random() * 30;

      // Color based on artifact type
      let color = '#ffaa00';
      if (artifact.fullName && artifact.fullName.includes('Quantum')) color = '#00ffff';
      if (artifact.fullName && artifact.fullName.includes('Precursor')) color = '#ff00ff';
      if (artifact.fullName && artifact.fullName.includes('Ancient')) color = '#00ff88';
      if (artifact.fullName && artifact.fullName.includes('Cursed')) color = '#ff0000';

      particles.push({
        x: artifactX + Math.cos(angle) * dist,
        y: artifactY + Math.sin(angle) * dist,
        vx: Math.cos(angle) * 20,
        vy: Math.sin(angle) * 20,
        life: 1,
        maxLife: 2,
        size: 2 + Math.random() * 3,
        color,
        type: 'artifact_particle'
      });
    }
  }
}
