
let canvas;
let ctx;
let socket;
let characters = {};
let hash;
const leftarrow = 65;
const rightarrow = 68;
const uparrow = 87;
const downarrow = 83;
const spacebar = 32;
let rightarrowBool = false;
let leftarrowBool = false;
let uparrowBool = false;
let downarrowBool = false;
let spacebarbool = false;
let walkImage;
let play = false;
let state;
let lastUpdate;
let seconds;
let minutes;
let playerNum;
let Timelabel;
let roomNumber;
let hasBall;
let player1Mins;
let player1Secs;
let player2Mins;
let player2Secs;
let player3Mins;
let player3Secs;
let player4Mins;
let player4Secs;
let winnerLabel;
let boostBool;
let boostAmount;
let boostRegain;
let boostRegainwithBall;
let boostDetrimint;
let NameLabel;
let boostCanvas;
let boostCtx;
let GameOver;
let here1;
let here2;
let here3;
let here4;
let spaces;


const init = () => {

    canvas = document.querySelector("#myCanvas");
    boostCanvas = document.querySelector("#BoostCanvas");
    canvas.width = 800;
    canvas.height = 600;
    boostCanvas.width = 200;
    boostCanvas.height = 25;
    ctx = canvas.getContext("2d");
    walkImage = document.querySelector("#walk");
    boostCtx = boostCanvas.getContext("2d");

    //connect to socket
    socket = io.connect();
    //init total time and hasBall
    hasBall = false;
    GameOver = false;
    seconds = 0;
    minutes = 0;
    spaces = 0;

    //init those that are here
    here1 = true;
    here2 = true;
    here3 = true;
    here4 = true;
    //connect the labels 
    Timelabel = document.querySelector("#Timeleftlabel");
    NameLabel = document.querySelector("#NameLabel");

    Timelabel.innerHTML = "minutes: 0 seconds: 0";

    player1Mins = 0;
    player1Secs = 0;
    player2Mins = 0;
    player2Secs = 0;
    player3Mins = 0;
    player3Secs = 0;
    player4Mins = 0;
    player4Secs = 0;

    hasBall = false;

    minutes = 0;
    seconds = 0;

    //boost init
    boostBool = true;
    boostAmount = 1000;
    boostRegain = 5;
    boostRegainwithBall = 10;
    boostDetrimint = 5;

    //after connect to socket
    socket.on("Joined", (data) => {
        characters[data.hash] = data;
        hash = data.hash;
        playerNum = data.charNum;
        roomNumber = data.roomNumber;
    });

    //other users joined
    socket.on("userJoined", (data) => {

        let keys = Object.keys(data);
        for(let x =0;x<keys.length;x++)
        {
            let char = data[keys[x]];
            if(!characters[char.hash] && keys[x] != "state")
            {
                characters[char.hash] = char;
            }
        }
    });

    //when time is changing 
    socket.on("ServerTimechange",(data) => {

        let time = Math.floor(data.time);
        let remainingMinutes = Math.floor(time / 60);
        let remainingSeconds = time % 60;
        Timelabel.innerHTML = `minutes: ${remainingMinutes} seconds: ${remainingSeconds}`;
        updateTime(data.deltaTime);
    });

    //Game Over
    socket.on("GameOver",()=> {

        
        let minArray = [];
        let secArray = [];

        let length = 0;

        if(here1)
        {
            minArray.push(player1Mins);
            secArray.push(player1Secs);
            length += 1;
        }
        if(here2)
        {
            minArray.push(player2Mins);
            secArray.push(player2Secs);
            length += 1;
        }
        if(here3)
        {
            minArray.push(player3Mins);
            secArray.push(player3Secs);
            length += 1;
        }
        if(here4)
        {
            minArray.push(player4Mins);
            secArray.push(player4Secs);
            length += 1;
        }

        let longestTime = -1;
        let recordedLongest = -1;
        let tieArray = [];
        let winner = 0;
        let minuteCheck = false;
        for(let i =0; i < length; i++)
        {
            let check = minArray[i];
            if(check != 0)
            {
                minuteCheck = true;
            }
        }
        if(minuteCheck == true)
        {
            for(let i =0; i < length; i++)
            {
                let Min = minArray[i];
                if(longestTime == -1)
                {
                    longestTime = Min;
                    recordedLongest = i;
                } 
                else if(Min > longestTime)
                {
                    longestTime = Min;
                    recordedLongest = i;
                }
                else if(Min == longestTime)
                {
                    if(recordedLongest != -1 && recordedLongest != "Same Number")
                    {
                        tieArray.push(recordedLongest);
                        tieArray.push(i);
                    }
                    else
                    {
                        tieArray.push(i);
                    }
                    recordedLongest = "Same Number";
                }
            }
        }
        else
        {
            for(let i =0; i < length; i++)
            {
                let Sec = secArray[i];
                if(longestTime == -1)
                {
                    longestTime = Sec;
                    recordedLongest = i;
                } 
                else if(Sec > longestTime)
                {
                    longestTime = Sec;
                    recordedLongest = i;
                }
                else if(Sec == longestTime)
                {
                    if(recordedLongest != -1 && recordedLongest != "Same Number")
                    {
                        tieArray.push(recordedLongest);
                        tieArray.push(i);
                    }
                    else
                    {
                        tieArray.push(i);
                    }
                    recordedLongest = "Same Number";
                }
            }
        }
        switch(recordedLongest) {
            case 0:
                winnerLabel = "Winner: player 1";
                break;
            case 1:
                winnerLabel = "Winner: player 2";
                break;
            case 2:
                winnerLabel = "Winner: player 3";
                break;
            case 3:
                winnerLabel = "Winner: player 4";
                break;
            case "Same Number":
                winnerLabel = `Winners: `;
                for(let k =0; k < tieArray.length;k++)
                {
                    spaces += 1;
                    winnerLabel += `player ${k + 1} `;
                } 
                break;
            default:
                console.log("Something went wrong");
        }

        play = false;
        GameOver = true;

        let button = document.createElement("button");
        button.id = "PAButton";
        button.innerHTML = "Play Again";

        let timeDiv = document.querySelector("#TimeandWinningDiv");
        timeDiv.appendChild(button);

        button.addEventListener("click", () => {
            socket.emit("Restart", {roomNumber});
            let deletebutton = document.querySelector("#PAButton");
            deletebutton.parentNode.removeChild(deletebutton);
        });

    });

    //when someone leaves
    socket.on("left",(data) => {


        let holder = characters[data.hashout];
        let playNum = holder.charNum;
        if(playNum == 1)
        {
            here1 = false;
        }
        if(playNum == 2)
        {
            here2 = false;
        }
        if(playNum == 3)
        {
            here3 = false;
        }
        if(playNum == 4)
        {
            here4 = false;
        }
        delete characters[data.hashout];
    });


    //restart game 
    socket.on("RestartServer", (data) => {
        let keys = Object.keys(data.properties);
        for(let i =0; i < keys.length; i++)
        {
            if(characters.hasOwnProperty(keys[i]))
            {
                characters[keys[i]] = data.properties[keys[i]];
            }
        }

        player1Mins = 0;
        player1Secs = 0;
        player2Mins = 0;
        player2Secs = 0;
        player3Mins = 0;
        player3Secs = 0;
        player4Mins = 0;
        player4Secs = 0;

        minutes = 0;
        seconds = 0;

        spaces = 0

        boostAmount = 1000;

        hasBall = false;

        GameOver = false;
        play = true;
        boostBool = true;

        state = 0;

        leftarrowBool = false;
        rightarrowBool = false;
        uparrowBool = false;
        downarrowBool = false;
        spacebarbool = false;
    })

    //when we get update on time
    socket.on("serverChangetime",(data) => {

        if(data.playerNum == 1)
        {
            player1Mins = data.minutes;
            player1Secs = data.seconds;
        }
        else if(data.playerNum == 2)
        {
            player2Mins = data.minutes;
            player2Secs = data.seconds;
        }
        else if(data.playerNum == 3)
        {
            player3Mins = data.minutes;
            player3Secs = data.seconds;
        }
        else if(data.playerNum == 4)
        {
            player4Mins = data.minutes;
            player4Secs = data.seconds;
        }
    })

    //when enough players join
    socket.on("ballStart",(data)=> {
        play = data.Start;
        state = 0;
        characters[data.ball.hash] = data.ball;

        switch(playerNum) {
            //text shadow found from: https://stackoverflow.com/questions/2570972/css-font-border
            case 1:
                NameLabel.innerHTML += "<span style='color:green; text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;'> Green/player 1</span>";
                break;
            case 2:
                NameLabel.innerHTML += "<span style='color:blue;  text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;'> Blue/player 2</span>";
                break;
            case 3:
                NameLabel.innerHTML += "<span style='color:yellow; text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;'> Yellow/player 3</span>";
                break;
            case 4:
                NameLabel.innerHTML += "<span style='color:purple; text-shadow: -1px 0 black, 0 1px black, 1px 0 black, 0 -1px black;'> Purple/player 4</span>";
                break;
            default:
                console.log("NameLable error");

        }

    });

    //get when someone tage
    socket.on("addMoreTime", (data) => {
        switch(data.playerNum)
        {
            case 1: 
                if(playerNum == 1)
                {
                    seconds += 5;
                }
                else
                {
                    player1Secs += 5;
                }
                break;
            case 2: 
                if(playerNum == 2)
                {
                    seconds += 5;
                }
                else
                {
                    player2Secs += 5;
                }
            break;           
            case 3: 
                if(playerNum == 3)
                {
                    seconds += 5;
                }
                else
                {
                    player3Secs += 5;
                }
            break;
            case 4: 
                if(playerNum == 4)
                {
                    seconds += 5;
                }
                else
                {
                    player4Secs += 5;
                }
                break;
            default:
                console.log("player num is ineligable");
        }
        socket.emit("changeTime",{playerNum,minutes,seconds,roomNumber});
    });

    //when someone interacts with the ball
    socket.on("someoneHasball",(data) => {
        if(data.state == 1)
        {
            characters["ball"].x = -100;
            characters["ball"].y = -100;
            state = data.state;
            let keys = Object.keys(characters);
            for(let i =0;i < keys.length; i++)
            {
                let object = characters[keys[i]];
                if(object.hash == data.circle.hash)
                {
                    object.hasBall = true;
                    if(object.hash == hash)
                    {
                        lastUpdate = Date.now();
                        hasBall = true;
                        socket.emit("objectChange", characters[hash]);
                    }
                }
            }
            socket.emit("objectChange", characters["ball"]);
        }
        else if(data.state == 0 )
        {
            characters["ball"].x = data.position.x;
            characters["ball"].y = data.position.y;
            state = data.state;
            let keys = Object.keys(characters);
            for(let i =0;i < keys.length; i++)
            {
                let object = characters[keys[i]];
                object.hasBall = false;
                socket.emit("objectChange", characters[object.hash]);
            }
            hasBall = false;
            socket.emit("objectChange", characters["ball"]);

        }
    });

    //update position of all chars
    socket.on("serverUpdatepos", (data) => {

        if(data.character != undefined)
        {
        if(!characters[data.character.hash])
        {
            characters[data.character.hash] = data.character;
        }
        else if(characters[data.character.hash].lastUpdate >= data.character.lastUpdate)
        {
            return;
        }
        else if(data.character.hash != hash)
        {
            characters[data.character.hash].prevX = data.character.prevX;
            characters[data.character.hash].destX = data.character.destX;
            characters[data.character.hash].destY = data.character.destY; 
            characters[data.character.hash].prevY = data.character.prevY;
            characters[data.character.hash].alpha = data.character.alpha;
            characters[data.character.hash].lastUpdate = data.character.lastUpdate;
        }
        else
        {
            characters[data.character.hash].lastUpdate = data.character.lastUpdate;
        }
    }
        
    });

    //start drawing
    draw();

    //handle buttons
    document.addEventListener("keydown",keydownHandler);
    document.addEventListener("keyup",keyUpHandler);

};


//draw objects on screen
const draw = () => {

    console.log(state);
    if(play == true)
    {
        ctx.clearRect(0,0,canvas.width,canvas.height);

        updatePosition();
        boostMeter();
        let keys = Object.keys(characters);
        for(let x =0;x<keys.length;x++)
        {
            let object = characters[keys[x]];
            ctx.save();
            ctx.beginPath();
            if(state == 0)
            {
                ctx.fillStyle = object.color;
            }
            else if(state == 1 && object.hasBall == true)
            {
                ctx.fillStyle = object.color;
            }
            else if(state == 1 && object.hasBall == false && object.hash != hash)
            {
                ctx.fillStyle = "red";
            }
            else if(state == 1 && object.hasBall == false && object.hash == hash)
            {
                ctx.fillStyle = "orange";
            }
            ctx.arc(object.x,object.y,object.radius,0,2*Math.PI);
            ctx.stroke();
            ctx.fill();
            ctx.restore();
        }

        

        requestAnimationFrame(draw);
    }
    else if(play == false && GameOver == false)
    {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.font = "24px Arial";
        ctx.fillText("Welcome to RunBall",canvas.width/2 - 110 ,30);
        ctx.font = "20px Arial";
        ctx.fillText("By: Johnny Siu",canvas.width/2 - 65, 60);
        ctx.font = "18px Arial";
        ctx.fillText("Objective of the game: Hold the ball for as long as possible",canvas.width/2 - 250, 120);
        ctx.fillText("The Label on the Left will identify which color circle you are and how much boost you have left.",canvas.width/2 - 375, 150);
        ctx.fillText("The Label on the Right will show how much time is left in the game.The white circle in the center",canvas.width/2- 375, 170);
        ctx.fillText("is the Ball, touch it to get the ball. When someone has the ball, all other players will turn red. ",canvas.width/2 - 375,190);
        ctx.fillText("At that point, your ball will be colored oranage. Once someone has touch the circle with the ball,",canvas.width/2 - 375, 210);
        ctx.fillText("all circles will go back to default colors, and the ball will spawn at another point.The player who",canvas.width/2 - 375, 230);
        ctx.fillText("is able to make the tag with someone who has the ball will get a little time bonus added to their",canvas.width/2 - 375, 250);
        ctx.fillText("overall time",canvas.width/2 - 375,270);
        
        ctx.fillText("Controls",canvas.width/2 - 40, 400);
        ctx.fillText("WASD to move",canvas.width/2 - 70, 430);
        ctx.fillText("Hold spacebar for boost",canvas.width/2 - 110, 460);
        ctx.fillText("Boost meter will refill over time, however, if you use all of it, you will have to wait for it to ",canvas.width/2 - 375, 490);
        ctx.fillText("fully recharge before using it again",canvas.width/2 - 375, 510)
        
        ctx.fillText("Waiting for more players",canvas.width/2-110,570);
        requestAnimationFrame(draw);
    }
    else if(play == false && GameOver == true)
    {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.font = "20px Arial";
        let width = 0;
        switch( spaces ) {
            case 1: 
                width = 20;
                break;
            case 2:
                width = 120;
                break;
            case 3:
                width = 150;
                break;
            case 4:
                width = 190;
                break;
            default:
                width = 60;
        }
        ctx.fillText(winnerLabel,canvas.width/2 - width,canvas.height/2);
        ctx.fillText("To play again, click on the 'play again' button under the time label on the right",canvas.width/2-330,canvas.height/2 + 30);
        requestAnimationFrame(draw);
    }
}

//update positions
const updatePosition = () => {

    if(play == true)
    {
        movement();
        boostRegainFunc();
        let keys = Object.keys(characters);
        //grab each user
        for(let x =0;x<keys.length;x++)
        {
            let square = characters[keys[x]];

            if(square.alpha < 1)
            {
                square.alpha += 0.05;
            }

            if(square.hash != "ball")
            {
                square.x = lerp(square.prevX,square.destX,square.alpha);
                square.y = lerp(square.prevY,square.destY,square.alpha);
            }

            characters[keys[x]] = square;
        
        
        }
    }
};

//lerp
const lerp = (v0, v1, alpha) => {
    return (1 - alpha) * v0 + alpha * v1;
};

//check delta time if someone has the ball
const updateTime = (secondsAdded) => {
    if(hasBall)
    {
        seconds += secondsAdded;
        if(seconds >= 60)
        {
            minutes += 1;
            seconds = 0;
        }
        updateLabel();
    }
};

//update the time labels
const updateLabel = () => {
    socket.emit("changeTime",{playerNum,minutes,seconds,roomNumber});
};


// look for keycodes
const keydownHandler = (e) =>
{
    if(play == true)
    {
        var keyCode = e.keyCode;
        //console.log(keyCode);
        if(keyCode == leftarrow)
        {
            leftarrowBool = true;
        }
        if(keyCode == rightarrow)
        {
            rightarrowBool = true;
        }
        if(keyCode == uparrow)
        {
            uparrowBool = true;
        }
        if(keyCode == downarrow)
        {
            downarrowBool = true;
        }
        if(keyCode == spacebar)
        {
            spacebarbool = true;
        }
    }
    e.preventDefault();
};

//if keys are released
const keyUpHandler = (e) =>
{
    if(play == true)
    {
        var keyCode = e.keyCode;

        if(keyCode == leftarrow)
        {
            leftarrowBool = false;
        }
        if(keyCode == rightarrow)
        {
            rightarrowBool = false;
        }
        if(keyCode == uparrow)
        {
            uparrowBool = false;
        }
        if(keyCode == downarrow)
        {
            downarrowBool = false;
        }
        if(keyCode == spacebar)
        {
            spacebarbool = false;
        }
}

};

const movement = () => {

    if(play == true)
    {
        let square = characters[hash];
        
        if(square != undefined)
        {
            square.prevX = square.x;
            square.prevY = square.y;

            boostAbility();

            if(leftarrowBool && square.destX > 25 && (spacebarbool == false || boostBool == false))
            {
                square.destX -= 2;
            
            }
            if(leftarrowBool && square.destX > 25 && spacebarbool == true && boostBool)
            {
                if(hasBall == false)
                {
                    square.destX -= 4;
                }
                else if(hasBall)
                {
                    square.destX -= 6;
                }
            }
            if(rightarrowBool && square.destX < 775 && (spacebarbool == false || boostBool == false))
            {
                square.destX += 2;
            }
            if(rightarrowBool && square.destX < 775 && spacebarbool == true && boostBool)
            {
                if(hasBall == false)
                {
                    square.destX += 4;
                }
                else if(hasBall)
                {
                    square.destX += 6;
                }
            }
            if(downarrowBool && square.destY < 575 && (spacebarbool == false || boostBool == false))
            {
                square.destY += 2;
            }
            if(downarrowBool && square.destY < 575 && spacebarbool == true && boostBool)
            {
                if(hasBall == false)
                {
                    square.destY += 4;
                }
                else if(hasBall == true)
                {
                    square.destY += 6;
                }
            }
            if(uparrowBool && square.destY > 25 && (spacebarbool == false || boostBool == false))
            {
                square.destY = square.destY - 2;
            }
            if(uparrowBool && square.destY > 25 && spacebarbool == true && boostBool)
            {
                if(hasBall == false)
                {
                    square.destY = square.destY - 4;
                }
                else if(hasBall == true)
                {
                    square.destY = square.destY - 6;
                }
            }
            square.alpha = 0.05;
            if(uparrowBool || downarrowBool || leftarrowBool || rightarrowBool)
            {
                socket.emit("updateFromclient", characters[hash]);
            }
        }
    }
};

//see if we can boost or not
const boostAbility = () => {

    if(boostBool && spacebarbool)
    {
        boostAmount -= boostDetrimint;
    }
    if(boostAmount <= 0)
    {
        boostBool = false;
    }
};

const boostRegainFunc = () => {

    if(boostAmount < 1000 && (spacebarbool == false || boostBool == false) && hasBall == false)
    {
        boostAmount += boostRegain;
    }
    else if(boostAmount < 1000 && (spacebarbool == false || boostBool == false) && hasBall)
    {
        boostAmount += boostRegainwithBall;
    }
    if(boostAmount >= 1000 && boostBool == false)
    {
        boostBool = true;
    }
    console.log(boostAmount);
};

const boostMeter = () => {
    let percentage = boostAmount / 1000;
    let boostmeter = percentage * 200;

    boostCtx.save();
    boostCtx.clearRect(0,0,boostCanvas.width,boostCanvas.height);
    boostCtx.fillStyle = "red";
    boostCtx.fillRect(0,0,boostmeter,boostCanvas.height);
    boostCtx.restore();


};





window.onload = init;