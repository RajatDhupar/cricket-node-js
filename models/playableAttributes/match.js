const { comparator } = require('../../modules/helper');
const Attribute = require('../attribute');
class Match extends Attribute {
  constructor(value) {
    super("matches", value);
  }

  compare(other, type) {
    return comparator(this.value, other.value, type);
  }
}
module.exports = Match;