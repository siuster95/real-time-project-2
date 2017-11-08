const xxh = require('xxhashjs');

const Character = require('./Characters.js');

const phsyics = require('./physics.js');

const Ball = require('./Ball.js');

const Timer = require('./timer');

const characters = {};

let charsInroom = {};

let io;

let roomNumber = 1;

let amountOfpeople = 0;

let hash;

// state 0: no one has the ball
// state 1: someone has the ball

const ballback = (state, position, circle) => {
  const rN = circle.roomNumber;
  const specificRoom2 = characters[rN];
  specificRoom2.state = 0;
  specificRoom2.check = true;
  io.to(`room${circle.roomNumber}`).emit('someoneHasball', { circle, state, position });
};

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
        case 1: {
          color = 'green';
          charsInroom[hash].x = 400;
          charsInroom[hash].y = 100;
          charsInroom[hash].prevX = 400;
          charsInroom[hash].prevY = 100;
          charsInroom[hash].destX = 400;
          charsInroom[hash].destY = 100;
          break;
        }
        case 2: {
          color = 'blue';
          charsInroom[hash].x = 600;
          charsInroom[hash].y = 300;
          charsInroom[hash].prevX = 600;
          charsInroom[hash].prevY = 300;
          charsInroom[hash].destX = 600;
          charsInroom[hash].destY = 300;
          break;
        }
        case 3: {
          color = 'yellow';
          charsInroom[hash].x = 400;
          charsInroom[hash].y = 500;
          charsInroom[hash].prevX = 400;
          charsInroom[hash].prevY = 500;
          charsInroom[hash].destX = 400;
          charsInroom[hash].destY = 500;
          break;
        }
        case 4: {
          color = 'purple';
          charsInroom[hash].x = 200;
          charsInroom[hash].y = 300;
          charsInroom[hash].prevX = 200;
          charsInroom[hash].prevY = 300;
          charsInroom[hash].destX = 200;
          charsInroom[hash].destY = 300;
          break;
        }
        default: {
          console.log('default case');
        }
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

      // make a timer
      const timer = 180;
      charsInroom.timer = timer;
      charsInroom.lastUpdate = Date.now();


      // keep track that this room is
      charsInroom.playing = true;

      // keep track of how many ppl wanna Play again
      charsInroom.PA = 0;

      // keep track of how many ppl are left in the room
      charsInroom.PPLinRoom = 4;

      charsInroom.here1 = true;
      charsInroom.here2 = true;
      charsInroom.here3 = true;
      charsInroom.here4 = true;


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
          charsInroom[hash].x = 400;
          charsInroom[hash].y = 100;
          charsInroom[hash].prevX = 400;
          charsInroom[hash].prevY = 100;
          charsInroom[hash].destX = 400;
          charsInroom[hash].destY = 100;
          break;
        }
        case 2: {
          color = 'blue';
          charsInroom[hash].x = 600;
          charsInroom[hash].y = 300;
          charsInroom[hash].prevX = 600;
          charsInroom[hash].prevY = 300;
          charsInroom[hash].destX = 600;
          charsInroom[hash].destY = 300;
          break;
        }
        case 3: {
          color = 'yellow';
          charsInroom[hash].x = 400;
          charsInroom[hash].y = 500;
          charsInroom[hash].prevX = 400;
          charsInroom[hash].prevY = 500;
          charsInroom[hash].destX = 400;
          charsInroom[hash].destY = 500;
          break;
        }
        case 4: {
          color = 'purple';
          charsInroom[hash].x = 200;
          charsInroom[hash].y = 300;
          charsInroom[hash].prevX = 200;
          charsInroom[hash].prevY = 300;
          charsInroom[hash].destX = 200;
          charsInroom[hash].destY = 300;
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

    socket.on('changeTime', (data) => {
      io.to(`room${data.roomNumber}`).emit('serverChangetime', { playerNum: data.playerNum, seconds: data.seconds, minutes: data.minutes });
    });

    socket.on('objectChange', (data) => {
      if (data.hash !== undefined) {
        const roomToupdate = characters[data.roomNumber];
        roomToupdate[data.hash] = data;
        roomToupdate[data.hash].lastUpdate = new Date().getTime();
        io.to(`room${data.roomNumber}`).emit('serverUpdatepos', { character: roomToupdate[data.hash] });
      }
    });

    socket.on('Restart', (data) => {
      const room = characters[data.roomNumber];
      room.PA += 1;
      if (room.PA === room.PPLinRoom) {
        // restart characters and their position
        const keys = Object.keys(room);
        for (let i = 0; i < keys.length; i++) {
          const object = room[keys[i]];
          const playerOrBallBool = Object.prototype.hasOwnProperty.call(object, 'name');
          if (playerOrBallBool) {
            if (object.name === 'player') {
              switch (object.charNum) {
                case 1:
                  if (room.here1) {
                    room[keys[i]].x = 400;
                    room[keys[i]].y = 100;
                    room[keys[i]].prevX = 400;
                    room[keys[i]].prevY = 100;
                    room[keys[i]].destX = 400;
                    room[keys[i]].destY = 100;
                    room[keys[i]].alpha = 0.05;
                    room[keys[i]].hasBall = false;
                    room[keys[i]].color = 'green';
                    room[keys[i]].lastUpdate = new Date().getTime();
                  }
                  break;
                case 2:
                  if (room.here2) {
                    room[keys[i]].x = 600;
                    room[keys[i]].y = 300;
                    room[keys[i]].prevX = 600;
                    room[keys[i]].prevY = 300;
                    room[keys[i]].destX = 600;
                    room[keys[i]].destY = 300;
                    room[keys[i]].alpha = 0.05;
                    room[keys[i]].hasBall = false;
                    room[keys[i]].color = 'blue';
                    room[keys[i]].lastUpdate = new Date().getTime();
                  }
                  break;
                case 3:
                  if (room.here3) {
                    room[keys[i]].x = 400;
                    room[keys[i]].y = 500;
                    room[keys[i]].prevX = 400;
                    room[keys[i]].prevY = 500;
                    room[keys[i]].destX = 400;
                    room[keys[i]].destY = 500;
                    room[keys[i]].alpha = 0.05;
                    room[keys[i]].hasBall = false;
                    room[keys[i]].color = 'yellow';
                    room[keys[i]].lastUpdate = new Date().getTime();
                  }
                  break;
                case 4:
                  if (room.here4) {
                    room[keys[i]].x = 200;
                    room[keys[i]].y = 300;
                    room[keys[i]].prevX = 200;
                    room[keys[i]].prevY = 300;
                    room[keys[i]].destX = 200;
                    room[keys[i]].destY = 300;
                    room[keys[i]].alpha = 0.05;
                    room[keys[i]].hasBall = false;
                    room[keys[i]].color = 'purple';
                    room[keys[i]].lastUpdate = new Date().getTime();
                  }
                  break;
                default:
                  console.log('not a player');
              }
            } else if (object.name === 'ball') {
              room[keys[i]].x = 400;
              room[keys[i]].y = 300;
              room[keys[i]].alpha = 0.05;
              room[keys[i]].lastUpdate = new Date().getTime();
            }
          } else if (keys[i] === 'timer') {
            room[keys[i]] = 180;
          } else if (keys[i] === 'lastUpdate') {
            room[keys[i]] = Date.now();
          } else if (keys[i] === 'playing') {
            room[keys[i]] = true;
          } else if (keys[i] === 'PA') {
            room[keys[i]] = 0;
          } else if (keys[i] === 'state') {
            room[keys[i]] = 0;
          }
        }

        characters[data.roomNumber] = room;
        io.to(`room${data.roomNumber}`).emit('RestartServer', { properties: characters[data.roomNumber] });
      }
    });

    socket.on('disconnect', () => {
      const Rnd = socket.roomNumber;
      const room = characters[Rnd];
      const keys = Object.keys(room);
      let pos;
      let tempcircle;
      let hashout = '';
      for (let i = 0; i < keys.length; i++) {
        const object = room[keys[i]];

        if (object.hash === socket.hash) {
          hashout = object.hash;
          switch (object.charNum) {
            case 1: {
              room.here1 = false;
              break;
            }
            case 2: {
              room.here2 = false;
              break;
            }
            case 3: {
              room.here3 = false;
              break;
            }
            case 4: {
              room.here4 = false;
              break;
            }
            default: {
              console.log('charNum is missing');
            }
          }
          tempcircle = room[keys[i]];
          pos = phsyics.setcharactersforleft(room);
          delete room[keys[i]];
          socket.to(`room${Rnd}`).emit('left', { hashout });
        }
      }
      room.PPLinRoom -= 1;
      socket.leave(`room${Rnd}`);
      if (tempcircle.hasBall) {
        ballback(0, pos, tempcircle);
      }
    });
  });
};

const changeState = (state, circle, position) => {
  switch (state) {
    case 0: {
      const rN = circle.roomNumber;
      const specificRoom0 = characters[rN];
      specificRoom0.state = 0;
      specificRoom0.check = true;
      characters[rN] = specificRoom0;
      io.to(`room${circle.roomNumber}`).emit('someoneHasball', { circle, state, position });
      io.to(`room${circle.roomNumber}`).emit('addMoreTime', { playerNum: circle.charNum });
      break;
    }
    case 1: {
      const rN1 = circle.roomNumber;
      const specificRoom1 = characters[rN1];
      specificRoom1.state = 1;
      specificRoom1.check = true;
      characters[rN1] = specificRoom1;
      io.to(`room${circle.roomNumber}`).emit('someoneHasball', { circle, state, position });
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

const sendbacktoRoom = (RoomNumber, time, lastUpdate, deltaTime) => {
  const room = characters[RoomNumber];
  room.timer = time;
  room.lastUpdate = lastUpdate;
  io.to(`room${RoomNumber}`).emit('ServerTimechange', { time, deltaTime });
};

const doTime = () => {
  const keys = Object.keys(characters);
  for (let i = 0; i < keys.length; i++) {
    const roomCheck = characters[keys[i]];
    const roomCheckbool = Object.prototype.hasOwnProperty.call(roomCheck, 'timer');
    if (roomCheckbool === true) {
      if (roomCheck.timer <= 0.5 && roomCheck.playing === true) {
        io.to(`room${i + 1}`).emit('GameOver', {});
        roomCheck.playing = false;
      } else if (roomCheck.playing === true) {
        Timer.changeTime(roomCheck.timer, roomCheck.lastUpdate, i + 1);
      }
    }
  }
};


setInterval(() => {
  doTime();
}, 0);

module.exports.changeState = changeState;
module.exports.setupSockets = setupSockets;
module.exports.characters = characters;
module.exports.stateStatus = stateStatus;
module.exports.sendbacktoRoom = sendbacktoRoom;
