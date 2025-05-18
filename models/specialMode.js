class Mode {
  constructor(name) {
    this.name = name;
    this.used = false;
  }

  getDamage() {
    return 10;
  }

  activate(player, opponent, gameState) {
    if (this.used) return;
    this.used = true;
    // this.applyEffect(player, opponent, gameState);
  }

  applyEffect(player, opponent, gameState) {
    throw new Error('applyEffect() must be implemented in subclass');
  }

  cleanup(player, opponent, gameState) {
    // Optional: remove effect after 1 turn if needed
  }
}
module.exports = Mode;