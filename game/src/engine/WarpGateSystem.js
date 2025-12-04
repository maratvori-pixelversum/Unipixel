/**
 * Warp Gate System
 * Manages warp gates that provide instant travel between connected star systems
 */

export class WarpGateSystem {
  constructor() {
    this.gates = []; // All warp gates in galaxy
    this.connections = new Map(); // systemIndex -> [connected systemIndices]
  }

  /**
   * Generate warp gate network for galaxy
   * Creates gates connecting nearby and strategically important systems
   */
  generateGateNetwork(galaxy) {
    this.gates = [];
    this.connections.clear();

    // Step 1: Connect nearby systems (local gates)
    for (let i = 0; i < galaxy.length; i++) {
      const system = galaxy[i];

      // Only some systems get gates (about 40%)
      if (Math.random() > 0.4) continue;

      // Find 1-3 nearby systems to connect
      const nearby = this.findNearestSystems(i, galaxy, 3);

      for (const targetIndex of nearby) {
        // Create bidirectional gate connection
        this.createGateConnection(i, targetIndex, 'local');
      }
    }

    // Step 2: Connect faction capitals (strategic gates)
    const capitals = galaxy
      .map((sys, idx) => ({ system: sys, index: idx }))
      .filter(item => item.system.isCapital);

    for (let i = 0; i < capitals.length; i++) {
      for (let j = i + 1; j < capitals.length; j++) {
        const capA = capitals[i];
        const capB = capitals[j];

        // 50% chance to connect capitals (not all connected)
        if (Math.random() < 0.5) {
          this.createGateConnection(capA.index, capB.index, 'strategic');
        }
      }
    }

    // Step 3: Create long-distance "highway" gates
    // Connecting distant parts of galaxy
    const numHighways = Math.floor(galaxy.length / 30);
    for (let i = 0; i < numHighways; i++) {
      const systemA = Math.floor(Math.random() * galaxy.length);
      const systemB = Math.floor(Math.random() * galaxy.length);

      if (systemA !== systemB) {
        this.createGateConnection(systemA, systemB, 'highway');
      }
    }

    // ENHANCED: Set target system names for all gates
    for (const gate of this.gates) {
      const targetSystem = galaxy[gate.targetSystemIndex];
      if (targetSystem) {
        gate.targetSystemName = targetSystem.name;
      }
    }
  }

  /**
   * Create a gate connection between two systems
   */
  createGateConnection(systemIndexA, systemIndexB, type = 'local') {
    // Check if connection already exists
    const connectionsA = this.connections.get(systemIndexA) || [];
    if (connectionsA.includes(systemIndexB)) {
      return; // Already connected
    }

    // Create gate in system A pointing to system B
    const gateA = {
      id: `gate_${systemIndexA}_${systemIndexB}`,
      sourceSystem: systemIndexA,
      targetSystem: systemIndexB,
      // ENHANCED: Add properties for InteractionSystem teleportation
      targetSystemIndex: systemIndexB,
      targetSystemName: null, // Will be set when galaxy is available
      type, // local, strategic, or highway
      active: true
    };

    // Create gate in system B pointing to system A
    const gateB = {
      id: `gate_${systemIndexB}_${systemIndexA}`,
      sourceSystem: systemIndexB,
      targetSystem: systemIndexA,
      // ENHANCED: Add properties for InteractionSystem teleportation
      targetSystemIndex: systemIndexA,
      targetSystemName: null, // Will be set when galaxy is available
      type,
      active: true
    };

    this.gates.push(gateA, gateB);

    // Update connections map
    if (!this.connections.has(systemIndexA)) {
      this.connections.set(systemIndexA, []);
    }
    this.connections.get(systemIndexA).push(systemIndexB);

    if (!this.connections.has(systemIndexB)) {
      this.connections.set(systemIndexB, []);
    }
    this.connections.get(systemIndexB).push(systemIndexA);
  }

  /**
   * Find nearest systems to a given system
   */
  findNearestSystems(systemIndex, galaxy, count = 3) {
    const system = galaxy[systemIndex];
    const distances = [];

    for (let i = 0; i < galaxy.length; i++) {
      if (i === systemIndex) continue;

      const other = galaxy[i];
      const dx = system.position.x - other.position.x;
      const dy = system.position.y - other.position.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      distances.push({ index: i, distance: dist });
    }

    // Sort by distance and return closest
    distances.sort((a, b) => a.distance - b.distance);
    return distances.slice(0, count).map(d => d.index);
  }

  /**
   * Get gates in a specific system
   */
  getGatesInSystem(systemIndex) {
    return this.gates.filter(gate => gate.sourceSystem === systemIndex && gate.active);
  }

  /**
   * Get all systems connected to a given system
   */
  getConnectedSystems(systemIndex) {
    return this.connections.get(systemIndex) || [];
  }

  /**
   * Check if player is near a warp gate
   */
  checkGateProximity(playerX, playerY, systemIndex, starX, starY) {
    const gates = this.getGatesInSystem(systemIndex);

    for (const gate of gates) {
      const gatePos = this.getGatePosition(gate, starX, starY, gates.length, gates.indexOf(gate));
      const dx = playerX - gatePos.x;
      const dy = playerY - gatePos.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Gate activation radius
      if (dist < 200) {
        return {
          nearGate: true,
          gate,
          gatePos,
          distance: dist
        };
      }
    }

    return { nearGate: false };
  }

  /**
   * Calculate position of warp gate in system
   * Gates are positioned in orbit around the star
   */
  getGatePosition(gate, starX, starY, totalGates, gateIndex) {
    // Position gates in a ring around the outer system
    const gateOrbitRadius = 2500; // Distance from star
    const angleStep = (Math.PI * 2) / Math.max(totalGates, 1);
    const angle = angleStep * gateIndex;

    return {
      x: starX + Math.cos(angle) * gateOrbitRadius,
      y: starY + Math.sin(angle) * gateOrbitRadius,
      angle
    };
  }

  /**
   * Render warp gate
   */
  renderGate(ctx, gatePos, gate, time, camera) {
    const px = Math.floor(gatePos.x - camera.x);
    const py = Math.floor(gatePos.y - camera.y);

    const gateSize = 40;
    const pulse = Math.sin(time * 0.003) * 0.3 + 0.7;

    // Gate type colors
    let gateColor = '#4488ff'; // Local gates - blue
    if (gate.type === 'strategic') gateColor = '#ff44ff'; // Strategic - magenta
    if (gate.type === 'highway') gateColor = '#ffaa00'; // Highway - orange

    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(time * 0.001);

    // Outer energy ring
    ctx.strokeStyle = `${gateColor}${Math.floor(pulse * 180).toString(16).padStart(2, '0')}`;
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, gateSize, 0, Math.PI * 2);
    ctx.stroke();

    // Inner energy ring
    ctx.strokeStyle = `${gateColor}${Math.floor(pulse * 255).toString(16).padStart(2, '0')}`;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(0, 0, gateSize * 0.7, 0, Math.PI * 2);
    ctx.stroke();

    // Energy core
    ctx.fillStyle = `${gateColor}${Math.floor(pulse * 200).toString(16).padStart(2, '0')}`;
    ctx.beginPath();
    ctx.arc(0, 0, gateSize * 0.3, 0, Math.PI * 2);
    ctx.fill();

    // Rotating energy streams
    for (let i = 0; i < 4; i++) {
      const streamAngle = (i / 4) * Math.PI * 2 + time * 0.002;
      const x1 = Math.cos(streamAngle) * gateSize * 0.3;
      const y1 = Math.sin(streamAngle) * gateSize * 0.3;
      const x2 = Math.cos(streamAngle) * gateSize;
      const y2 = Math.sin(streamAngle) * gateSize;

      ctx.strokeStyle = `${gateColor}aa`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    }

    // Gate structure (four pillars)
    for (let i = 0; i < 4; i++) {
      const pillarAngle = (i / 4) * Math.PI * 2;
      const px = Math.cos(pillarAngle) * gateSize * 1.1;
      const py = Math.sin(pillarAngle) * gateSize * 1.1;

      ctx.fillStyle = '#666666';
      ctx.fillRect(px - 3, py - 6, 6, 12);
      ctx.fillStyle = gateColor;
      ctx.fillRect(px - 2, py - 5, 4, 10);
    }

    ctx.restore();

    // Gate label
    ctx.font = '10px DigitalDisco, monospace';
    ctx.fillStyle = gateColor;
    ctx.textAlign = 'center';
    ctx.fillText('WARP GATE', px, py + gateSize + 15);
    ctx.fillStyle = '#cccccc';
    ctx.font = '8px DigitalDisco, monospace';
    ctx.fillText(gate.type.toUpperCase(), px, py + gateSize + 25);
  }

  /**
   * Render gate particles/effects
   */
  createGateParticles(gatePos, particles, time) {
    // Generate swirling energy particles around gate
    if (Math.random() < 0.3) {
      const angle = Math.random() * Math.PI * 2;
      const dist = 20 + Math.random() * 40;
      const speed = 50 + Math.random() * 50;

      particles.push({
        x: gatePos.x + Math.cos(angle) * dist,
        y: gatePos.y + Math.sin(angle) * dist,
        vx: Math.cos(angle + Math.PI / 2) * speed,
        vy: Math.sin(angle + Math.PI / 2) * speed,
        life: 1,
        maxLife: 1.5,
        size: 2 + Math.random() * 2,
        color: '#4488ff',
        type: 'gate_particle'
      });
    }
  }
}
