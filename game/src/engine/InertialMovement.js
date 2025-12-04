/**
 * Realistic Inertial Movement System
 * Newtonian physics-based ship movement:
 * - Mass affects acceleration
 * - Momentum conservation
 * - Rotational inertia
 * - Thruster vectoring
 * - Gravity well interactions
 */

export class InertialMovement {
  constructor(ship) {
    this.ship = ship;

    // Physics properties
    this.mass = ship.mass || 100;
    this.cargoMass = ship.cargoMass || 0; // NEW: Cargo weight system (0-500 kg)
    this.momentOfInertia = this.mass * 2; // Rotational resistance

    // Movement state
    this.velocity = { x: ship.vx || 0, y: ship.vy || 0 };
    this.angularVelocity = 0;
    this.position = { x: ship.x, y: ship.y };
    this.rotation = ship.rotation || 0;

    // Thruster configuration (ULTRA-ENHANCED: 2.5x stronger for MASSIVE scale)
    this.mainThrusterForce = 1000; // Forward thrust (was 400, now 2.5x)
    this.retroThrusterForce = 500; // Reverse thrust (was 200, now 2.5x)
    this.lateralThrusterForce = 375; // Lateral thrust (was 150, now 2.5x)
    this.rotationalThrusterTorque = 35; // Turning power (was 15, now 2.33x)

    // Damage effects (NEW)
    this.damageMultiplier = 1.0; // Reduced by hull damage
    this.thrusterEfficiency = 1.0; // Affected by damage

    // Dampening (REDUCED: from 0.005 to 0.001 for more realistic space physics)
    this.linearDampening = 0.001; // Space friction (very minimal)
    this.angularDampening = 0.05; // Rotational resistance

    // Inertial dampening system (can be toggled)
    this.inertialDampeningActive = ship.inertialDampening || false;
    this.dampeningStrength = 0.15; // How quickly dampening slows ship

    // Gravity effects
    this.gravityMultiplier = 1.0;
  }

  /**
   * Apply thrust in a direction (ENHANCED: cargo weight and damage effects)
   */
  applyThrust(direction, dt) {
    // direction: 'forward', 'backward', 'left', 'right'
    let force = 0;
    let angle = this.rotation;

    // Update damage effects based on ship hull
    const hullPercent = this.ship.hull / this.ship.maxHull;
    this.thrusterEfficiency = 0.5 + (hullPercent * 0.5); // 50-100% efficiency based on hull
    this.damageMultiplier = 0.7 + (hullPercent * 0.3); // 70-100% multiplier

    switch (direction) {
      case 'forward':
        force = this.mainThrusterForce * this.thrusterEfficiency;
        break;
      case 'backward':
        force = this.retroThrusterForce * this.thrusterEfficiency;
        angle += Math.PI; // Opposite direction
        break;
      case 'left':
        force = this.lateralThrusterForce * this.thrusterEfficiency;
        angle -= Math.PI / 2;
        break;
      case 'right':
        force = this.lateralThrusterForce * this.thrusterEfficiency;
        angle += Math.PI / 2;
        break;
    }

    if (force > 0) {
      // NEW: Effective mass includes cargo
      const effectiveMass = this.mass + this.cargoMass;
      const acceleration = (force * this.damageMultiplier) / effectiveMass;
      this.velocity.x += Math.cos(angle) * acceleration * dt;
      this.velocity.y += Math.sin(angle) * acceleration * dt;

      // Return thruster info for visual effects
      return {
        active: true,
        direction,
        angle,
        force: force * this.damageMultiplier
      };
    }
    return { active: false };
  }

  /**
   * Apply rotational thrust
   */
  applyRotationalThrust(direction, dt) {
    // direction: 1 for CW, -1 for CCW
    const torque = this.rotationalThrusterTorque * direction;
    const angularAcceleration = torque / this.momentOfInertia;
    this.angularVelocity += angularAcceleration * dt;
  }

  /**
   * Apply external force (gravity, explosions, etc.)
   */
  applyForce(forceX, forceY, dt) {
    const accelerationX = forceX / this.mass;
    const accelerationY = forceY / this.mass;

    this.velocity.x += accelerationX * dt;
    this.velocity.y += accelerationY * dt;
  }

  /**
   * Apply impulse (instant velocity change)
   */
  applyImpulse(impulseX, impulseY) {
    this.velocity.x += impulseX / this.mass;
    this.velocity.y += impulseY / this.mass;
  }

  /**
   * Toggle inertial dampening
   */
  toggleInertialDampening() {
    this.inertialDampeningActive = !this.inertialDampeningActive;
    return this.inertialDampeningActive;
  }

  /**
   * Update physics
   */
  update(dt) {
    // Apply dampening forces
    if (this.inertialDampeningActive) {
      // Inertial dampening tries to bring ship to rest
      this.velocity.x *= (1 - this.dampeningStrength);
      this.velocity.y *= (1 - this.dampeningStrength);
      this.angularVelocity *= (1 - this.dampeningStrength * 2);
    } else {
      // Natural space dampening (very minimal)
      this.velocity.x *= (1 - this.linearDampening);
      this.velocity.y *= (1 - this.linearDampening);
      this.angularVelocity *= (1 - this.angularDampening);
    }

    // Update rotation
    this.rotation += this.angularVelocity * dt;

    // Normalize rotation to 0-2π
    while (this.rotation > Math.PI * 2) this.rotation -= Math.PI * 2;
    while (this.rotation < 0) this.rotation += Math.PI * 2;

    // Update position
    this.position.x += this.velocity.x * dt;
    this.position.y += this.velocity.y * dt;

    // Velocity limiting (ULTRA-ENHANCED: 2x higher max speed for MASSIVE scale travel)
    const speed = Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
    const maxSpeed = 1200; // Was 600, now 2x for EPIC scale travel
    if (speed > maxSpeed) {
      const scale = maxSpeed / speed;
      this.velocity.x *= scale;
      this.velocity.y *= scale;
    }

    // Angular velocity limiting (ULTRA-ENHANCED: faster rotation)
    const maxAngularVelocity = 6; // Was 4, now 1.5x
    if (Math.abs(this.angularVelocity) > maxAngularVelocity) {
      this.angularVelocity = Math.sign(this.angularVelocity) * maxAngularVelocity;
    }

    // Sync back to ship object
    this.ship.x = this.position.x;
    this.ship.y = this.position.y;
    this.ship.vx = this.velocity.x;
    this.ship.vy = this.velocity.y;
    this.ship.rotation = this.rotation;
    this.ship.rotationVel = this.angularVelocity;
  }

  /**
   * Get current speed
   */
  getSpeed() {
    return Math.sqrt(this.velocity.x * this.velocity.x + this.velocity.y * this.velocity.y);
  }

  /**
   * Get velocity in ship's reference frame
   */
  getRelativeVelocity() {
    const speed = this.getSpeed();
    if (speed === 0) return { forward: 0, lateral: 0 };

    const velocityAngle = Math.atan2(this.velocity.y, this.velocity.x);
    const relativeAngle = velocityAngle - this.rotation;

    return {
      forward: speed * Math.cos(relativeAngle),
      lateral: speed * Math.sin(relativeAngle)
    };
  }

  /**
   * Calculate orbital velocity around a body
   */
  calculateOrbitalVelocity(bodyX, bodyY, bodyMass, G = 0.5) {
    const dx = bodyX - this.position.x;
    const dy = bodyY - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return { vx: 0, vy: 0 };

    // Orbital velocity magnitude: v = sqrt(G * M / r)
    const orbitalSpeed = Math.sqrt((G * bodyMass) / distance);

    // Perpendicular to radius vector
    const tangentAngle = Math.atan2(dy, dx) + Math.PI / 2;

    return {
      vx: Math.cos(tangentAngle) * orbitalSpeed,
      vy: Math.sin(tangentAngle) * orbitalSpeed
    };
  }

  /**
   * Match velocity with target (for docking, formation flying)
   */
  matchVelocity(targetVx, targetVy, strength = 0.1) {
    this.velocity.x += (targetVx - this.velocity.x) * strength;
    this.velocity.y += (targetVy - this.velocity.y) * strength;
  }

  /**
   * Kill all velocity (emergency stop)
   */
  killVelocity() {
    this.velocity.x = 0;
    this.velocity.y = 0;
    this.angularVelocity = 0;
  }

  /**
   * Set cargo mass (NEW: affects ship performance)
   */
  setCargoMass(cargoMass) {
    this.cargoMass = Math.max(0, Math.min(cargoMass, 500)); // Clamp 0-500 kg
    this.ship.cargoMass = this.cargoMass;
  }

  /**
   * Get flight information for HUD (ENHANCED: includes cargo and damage info)
   */
  getFlightInfo() {
    const speed = this.getSpeed();
    const relativeVel = this.getRelativeVelocity();

    return {
      speed: Math.floor(speed),
      forwardSpeed: Math.floor(relativeVel.forward),
      lateralSpeed: Math.floor(relativeVel.lateral),
      angularVelocity: this.angularVelocity.toFixed(2),
      inertialDampeningActive: this.inertialDampeningActive,
      mass: this.mass,
      cargoMass: this.cargoMass, // NEW
      effectiveMass: this.mass + this.cargoMass, // NEW
      thrusterEfficiency: Math.floor(this.thrusterEfficiency * 100), // NEW
      damageMultiplier: this.damageMultiplier.toFixed(2) // NEW
    };
  }

  /**
   * ASTROPHYSICAL MANEUVERS
   */

  /**
   * Calculate and apply gravity assist (slingshot maneuver)
   * Uses a celestial body's gravity to change velocity without fuel
   */
  applyGravityAssist(bodyX, bodyY, bodyVx, bodyVy, bodyMass, G = 0.5) {
    const dx = bodyX - this.position.x;
    const dy = bodyY - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance === 0) return { deltaV: 0, angle: 0 };

    // Calculate gravitational force
    const forceMagnitude = (G * bodyMass * this.mass) / (distance * distance);
    const forceX = (dx / distance) * forceMagnitude / this.mass;
    const forceY = (dy / distance) * forceMagnitude / this.mass;

    // Relative velocity to body
    const relVx = this.velocity.x - bodyVx;
    const relVy = this.velocity.y - bodyVy;
    const relSpeed = Math.sqrt(relVx * relVx + relVy * relVy);

    // Calculate deflection angle (more deflection at close approach)
    const deflectionRadius = bodyMass * 10; // Influence radius
    const deflectionFactor = Math.max(0, 1 - distance / deflectionRadius);

    // Apply slingshot effect
    if (deflectionFactor > 0.1) {
      // Calculate exit velocity (gravity assist boost)
      const boostFactor = 1 + deflectionFactor * 0.3;
      const exitAngle = Math.atan2(relVy, relVx) + deflectionFactor * Math.PI * 0.5;

      this.velocity.x = bodyVx + Math.cos(exitAngle) * relSpeed * boostFactor;
      this.velocity.y = bodyVy + Math.sin(exitAngle) * relSpeed * boostFactor;

      const deltaV = relSpeed * (boostFactor - 1);
      return { deltaV, angle: exitAngle, success: true };
    }

    return { deltaV: 0, angle: 0, success: false };
  }

  /**
   * Calculate Hohmann transfer orbit parameters
   * Efficient orbital transfer between two circular orbits
   */
  calculateHohmannTransfer(currentRadius, targetRadius, centralBodyMass, G = 0.5) {
    if (currentRadius === targetRadius) return null;

    // Semi-major axis of transfer ellipse
    const semiMajorAxis = (currentRadius + targetRadius) / 2;

    // Current circular orbital velocity
    const v1 = Math.sqrt(G * centralBodyMass / currentRadius);

    // Transfer orbit periapsis velocity
    const vTransfer1 = Math.sqrt(G * centralBodyMass * (2 / currentRadius - 1 / semiMajorAxis));

    // First burn (delta-v)
    const deltaV1 = vTransfer1 - v1;

    // Target circular orbital velocity
    const v2 = Math.sqrt(G * centralBodyMass / targetRadius);

    // Transfer orbit apoapsis velocity
    const vTransfer2 = Math.sqrt(G * centralBodyMass * (2 / targetRadius - 1 / semiMajorAxis));

    // Second burn (delta-v)
    const deltaV2 = v2 - vTransfer2;

    // Transfer time (half period of transfer ellipse)
    const transferTime = Math.PI * Math.sqrt(Math.pow(semiMajorAxis, 3) / (G * centralBodyMass));

    return {
      deltaV1: Math.abs(deltaV1),
      deltaV2: Math.abs(deltaV2),
      totalDeltaV: Math.abs(deltaV1) + Math.abs(deltaV2),
      transferTime,
      expanding: targetRadius > currentRadius
    };
  }

  /**
   * Execute prograde burn (accelerate along orbit direction)
   * Raises apoapsis of orbit
   */
  executeProgradeBurn(bodyX, bodyY, bodyMass, burnStrength, dt, G = 0.5) {
    const orbitalVel = this.calculateOrbitalVelocity(bodyX, bodyY, bodyMass, G);

    // Burn in direction of orbital motion
    const burnAngle = Math.atan2(orbitalVel.vy, orbitalVel.vx);
    const burnForce = this.mainThrusterForce * burnStrength * this.thrusterEfficiency;

    const effectiveMass = this.mass + this.cargoMass;
    const acceleration = burnForce / effectiveMass;

    this.velocity.x += Math.cos(burnAngle) * acceleration * dt;
    this.velocity.y += Math.sin(burnAngle) * acceleration * dt;

    return {
      angle: burnAngle,
      deltaV: acceleration * dt,
      direction: 'prograde'
    };
  }

  /**
   * Execute retrograde burn (decelerate along orbit direction)
   * Lowers periapsis of orbit
   */
  executeRetrogradeBurn(bodyX, bodyY, bodyMass, burnStrength, dt, G = 0.5) {
    const orbitalVel = this.calculateOrbitalVelocity(bodyX, bodyY, bodyMass, G);

    // Burn opposite to orbital motion
    const burnAngle = Math.atan2(orbitalVel.vy, orbitalVel.vx) + Math.PI;
    const burnForce = this.mainThrusterForce * burnStrength * this.thrusterEfficiency;

    const effectiveMass = this.mass + this.cargoMass;
    const acceleration = burnForce / effectiveMass;

    this.velocity.x += Math.cos(burnAngle) * acceleration * dt;
    this.velocity.y += Math.sin(burnAngle) * acceleration * dt;

    return {
      angle: burnAngle,
      deltaV: acceleration * dt,
      direction: 'retrograde'
    };
  }

  /**
   * Calculate orbital insertion burn
   * Circularize orbit at current altitude
   */
  calculateOrbitalInsertion(bodyX, bodyY, bodyMass, G = 0.5) {
    const dx = bodyX - this.position.x;
    const dy = bodyY - this.position.y;
    const currentRadius = Math.sqrt(dx * dx + dy * dy);

    // Required circular orbital velocity at this radius
    const requiredOrbitalVel = this.calculateOrbitalVelocity(bodyX, bodyY, bodyMass, G);

    // Current velocity difference
    const deltaVx = requiredOrbitalVel.vx - this.velocity.x;
    const deltaVy = requiredOrbitalVel.vy - this.velocity.y;
    const deltaVMagnitude = Math.sqrt(deltaVx * deltaVx + deltaVy * deltaVy);

    // Burn angle
    const burnAngle = Math.atan2(deltaVy, deltaVx);

    return {
      deltaV: deltaVMagnitude,
      angle: burnAngle,
      duration: deltaVMagnitude / (this.mainThrusterForce / (this.mass + this.cargoMass)),
      requiredVelocity: requiredOrbitalVel,
      currentRadius
    };
  }

  /**
   * Execute orbital insertion burn
   */
  executeOrbitalInsertion(bodyX, bodyY, bodyMass, burnStrength, dt, G = 0.5) {
    const insertion = this.calculateOrbitalInsertion(bodyX, bodyY, bodyMass, G);

    const burnForce = this.mainThrusterForce * burnStrength * this.thrusterEfficiency;
    const effectiveMass = this.mass + this.cargoMass;
    const acceleration = burnForce / effectiveMass;

    this.velocity.x += Math.cos(insertion.angle) * acceleration * dt;
    this.velocity.y += Math.sin(insertion.angle) * acceleration * dt;

    return {
      remainingDeltaV: insertion.deltaV - acceleration * dt,
      angle: insertion.angle,
      progress: Math.min(1, (acceleration * dt) / insertion.deltaV)
    };
  }

  /**
   * Simulate aerobraking (atmospheric drag to reduce velocity)
   * Used for fuel-efficient orbital insertion at planets with atmosphere
   */
  applyAerobraking(bodyX, bodyY, bodyRadius, atmosphereHeight, dt) {
    const dx = bodyX - this.position.x;
    const dy = bodyY - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Check if in atmosphere
    const altitude = distance - bodyRadius;
    if (altitude > atmosphereHeight) {
      return { inAtmosphere: false, dragForce: 0 };
    }

    // Calculate atmospheric density (exponential falloff)
    const densityAtSurface = 1.0;
    const scaleHeight = atmosphereHeight / 5;
    const density = densityAtSurface * Math.exp(-altitude / scaleHeight);

    // Drag force = 0.5 * density * velocity^2 * drag_coefficient * cross_section_area
    const speed = this.getSpeed();
    const dragCoefficient = 0.5;
    const crossSectionArea = 10; // Arbitrary units

    const dragForce = 0.5 * density * speed * speed * dragCoefficient * crossSectionArea;

    // Apply drag opposite to velocity
    if (speed > 0) {
      const dragAccelX = -(this.velocity.x / speed) * dragForce / this.mass;
      const dragAccelY = -(this.velocity.y / speed) * dragForce / this.mass;

      this.velocity.x += dragAccelX * dt;
      this.velocity.y += dragAccelY * dt;

      // Heat generation from aerobraking
      const heatGeneration = dragForce * speed * 0.01;

      return {
        inAtmosphere: true,
        dragForce,
        altitude,
        density,
        heatGeneration,
        deltaV: Math.sqrt(dragAccelX * dragAccelX + dragAccelY * dragAccelY) * dt
      };
    }

    return { inAtmosphere: true, dragForce: 0 };
  }

  /**
   * Calculate Lagrange point positions
   * L1-L5 equilibrium points in a two-body system
   */
  calculateLagrangePoints(body1X, body1Y, body1Mass, body2X, body2Y, body2Mass) {
    const dx = body2X - body1X;
    const dy = body2Y - body1Y;
    const distance = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);

    // Mass ratio
    const mu = body2Mass / (body1Mass + body2Mass);

    // L1 (between bodies, closer to smaller body)
    const r1 = distance * (1 - Math.pow(mu / 3, 1 / 3));
    const L1 = {
      x: body1X + Math.cos(angle) * r1,
      y: body1Y + Math.sin(angle) * r1
    };

    // L2 (beyond smaller body)
    const r2 = distance * (1 + Math.pow(mu / 3, 1 / 3));
    const L2 = {
      x: body1X + Math.cos(angle) * r2,
      y: body1Y + Math.sin(angle) * r2
    };

    // L3 (opposite side of larger body)
    const r3 = distance * (1 + 5 * mu / 12);
    const L3 = {
      x: body1X - Math.cos(angle) * r3,
      y: body1Y - Math.sin(angle) * r3
    };

    // L4 and L5 (60 degrees ahead/behind smaller body)
    const r45 = distance;
    const L4 = {
      x: body1X + Math.cos(angle + Math.PI / 3) * r45,
      y: body1Y + Math.sin(angle + Math.PI / 3) * r45
    };

    const L5 = {
      x: body1X + Math.cos(angle - Math.PI / 3) * r45,
      y: body1Y + Math.sin(angle - Math.PI / 3) * r45
    };

    return { L1, L2, L3, L4, L5 };
  }

  /**
   * Station keeping at Lagrange point
   * Small corrections to maintain position
   */
  maintainLagrangePosition(targetX, targetY, correctionStrength = 0.05) {
    const dx = targetX - this.position.x;
    const dy = targetY - this.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    if (distance > 50) { // Threshold for station keeping
      const correctionX = (dx / distance) * correctionStrength;
      const correctionY = (dy / distance) * correctionStrength;

      this.velocity.x += correctionX;
      this.velocity.y += correctionY;

      return {
        active: true,
        distance,
        correctionApplied: Math.sqrt(correctionX * correctionX + correctionY * correctionY)
      };
    }

    return { active: false, distance };
  }
}

/**
 * Helper function to calculate intercept course
 * Returns thrust vector to intercept moving target
 */
export function calculateInterceptVector(shipPos, shipVel, targetPos, targetVel, projectileSpeed) {
  const dx = targetPos.x - shipPos.x;
  const dy = targetPos.y - shipPos.y;
  const dvx = targetVel.x - shipVel.x;
  const dvy = targetVel.y - shipVel.y;

  // Quadratic equation coefficients for intercept
  const a = dvx * dvx + dvy * dvy - projectileSpeed * projectileSpeed;
  const b = 2 * (dx * dvx + dy * dvy);
  const c = dx * dx + dy * dy;

  const discriminant = b * b - 4 * a * c;

  if (discriminant < 0) {
    // No intercept possible, aim at current position
    return Math.atan2(dy, dx);
  }

  const t1 = (-b + Math.sqrt(discriminant)) / (2 * a);
  const t2 = (-b - Math.sqrt(discriminant)) / (2 * a);

  const t = Math.min(t1 > 0 ? t1 : Infinity, t2 > 0 ? t2 : Infinity);

  if (t === Infinity) {
    return Math.atan2(dy, dx);
  }

  const interceptX = targetPos.x + targetVel.x * t;
  const interceptY = targetPos.y + targetVel.y * t;

  return Math.atan2(interceptY - shipPos.y, interceptX - shipPos.x);
}
