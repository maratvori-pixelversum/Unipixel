/**
 * RenderOptimizer - Utilities for debouncing canvas renders
 * Prevents excessive re-renders that cause UI freezes
 */

/**
 * Debounced RAF renderer - only renders once per animation frame
 * even if called multiple times
 */
export class DebounceRAFRenderer {
  constructor(renderFn) {
    this.renderFn = renderFn;
    this.rafId = null;
    this.isPending = false;
  }

  /**
   * Request a render - will batch multiple calls into single RAF
   */
  requestRender() {
    if (this.isPending) return;

    this.isPending = true;
    this.rafId = requestAnimationFrame(() => {
      this.isPending = false;
      this.renderFn();
    });
  }

  /**
   * Cancel pending render
   */
  cancel() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
      this.isPending = false;
    }
  }

  /**
   * Force immediate render
   */
  renderNow() {
    this.cancel();
    this.renderFn();
  }
}

/**
 * Throttled scroll handler - limits scroll updates
 */
export function createThrottledScroll(callback, limit = 16) {
  let lastRun = 0;
  let pending = false;
  let pendingArgs = null;

  return function(...args) {
    pendingArgs = args;

    if (!pending) {
      const now = Date.now();
      const timeSinceLastRun = now - lastRun;

      if (timeSinceLastRun >= limit) {
        callback.apply(this, args);
        lastRun = now;
      } else {
        pending = true;
        setTimeout(() => {
          callback.apply(this, pendingArgs);
          lastRun = Date.now();
          pending = false;
        }, limit - timeSinceLastRun);
      }
    }
  };
}
