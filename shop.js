const db = require("./db.js");
const {
    REST, Routes, Embed, EmbedBuilder, channelLink, ReactionUserManager, InteractionCollector, ApplicationCommandOptionType, moveElementInArray, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, Collector, Collection, Colors
} = require("discord.js");


exports.list = async (interaction) => {
    let res = new EmbedBuilder().setTitle("SHOP").setColor(Colors.Blurple);
    let shop = await db.query("SELECT * FROM items",[]);
    console.log(shop)
    shop = shop.rows;
    let itemfield = "";
    shop.forEach((e) => {
        itemfield += "``" + (e.id) + ":``" + e.name + e.emogi + " -> " + "``" + e.price + "$``" + "\n";
    })
    console.log(itemfield);
    res.addFields({ name: "ITEM", value: itemfield, inline: true });
    interaction.reply({ embeds: [res] });
}

exports.buy = async (interaction) => {
    let err = new EmbedBuilder().setTitle("Error").setColor(Colors.Red);
    const input = interaction.options.get("index").value ; //get input
    let shopAmm = await db.query("SELECT COUNT(*) AS amount FROM items",[]);
    if(input <=0 || input > shopAmm.rows[0].amount){ // check if input exsiste
        interaction.reply({embeds: [err.setDescription("this is not an index!")],ephemeral: true});
        return
    }
    //get item from db
    let item = await db.query("SELECT * FROM items WHERE id = ?",[input]);
    item = item.rows[0];

    //get items of user
    let res = await db.query("SELECT item FROM inventory WHERE userid = ?",[interaction.user.id]);
    //format items to strings
    
    //check money
    res = await db.query("SELECT balance FROM money WHERE userid = ?",[interaction.user.id]);
    let balance = res.rows[0].balance;
    if(item.price > balance){
        await interaction.reply({embeds:[err.setDescription("You dont have enough money on hand! The " + item.emogi + " costs ``" + item.price + "$`` but you only have ``" + balance + "$`` on hand!").setFooter({text: "Use /withdraw to withdaw money from your bank account or /work to earn some more money!"})]});
        return;
    }
    let resEmbed = new EmbedBuilder().setTitle("BUY "+ item.name).setDescription("Are you sure you want to buy the "+ item.name + item.emogi + "for ``" + item.price + "$``").setColor(Colors.Red);
    let buttons = new ActionRowBuilder().setComponents(new ButtonBuilder().setLabel("YES").setStyle(ButtonStyle.Danger).setCustomId("YES"),
    new ButtonBuilder().setLabel("NO").setStyle(ButtonStyle.Success).setCustomId("NO"));
    interaction.reply({embeds: [resEmbed],components:[buttons],ephemeral:true});
//buttons
    const collector = interaction.channel.createMessageComponentCollector();
    collector.on("collect", async i => {
        //check that it is the right user to be safe
        if (interaction.id != i.message.interaction.id) {
            return
        }
        if (interaction.user.id != i.user.id) {
            return
        }
        //no
        if(i.customId == "NO"){
            const noEmbed = new EmbedBuilder().setTitle("NOTHING HAPPEND!").setDescription("you didnt buy the "+ item.name + "!").setColor(Colors.Green);
            await interaction.editReply({embeds:[noEmbed],ephemeral:true,components:[]});
            return;
        }
        if(i.customId == "YES"){
            let res = await db.query("UPDATE money SET balance = ? WHERE userid = ?",[(balance-item.price),(interaction.user.id)]);
            console.log(res);
            res = await db.query("INSERT INTO `inventory`(userid, item) VALUES (?,?)",[interaction.user.id,item.id]);
            console.log(res);
            const succesfulEmbed = new EmbedBuilder().setTitle("YOU BOUGHT "+ item.emogi).setDescription("You bought "+item.name+item.emogi+ "for ``"+item.price+"$``. You now have ``" + (balance-item.price)+ "$``").setColor(Colors.Green);
            await interaction.editReply({embeds:[succesfulEmbed],ephemeral:true,components:[]});
            return;
        }
    });  
}

exports.inventory = async(interaction) => {
    // get items
    let res = await db.query("SELECT inventory.item,items.name,items.price,items.emogi FROM inventory INNER JOIN items ON inventory.item = items.id WHERE inventory.userid = ?",[interaction.user.id]);
    console.log(res);
    let resItem = ""
    res.rows.forEach(e => {
        resItem += e.emogi;
    });
    if(resItem == ""){
        await interaction.reply({embeds:[new EmbedBuilder().setTitle("NOTHIUNG IN HERE").setColor(Colors.Red).setFooter({text: "Use /shop buy to buy something!"})],ephemeral:true});
        return
    }
    let resEmbed = new EmbedBuilder().setTitle("YOUR INVENTORY").addFields({name:"Items",value:resItem}).setColor(Colors.Green).setFooter({text: "Use /shop buy to buy something!"});
    await interaction.reply({embeds:[resEmbed],ephemeral:true});
}