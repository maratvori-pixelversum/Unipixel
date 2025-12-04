/**
 * Math Utility Functions
 * Common mathematical operations used across the game engine
 */

export class MathUtils {
  /**
   * Clamp a value between min and max
   * @param {number} value - Value to clamp
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Clamped value
   */
  static clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Linear interpolation between two values
   * @param {number} a - Start value
   * @param {number} b - End value
   * @param {number} t - Interpolation factor (0-1)
   * @returns {number} Interpolated value
   */
  static lerp(a, b, t) {
    return a + (b - a) * t;
  }

  /**
   * Map a value from one range to another
   * @param {number} value - Input value
   * @param {number} inMin - Input range minimum
   * @param {number} inMax - Input range maximum
   * @param {number} outMin - Output range minimum
   * @param {number} outMax - Output range maximum
   * @returns {number} Mapped value
   */
  static map(value, inMin, inMax, outMin, outMax) {
    return outMin + (outMax - outMin) * ((value - inMin) / (inMax - inMin));
  }

  /**
   * Calculate distance between two points
   * @param {number} x1 - First point X
   * @param {number} y1 - First point Y
   * @param {number} x2 - Second point X
   * @param {number} y2 - Second point Y
   * @returns {number} Distance
   */
  static distance(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Calculate squared distance (faster, no sqrt)
   * @param {number} x1 - First point X
   * @param {number} y1 - First point Y
   * @param {number} x2 - Second point X
   * @param {number} y2 - Second point Y
   * @returns {number} Squared distance
   */
  static distanceSquared(x1, y1, x2, y2) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    return dx * dx + dy * dy;
  }

  /**
   * Calculate angle between two points (in radians)
   * @param {number} x1 - First point X
   * @param {number} y1 - First point Y
   * @param {number} x2 - Second point X
   * @param {number} y2 - Second point Y
   * @returns {number} Angle in radians
   */
  static angleBetween(x1, y1, x2, y2) {
    return Math.atan2(y2 - y1, x2 - x1);
  }

  /**
   * Normalize angle to 0-2π range
   * @param {number} angle - Angle in radians
   * @returns {number} Normalized angle
   */
  static normalizeAngle(angle) {
    while (angle < 0) angle += Math.PI * 2;
    while (angle >= Math.PI * 2) angle -= Math.PI * 2;
    return angle;
  }

  /**
   * Convert degrees to radians
   * @param {number} degrees - Angle in degrees
   * @returns {number} Angle in radians
   */
  static degToRad(degrees) {
    return degrees * (Math.PI / 180);
  }

  /**
   * Convert radians to degrees
   * @param {number} radians - Angle in radians
   * @returns {number} Angle in degrees
   */
  static radToDeg(radians) {
    return radians * (180 / Math.PI);
  }

  /**
   * Seeded random number generator
   * @param {number} seed - Seed value
   * @returns {Function} Random function that returns 0-1
   */
  static seededRandom(seed) {
    let value = seed || 12345;
    return function() {
      value = (value * 9301 + 49297) % 233280;
      return value / 233280;
    };
  }

  /**
   * Random integer between min and max (inclusive)
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Random integer
   */
  static randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Random float between min and max
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Random float
   */
  static randomFloat(min, max) {
    return Math.random() * (max - min) + min;
  }

  /**
   * Check if point is in circle
   * @param {number} px - Point X
   * @param {number} py - Point Y
   * @param {number} cx - Circle center X
   * @param {number} cy - Circle center Y
   * @param {number} radius - Circle radius
   * @returns {boolean} True if point is in circle
   */
  static pointInCircle(px, py, cx, cy, radius) {
    return this.distanceSquared(px, py, cx, cy) <= radius * radius;
  }

  /**
   * Check if point is in rectangle
   * @param {number} px - Point X
   * @param {number} py - Point Y
   * @param {number} rx - Rectangle X
   * @param {number} ry - Rectangle Y
   * @param {number} rw - Rectangle width
   * @param {number} rh - Rectangle height
   * @returns {boolean} True if point is in rectangle
   */
  static pointInRect(px, py, rx, ry, rw, rh) {
    return px >= rx && px <= rx + rw && py >= ry && py <= ry + rh;
  }

  /**
   * Smooth step interpolation (ease in/out)
   * @param {number} edge0 - Lower edge
   * @param {number} edge1 - Upper edge
   * @param {number} x - Value to interpolate
   * @returns {number} Smoothly interpolated value (0-1)
   */
  static smoothstep(edge0, edge1, x) {
    const t = this.clamp((x - edge0) / (edge1 - edge0), 0, 1);
    return t * t * (3 - 2 * t);
  }

  /**
   * Wrap value to range (circular)
   * @param {number} value - Value to wrap
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Wrapped value
   */
  static wrap(value, min, max) {
    const range = max - min;
    while (value < min) value += range;
    while (value >= max) value -= range;
    return value;
  }

  /**
   * Calculate percentage
   * @param {number} value - Current value
   * @param {number} max - Maximum value
   * @returns {number} Percentage (0-100)
   */
  static percentage(value, max) {
    return max > 0 ? (value / max) * 100 : 0;
  }
}
