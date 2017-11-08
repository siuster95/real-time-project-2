const sockets = require('./sockets.js');

const upperLeft = {
  x: 100, y: 100, name: 'upperRight', canUse: true,
};
const upperRight = {
  x: 700, y: 100, name: 'upperLeft', canUse: true,
};
const bottomRight = {
  x: 700, y: 500, name: 'bottomRight', canUse: true,
};
const bottomLeft = {
  x: 100, y: 500, name: 'bottomLeft', canUse: true,
};

const positionArray = [upperLeft, upperRight, bottomLeft, bottomRight];

let characters = {};

let intersecting = false;

const checkDistanceofNewposition = () => {
  const totalPosition = { x: 0, y: 0 };
  let distance = 0;
  let positiontoReturn;

  const keys = Object.keys(characters);
  for (let l = 0; l < keys.length; l++) {
    if (keys[l] !== 'state' && keys[l] !== 'ball') {
      const circle = characters[keys[l]];
      totalPosition.x += circle.x;
      totalPosition.y += circle.y;
      for (let c = 0; c < 4; c++) {
        const positiontoTake = positionArray[c];
        const x = circle.x - positiontoTake.x;
        const x2 = x * x;
        const y = circle.y - positiontoTake.y;
        const y2 = y * y;
        const combined = x2 + y2;
        const result = Math.sqrt(combined);
        if (result < 100) {
          positionArray[c].canUse = false;
        }
      }
    }
  }
  totalPosition.x /= 4;
  totalPosition.y /= 4;

  for (let t = 0; t < positionArray.length; t++) {
    const position = positionArray[t];
    const x = totalPosition.x - position.x;
    const x2 = x * x;
    const y = totalPosition.y - position.y;
    const y2 = y * y;
    const combined = x2 + y2;
    const result = Math.sqrt(combined);

    if (distance === 0 && position.canUse) {
      positiontoReturn = position;
      distance = result;
    } else if (result > distance && position.canUse) {
      positiontoReturn = position;
      distance = result;
    }
  }
  for (let g = 0; g < 4; g++) {
    positionArray[g].canUse = true;
  }
  return positiontoReturn;
};

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
        if (result < 50) {
          console.log(`circle ${circle.charNum} is intersecting with ${circle2.charNum}`);

          if (circle.charNum === 'ball') {
            sockets.changeState(1, circle2);
            intersecting = true;
            break;
          }
        }
      } else if (state === 1) {
        const x = circle2.x - circle.x;
        const x2 = x * x;
        const y = circle2.y - circle.y;
        const y2 = y * y;
        const combined = x2 + y2;
        const result = Math.sqrt(combined);
        if (result < 50 && circle.charNum !== 'ball') {
          console.log(`circle ${circle.charNum} is intersecting with ${circle2.charNum}`);
          if (circle.hasBall) {
            const positionR = checkDistanceofNewposition();
            sockets.changeState(0, circle2, positionR);
            intersecting = true;
            break;
          }
        }
      }
    }
    console.log('no circles are intersecting');
    if (intersecting) {
      intersecting = false;
      break;
    }
  }
};

// set the characters over here
const setcharacters = (chars) => {
  characters = chars;
  checkCollision();
};

const setcharactersforleft = (chars) => {
  characters = chars;
  const position = checkDistanceofNewposition();
  return position;
};

module.exports.setcharacters = setcharacters;
module.exports.setcharactersforleft = setcharactersforleft;
