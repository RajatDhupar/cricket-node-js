const Player = require('../player');

class RealPlayer extends Player {
  constructor(name) {
    super(name, 'real');
  }

  chooseCard() {
    // TODO - add some UI lofic here
    // throw new Error("UI input needed for chooseCard()");
  }

  chooseStat(card) {
    // TODO - Human selects a stat to compare
    // throw new Error("UI input needed for chooseStat()");
  }
}

module.exports = RealPlayer;
