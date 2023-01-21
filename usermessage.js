const db = require("./db.js");
exports.messageUpdate = async (message) =>{
    updateMessageCount(message);
}
// updates Message Coubt
const updateMessageCount = async(message) =>{
    console.log("authorid:"+ message.author.id);
    console.log("servername:" +message.guild.name);
    console.log("serverid:" +message.guild.id);
    
    

    userExist = await db.query("SELECT userid,serverid FROM user WHERE userid = ? AND serverid = ?",[message.author.id, message.guild.id]);
    console.log(userExist);
    if(userExist.err){return}
    if(userExist.rows.length === 0){
        userExist == false;
        var res = await db.query("INSERT INTO user (userid, messageCount, serverid) VALUES ( ? , ? , ?)",[message.author.id,1,message.guild.id]);
        
    }
    else{
        var res = await db.query("UPDATE user SET messageCount = messageCount + 1 WHERE userid = ? AND serverid = ?",[message.author.id, message.guild.id]);
        console.log(res);
    }
    
}

exports.giveStats = async (interaction) => {
    var res = await db.query("SELECT messageCount FROM user WHERE userid = ? AND serverid = ?",[interaction.options.get("user").value,interaction.guild.id]);
    if(res.rows.length === 0){
        interaction.reply("this user hasnt sent anything");
        return;
    }
    console.log(interaction.options.get("user").value.username);
    interaction.reply({
        "embeds": [
            {
              "type": "rich",
              "title": `Stats`,
              "description": `from <@${interaction.options.get("user").value}>`,
              "color": 0x00FFFF,
              "fields": [
                {
                  "name": `Messages Sent`,
                  "value": `${res.rows[0].messageCount}`
                }
              ]
            }
          ]
    })
}





  
