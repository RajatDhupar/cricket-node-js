class Attribute {
  constructor(name, value) {
    this.name = name;
    this.value = value;
  }

  compare(other) {
    throw new Error("Method 'compare()' must be implemented.");
  }
}
module.exports = Attribute;