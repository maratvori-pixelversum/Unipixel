/**
 * Seeded Random Number Generator
 * Provides deterministic random numbers for procedural generation
 */
export class SeededRandom {
  constructor(seed) {
    this.seed = seed;
    this.initialSeed = seed; // Store initial seed for reference
  }

  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  // Alias for next() to match common RNG interfaces
  random() {
    return this.next();
  }

  range(min, max) {
    return min + this.next() * (max - min);
  }

  int(min, max) {
    return Math.floor(this.range(min, max + 1));
  }

  // Choose random element from array
  choice(array) {
    if (!array || array.length === 0) {
      return null;
    }
    const index = Math.floor(this.next() * array.length);
    return array[index];
  }

  // Random boolean with probability
  boolean(probability = 0.5) {
    return this.next() < probability;
  }

  // Random integer between 0 and max (exclusive)
  nextInt(max) {
    return Math.floor(this.next() * max);
  }
}
