const xxh = require('xxhashjs');

const Character = require('./Characters.js');

const phsyics = require('./physics.js');

const Ball = require('./Ball.js');

const characters = {};

let charsInroom = {};

let io;

let roomNumber = 1;

let amountOfpeople = 0;

let hash;

// state 0: no one has the ball
// state 1: someone has the ball

const setupSockets = (ioServer) => {
  io = ioServer;

  // make a new square and send it
  io.on('connection', (sock) => {
    const socket = sock;

    amountOfpeople += 1;

    if (amountOfpeople % 4 === 0) {
      // make a new player and tell them to join the room
      socket.join(`room${roomNumber}`);
      socket.roomNumber = roomNumber;
      hash = xxh.h32(`${socket.id}${new Date().getTime()}`, 0xCAFEBABE).toString(16);
      charsInroom[hash] = new Character(hash, amountOfpeople);
      socket.hash = hash;
      charsInroom[hash].id = socket.id;
      charsInroom[hash].roomNumber = roomNumber;
      let color;
      switch (amountOfpeople) {
        case 1:
          color = 'green';
          charsInroom[hash].x = 250;
          charsInroom[hash].y = 100;
          charsInroom[hash].prevX = 250;
          charsInroom[hash].prevY = 100;
          charsInroom[hash].destX = 250;
          charsInroom[hash].destY = 100;
          break;
        case 2:
          color = 'blue';
          charsInroom[hash].x = 400;
          charsInroom[hash].y = 250;
          charsInroom[hash].prevX = 400;
          charsInroom[hash].prevY = 250;
          charsInroom[hash].destX = 400;
          charsInroom[hash].destY = 250;
          break;
        case 3:
          color = 'yellow';
          charsInroom[hash].x = 250;
          charsInroom[hash].y = 400;
          charsInroom[hash].prevX = 250;
          charsInroom[hash].prevY = 400;
          charsInroom[hash].destX = 250;
          charsInroom[hash].destY = 400;
          break;
        case 4:
          color = 'purple';
          charsInroom[hash].x = 100;
          charsInroom[hash].y = 250;
          charsInroom[hash].prevX = 100;
          charsInroom[hash].prevY = 250;
          charsInroom[hash].destX = 100;
          charsInroom[hash].destY = 250;
          break;
        default:
          console.log('default case');
      }
      charsInroom[hash].color = color;
      charsInroom.state = 0;
      characters[roomNumber] = charsInroom;
      socket.emit('Joined', charsInroom[hash]);
      io.in(`room${roomNumber}`).emit('userJoined', charsInroom);

      // create the ball
      const ball = new Ball();
      ball.roomNumber = roomNumber;
      charsInroom[ball.hash] = ball;
      characters[roomNumber] = charsInroom;
      io.in(`room${roomNumber}`).emit('ballStart', { Start: true, ball });

      // increment and start over
      charsInroom = {};
      roomNumber += 1;
      amountOfpeople = 0;
    } else {
      socket.join(`room${roomNumber}`);
      socket.roomNumber = roomNumber;
      hash = xxh.h32(`${socket.id}${new Date().getTime()}`, 0xCAFEBABE).toString(16);
      socket.hash = hash;
      charsInroom[hash] = new Character(hash, amountOfpeople);
      charsInroom[hash].id = socket.id;
      charsInroom[hash].roomNumber = roomNumber;
      let color;
      switch (amountOfpeople) {
        case 1: {
          color = 'green';
          charsInroom[hash].x = 250;
          charsInroom[hash].y = 100;
          charsInroom[hash].prevX = 250;
          charsInroom[hash].prevY = 100;
          charsInroom[hash].destX = 250;
          charsInroom[hash].destY = 100;
          break;
        }
        case 2: {
          color = 'blue';
          charsInroom[hash].x = 400;
          charsInroom[hash].y = 250;
          charsInroom[hash].prevX = 400;
          charsInroom[hash].prevY = 250;
          charsInroom[hash].destX = 400;
          charsInroom[hash].destY = 250;
          break;
        }
        case 3: {
          color = 'yellow';
          charsInroom[hash].x = 250;
          charsInroom[hash].y = 400;
          charsInroom[hash].prevX = 250;
          charsInroom[hash].prevY = 400;
          charsInroom[hash].destX = 250;
          charsInroom[hash].destY = 400;
          break;
        }
        case 4: {
          color = 'purple';
          charsInroom[hash].x = 100;
          charsInroom[hash].y = 250;
          charsInroom[hash].prevX = 100;
          charsInroom[hash].prevY = 250;
          charsInroom[hash].destX = 100;
          charsInroom[hash].destY = 250;
          break;
        }
        default: {
          console.log('default case');
        }
      }
      charsInroom[hash].color = color;
      characters[roomNumber] = charsInroom;
      socket.emit('Joined', charsInroom[hash]);
      io.in(`room${roomNumber}`).emit('userJoined', charsInroom);
    }

    socket.on('updateFromclient', (data) => {
      if (data.hash !== undefined) {
        const roomToupdate = characters[data.roomNumber];
        roomToupdate[data.hash] = data;
        phsyics.setcharacters(roomToupdate);
        roomToupdate[data.hash].lastUpdate = new Date().getTime();
        io.to(`room${data.roomNumber}`).emit('serverUpdatepos', { character: roomToupdate[data.hash] });
      }
    });

    socket.on('disconnect', () => {
      const Rnd = socket.roomNumber;
      const room = characters[Rnd];
      const keys = Object.keys(room);
      let hashout = '';
      for (let i = 0; i < keys.length; i++) {
        const object = room[keys[i]];

        if (object.hash === socket.hash) {
          hashout = object.hash;
          delete room[keys[i]];
        }
      }

      socket.to(`room${Rnd}`).emit('left', { hashout });


      socket.leave(`room${Rnd}`);
    });
  });
};


const changeState = (state, circle) => {
  switch (state) {
    case 0: {
      const rN = circle.roomNumber;
      const specificRoom0 = characters[rN];
      specificRoom0.state = 0;
      io.to(`room${circle.roomNumber}`).emit('someoneHasball', { circle, state });
      break;
    }
    case 1: {
      const rN1 = circle.roomNumber;
      const specificRoom1 = characters[rN1];
      specificRoom1.state = 1;
      io.to(`room${circle.roomNumber}`).emit('someoneHasball', { circle, state });
      break;
    }
    default: {
      console.log('default case');
    }
  }
};

const stateStatus = (circle) => {
  const rNs = circle.roomNumber;
  const specificRoomS = characters[rNs];
  const stateOut = specificRoomS.state;
  return stateOut;
};

module.exports.changeState = changeState;
module.exports.setupSockets = setupSockets;
module.exports.characters = characters;
module.exports.stateStatus = stateStatus;
