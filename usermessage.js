const db = require("./db.js");
exports.messageUpdate = (message) =>{
    updateMessageCount(message);
}
// updates Message Coubt
const updateMessageCount = async(message) =>{  
    userExist = await db.query("SELECT userid,serverid FROM user WHERE userid = ? AND serverid = ?",[message.author.id, message.guild.id]);
    if(userExist.err){return}
    if(userExist.rows.length === 0){
        userExist == false;
        await db.query("INSERT INTO user (userid, messageCount, serverid) VALUES ( ? , ? , ?)",[message.author.id,1,message.guild.id]);  
    }
    else{
        await db.query("UPDATE user SET messageCount = messageCount + 1 WHERE userid = ? AND serverid = ?",[message.author.id, message.guild.id]);
    }
    
}

exports.giveStats = async (interaction) => {
    let res = await db.query("SELECT messageCount FROM user WHERE userid = ? AND serverid = ?",[interaction.options.get("user").value,interaction.guild.id]);
    if(res.rows.length === 0){
        interaction.reply("this user hasnt sent anything");
        return;
    }

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





  
