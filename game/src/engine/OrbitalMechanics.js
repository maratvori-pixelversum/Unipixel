/**
 * Orbital Mechanics System
 * REALISTIC UPGRADE: Implements Kepler's Laws and realistic orbital dynamics
 *
 * Features:
 * - Elliptical orbits with eccentricity
 * - Kepler's First Law: Orbits are ellipses
 * - Kepler's Second Law: Equal areas in equal times (varying orbital speed)
 * - Kepler's Third Law: Orbital period related to semi-major axis
 * - Orbital elements (eccentricity, semi-major axis, inclination, etc.)
 * - Proper orbital velocities
 * - Apsides (periapsis and apoapsis)
 * - Mean anomaly and true anomaly calculations
 */

export class OrbitalMechanics {
  constructor() {
    this.G = 2.0; // ENHANCED: Increased gravitational constant for faster, more visible orbits (was 0.5)
    this.orbitalElements = new Map(); // Store orbital data for each body
  }

  /**
   * Initialize orbital elements for a celestial body
   *
   * Orbital Elements:
   * - a: Semi-major axis (average orbital radius)
   * - e: Eccentricity (0 = circle, 0-1 = ellipse)
   * - i: Inclination (orbital tilt)
   * - Ω: Longitude of ascending node
   * - ω: Argument of periapsis
   * - M₀: Mean anomaly at epoch
   */
  initializeOrbit(body, centralBody, semiMajorAxis, seed) {
    const bodyId = this.getBodyId(body);
    const rng = this.createRNG(seed || bodyId);

    // Eccentricity (ENHANCED: more elliptical orbits for visual interest)
    // Real solar system: Earth 0.017, Mars 0.093, Mercury 0.206, Pluto 0.248
    let eccentricity;
    const rand = rng.next();
    if (rand < 0.4) {
      eccentricity = rng.range(0.05, 0.12); // Slightly elliptical (was 0.001-0.05)
    } else if (rand < 0.75) {
      eccentricity = rng.range(0.12, 0.25); // Moderately elliptical (was 0.05-0.15)
    } else {
      eccentricity = rng.range(0.25, 0.45); // Highly elliptical (was 0.15-0.35)
    }

    // Orbital inclination (ENHANCED: more varied orbital planes for visual interest)
    // Real values: Earth 0°, Mars 1.85°, Mercury 7°, Pluto 17°
    let inclination;
    if (rng.next() < 0.5) {
      inclination = rng.range(2, 8) * (Math.PI / 180); // Low inclination (was 0-5)
    } else if (rng.next() < 0.8) {
      inclination = rng.range(8, 20) * (Math.PI / 180); // Medium (was 5-15)
    } else {
      inclination = rng.range(20, 40) * (Math.PI / 180); // High (was 15-30)
    }

    // Other orbital angles (random orientation in space)
    const longitudeOfAscendingNode = rng.next() * Math.PI * 2;
    const argumentOfPeriapsis = rng.next() * Math.PI * 2;
    const meanAnomalyAtEpoch = rng.next() * Math.PI * 2;

    // Calculate orbital period using Kepler's Third Law
    // T² = (4π² / GM) × a³
    const period = this.calculateOrbitalPeriod(semiMajorAxis, centralBody.mass);

    // Calculate mean motion (radians per unit time)
    const meanMotion = (2 * Math.PI) / period;

    const elements = {
      // Primary orbital elements
      semiMajorAxis,                    // a
      eccentricity,                     // e
      inclination,                      // i
      longitudeOfAscendingNode,         // Ω
      argumentOfPeriapsis,              // ω
      meanAnomalyAtEpoch,               // M₀

      // Derived quantities
      period,                           // T
      meanMotion,                       // n

      // Apsides (closest and farthest points)
      periapsis: semiMajorAxis * (1 - eccentricity),
      apoapsis: semiMajorAxis * (1 + eccentricity),

      // Current state
      meanAnomaly: meanAnomalyAtEpoch,  // M
      eccentricAnomaly: meanAnomalyAtEpoch, // E (initial approximation)
      trueAnomaly: meanAnomalyAtEpoch,  // ν

      // Reference to central body
      centralBody,
      centralBodyId: this.getBodyId(centralBody)
    };

    this.orbitalElements.set(bodyId, elements);
    return elements;
  }

  /**
   * Calculate orbital period using Kepler's Third Law
   * T² = (4π² / GM) × a³
   */
  calculateOrbitalPeriod(semiMajorAxis, centralMass) {
    const T_squared = (4 * Math.PI * Math.PI / (this.G * centralMass)) *
                      Math.pow(semiMajorAxis, 3);
    return Math.sqrt(T_squared);
  }

  /**
   * Calculate orbital velocity at a given distance
   * v = sqrt(GM(2/r - 1/a))  (Vis-viva equation)
   */
  calculateOrbitalVelocity(r, semiMajorAxis, centralMass) {
    const v_squared = this.G * centralMass * (2 / r - 1 / semiMajorAxis);
    return Math.sqrt(Math.max(0, v_squared));
  }

  /**
   * Update orbital position using Kepler's equation
   * This advances the body along its elliptical orbit
   */
  updateOrbit(body, dt) {
    const bodyId = this.getBodyId(body);
    const elements = this.orbitalElements.get(bodyId);

    if (!elements) return null;

    // Update mean anomaly (increases linearly with time)
    // M = M₀ + n*t
    elements.meanAnomaly += elements.meanMotion * dt;

    // Keep mean anomaly in [0, 2π]
    elements.meanAnomaly = elements.meanAnomaly % (2 * Math.PI);
    if (elements.meanAnomaly < 0) elements.meanAnomaly += 2 * Math.PI;

    // Solve Kepler's equation: M = E - e*sin(E)
    // Use Newton-Raphson iteration to find eccentric anomaly E
    elements.eccentricAnomaly = this.solveKeplerEquation(
      elements.meanAnomaly,
      elements.eccentricity
    );

    // Calculate true anomaly from eccentric anomaly
    // ν = 2 * arctan(sqrt((1+e)/(1-e)) * tan(E/2))
    elements.trueAnomaly = this.calculateTrueAnomaly(
      elements.eccentricAnomaly,
      elements.eccentricity
    );

    // Calculate position in orbital plane
    const r = this.calculateOrbitalRadius(elements);
    const orbitalPosition = this.calculateOrbitalPlanePosition(elements, r);

    // Transform to 3D space considering inclination
    const position3D = this.transformTo3D(orbitalPosition, elements);

    // Calculate velocity vector
    const velocity = this.calculateVelocityVector(elements, r);

    // Update body position
    body.orbitX = position3D.x;
    body.orbitY = position3D.y;
    body.orbitZ = position3D.z || 0;

    body.orbitVx = velocity.vx;
    body.orbitVy = velocity.vy;
    body.orbitVz = velocity.vz || 0;

    return {
      position: position3D,
      velocity,
      radius: r,
      trueAnomaly: elements.trueAnomaly,
      meanAnomaly: elements.meanAnomaly,
      eccentricAnomaly: elements.eccentricAnomaly
    };
  }

  /**
   * Solve Kepler's equation: M = E - e*sin(E)
   * Uses Newton-Raphson method
   */
  solveKeplerEquation(M, e, maxIterations = 10, tolerance = 1e-6) {
    // Initial guess: E = M
    let E = M;

    for (let i = 0; i < maxIterations; i++) {
      const f = E - e * Math.sin(E) - M; // f(E) = E - e*sin(E) - M
      const fPrime = 1 - e * Math.cos(E); // f'(E) = 1 - e*cos(E)

      const delta = f / fPrime;
      E = E - delta;

      if (Math.abs(delta) < tolerance) {
        break;
      }
    }

    return E;
  }

  /**
   * Calculate true anomaly from eccentric anomaly
   * ν = 2 * arctan(sqrt((1+e)/(1-e)) * tan(E/2))
   */
  calculateTrueAnomaly(E, e) {
    // Clamp eccentricity to avoid division by zero when e >= 1.0
    const safeE = Math.min(e, 0.9999);
    const factor = Math.sqrt((1 + safeE) / (1 - safeE));
    const ν = 2 * Math.atan2(
      factor * Math.sin(E / 2),
      Math.cos(E / 2)
    );
    return ν;
  }

  /**
   * Calculate orbital radius at current true anomaly
   * r = a(1 - e²) / (1 + e*cos(ν))
   */
  calculateOrbitalRadius(elements) {
    const { semiMajorAxis: a, eccentricity: e, trueAnomaly: ν } = elements;
    const denominator = 1 + e * Math.cos(ν);
    // Prevent division by near-zero (parabolic escape trajectory edge case)
    const safeDenominator = Math.max(denominator, 0.0001);
    const r = a * (1 - e * e) / safeDenominator;
    return r;
  }

  /**
   * Calculate position in the orbital plane
   */
  calculateOrbitalPlanePosition(elements, r) {
    const { trueAnomaly: ν, argumentOfPeriapsis: ω } = elements;

    // Angle in orbital plane
    const θ = ν + ω;

    return {
      x: r * Math.cos(θ),
      y: r * Math.sin(θ),
      z: 0 // In orbital plane
    };
  }

  /**
   * Transform orbital plane coordinates to 3D space
   * Applies inclination and longitude of ascending node
   */
  transformTo3D(orbitalPos, elements) {
    const { inclination: i, longitudeOfAscendingNode: Ω } = elements;

    // Rotation matrices for orbital elements
    const x = orbitalPos.x * (Math.cos(Ω) * Math.cos(elements.argumentOfPeriapsis) - Math.sin(Ω) * Math.sin(elements.argumentOfPeriapsis) * Math.cos(i))
            - orbitalPos.y * (Math.cos(Ω) * Math.sin(elements.argumentOfPeriapsis) + Math.sin(Ω) * Math.cos(elements.argumentOfPeriapsis) * Math.cos(i));

    const y = orbitalPos.x * (Math.sin(Ω) * Math.cos(elements.argumentOfPeriapsis) + Math.cos(Ω) * Math.sin(elements.argumentOfPeriapsis) * Math.cos(i))
            - orbitalPos.y * (Math.sin(Ω) * Math.sin(elements.argumentOfPeriapsis) - Math.cos(Ω) * Math.cos(elements.argumentOfPeriapsis) * Math.cos(i));

    const z = orbitalPos.x * Math.sin(elements.argumentOfPeriapsis) * Math.sin(i)
            + orbitalPos.y * Math.cos(elements.argumentOfPeriapsis) * Math.sin(i);

    // Add central body offset
    return {
      x: x + elements.centralBody.x,
      y: y + elements.centralBody.y,
      z: z
    };
  }

  /**
   * Calculate velocity vector at current position
   * Uses vis-viva equation and orbital mechanics
   */
  calculateVelocityVector(elements, r) {
    const { semiMajorAxis: a, eccentricity: e, centralBody, trueAnomaly: ν } = elements;

    // Orbital speed from vis-viva equation
    const v = this.calculateOrbitalVelocity(r, a, centralBody.mass);

    // Velocity is perpendicular to radius vector in orbital plane
    // Direction: tangent to ellipse
    const flightPathAngle = Math.atan2(e * Math.sin(ν), 1 + e * Math.cos(ν));

    // Velocity components in orbital plane
    const vx_orbital = -v * Math.sin(ν + elements.argumentOfPeriapsis + flightPathAngle);
    const vy_orbital = v * Math.cos(ν + elements.argumentOfPeriapsis + flightPathAngle);

    // Transform to 3D (simplified - assumes low inclination for 2D game)
    return {
      vx: vx_orbital,
      vy: vy_orbital,
      vz: 0
    };
  }

  /**
   * Calculate time to next periapsis passage
   */
  calculateTimeToPeriapsis(elements) {
    const { meanAnomaly, period } = elements;

    // Time since last periapsis
    const timeSincePeriapsis = (meanAnomaly / (2 * Math.PI)) * period;

    // Time to next periapsis
    return period - timeSincePeriapsis;
  }

  /**
   * Calculate time to next apoapsis passage
   */
  calculateTimeToApoapsis(elements) {
    const timeToPeri = this.calculateTimeToPeriapsis(elements);
    return timeToPeri + elements.period / 2;
  }

  /**
   * Get orbital elements for a body
   */
  getOrbitalElements(body) {
    return this.orbitalElements.get(this.getBodyId(body));
  }

  /**
   * Create predictable RNG from seed
   */
  createRNG(seed) {
    let value = typeof seed === 'number' ? seed :
                typeof seed === 'string' ? this.hashString(seed) : 12345;

    return {
      next: () => {
        value = (value * 9301 + 49297) % 233280;
        return value / 233280;
      },
      range: (min, max) => {
        value = (value * 9301 + 49297) % 233280;
        return min + (value / 233280) * (max - min);
      }
    };
  }

  /**
   * Hash string to number for RNG seed
   */
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash);
  }

  /**
   * Get unique ID for body
   */
  getBodyId(body) {
    return `${body.x}_${body.y}_${body.radius}_${body.name || ''}`;
  }

  /**
   * Reset all orbital data
   */
  reset() {
    this.orbitalElements.clear();
  }
}
