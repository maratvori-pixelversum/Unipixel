/**
 * Celestial Body Rotation System
 * REALISTIC UPGRADE: Adds axis rotation to all celestial bodies
 *
 * Features:
 * - Realistic rotation periods (faster near equator, slower at poles)
 * - Surface features move as body rotates
 * - Different rotation speeds for different body types
 * - Tidal locking for close-orbiting bodies
 * - Retrograde rotation for some bodies
 */

import { SeededRandom } from '../utils/SeededRandom.js';

export class CelestialRotation {
  constructor() {
    this.rotationData = new Map(); // Cache rotation data per body
  }

  /**
   * Initialize rotation data for a celestial body
   */
  initializeRotation(body, bodyType, seed) {
    const bodyId = `${body.x}_${body.y}_${body.radius}`;

    if (this.rotationData.has(bodyId)) {
      return this.rotationData.get(bodyId);
    }

    const rng = new SeededRandom(seed || bodyId);

    // Determine rotation period based on body type
    const rotationSpeed = this.calculateRotationSpeed(bodyType, body, rng);

    // Determine if retrograde (backwards rotation) - 10% chance
    const isRetrograde = rng.next() < 0.1;

    // Axial tilt (0-90 degrees) affects how we see surface features
    const axialTilt = rng.range(0, 45) * (Math.PI / 180);

    // Initial rotation angle
    const initialAngle = rng.next() * Math.PI * 2;

    const rotation = {
      angle: initialAngle,
      speed: rotationSpeed * (isRetrograde ? -1 : 1),
      isRetrograde,
      axialTilt,
      period: 2 * Math.PI / Math.abs(rotationSpeed), // Time for full rotation
      bodyType,
      surfaceOffset: 0 // Track how far surface has rotated
    };

    this.rotationData.set(bodyId, rotation);
    return rotation;
  }

  /**
   * Calculate rotation speed based on body type
   * Returns radians per frame (at 60 FPS)
   *
   * Real-world examples:
   * - Earth: ~24 hours = 0.0000727 rad/s
   * - Jupiter: ~10 hours = 0.000175 rad/s  (very fast)
   * - Venus: ~243 days = 0.00000030 rad/s (very slow, retrograde)
   * - Moon: ~27 days (tidally locked)
   */
  calculateRotationSpeed(bodyType, body, rng) {
    // ENHANCED: MUCH FASTER rotation speeds for visible animation
    // Base speeds in radians per frame (60 FPS)
    // Multiplied by 5-10x to make rotation clearly visible

    const baseSpeed = {
      // Stars rotate slowly but visibly
      'star': 0.0005,              // 5x faster - visible surface movement

      // Rocky planets - clearly visible rotation
      'rocky_planet': 0.0025,      // 5x faster - 1-2 minute full rotation
      'terran_planet': 0.002,      // 5x faster
      'desert_planet': 0.0015,     // 5x faster
      'ice_planet': 0.002,         // 5x faster
      'volcanic_planet': 0.003,    // 5x faster
      'lava_planet': 0.0001,       // Still slow (tidally locked)
      'ocean_planet': 0.002,       // 5x faster
      'carbon_planet': 0.0015,     // 5x faster
      'super_earth': 0.0025,       // 5x faster
      'eyeball_planet': 0.0001,    // Tidally locked
      'tidally_locked_planet': 0.0001,

      // Gas giants - VERY fast visible rotation
      'gas_giant': 0.005,          // 5x faster - dramatic cloud band movement
      'ice_giant': 0.004,          // 5x faster
      'hot_jupiter': 0.0003,       // Slightly faster even though locked
      'storm_giant': 0.006,        // 5x faster - extreme rotation
      'mini_neptune': 0.0035,      // 5x faster

      // Moons - visible rotation
      'moon': 0.001,               // 5x faster
      'small_moon': 0.0015,        // 5x faster
      'medium_moon': 0.001,        // 5x faster
      'large_moon': 0.0005,        // 5x faster

      // Dwarf planets
      'dwarf_planet': 0.0004,

      // Exotic bodies
      'neutron_star': 0.01,        // Pulsars spin incredibly fast!
      'blackhole': 0.002,          // Rotating blackhole

      // Default
      'default': 0.0003
    };

    const speed = baseSpeed[bodyType] || baseSpeed.default;

    // Add variation (±30%)
    const variation = rng.range(0.7, 1.3);

    return speed * variation;
  }

  /**
   * Update rotation for a body
   */
  update(body, dt) {
    const bodyId = `${body.x}_${body.y}_${body.radius}`;
    const rotation = this.rotationData.get(bodyId);

    if (!rotation) return null;

    // Update rotation angle
    rotation.angle += rotation.speed * dt * 60; // dt is in seconds, normalize to 60 FPS

    // Keep angle in 0-2π range
    if (rotation.angle > Math.PI * 2) {
      rotation.angle -= Math.PI * 2;
    } else if (rotation.angle < 0) {
      rotation.angle += Math.PI * 2;
    }

    // Update surface offset (for texture scrolling)
    rotation.surfaceOffset += rotation.speed * dt * 60;

    return rotation;
  }

  /**
   * Get rotation data for a body
   */
  getRotation(body) {
    const bodyId = `${body.x}_${body.y}_${body.radius}`;
    return this.rotationData.get(bodyId);
  }

  /**
   * Calculate surface feature position considering rotation
   * This transforms a feature's original position based on current rotation
   */
  transformSurfaceFeature(feature, rotation, bodyRadius) {
    if (!rotation) return feature;

    // Feature's longitude changes with rotation
    const rotatedAngle = feature.angle + rotation.angle;

    // Feature's latitude is affected by axial tilt (but we simplify this)
    const rotatedLatitude = feature.latitude;

    // Calculate 3D position on sphere considering rotation
    const x = Math.cos(rotatedAngle) * Math.cos(rotatedLatitude) * bodyRadius;
    const y = Math.sin(rotatedAngle) * Math.cos(rotatedLatitude) * bodyRadius;
    const z = Math.sin(rotatedLatitude) * bodyRadius;

    // Determine visibility (features on back hemisphere are hidden)
    const visible = z > -bodyRadius * 0.1; // Small overlap for smoother transitions

    return {
      x,
      y,
      z,
      visible,
      angle: rotatedAngle,
      latitude: rotatedLatitude,
      // Brightness based on angle (features near limb are darker)
      brightness: visible ? Math.max(0.3, (z + bodyRadius) / (2 * bodyRadius)) : 0
    };
  }

  /**
   * Apply rotation to all surface features (continents, craters, clouds, etc.)
   */
  rotateSurfaceFeatures(features, rotation, bodyRadius) {
    if (!rotation || !features) return features;

    const rotatedFeatures = {
      ...features,
      continents: features.continents?.map(f => ({
        ...f,
        transformed: this.transformSurfaceFeature(f, rotation, bodyRadius)
      })) || [],
      craters: features.craters?.map(f => ({
        ...f,
        transformed: this.transformSurfaceFeature(f, rotation, bodyRadius)
      })) || [],
      clouds: features.clouds?.map(f => ({
        ...f,
        // Clouds move slightly faster than surface (atmospheric super-rotation)
        transformed: this.transformSurfaceFeature(
          { ...f, angle: f.angle + rotation.angle * 1.05 },
          { ...rotation, angle: 0 },
          bodyRadius
        )
      })) || [],
      iceCaps: features.iceCaps?.map(f => ({
        ...f,
        transformed: this.transformSurfaceFeature(f, rotation, bodyRadius)
      })) || [],
      bands: features.bands?.map(f => ({
        ...f,
        // Gas giant bands move at different speeds (differential rotation)
        transformed: this.transformSurfaceFeature(
          { ...f, angle: f.angle + rotation.angle * (1.0 + f.latitude * 0.3) },
          { ...rotation, angle: 0 },
          bodyRadius
        )
      })) || [],
      spots: features.spots?.map(f => ({
        ...f,
        transformed: this.transformSurfaceFeature(f, rotation, bodyRadius)
      })) || []
    };

    return rotatedFeatures;
  }

  /**
   * Check if body should be tidally locked to parent
   * Bodies very close to their parent become tidally locked
   */
  checkTidalLocking(body, parentBody, parentMass) {
    if (!parentBody) return false;

    const distance = Math.sqrt(
      Math.pow(body.x - parentBody.x, 2) +
      Math.pow(body.y - parentBody.y, 2)
    );

    // Simplified Roche limit check
    // Real tidal locking happens within ~2-3x Roche limit for small bodies
    const rocheLimit = parentBody.radius * 2.5 * Math.pow(parentMass / body.mass, 1/3);

    return distance < rocheLimit * 3;
  }

  /**
   * Synchronize rotation to orbital period (tidal locking)
   */
  applyTidalLocking(body, orbitalPeriod) {
    const bodyId = `${body.x}_${body.y}_${body.radius}`;
    const rotation = this.rotationData.get(bodyId);

    if (!rotation) return;

    // Set rotation period equal to orbital period
    const orbitalSpeed = 2 * Math.PI / orbitalPeriod; // radians per frame
    rotation.speed = orbitalSpeed;
    rotation.period = orbitalPeriod;
  }

  /**
   * Reset all rotation data (when changing systems)
   */
  reset() {
    this.rotationData.clear();
  }
}
