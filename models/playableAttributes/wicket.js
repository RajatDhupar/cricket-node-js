const { comparator } = require('../../modules/helper');
const Attribute = require('../attribute');
class Wicket extends Attribute {
  constructor(value) {
    super("wickets", value);
  }

  compare(other, type) {
    return comparator(this.value, other.value, type);
  }
}
module.exports = Wicket;