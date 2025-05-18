class Player {
  constructor(name, type) {
    if (new.target === Player) {
      throw new Error("Cannot instantiate abstract class Player");
    }
    this.name = name;
    this.cards = [];
    this.health = 100;
    this.type = type;
    this.specialMode = null;
    this.specialModeCounter = process.env.SPECIAL_MODE_USE_COUNTER || 1;
  }

  assignCards(cards) {
    this.cards = cards;
  }

  getFlatHeirarchyCards() {
    return this.cards.map(card => {
      return {
        playerName: card.name,
        runs: card.attributes.get('runs').value,
        matches: card.attributes.get('matches').value,
        centuries: card.attributes.get('centuries').value,
        halfCenturies: card.attributes.get('halfCenturies').value,
        wickets: card.attributes.get('wickets').value,
        catches: card.attributes.get('catches').value,
        imageUrl: card.imageUrl
      };
    });
  }

  setSpecialMode(mode) {
    this.specialMode = mode;
  }

  updateSpecialModeCounter() {
    this.specialModeCounter--;
    if (this.specialModeCounter < 0) {
      this.specialMode = null;
    }
  }

  loseHealth(amount) {
    this.health = Math.max(this.health - amount, 0);
  }

  // Abstract methods
  chooseCard() {
    throw new Error("chooseCard() must be implemented");
  }

  chooseStat(card) {
    throw new Error("chooseStat() must be implemented");
  }
}

module.exports = Player;
