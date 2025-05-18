const Mode = require('../mode');
class SuperMode extends Mode {
  constructor() {
    super('Super');
  }

  getLossHit() {
    return 10;
  }

  getOpponentDamage() {
    return 25;
  }

  applyEffect(player, opponent, gameState) {
    const hasHighestRuns = player.cards.some(card => card.attributes.get('runs')?.value === gameState.highestRuns);
    const hasHighestWickets = player.cards.some(card => card.attributes.get('wickets')?.value === gameState.highestWickets);

    if (hasHighestRuns && hasHighestWickets) {
      player.damageFixed = 25;
    }
  }

  cleanup(player, opponent, gameState) {
    player.damageFixed = null;
  }
}
module.exports = SuperMode;