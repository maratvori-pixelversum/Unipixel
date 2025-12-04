/**
 * FontLoader - Loads and manages custom .ttf fonts for canvas rendering
 * Supports heavily pixelated retro text rendering with custom fonts
 */
class FontLoader {
  constructor() {
    this.fonts = new Map();
    this.loading = new Map();
    this.loaded = false;
  }

  /**
   * Load a font from a .ttf file
   * @param {string} name - Font name identifier
   * @param {string} path - Path to .ttf file
   * @returns {Promise} Resolves when font is loaded
   */
  async loadFont(name, path) {
    // If already loaded, return immediately
    if (this.fonts.has(name)) {
      return Promise.resolve();
    }

    // If currently loading, return existing promise
    if (this.loading.has(name)) {
      return this.loading.get(name);
    }

    const loadPromise = new Promise((resolve, reject) => {
      try {
        const font = new FontFace(name, `url(${path})`);

        // Add timeout to prevent hanging
        const timeout = setTimeout(() => {
          this.loading.delete(name);
          console.warn(`Font loading timed out: ${name} - continuing with fallback`);
          resolve(null);  // Resolve with null instead of rejecting
        }, 5000);

        font.load()
          .then((loadedFont) => {
            clearTimeout(timeout);
            document.fonts.add(loadedFont);
            this.fonts.set(name, loadedFont);
            this.loading.delete(name);
            console.log(`Font loaded: ${name}`);
            resolve(loadedFont);
          })
          .catch((error) => {
            clearTimeout(timeout);
            console.warn(`Failed to load font ${name} (will use fallback):`, error.message || error);
            this.loading.delete(name);
            // Resolve instead of reject to allow app to continue
            resolve(null);
          });
      } catch (error) {
        console.warn(`Error creating FontFace for ${name} (will use fallback):`, error.message || error);
        this.loading.delete(name);
        resolve(null);
      }
    });

    this.loading.set(name, loadPromise);
    return loadPromise;
  }

  /**
   * Load all game fonts
   * @returns {Promise} Resolves when all fonts are loaded (or failed gracefully)
   */
  async loadGameFonts() {
    const fontsToLoad = [
      { name: 'DigitalDisco', path: '/concepts/fonts/DigitalDisco.ttf' },
      { name: 'DigitalDisco-Thin', path: '/concepts/fonts/DigitalDisco-Thin.ttf' },
    ];

    try {
      const results = await Promise.all(
        fontsToLoad.map(font => this.loadFont(font.name, font.path))
      );

      // Count successful loads
      const successCount = results.filter(r => r !== null).length;
      const failCount = results.length - successCount;

      this.loaded = true;

      if (successCount === results.length) {
        console.log('✓ All game fonts loaded successfully');
      } else if (successCount > 0) {
        console.warn(`⚠ Loaded ${successCount}/${results.length} fonts (${failCount} failed, using fallbacks)`);
      } else {
        console.warn('⚠ No custom fonts loaded - using fallback system fonts');
      }
    } catch (error) {
      // This should never happen now, but just in case
      console.warn('Font loading encountered an error (continuing with fallbacks):', error.message || error);
      this.loaded = true;
    }
  }

  /**
   * Check if a font is loaded
   * @param {string} name - Font name
   * @returns {boolean}
   */
  isFontLoaded(name) {
    return this.fonts.has(name);
  }

  /**
   * Get font family string for canvas
   * @param {string} name - Font name
   * @param {string} fallback - Fallback font
   * @returns {string}
   */
  getFontFamily(name, fallback = 'monospace') {
    return this.isFontLoaded(name) ? `${name}, ${fallback}` : fallback;
  }

  /**
   * Render pixelated text on canvas
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {string} text - Text to render
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} fontSize - Font size
   * @param {string} color - Text color
   * @param {string} fontName - Font name (default: 'DigitalDisco')
   * @param {string} align - Text alignment (default: 'left')
   */
  renderPixelatedText(ctx, text, x, y, fontSize, color, fontName = 'DigitalDisco', align = 'left') {
    ctx.save();

    // Disable image smoothing for pixelated effect
    ctx.imageSmoothingEnabled = false;

    // Set font
    ctx.font = `${fontSize}px ${this.getFontFamily(fontName)}`;
    ctx.fillStyle = color;
    ctx.textAlign = align;
    ctx.textBaseline = 'top';

    // Draw text
    ctx.fillText(text, x, y);

    ctx.restore();
  }

  /**
   * Render outlined pixelated text
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {string} text - Text to render
   * @param {number} x - X position
   * @param {number} y - Y position
   * @param {number} fontSize - Font size
   * @param {string} fillColor - Fill color
   * @param {string} strokeColor - Stroke color
   * @param {number} strokeWidth - Stroke width
   * @param {string} fontName - Font name
   */
  renderOutlinedText(ctx, text, x, y, fontSize, fillColor, strokeColor, strokeWidth, fontName = 'DigitalDisco') {
    ctx.save();
    ctx.imageSmoothingEnabled = false;
    ctx.font = `${fontSize}px ${this.getFontFamily(fontName)}`;
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';

    // Draw stroke
    ctx.strokeStyle = strokeColor;
    ctx.lineWidth = strokeWidth;
    ctx.strokeText(text, x, y);

    // Draw fill
    ctx.fillStyle = fillColor;
    ctx.fillText(text, x, y);

    ctx.restore();
  }
}

// Create singleton instance
const fontLoader = new FontLoader();

export default fontLoader;
