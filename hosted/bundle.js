"use strict";

var canvas = void 0;
var ctx = void 0;
var socket = void 0;
var characters = {};
var hash = void 0;
var leftarrow = 37;
var rightarrow = 39;
var uparrow = 38;
var downarrow = 40;
var spacebar = 32;
var rightarrowBool = false;
var leftarrowBool = false;
var uparrowBool = false;
var downarrowBool = false;
var spacebarbool = false;
var walkImage = void 0;
var play = false;
var state = void 0;

var spriteSize = {
    WIDTH: 100,
    HEIGHT: 100
};

var init = function init() {

    canvas = document.querySelector("#myCanvas");
    ctx = canvas.getContext("2d");
    walkImage = document.querySelector("#walk");

    //connect to socket
    socket = io.connect();

    //after connect to socket
    socket.on("Joined", function (data) {
        characters[data.hash] = data;
        hash = data.hash;
    });

    //other users joined
    socket.on("userJoined", function (data) {

        var keys = Object.keys(data);
        for (var x = 0; x < keys.length; x++) {
            var char = data[keys[x]];
            if (!characters[char.hash] && keys[x] != "state") {
                characters[char.hash] = char;
            }
        }
    });

    //when someone leaves
    socket.on("left", function (data) {

        delete characters[data.hashout];
    });

    //when enough players join
    socket.on("ballStart", function (data) {
        play = data.Start;
        state = 0;
        characters[data.ball.hash] = data.ball;
    });

    //when someone interacts with the ball
    socket.on("someoneHasball", function (data) {
        if (data.state == 1) {
            characters["ball"].x = -100;
            characters["ball"].y = -100;
            state = data.state;
            var keys = Object.keys(characters);
            for (var i = 0; i < keys.length; i++) {
                var object = characters[keys[i]];
                if (object.hash == data.circle.hash) {
                    object.hasBall = true;
                }
            }
            socket.emit("updateFromclient", characters["ball"]);
        } else if (data.state == 0) {
            characters["ball"].x = 250;
            characters["ball"].y = 250;
            state = data.state;
            var _keys = Object.keys(characters);
            for (var _i = 0; _i < _keys.length; _i++) {
                var _object = characters[_keys[_i]];
                _object.hasBall = false;
            }
            socket.emit("updateFromclient", characters["ball"]);
        }
    });

    //update position of all chars
    socket.on("serverUpdatepos", function (data) {

        if (data.character != undefined) {
            if (!characters[data.character.hash]) {
                characters[data.character.hash] = data.character;
            } else if (characters[data.character.hash].lastUpdate >= data.character.lastUpdate) {
                return;
            } else if (data.character.hash != hash) {
                characters[data.character.hash].prevX = data.character.prevX;
                characters[data.character.hash].destX = data.character.destX;
                characters[data.character.hash].destY = data.character.destY;
                characters[data.character.hash].prevY = data.character.prevY;
                characters[data.character.hash].alpha = data.character.alpha;
                characters[data.character.hash].lastUpdate = data.character.lastUpdate;
            } else {
                characters[data.character.hash].lastUpdate = data.character.lastUpdate;
            }
        }
    });

    //start drawing
    draw();

    //handle buttons
    document.addEventListener("keydown", keydownHandler);
    document.addEventListener("keyup", keyUpHandler);
};

//draw objects on screen
var draw = function draw() {

    if (play == true) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        updatePosition();
        var keys = Object.keys(characters);
        for (var x = 0; x < keys.length; x++) {
            var object = characters[keys[x]];
            ctx.save();
            ctx.beginPath();
            if (state == 0) {
                ctx.fillStyle = object.color;
            } else if (state == 1 && object.hasBall == true) {
                ctx.fillStyle = object.color;
            } else if (state == 1 && object.hasBall == false && object.hash != hash) {
                ctx.fillStyle = "red";
            } else if (state == 1 && object.hasBall == false && object.hash == hash) {
                ctx.fillStyle = "orange";
            }
            ctx.arc(object.x, object.y, object.radius, 0, 2 * Math.PI);
            ctx.stroke();
            ctx.fill();
            ctx.restore();
        }
        requestAnimationFrame(draw);
    } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.font = "30px Arial";
        ctx.fillText("Waiting for more players", canvas.width / 2 - 150, canvas.height / 2);
        requestAnimationFrame(draw);
    }
};

//update positions
var updatePosition = function updatePosition() {

    if (play == true) {
        movement();

        var keys = Object.keys(characters);
        //grab each user
        for (var x = 0; x < keys.length; x++) {
            var square = characters[keys[x]];

            if (square.alpha < 1) {
                square.alpha += 0.05;
            }

            if (square.hash != "ball") {
                square.x = lerp(square.prevX, square.destX, square.alpha);
                square.y = lerp(square.prevY, square.destY, square.alpha);
            }

            characters[keys[x]] = square;
        }
    }
};

//lerp
var lerp = function lerp(v0, v1, alpha) {
    return (1 - alpha) * v0 + alpha * v1;
};

// look for keycodes
var keydownHandler = function keydownHandler(e) {
    if (play == true) {
        var keyCode = e.keyCode;
        console.log(keyCode);
        if (keyCode == leftarrow) {
            leftarrowBool = true;
        } else if (keyCode == rightarrow) {
            rightarrowBool = true;
        } else if (keyCode == uparrow) {
            uparrowBool = true;
        } else if (keyCode == downarrow) {
            downarrowBool = true;
        } else if (keyCode == spacebar) {
            spacebarbool = true;
        }
    }
};

//if keys are released
var keyUpHandler = function keyUpHandler(e) {
    if (play == true) {
        var keyCode = e.keyCode;

        if (keyCode == leftarrow) {
            leftarrowBool = false;
        } else if (keyCode == rightarrow) {
            rightarrowBool = false;
        } else if (keyCode == uparrow) {
            uparrowBool = false;
        } else if (keyCode == downarrow) {
            downarrowBool = false;
        } else if (keyCode == spacebar) {
            spacebarbool = false;
        }
    }
};

var movement = function movement() {

    if (play == true) {
        var square = characters[hash];

        if (square != undefined) {
            square.prevX = square.x;
            square.prevY = square.y;

            if (leftarrowBool && square.destX > 50 && spacebarbool == false) {
                square.destX -= 2;
            } else if (leftarrowBool && square.destX > 50 && spacebarbool == true) {
                square.destX -= 4;
            } else if (rightarrowBool && square.destX < 450 && spacebarbool == false) {
                square.destX += 2;
            } else if (rightarrowBool && square.destX < 450 && spacebarbool == true) {
                square.destX += 4;
            }
            if (downarrowBool && square.destY < 450 && spacebarbool == false) {
                square.destY += 2;
            }
            if (downarrowBool && square.destY < 450 && spacebarbool == true) {
                square.destY += 4;
            }
            if (uparrowBool && square.destY > 50 && spacebarbool == false) {
                square.destY = square.destY - 2;
            }
            if (uparrowBool && square.destY > 50 && spacebarbool == true) {
                square.destY = square.destY - 4;
            }
            square.alpha = 0.05;
            socket.emit("updateFromclient", characters[hash]);
        }
    }
};

window.onload = init;
