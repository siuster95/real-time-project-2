class Ball {
  constructor() {
    this.x = 250;
    this.y = 250;
    this.radius = 50;
    this.alpha = 0.05;
    this.lastUpdate = new Date().getTime();
    this.color = 'white';
    this.hash = 'ball';
    this.charNum = 'ball';
    this.roomNumber = '';
  }
}


module.exports = Ball;
