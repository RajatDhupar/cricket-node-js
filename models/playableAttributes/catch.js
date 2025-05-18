const { comparator } = require('../../modules/helper');
const Attribute = require('../attribute');
class Catch extends Attribute {
  constructor(value) {
    super("catches", value);
  }

  compare(other, type) {
    return comparator(this.value, other.value, type);
  }
}

module.exports = Catch;