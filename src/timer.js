const Socket = require('./sockets');


const changeTime = (timer, lastUpdate, RoomNumber) => {
  const now = Date.now();
  const dt = now - lastUpdate;
  const newlastUpdate = lastUpdate - now;
  const secondsDecrease = dt / 1000;
  const newtimer = timer - secondsDecrease;
  Socket.sendbacktoRoom(RoomNumber, newtimer, newlastUpdate, secondsDecrease);
};


module.exports.changeTime = changeTime;