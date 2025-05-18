const { comparator } = require('../../modules/helper');
const Attribute = require('../attribute');
class Century extends Attribute {
  constructor(value) {
    super("centuries", value);
  }

  compare(other, type) {
    return comparator(this.value, other.value, type);
  }
}

module.exports = Century;