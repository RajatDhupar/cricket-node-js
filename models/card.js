class Card {
  constructor(name, attributes, imageUrl) {
    this.name = name;
    this.imageUrl = imageUrl;
    this.attributes = attributes; 
  }

  getAllAttributes() {
    return [...this.attributes.values()];
  }
}

module.exports = Card;