const { comparator } = require('../../modules/helper');
const Attribute = require('../attribute');

class Run extends Attribute {
  constructor(value) {
    super("runs", value);
  }

  compare(other, type) {
    // returns true if this wins
    return comparator(this.value, other.value, type);
  }
}

module.exports = Run;