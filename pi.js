const { EmbedBuilder, Colors } = require("discord.js")
exports.pi = async (message) => {
    msg = message.content;
    amount = msg.split(" ")[1];
    amount = parseInt(amount);
    if(isNaN(amount)){
      message.channel.send("please enter a number");
    }else {
      let points = 0;
      let pointsInCircle = 0;
      for(let i = 1; i<= amount;i++){
        
        let randomX = Math.random(-1,1);
        let randomY = Math.random(-1,1);
        points++;
        console.log(Math.sqrt(Math.pow(randomX,2) + Math.pow(randomY,2)));
        if(Math.sqrt(Math.pow(randomX,2),Math.pow(randomY,2) <= 1)){
          //message.channel.send("P(" + randomX + "|" + randomY +") is in the circle");
          pointsInCircle++;
        }
        else{
          //message.channel.send("P(" + randomX + "|" + randomY +") is not in the circle");
        }
        message.channel.send({
        "embeds": [
          {
            "type": "rich",
            "title": "PI",
            "description": "",
            "color": 0x1f49ef,
            "fields": [
              {
                "name": "Points:",
                "value": points,
                
              },
              {
                "name": "Points in Circle:",
                "value": pointsInCircle,
              },
              {
                "name": "PI",
                "value": "idk",
              }
            ]
          }
        ]
      });
        
      }
    }
}