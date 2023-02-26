const token = "MTA0OTA0NTYyMTc2OTc2NDk4NQ.G4m5Hj.Z9gl4_YuunO8ueIf3XQzNM_T0D8w0gBlWExSPk";
const { REST, Routes, Embed, EmbedBuilder, channelLink, ReactionUserManager, InteractionCollector, ApplicationCommandOptionType, moveElementInArray,ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, Colors } = require('discord.js');
const db = require("./db.js")
const money = require("./money.js");

exports.rob = async (interaction) => {
    //err embeds
    let errEmbed = new EmbedBuilder().setColor(Colors.Red).setTitle("ERROR");
    //get player
    const robber = {user:interaction.user};
    const victim = {user:interaction.options.get("user").user};
    //get money from db
    let dbres = await db.query("SELECT balance,bankbalance FROM money WHERE userid = ?",[robber.user.id]);
    // check if robber to is even in money system
    if(dbres.rows.length === 0){
        //err message
        interaction.reply({embeds: [errEmbed.setDescription("You is not in the Money system! use /work to be reqisted")]});
        return;
    }
    robber.balance = dbres.rows[0].balance;// convert db output and write to robber item
    robber.bankbalance = dbres.rows[0].bankbalance
    dbres = await db.query("SELECT balance FROM money WHERE userid = ?",[victim.user.id]);//extract id
    // check if victim to is even in money system
    if(dbres.rows.length === 0){
        //err message
        interaction.reply({embeds: [errEmbed.setDescription("The Victim is not in the Money system!")]});
        return;
    }
    victim.balance = dbres.rows[0].balance;// convert db output and write to robber item
    //calc money robed
    let amount = Math.floor(victim.balance * (Math.random()/20+0.1)); // the robed ammount is 10% - 30% of victims balance
    if(amount>robber.balance){
        amount = Math.floor(robber.balance + (((Math.random()-0.5)*0.4)*(robber.bankbalance + robber.balance)));// determin balance if ammount is not bigger than robber balance
    }
    //detimine if catched by police
    if(Math.random() < 0.5){
        // embed to tell you failed
        const coughtEmbed = new EmbedBuilder().setTitle("COUGHT").setDescription("YOU WERE COUGHT, YOU WILL NOT BE ABLE TO DO MONEY RELATED THINGS FOR 5 HOURS").setColor(Colors.Red);
        interaction.reply({embeds: [coughtEmbed]});
        //set time in jail to now  + 5 h
        await db.query("UPDATE money SET injailtill = ? WHERE userid = ?",[Date.now()+(3600000*5), robber.user.id]);//set in db that they are in jail
    }
    else{
        // you weren chough so send that embed and notify robed person
        let robEmbed = new EmbedBuilder().setTitle("You Got Away!").setFields({name: "Amount", inline: true, value: String(amount)},
        {name: "From", inline: true, value: victim.user.username}).setColor(Colors.Green);
        //send
        interaction.reply({embeds:[robEmbed]});
        //insert into db -> rober
        db.query("UPDATE money SET balance = balance + ? WHERE userid = ?",[amount, robber.user.id]);
        //remove money from victim
        db.query("UPDATE money SET balance = balance - ? WHERE userid = ?",[amount, victim.user.id]);
        //send message to victim
        let victimEmbed = new EmbedBuilder().setTitle("You have been robbed!").setFields({name: "Robber", value: robber.user.username, inline:true},
        {name: "Amount", value:String(amount), inline:true}).setColor(Colors.Red);
        victim.user.send({embeds: [victimEmbed]});
        
    }
}
exports.jail = async (interaction) => {
    //get basic data
    let user = interaction.user;
    let injailtill = await db.query("SELECT injailtill FROM money WHERE userid = ?",[user.id])
    injailtill = injailtill.rows[0].injailtill; // format dbquery to use value
    
    if(injailtill < Date.now()){
        //he is not in jail
        //send not in jail embed
        let notInJailEmbed = new EmbedBuilder().setTitle("YOU ARE NOT IN JAIL").setDescription("grats").setColor(Colors.Green);
        interaction.reply({embeds: [notInJailEmbed]});
    }
    else{
        //he in jail
        //calc the time
        let h = Math.floor((injailtill - Date.now())/3600000);
        let min = Math.floor(((injailtill - Date.now())%3600000)/60000)
        let inJailEmbed = new EmbedBuilder().setTitle("IN JAIL").setDescription(`You still have ${h}h and ${min}min to go!`).setColor(Colors.Red);
        interaction.reply({embeds: [inJailEmbed]});
    }
}