const Mode = require('../mode');
class PowerPlayMode extends Mode {
  constructor() {
    super('Power Play');
  }

  getLossHit() {
    return 10;
  }

  getOpponentDamage() {
    return 12.5;
  }

  applyEffect(player, opponent, gameState) {
    player.compareTwoAttributes = true;
    player.damageMultiplier = 0.10;
  }

  cleanup(player, opponent, gameState) {
    player.compareTwoAttributes = false;
    player.damageMultiplier = 1.0;
  }
}
module.exports = PowerPlayMode;