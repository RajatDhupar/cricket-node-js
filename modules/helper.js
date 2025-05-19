const FreeHitMode = require('../models/mode/freeHitMode');
const SuperMode = require('../models/mode/superMode');
const PowerPlayMode = require('../models/mode/powerPlayMode');
const WorldCupMode = require('../models/mode/worldCupMode');

function comparator(a,b,type = 'max') {
  if (a === b) return 0;
  // can extend this to support more types
  if (type === 'max') {
      return a > b ? 1 : -1;
  } else if (type === 'min') {
      return a < b ? 1 : -1;
  } else {
      throw new Error('Invalid comparison type. Use "max" or "min".');
  }
}

function createSpecialMode(modeName) {
  console.log('duk3 modeName .......', modeName);
  switch (modeName.toLowerCase()) {
    case 'free_hit':
      return new FreeHitMode();
    case 'super':
      return new SuperMode();
    case 'power_play':
      return new PowerPlayMode();
    case 'world_cup':
      return new WorldCupMode();
    default:
      throw new Error(`Unknown special mode: ${modeName}`);
  }
}

module.exports = {
  comparator,
  createSpecialMode
};