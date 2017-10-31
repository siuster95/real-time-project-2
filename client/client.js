
let canvas;
let ctx;
let socket;
let characters = {};
let hash;
const leftarrow = 37;
const rightarrow = 39;
const uparrow = 38;
const downarrow = 40;
const spacebar = 32;
let rightarrowBool = false;
let leftarrowBool = false;
let uparrowBool = false;
let downarrowBool = false;
let spacebarbool = false;
let walkImage;
let play = false;
let state;

const spriteSize = {
    WIDTH: 100,
    HEIGHT: 100
};



const init = () => {

    canvas = document.querySelector("#myCanvas");
    ctx = canvas.getContext("2d");
    walkImage = document.querySelector("#walk");

    //connect to socket
    socket = io.connect();


    //after connect to socket
    socket.on("Joined", (data) => {
        characters[data.hash] = data;
        hash = data.hash;
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

    //when someone leaves
    socket.on("left",(data) => {

        delete characters[data.hashout];
    });

    //when enough players join
    socket.on("ballStart",(data)=> {
        play = data.Start;
        state = 0;
        characters[data.ball.hash] = data.ball;
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
                }
            }
            socket.emit("updateFromclient", characters["ball"]);
        }
        else if(data.state == 0 )
        {
            characters["ball"].x = 250;
            characters["ball"].y = 250;
            state = data.state;
            let keys = Object.keys(characters);
            for(let i =0;i < keys.length; i++)
            {
                let object = characters[keys[i]];
                object.hasBall = false;
            }
            socket.emit("updateFromclient", characters["ball"]);

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

    if(play == true)
    {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        updatePosition();
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
    else
    {
        ctx.clearRect(0,0,canvas.width,canvas.height);
        ctx.font = "30px Arial";
        ctx.fillText("Waiting for more players",canvas.width/2 - 150,canvas.height/2);
        requestAnimationFrame(draw);
    }
}

//update positions
const updatePosition = () => {

    if(play == true)
    {
        movement();

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

// look for keycodes
const keydownHandler = (e) =>
{
    if(play == true)
    {
        var keyCode = e.keyCode;
        console.log(keyCode);
        if(keyCode == leftarrow)
        {
            leftarrowBool = true;
        }
        else if(keyCode == rightarrow)
        {
            rightarrowBool = true;
        }
        else if(keyCode == uparrow)
        {
            uparrowBool = true;
        }
        else if(keyCode == downarrow)
        {
            downarrowBool = true;
        }
        else if(keyCode == spacebar)
        {
            spacebarbool = true;
        }
    }

}

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
        else if(keyCode == rightarrow)
        {
            rightarrowBool = false;
        }
        else if(keyCode == uparrow)
        {
            uparrowBool = false;
        }
        else if(keyCode == downarrow)
        {
            downarrowBool = false;
        }
        else if(keyCode == spacebar)
        {
            spacebarbool = false;
        }
}

}

const movement = () => {

    if(play == true)
    {
        let square = characters[hash];

        if(square != undefined)
        {
            square.prevX = square.x;
            square.prevY = square.y;

            if(leftarrowBool && square.destX > 50 && spacebarbool == false)
            {
                square.destX -= 2;
            
            }
            else if(leftarrowBool && square.destX > 50 && spacebarbool == true)
            {
                square.destX -= 4;
            
            }
            else if(rightarrowBool && square.destX < 450 && spacebarbool == false)
            {
                square.destX += 2;
            }
            else if(rightarrowBool && square.destX < 450 && spacebarbool == true)
            {
                square.destX += 4;
            }
            if(downarrowBool && square.destY < 450 && spacebarbool == false)
            {
                square.destY += 2;
            }
            if(downarrowBool && square.destY < 450 && spacebarbool == true)
            {
                square.destY += 4;
            }
            if(uparrowBool && square.destY > 50 && spacebarbool == false)
            {
                square.destY = square.destY - 2;
            }
            if(uparrowBool && square.destY > 50 && spacebarbool == true)
            {
                square.destY = square.destY - 4;
            }
            square.alpha = 0.05;
            socket.emit("updateFromclient", characters[hash]);
        }
    }
};





window.onload = init;