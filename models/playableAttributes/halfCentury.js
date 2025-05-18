const { comparator } = require('../../modules/helper');
const Attribute = require('../attribute');
class HalfCentury extends Attribute {
  constructor(value) {
    super("halfCenturies", value);
  }

  compare(other, type) {
    return comparator(this.value, other.value, type);
  }
}

module.exports = HalfCentury;