const Socket = require('./sockets');


//delta time found from here https://stackoverflow.com/questions/13996267/loop-forever-and-provide-delta-time
const changeTime = (timer, lastUpdate, RoomNumber) => {
  const now = Date.now();
  const dt = now - lastUpdate;
  const newlastUpdate = now;
  const secondsDecrease = dt / 1000;
  const newtimer = timer - secondsDecrease;
  Socket.sendbacktoRoom(RoomNumber, newtimer, newlastUpdate, secondsDecrease);
};


module.exports.changeTime = changeTime;
