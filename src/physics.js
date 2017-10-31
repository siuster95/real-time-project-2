const sockets = require('./sockets.js');


let characters = {};

const checkCollision = () => {
  const keys = Object.keys(characters);
  const state = sockets.stateStatus(characters[keys[0]]);
  for (let i = 0; i < keys.length; i++) {
    const circle = characters[keys[i]];
    for (let k = 0; k < keys.length; k++) {
      const circle2 = characters[keys[k]];

      if (circle2.charNum === circle.charNum) {
        console.log('same circle');
      } else if (state === 0) {
        const x = circle2.x - circle.x;
        const x2 = x * x;
        const y = circle2.y - circle.y;
        const y2 = y * y;
        const combined = x2 + y2;
        const result = Math.sqrt(combined);
        if (result < 100) {
          console.log(`circle ${circle.charNum} is intersecting with ${circle2.charNum}`);

          if (circle.charNum === 'ball') {
            sockets.changeState(1, circle2);
          } else if (circle2.charNum === 'ball') {
            sockets.changeState(1, circle);
          }
        }
      } else if (state === 1) {
        const x = circle2.x - circle.x;
        const x2 = x * x;
        const y = circle2.y - circle.y;
        const y2 = y * y;
        const combined = x2 + y2;
        const result = Math.sqrt(combined);
        if (result < 100) {
          console.log(`circle ${circle.charNum} is intersecting with ${circle2.charNum}`);

          if (circle.hasBall) {
            sockets.changeState(0, circle2);
          } else if (circle2.hasBall) {
            sockets.changeState(0, circle);
          }
        }
      }
    }
    console.log('no circles are intersecting');
  }
};

// set the characters over here
const setcharacters = (chars) => {
  characters = chars;
  checkCollision();
};

module.exports.setcharacters = setcharacters;
