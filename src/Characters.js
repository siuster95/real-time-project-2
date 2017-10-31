// Character class
class Character {
  constructor(hash, Num) {
    this.hash = hash;
    this.x = 0;
    this.y = 0;
    this.prevX = 0;
    this.prevY = 0;
    this.destX = 0;
    this.destY = 0;
    this.radius = 50;
    this.alpha = 0.05;
    this.id = '';
    this.lastUpdate = new Date().getTime();
    this.roomNumber = 0;
    this.charNum = Num;
    this.color = '';
    this.name = 'player';
    this.hasBall = false;
  }
}


module.exports = Character;

