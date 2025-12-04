/**
 * Advanced Physics System
 * Implements realistic space physics including:
 * - Gravitational wells and slingshot maneuvers
 * - N-body gravity simulation
 * - Tidal forces
 * - Relativistic effects near massive objects
 * - Orbital mechanics (Kepler's laws)
 */

export class AdvancedPhysics {
  constructor() {
    // Gravitational constant (scaled for gameplay)
    this.G = 0.5;

    // Speed of light (for relativistic effects)
    this.C = 1000;

    // Enable/disable features for performance
    this.enableTidalForces = true;
    this.enableRelativisticEffects = true;
    this.enableNBodyGravity = true;
  }

  /**
   * Calculate gravitational force between two bodies
   * F = G * (m1 * m2) / r^2
   */
  calculateGravitationalForce(body1, body2) {
    const dx = body2.x - body1.x;
    const dy = body2.y - body1.y;
    const distSq = dx * dx + dy * dy;
    const dist = Math.sqrt(distSq);

    if (dist < 0.1) return { fx: 0, fy: 0, dist: 0 };

    // Gravitational force magnitude
    const forceMag = (this.G * body1.mass * body2.mass) / distSq;

    // Force components
    const fx = (dx / dist) * forceMag;
    const fy = (dy / dist) * forceMag;

    return { fx, fy, dist, forceMag };
  }

  /**
   * Apply gravity from all massive bodies to a ship
   */
  applyGravity(ship, bodies, dt) {
    let totalFx = 0;
    let totalFy = 0;

    // Track closest body for special effects
    let closestBody = null;
    let closestDist = Infinity;

    for (const body of bodies) {
      const { fx, fy, dist } = this.calculateGravitationalForce(
        { x: ship.x, y: ship.y, mass: ship.mass },
        body
      );

      // Check if within influence range
      const influenceRadius = this.calculateInfluenceRadius(body);
      if (dist < influenceRadius) {
        totalFx += fx;
        totalFy += fy;

        if (dist < closestDist) {
          closestDist = dist;
          closestBody = body;
        }
      }
    }

    // Apply forces to ship velocity
    const ax = totalFx / ship.mass;
    const ay = totalFy / ship.mass;

    ship.vx += ax * dt;
    ship.vy += ay * dt;

    // Return info about gravitational influence
    return {
      acceleration: Math.sqrt(ax * ax + ay * ay),
      closestBody,
      closestDist,
      inGravityWell: closestDist < (closestBody ? closestBody.radius * 5 : Infinity)
    };
  }

  /**
   * Calculate sphere of influence radius for a body
   * (Simplified Hill sphere calculation)
   */
  calculateInfluenceRadius(body) {
    // Larger mass = larger influence
    const baseRadius = Math.pow(body.mass / 1000, 0.33) * 100;
    return Math.min(baseRadius, 5000); // Cap for performance
  }

  /**
   * Calculate orbital velocity for circular orbit
   * v = sqrt(G * M / r)
   */
  calculateOrbitalVelocity(centralMass, orbitRadius) {
    return Math.sqrt((this.G * centralMass) / orbitRadius);
  }

  /**
   * Calculate escape velocity
   * v_esc = sqrt(2 * G * M / r)
   */
  calculateEscapeVelocity(centralMass, distance) {
    return Math.sqrt((2 * this.G * centralMass) / distance);
  }

  /**
   * Gravity slingshot / Oberth maneuver calculation
   * Returns velocity boost from gravity assist
   */
  calculateGravitySlingshot(ship, body) {
    const dx = body.x - ship.x;
    const dy = body.y - ship.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Velocity relative to the body
    const relVx = ship.vx - (body.vx || 0);
    const relVy = ship.vy - (body.vy || 0);
    const relSpeed = Math.sqrt(relVx * relVx + relVy * relVy);

    // Calculate slingshot boost based on approach angle and speed
    const escapeVel = this.calculateEscapeVelocity(body.mass, dist);

    // Boost is proportional to how fast you're going relative to escape velocity
    const boostFactor = Math.min(relSpeed / escapeVel, 2.0);

    // Direction perpendicular to current velocity (slingshot effect)
    const perpAngle = Math.atan2(relVy, relVx) + Math.PI / 2;

    return {
      boostFactor,
      boostVx: Math.cos(perpAngle) * boostFactor * 20,
      boostVy: Math.sin(perpAngle) * boostFactor * 20,
      isEffective: boostFactor > 0.5 && dist < body.radius * 10
    };
  }

  /**
   * Calculate tidal forces (stretching effect near massive objects)
   */
  calculateTidalForces(ship, body) {
    if (!this.enableTidalForces) return { tidalStress: 0 };

    const dx = body.x - ship.x;
    const dy = body.y - ship.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Tidal force increases as you get closer
    // F_tidal = 2 * G * M * ship_length / r^3
    const shipLength = 20; // Ship size
    const rocheLimit = body.radius * 2.5; // Simplified Roche limit

    if (dist < rocheLimit) {
      const tidalStress = (2 * this.G * body.mass * shipLength) / (dist * dist * dist);
      return {
        tidalStress,
        isDestroying: tidalStress > 100, // Ship breaks apart
        warningLevel: Math.min(tidalStress / 100, 1.0)
      };
    }

    return { tidalStress: 0, isDestroying: false, warningLevel: 0 };
  }

  /**
   * Calculate relativistic time dilation near massive objects
   * (Simplified Schwarzschild metric)
   */
  calculateTimeDilation(ship, body) {
    if (!this.enableRelativisticEffects) return 1.0;

    const dx = body.x - ship.x;
    const dy = body.y - ship.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Schwarzschild radius (event horizon for black hole)
    const schwarzschildRadius = (2 * this.G * body.mass) / (this.C * this.C);

    // Time dilation factor
    // t' = t * sqrt(1 - rs/r)
    if (dist > schwarzschildRadius) {
      const dilationFactor = Math.sqrt(1 - (schwarzschildRadius / dist));
      return Math.max(dilationFactor, 0.1); // Clamp to avoid extreme slowdown
    }

    return 0.1; // Extreme dilation near event horizon
  }

  /**
   * Calculate orbital parameters (for display/UI)
   */
  calculateOrbitalParameters(ship, centralBody) {
    const dx = ship.x - centralBody.x;
    const dy = ship.y - centralBody.y;
    const r = Math.sqrt(dx * dx + dy * dy);

    // Velocity relative to central body
    const vx = ship.vx - (centralBody.vx || 0);
    const vy = ship.vy - (centralBody.vy || 0);
    const v = Math.sqrt(vx * vx + vy * vy);

    // Specific orbital energy
    const E = (v * v) / 2 - (this.G * centralBody.mass) / r;

    // Orbital type
    let orbitType;
    if (E < 0) {
      orbitType = 'elliptical'; // Bound orbit
    } else if (E === 0) {
      orbitType = 'parabolic'; // Escape trajectory
    } else {
      orbitType = 'hyperbolic'; // Flyby
    }

    // Semi-major axis (for elliptical orbits)
    const a = E < 0 ? -(this.G * centralBody.mass) / (2 * E) : Infinity;

    // Eccentricity (orbit shape)
    const h = dx * vy - dy * vx; // Angular momentum
    const e = E < 0 ?
      Math.sqrt(1 + (2 * E * h * h) / (this.G * this.G * centralBody.mass * centralBody.mass)) :
      1.0;

    return {
      distance: r,
      velocity: v,
      orbitType,
      semiMajorAxis: a,
      eccentricity: e,
      isStable: orbitType === 'elliptical' && e < 0.9,
      apoapsis: a * (1 + e), // Furthest point
      periapsis: a * (1 - e) // Closest point
    };
  }

  /**
   * Check if ship is in a stable orbit
   */
  isInStableOrbit(ship, centralBody, tolerance = 0.1) {
    const params = this.calculateOrbitalParameters(ship, centralBody);

    // Stable orbit criteria:
    // 1. Elliptical orbit
    // 2. Low eccentricity (< 0.9)
    // 3. Periapsis above surface + safe margin
    const safeAltitude = centralBody.radius * 1.5;

    return params.orbitType === 'elliptical' &&
           params.eccentricity < 0.9 &&
           params.periapsis > safeAltitude;
  }

  /**
   * Calculate Lagrange points between two bodies
   * REALISTIC UPGRADE: L1-L5 points for station-keeping
   *
   * L1: Between bodies (gravitationally neutral)
   * L2: Beyond smaller body (for telescopes)
   * L3: Opposite side of larger body
   * L4: Leading triangular point (60° ahead)
   * L5: Trailing triangular point (60° behind)
   */
  calculateLagrangePoints(body1, body2) {
    const dx = body2.x - body1.x;
    const dy = body2.y - body1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < 0.1) return null;

    const angle = Math.atan2(dy, dx);
    const massRatio = body2.mass / (body1.mass + body2.mass);

    // L1: Between the bodies
    // Approximate distance from body1: r = d * (massRatio / 3)^(1/3)
    const r_L1 = distance * Math.pow(massRatio / 3, 1/3);
    const L1 = {
      x: body1.x + Math.cos(angle) * r_L1,
      y: body1.y + Math.sin(angle) * r_L1,
      type: 'L1',
      stable: false
    };

    // L2: Beyond body2
    const r_L2 = distance + distance * Math.pow(massRatio / 3, 1/3);
    const L2 = {
      x: body1.x + Math.cos(angle) * r_L2,
      y: body1.y + Math.sin(angle) * r_L2,
      type: 'L2',
      stable: false
    };

    // L3: Opposite side of body1
    const L3 = {
      x: body1.x - Math.cos(angle) * distance,
      y: body1.y - Math.sin(angle) * distance,
      type: 'L3',
      stable: false
    };

    // L4: 60° ahead in orbit
    const L4 = {
      x: body1.x + Math.cos(angle + Math.PI/3) * distance,
      y: body1.y + Math.sin(angle + Math.PI/3) * distance,
      type: 'L4',
      stable: true // Trojan asteroids live here
    };

    // L5: 60° behind in orbit
    const L5 = {
      x: body1.x + Math.cos(angle - Math.PI/3) * distance,
      y: body1.y + Math.sin(angle - Math.PI/3) * distance,
      type: 'L5',
      stable: true // Trojan asteroids live here
    };

    return { L1, L2, L3, L4, L5 };
  }

  /**
   * Check if position is near a Lagrange point
   */
  isNearLagrangePoint(x, y, body1, body2, threshold = 500) {
    const lagrangePoints = this.calculateLagrangePoints(body1, body2);
    if (!lagrangePoints) return null;

    for (const [name, point] of Object.entries(lagrangePoints)) {
      const dx = x - point.x;
      const dy = y - point.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < threshold) {
        return { point: name, distance: dist, stable: point.stable };
      }
    }

    return null;
  }

  /**
   * Calculate Hill Sphere (sphere of gravitational influence)
   * REALISTIC UPGRADE: Determines gravitational dominance region
   */
  calculateHillSphere(body, centralBody, orbitRadius) {
    if (!centralBody) return body.radius * 10; // Default for stars

    // Hill radius: r_H = a * (m / 3M)^(1/3)
    // where a = orbital radius, m = body mass, M = central body mass
    const hillRadius = orbitRadius * Math.pow(
      body.mass / (3 * centralBody.mass),
      1/3
    );

    return hillRadius;
  }

  /**
   * Determine which body's sphere of influence the ship is in
   */
  calculateSphereOfInfluence(ship, bodies) {
    let dominantBody = null;
    let dominantInfluence = 0;

    for (const body of bodies) {
      const dx = ship.x - body.x;
      const dy = ship.y - body.y;
      const dist = Math.sqrt(dx * dx + dy * dy);

      // Calculate influence strength
      const influenceRadius = this.calculateInfluenceRadius(body);

      if (dist < influenceRadius) {
        const influence = (body.mass / (dist * dist)) / influenceRadius;

        if (influence > dominantInfluence) {
          dominantInfluence = influence;
          dominantBody = body;
        }
      }
    }

    return dominantBody;
  }

  /**
   * Calculate Roche Limit (tidal disruption distance)
   * REALISTIC UPGRADE: Where tidal forces tear objects apart
   *
   * Rigid body: d = 2.46 * R * (ρ_M / ρ_m)^(1/3)
   * Fluid body: d = 2.88 * R * (ρ_M / ρ_m)^(1/3)
   */
  calculateRocheLimit(primaryBody, satelliteBody, isFluid = false) {
    // Simplified: assume similar densities
    // Real formula requires density, we approximate with mass/volume
    const primaryDensity = primaryBody.mass / (primaryBody.radius ** 3);
    const satelliteDensity = satelliteBody.mass / (satelliteBody.radius ** 3);

    const factor = isFluid ? 2.88 : 2.46;
    const densityRatio = Math.pow(primaryDensity / satelliteDensity, 1/3);

    return factor * primaryBody.radius * densityRatio;
  }

  /**
   * Check if object would be tidally disrupted
   */
  checkTidalDisruption(body1, body2) {
    const dx = body2.x - body1.x;
    const dy = body2.y - body1.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const rocheLimit = this.calculateRocheLimit(body1, body2, false);

    return {
      distance,
      rocheLimit,
      isTidallyDisrupted: distance < rocheLimit,
      warningLevel: Math.max(0, 1 - distance / rocheLimit)
    };
  }

  /**
   * Calculate gravitational perturbations from nearby bodies
   * REALISTIC UPGRADE: Multi-body gravitational interactions
   */
  calculatePerturbations(ship, primaryBody, perturbingBodies) {
    let totalPerturbationX = 0;
    let totalPerturbationY = 0;

    for (const perturber of perturbingBodies) {
      if (perturber === primaryBody) continue;

      // Force on ship from perturber
      const { fx, fy } = this.calculateGravitationalForce(
        { x: ship.x, y: ship.y, mass: ship.mass },
        perturber
      );

      // Force on primary from perturber (indirect effect)
      const { fx: fx_indirect, fy: fy_indirect } = this.calculateGravitationalForce(
        { x: primaryBody.x, y: primaryBody.y, mass: ship.mass },
        perturber
      );

      // Net perturbation (direct - indirect)
      totalPerturbationX += (fx - fx_indirect);
      totalPerturbationY += (fy - fy_indirect);
    }

    return {
      fx: totalPerturbationX,
      fy: totalPerturbationY,
      magnitude: Math.sqrt(totalPerturbationX ** 2 + totalPerturbationY ** 2)
    };
  }

  /**
   * Calculate frame dragging effect (Lense-Thirring effect)
   * REALISTIC UPGRADE: Spacetime dragging by rotating massive objects
   */
  calculateFrameDragging(ship, rotatingBody, angularVelocity) {
    if (!this.enableRelativisticEffects) return { fx: 0, fy: 0 };

    const dx = ship.x - rotatingBody.x;
    const dy = ship.y - rotatingBody.y;
    const r = Math.sqrt(dx * dx + dy * dy);

    if (r < 0.1) return { fx: 0, fy: 0 };

    // Frame dragging angular velocity
    // ω_FD ≈ (2 * G * J) / (c² * r³)
    // where J = I * ω = angular momentum
    const momentOfInertia = 0.4 * rotatingBody.mass * rotatingBody.radius ** 2;
    const angularMomentum = momentOfInertia * angularVelocity;

    const frameDragVelocity = (2 * this.G * angularMomentum) / (this.C * this.C * r * r * r);

    // Tangential force (perpendicular to radius)
    const fx = -dy / r * frameDragVelocity * ship.mass;
    const fy = dx / r * frameDragVelocity * ship.mass;

    return { fx, fy, frameDragVelocity };
  }

  /**
   * Apply drag from atmosphere (if near planet)
   */
  applyAtmosphericDrag(ship, planet, dt) {
    const dx = planet.x - ship.x;
    const dy = planet.y - ship.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    // Check if in atmosphere
    const atmosphereHeight = planet.radius * 1.5;

    if (dist < atmosphereHeight) {
      // Atmospheric density (exponential falloff)
      const altitude = dist - planet.radius;
      const density = Math.exp(-altitude / (planet.radius * 0.3));

      // Drag force proportional to velocity squared
      const speed = Math.sqrt(ship.vx * ship.vx + ship.vy * ship.vy);
      const dragMagnitude = 0.5 * density * speed * speed * 0.01;

      // Apply drag opposite to velocity
      if (speed > 0) {
        const dragFx = -(ship.vx / speed) * dragMagnitude;
        const dragFy = -(ship.vy / speed) * dragMagnitude;

        ship.vx += (dragFx / ship.mass) * dt;
        ship.vy += (dragFy / ship.mass) * dt;

        return {
          inAtmosphere: true,
          density,
          drag: dragMagnitude,
          altitude
        };
      }
    }

    return { inAtmosphere: false };
  }
}
