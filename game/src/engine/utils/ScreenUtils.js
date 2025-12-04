/**
 * Screen/Canvas Utility Functions
 * Coordinate transforms and screen boundary checks
 */

export class ScreenUtils {
  /**
   * Check if object is on screen (visible)
   * @param {number} x - Object X position
   * @param {number} y - Object Y position
   * @param {number} camX - Camera X position
   * @param {number} camY - Camera Y position
   * @param {number} screenWidth - Screen width
   * @param {number} screenHeight - Screen height
   * @param {number} margin - Extra margin for culling (default 100)
   * @returns {boolean} True if object is visible
   */
  static isOnScreen(x, y, camX, camY, screenWidth, screenHeight, margin = 100) {
    const screenX = x - camX + screenWidth / 2;
    const screenY = y - camY + screenHeight / 2;

    return screenX > -margin &&
           screenX < screenWidth + margin &&
           screenY > -margin &&
           screenY < screenHeight + margin;
  }

  /**
   * Check if object with size is on screen
   * @param {number} x - Object X position
   * @param {number} y - Object Y position
   * @param {number} width - Object width
   * @param {number} height - Object height
   * @param {number} camX - Camera X position
   * @param {number} camY - Camera Y position
   * @param {number} screenWidth - Screen width
   * @param {number} screenHeight - Screen height
   * @param {number} margin - Extra margin
   * @returns {boolean} True if object is visible
   */
  static isRectOnScreen(x, y, width, height, camX, camY, screenWidth, screenHeight, margin = 0) {
    const screenX = x - camX + screenWidth / 2;
    const screenY = y - camY + screenHeight / 2;

    return screenX + width > -margin &&
           screenX < screenWidth + margin &&
           screenY + height > -margin &&
           screenY < screenHeight + margin;
  }

  /**
   * Convert world coordinates to screen coordinates
   * @param {number} worldX - World X position
   * @param {number} worldY - World Y position
   * @param {number} camX - Camera X position
   * @param {number} camY - Camera Y position
   * @param {number} screenWidth - Screen width
   * @param {number} screenHeight - Screen height
   * @returns {{x: number, y: number}} Screen coordinates
   */
  static worldToScreen(worldX, worldY, camX, camY, screenWidth, screenHeight) {
    return {
      x: worldX - camX + screenWidth / 2,
      y: worldY - camY + screenHeight / 2
    };
  }

  /**
   * Convert screen coordinates to world coordinates
   * @param {number} screenX - Screen X position
   * @param {number} screenY - Screen Y position
   * @param {number} camX - Camera X position
   * @param {number} camY - Camera Y position
   * @param {number} screenWidth - Screen width
   * @param {number} screenHeight - Screen height
   * @returns {{x: number, y: number}} World coordinates
   */
  static screenToWorld(screenX, screenY, camX, camY, screenWidth, screenHeight) {
    return {
      x: screenX + camX - screenWidth / 2,
      y: screenY + camY - screenHeight / 2
    };
  }

  /**
   * Clamp camera position to world bounds
   * @param {number} camX - Camera X
   * @param {number} camY - Camera Y
   * @param {number} worldMinX - World minimum X
   * @param {number} worldMinY - World minimum Y
   * @param {number} worldMaxX - World maximum X
   * @param {number} worldMaxY - World maximum Y
   * @param {number} screenWidth - Screen width
   * @param {number} screenHeight - Screen height
   * @returns {{x: number, y: number}} Clamped camera position
   */
  static clampCamera(camX, camY, worldMinX, worldMinY, worldMaxX, worldMaxY, screenWidth, screenHeight) {
    const halfWidth = screenWidth / 2;
    const halfHeight = screenHeight / 2;

    return {
      x: Math.max(worldMinX + halfWidth, Math.min(worldMaxX - halfWidth, camX)),
      y: Math.max(worldMinY + halfHeight, Math.min(worldMaxY - halfHeight, camY))
    };
  }

  /**
   * Calculate optimal camera position to follow target
   * @param {number} targetX - Target X position
   * @param {number} targetY - Target Y position
   * @param {number} currentCamX - Current camera X
   * @param {number} currentCamY - Current camera Y
   * @param {number} smoothness - Camera smoothness (0-1, 0=instant, 1=no movement)
   * @returns {{x: number, y: number}} New camera position
   */
  static smoothFollow(targetX, targetY, currentCamX, currentCamY, smoothness = 0.1) {
    return {
      x: currentCamX + (targetX - currentCamX) * (1 - smoothness),
      y: currentCamY + (targetY - currentCamY) * (1 - smoothness)
    };
  }

  /**
   * Calculate screen shake offset
   * @param {number} intensity - Shake intensity
   * @param {number} time - Current time
   * @returns {{x: number, y: number}} Shake offset
   */
  static calculateScreenShake(intensity, time) {
    return {
      x: Math.sin(time * 20) * intensity,
      y: Math.cos(time * 25) * intensity
    };
  }

  /**
   * Get viewport bounds in world coordinates
   * @param {number} camX - Camera X
   * @param {number} camY - Camera Y
   * @param {number} screenWidth - Screen width
   * @param {number} screenHeight - Screen height
   * @returns {{minX: number, minY: number, maxX: number, maxY: number}} Viewport bounds
   */
  static getViewportBounds(camX, camY, screenWidth, screenHeight) {
    const halfWidth = screenWidth / 2;
    const halfHeight = screenHeight / 2;

    return {
      minX: camX - halfWidth,
      minY: camY - halfHeight,
      maxX: camX + halfWidth,
      maxY: camY + halfHeight
    };
  }

  /**
   * Calculate zoom factor based on distance
   * @param {number} distance - Distance from camera
   * @param {number} minZoom - Minimum zoom (default 0.5)
   * @param {number} maxZoom - Maximum zoom (default 2.0)
   * @param {number} zoomDistance - Distance for normal zoom (default 1000)
   * @returns {number} Zoom factor
   */
  static calculateZoom(distance, minZoom = 0.5, maxZoom = 2.0, zoomDistance = 1000) {
    const zoom = zoomDistance / Math.max(distance, 1);
    return Math.max(minZoom, Math.min(maxZoom, zoom));
  }
}
