const { REST, Routes, Embed, EmbedBuilder, channelLink, ReactionUserManager, InteractionCollector, ApplicationCommandOptionType } = require('discord.js');
const db = require("./db.js")


exports.work = async (interaction) => {
    //Check if in db
    let inDb = await db.query("SELECT * FROM money WHERE userid = ?",[interaction.user.id]);
    if(inDb.rows.length === 0){
        var res = await db.query("INSERT INTO money (userid, balance, lastworked) VALUES ( ? , ? , ?)",[interaction.user.id,0,0]);
        inDb = await db.query("SELECT * FROM money WHERE userid = ?",[interaction.user.id]);
    }
    console.log(inDb);
    //work
    console.log(inDb.rows[0].lastworked + "  lastworked");
    console.log(Date.now() - 3600);
    if(inDb.rows[0].lastworked < Date.now() - 3600000){
        let Wage = Math.floor((Math.random()*30) +10);
        
        var res = await db.query("UPDATE money SET balance = balance + ?, lastworked = ?  WHERE userid = ?",[Wage, Date.now(),interaction.user.id]);
        interaction.reply("Worked! Your balance: " + (inDb.rows[0].balance + Wage));
        console.log(res.err);
    }
    else{
        interaction.reply(`geez,take a break: you can work in ${Math.round((inDb.rows[0].lastworked - Date.now() + 3600000)/60000)} min and ${ Math.floor(((inDb.rows[0].lastworked - Date.now() + 3600000)%60000)/1000)} sec`);
    }
}