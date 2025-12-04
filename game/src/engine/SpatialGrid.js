/**
 * Spatial Grid for efficient spatial queries
 * Divides space into cells for O(1) lookups instead of O(n) searches
 *
 * Performance improvement: ~100x faster for large numbers of objects
 */
export class SpatialGrid {
  constructor(cellSize = 1000) {
    this.cellSize = cellSize;
    this.grid = new Map(); // Map of "x,y" -> array of objects
  }

  /**
   * Get cell coordinates for a world position
   */
  getCellCoords(x, y) {
    return {
      cx: Math.floor(x / this.cellSize),
      cy: Math.floor(y / this.cellSize)
    };
  }

  /**
   * Get cell key string
   */
  getCellKey(cx, cy) {
    return `${cx},${cy}`;
  }

  /**
   * Clear all objects from grid
   */
  clear() {
    this.grid.clear();
  }

  /**
   * Insert an object into the grid
   * Object must have x, y properties
   */
  insert(object) {
    if (!object || typeof object.x !== 'number' || typeof object.y !== 'number') {
      return;
    }

    const { cx, cy } = this.getCellCoords(object.x, object.y);
    const key = this.getCellKey(cx, cy);

    if (!this.grid.has(key)) {
      this.grid.set(key, []);
    }

    this.grid.get(key).push(object);
  }

  /**
   * Query all objects within a radius of a point
   * Returns array of objects
   */
  queryRadius(x, y, radius) {
    const results = [];
    const radiusSq = radius * radius;

    // Calculate cell range to check
    const { cx: centerCx, cy: centerCy } = this.getCellCoords(x, y);
    const cellRadius = Math.ceil(radius / this.cellSize);

    // Check all cells within range
    for (let cy = centerCy - cellRadius; cy <= centerCy + cellRadius; cy++) {
      for (let cx = centerCx - cellRadius; cx <= centerCx + cellRadius; cx++) {
        const key = this.getCellKey(cx, cy);
        const cell = this.grid.get(key);

        if (!cell) continue;

        // Check each object in cell
        for (const obj of cell) {
          const dx = obj.x - x;
          const dy = obj.y - y;
          const distSq = dx * dx + dy * dy;

          if (distSq <= radiusSq) {
            results.push(obj);
          }
        }
      }
    }

    return results;
  }

  /**
   * Query objects in a specific cell
   */
  queryCell(cx, cy) {
    const key = this.getCellKey(cx, cy);
    return this.grid.get(key) || [];
  }

  /**
   * Get all objects in grid (for debugging)
   */
  getAllObjects() {
    const results = [];
    for (const cell of this.grid.values()) {
      results.push(...cell);
    }
    return results;
  }

  /**
   * Get statistics about grid usage
   */
  getStats() {
    let totalObjects = 0;
    let maxCellSize = 0;
    let nonEmptyCells = 0;

    for (const cell of this.grid.values()) {
      totalObjects += cell.length;
      maxCellSize = Math.max(maxCellSize, cell.length);
      if (cell.length > 0) nonEmptyCells++;
    }

    return {
      totalObjects,
      nonEmptyCells,
      maxCellSize,
      avgCellSize: nonEmptyCells > 0 ? totalObjects / nonEmptyCells : 0
    };
  }
}
