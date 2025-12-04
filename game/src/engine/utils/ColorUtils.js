/**
 * Color Utility Functions
 * Centralized color manipulation functions used across renderers
 */

export class ColorUtils {
  /**
   * Parse hex color to RGB components
   * @param {string} hex - Hex color string (e.g., '#ff0000' or 'ff0000')
   * @returns {{r: number, g: number, b: number}}
   */
  static hexToRgb(hex) {
    // Remove # if present
    hex = hex.replace(/^#/, '');

    // Parse hex values
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return { r, g, b };
  }

  /**
   * Convert RGB to hex color string
   * @param {number} r - Red (0-255)
   * @param {number} g - Green (0-255)
   * @param {number} b - Blue (0-255)
   * @returns {string} Hex color (e.g., '#ff0000')
   */
  static rgbToHex(r, g, b) {
    const toHex = (n) => {
      const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
      return hex.length === 1 ? '0' + hex : hex;
    };

    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  /**
   * Blend two colors together
   * @param {string} color1 - First hex color
   * @param {string} color2 - Second hex color
   * @param {number} factor - Blend factor (0-1, 0=color1, 1=color2)
   * @returns {string} Blended hex color
   */
  static blendColors(color1, color2, factor) {
    factor = Math.max(0, Math.min(1, factor));

    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);

    const r = c1.r + (c2.r - c1.r) * factor;
    const g = c1.g + (c2.g - c1.g) * factor;
    const b = c1.b + (c2.b - c1.b) * factor;

    return this.rgbToHex(r, g, b);
  }

  /**
   * Adjust color brightness
   * @param {string} color - Hex color
   * @param {number} factor - Brightness factor (>1 brighter, <1 darker)
   * @returns {string} Adjusted hex color
   */
  static adjustBrightness(color, factor) {
    const rgb = this.hexToRgb(color);

    const r = rgb.r * factor;
    const g = rgb.g * factor;
    const b = rgb.b * factor;

    return this.rgbToHex(r, g, b);
  }

  /**
   * Add alpha channel to hex color
   * @param {string} hex - Hex color
   * @param {number} alpha - Alpha value (0-1)
   * @returns {string} RGBA color string
   */
  static hexToRgba(hex, alpha = 1) {
    const { r, g, b } = this.hexToRgb(hex);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  /**
   * Generate a random color
   * @param {number} seed - Optional seed for deterministic random
   * @returns {string} Hex color
   */
  static randomColor(seed) {
    if (seed !== undefined) {
      // Seeded random
      const x = Math.sin(seed++) * 10000;
      const random = x - Math.floor(x);
      const r = Math.floor(random * 256);
      const g = Math.floor((random * 256 * 7) % 256);
      const b = Math.floor((random * 256 * 13) % 256);
      return this.rgbToHex(r, g, b);
    }

    // True random
    const r = Math.floor(Math.random() * 256);
    const g = Math.floor(Math.random() * 256);
    const b = Math.floor(Math.random() * 256);
    return this.rgbToHex(r, g, b);
  }

  /**
   * Interpolate between multiple colors
   * @param {string[]} colors - Array of hex colors
   * @param {number} position - Position (0-1) in the gradient
   * @returns {string} Interpolated hex color
   */
  static gradientColor(colors, position) {
    position = Math.max(0, Math.min(1, position));

    if (colors.length === 0) return '#000000';
    if (colors.length === 1) return colors[0];

    const segmentCount = colors.length - 1;
    const segment = position * segmentCount;
    const segmentIndex = Math.floor(segment);
    const segmentPosition = segment - segmentIndex;

    if (segmentIndex >= segmentCount) {
      return colors[colors.length - 1];
    }

    return this.blendColors(colors[segmentIndex], colors[segmentIndex + 1], segmentPosition);
  }

  /**
   * Convert color to grayscale
   * @param {string} color - Hex color
   * @returns {string} Grayscale hex color
   */
  static toGrayscale(color) {
    const { r, g, b } = this.hexToRgb(color);
    // Use luminosity method for better results
    const gray = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    return this.rgbToHex(gray, gray, gray);
  }

  /**
   * Get color luminosity (perceived brightness)
   * @param {string} color - Hex color
   * @returns {number} Luminosity value (0-255)
   */
  static getLuminosity(color) {
    const { r, g, b } = this.hexToRgb(color);
    return 0.299 * r + 0.587 * g + 0.114 * b;
  }

  /**
   * Determine if color is dark (for choosing text color)
   * @param {string} color - Hex color
   * @returns {boolean} True if color is dark
   */
  static isDark(color) {
    return this.getLuminosity(color) < 128;
  }
}
