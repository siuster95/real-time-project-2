class Ball {
  constructor() {
    this.x = 400;
    this.y = 300;
    this.radius = 25;
    this.alpha = 0.05;
    this.lastUpdate = new Date().getTime();
    this.color = 'white';
    this.hash = 'ball';
    this.name = 'ball';
    this.charNum = 'ball';
    this.roomNumber = '';
  }
}


module.exports = Ball;
