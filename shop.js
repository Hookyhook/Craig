const offers = [
    { item: "car", price: 5000, emoji: ":blue_car:" }, //-> uber
    { item: "teacher bag", price: 10000, emoji: ":briefcase:" },
    { item: "laptop", price: 30000, emoji: ":computer:" },
    { item: "race car", price: 100000, emoji: ":race_car:" },
    { item: "PC", price: 451000, emoji: ":desktop:" },
    { item: "test tube", price: 978600, emoji: ":test_tube:" }, //chemist
    { item: "gun", price: 18769420, emoji: ":gun:" }, // -> americaan
];
const db = require("./db.js");
const {
    REST, Routes, Embed, EmbedBuilder, channelLink, ReactionUserManager, InteractionCollector, ApplicationCommandOptionType, moveElementInArray, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, Collector, Collection, Colors
} = require("discord.js");

exports.list = async (interaction) => {
    let res = new EmbedBuilder().setTitle("SHOP").setColor(Colors.Blurple);
    let itemfield = "";
    offers.forEach((e, i) => {
        itemfield += "``" + (i + 1) + ":``" + e.item + e.emoji + " -> " + "``" + e.price + "$``" + "\n";
    })
    res.addFields({ name: "ITEM", value: itemfield, inline: true });
    interaction.reply({ embeds: [res] });
}

exports.buy = async (interaction) => {
    let err = new EmbedBuilder().setTitle("Error").setColor(Colors.Red);
    const input = interaction.options.get("index").value ; //get input
    if(input <=0 || input > offers.length){ // check if input exsiste
        interaction.reply({embeds: [err.setDescription("this is not an index!")],ephemeral: true});
        return
    }
    //get index in array
    const index = input-1;
    //get item data
    let item = offers[index];
    //get items of user
    let res = await db.query("SELECT item FROM inventory WHERE userid = ?",[interaction.user.id]);
    //format items to strings
    let owend = [];
    res.rows.forEach(e => {
        owend.push(e.item);
    });
    //chek if user contains selected item
    console.log(owend);
    console.log(owend.includes(item.item));
    if(owend.includes(item.item)){
        await interaction.reply({embeds:[err.setDescription("You already own a "+ item.item + item.emoji).setFooter({text:"Use /invetory to see what you own!"})]})
        return;
    }
    res = await db.query("SELECT balance FROM money WHERE userid = ?",[interaction.user.id]);
    let balance = res.rows[0].balance;
    if(item.price > balance){
        await interaction.reply({embeds:[err.setDescription("You don´t have enough money on hand! The " + item.emoji + " costs ``" + item.price + "$`` but you only have ``" + balance + "$`` on hand!").setFooter({text: "Use /withdraw to withdaw money from your bank account or /work to earn some more money!"})]});
        return;
    }
    let resEmbed = new EmbedBuilder().setTitle("BUY "+ item.item).setDescription("Are you sure you want to buy the "+ item.item + item.emoji + "for ``" + item.price + "``").setColor(Colors.Red);
    let buttons = new ActionRowBuilder().setComponents(new ButtonBuilder().setLabel("YES").setStyle(ButtonStyle.Danger).setCustomId("YES"),
    new ButtonBuilder().setLabel("NO").setStyle(ButtonStyle.Success).setCustomId("NO"));
    interaction.reply({embeds: [resEmbed],components:[buttons],ephemeral:true});
//buttons
    const collector = interaction.channel.createMessageComponentCollector();
    collector.on("collect", async i => {
        //check that it is the right user to be safe
        console.log(i.customId);
        if (interaction.id != i.message.interaction.id) {
            return
        }
        if (interaction.user.id != i.user.id) {
            return
        }
        //no
        if(i.customId == "NO"){
            const noEmbed = new EmbedBuilder().setTitle("NOTHING HAPPEND!").setDescription("you didnt buy the "+ item.item + "!").setColor(Colors.Green);
            await interaction.editReply({embeds:[noEmbed],ephemeral:true,components:[]});
            return;
        }
        if(i.customId == "YES"){
            let res = await db.query("UPDATE money SET balance = ? WHERE userid = ?",[(balance-item.price),(interaction.user.id)]);
            console.log(res);
            res = await db.query("INSERT INTO `inventory`(userid, item) VALUES (?,?)",[interaction.user.id,item.item]);
            console.log(res);
            const succesfulEmbed = new EmbedBuilder().setTitle("YOU BOUGHT "+ item.emoji).setDescription("You bought "+item.item+item.emoji+ "for ``"+item.price+"?``. You now have ``" + (balance-item.price)+ "$``").setColor(Colors.Green);
            await interaction.editReply({embeds:[succesfulEmbed],ephemeral:true,components:[]});
            return;
        }
    });  
}

exports.inventory = async(interaction) => {
    // get items
    let res = await db.query("SELECT item FROM inventory WHERE userid = ?",[interaction.user.id]);
    let resItem = ""
    res.rows.forEach(e => {
        offers.forEach(l => {
            if(e.item == l.item){
                resItem += l.item + l.emoji + "\n";
            }
        });
    });
    if(resItem == ""){
        await interaction.reply({embeds:[new EmbedBuilder().setTitle("NOTHIUNG IN HERE").setColor(Colors.Red).setFooter({text: "Use /shop buy to buy something!"})],ephemeral:true});
        return
    }
    let resEmbed = new EmbedBuilder().setTitle("YOUR INVENTORY").addFields({name:"Items",value:resItem}).setColor(Colors.Green).setFooter({text: "Use /shop buy to buy something!"});
    await interaction.reply({embeds:[resEmbed],ephemeral:true});
}