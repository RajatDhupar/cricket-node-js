const Mode = require('../mode');
class WorldCupMode extends Mode {
  constructor() {
    super('World Cup');
  }

  getLossHit() {
    return 10;
  }

  getOpponentDamage() {
    return 12.5;
  }

  applyEffect(player, opponent, gameState) {
    if (player.cards.length === 1) {
      player.damageMultiplier = 2.0;
    }
  }

  cleanup(player, opponent, gameState) {
    player.damageMultiplier = 1.0;
  }
}
module.exports = WorldCupMode;