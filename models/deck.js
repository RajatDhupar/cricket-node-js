const Card = require('./card');
const cricketPlayers = require('../resources/seed');
const Runs = require('./playableAttributes/run');
const Matches = require('./playableAttributes/match');
const Centuries = require('./playableAttributes/century');
const HalfCenturies = require('./playableAttributes/halfCentury');
const Wickets = require('./playableAttributes/wicket');
const Catches = require('./playableAttributes/catch');

class Deck {
  constructor() {
    this.cards = this._generateCards();
  }

  _generateCards() {
    return cricketPlayers.map(player => {
      const attributes = new Map();
      attributes.set("runs", new Runs(player.runs));
      attributes.set("matches", new Matches(player.matches));
      attributes.set("centuries", new Centuries(player.centuries));
      attributes.set("halfCenturies", new HalfCenturies(player.half_centuries));
      attributes.set("wickets", new Wickets(player.wickets));
      attributes.set("catches", new Catches(player.catches));
      return new Card(player.playerName, attributes, player.imageUrl || "");
    });
  }

  shuffleDeck() {
    for (let i = this.cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [this.cards[i], this.cards[j]] = [this.cards[j], this.cards[i]];
    }
  }

  dealCards(n) {
    if (n > this.cards.length) {
      throw new Error("Not enough cards in the deck");
    }

    this.shuffleDeck();
    return this.cards.splice(0, n);
  }

  remainingCards() {
    return this.cards.length;
  }
}

module.exports = Deck;
