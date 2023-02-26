const offers = [{ item: "laptop", price: 5000, emoji: ":computer:" },
{ item: "PC", price: 10000, emoji: ":desktop:" },];
const db = require("./db.js");
const {
    REST,
    Routes,
    Embed,
    EmbedBuilder,
    channelLink,
    ReactionUserManager,
    InteractionCollector,
    ApplicationCommandOptionType,
    moveElementInArray,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Events,
    Collector,
    Collection,
    Colors
} = require("discord.js");    

exports.list = async (inteaction) =>{
    let res = new EmbedBuilder().setTitle("SHOP").setColor(Colors.Blurple);
    let itemfield = "";
    let moneyfield = "";
    offers.forEach((e,i)=>{
        itemfield += e.item + e.emoji + "\n";
        moneyfield += e.price +"$"+ "\n";
    })
    res.addFields({name: "ITEM",value:itemfield,inline:true},{name: "Price",value:moneyfield,inline:true})
    inteaction.reply({embeds:[res]});
}

exports.buy = async (inteaction) =>{
    inteaction.reply("no this isnt now rweady");
}