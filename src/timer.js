const Socket = require('./sockets');

let newlastUpdate;
let newtimer;

// delta time found from here https://stackoverflow.com/questions/13996267/loop-forever-and-provide-delta-time
const changeTime = (timer, lastUpdate, RoomNumber) => {
  const now = Date.now();
  const dt = now - lastUpdate;
  newlastUpdate = now;
  const secondsDecrease = dt / 1000;
  newtimer = timer - secondsDecrease;
  Socket.sendbacktoRoom(RoomNumber, newtimer, newlastUpdate, secondsDecrease);
};


module.exports.changeTime = changeTime;
