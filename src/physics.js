const sockets = require('./sockets.js');


let characters = {};

const checkCollision = () => {

  const keys = Object.keys(characters);
  let state = sockets.stateStatus(characters[keys[0]]);
  for(let i = 0; i < keys.length;i++)
  {
     let circle = characters[keys[i]];
     for(let y = 0; y < keys.length; y++)
     {
       let circle2 = characters[keys[y]];

       if(circle2.charNum == circle.charNum)
       {

       }
       else if(state == 0)
       {
          let x = circle2.x - circle.x;
          let x2 = Math.pow(x,2);
          let y = circle2.y - circle.y;
          let y2 = Math.pow(y,2);
          let combined = x2 + y2;
          let result = Math.sqrt(combined);
          if(result < 100)
          {
            console.log(`circle ${circle.charNum} is intersecting with ${circle2.charNum}`);

            if(circle.charNum == "ball")
            {
                sockets.changeState(1,circle2);
                
            }
            else if(circle2.charNum == "ball")
            {
              sockets.changeState(1,circle);
            }
          }
       }
       else if(state == 1)
       {
        let x = circle2.x - circle.x;
        let x2 = Math.pow(x,2);
        let y = circle2.y - circle.y;
        let y2 = Math.pow(y,2);
        let combined = x2 + y2;
        let result = Math.sqrt(combined);
        if(result < 100)
        {
          console.log(`circle ${circle.charNum} is intersecting with ${circle2.charNum}`);

          if(circle.hasBall)
          {
              sockets.changeState(0,circle2);
              
          }
          else if(circle2.hasBall)
          {
            sockets.changeState(0,circle);
          }
        }


       }
    }
    console.log("no circles are intersecting");
  }
};

// set the characters over here
const setcharacters = (chars) => {
  characters = chars;
  checkCollision();
};

module.exports.setcharacters = setcharacters;
