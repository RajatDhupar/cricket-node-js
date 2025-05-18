const Mode = require('../mode');
class FreeHitMode extends Mode {
  constructor() {
    super('Free Hit');
  }

  getLossHit() {
    return 15;
  }

  getOpponentDamage() {
    return 12.5;
  }

  applyEffect(player, opponent, gameState) {
    player.damageMultiplier = 1.125;
    opponent.damageTakenMultiplier = 1.15;
  }

  cleanup(player, opponent, gameState) {
    player.damageMultiplier = 1.0;
    opponent.damageTakenMultiplier = 1.0;
  }
}
module.exports = FreeHitMode;