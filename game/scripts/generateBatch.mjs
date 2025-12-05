#!/usr/bin/env node
/**
 * Batch generator for planets - generates specific types only
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

const BATCH_1 = ['arctic', 'tropical', 'arid', 'swamp', 'continental', 'island',
                 'pangaea', 'archipelago', 'canyon', 'mesa', 'rift', 'shield'];

const BATCH_2 = ['supervolcano', 'geothermal', 'primordial', 'dead', 'storm', 'windy',
                 'fog', 'dust', 'ash', 'sulfur', 'methane', 'ammonia'];

const BATCH_3 = ['silicate', 'iron', 'nickel', 'diamond', 'graphite', 'ruby',
                 'sapphire', 'emerald', 'quartz', 'obsidian', 'marble', 'granite'];

const BATCH_4 = ['basalt', 'sandstone', 'limestone', 'shale', 'slate', 'gneiss', 'schist'];

const batchNumber = process.argv[2] || '1';

let types;
switch(batchNumber) {
  case '1': types = BATCH_1; break;
  case '2': types = BATCH_2; break;
  case '3': types = BATCH_3; break;
  case '4': types = BATCH_4; break;
  default: types = BATCH_1;
}

console.log(`Generating batch ${batchNumber}: ${types.join(', ')}`);
console.log(`Number of planets: ${types.length}\n`);

// Modify the planet generator to only generate specific types
const typesArg = types.join(',');
process.env.PLANET_TYPES = typesArg;

try {
  const { stdout, stderr } = await execAsync('node scripts/generatePlanets.mjs');
  console.log(stdout);
  if (stderr) console.error(stderr);
} catch (error) {
  console.error('Error:', error);
}
