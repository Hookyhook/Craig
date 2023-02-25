const { REST, Routes, Embed, EmbedBuilder, channelLink, ReactionUserManager, InteractionCollector, ApplicationCommandOptionType, moveElementInArray, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, Colors, InviteGuild } = require('discord.js');
const db = require("./db.js");

exports.deposit = async (interaction) => {
    let user = interaction.user;
    const res = await db.query("SELECT bankbalance, balance FROM money WHERE userid = ?", [interaction.user.id]);
    const balance = res.rows[0].balance;
    const bank = res.rows[0].bankbalance;
    let deposit = interaction.options.get("amount").value;
    let transferOK = false;
    let errEmbed = new EmbedBuilder().setTitle("ERROR").setColor(Colors.Red);
    if (res.rows[0].length === 0) {
        interaction.reply({ embeds: [errEmbed.setDescription("You arent in the money system! /money for help!")] });
        transferOK = true;
        return
    }
    if (deposit < 0) {
        interaction.reply({ embeds: [errEmbed.setDescription("Bro..., you can deposit negative Money?")] });
        return
    }
    if (balance < deposit) {
        if (balance == 0) {
            interaction.reply({ embeds: [errEmbed.setDescription("Bro, you have 0?")] });
            return
        }
        // if dont have enough money ask if Want to deposit all
        let button = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("all").setLabel("DEPOSIT ALL").setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId("no").setLabel("NO").setStyle(ButtonStyle.Success));
        await interaction.reply({ embeds: [errEmbed.setDescription(`You dont have that much money on hand! DO you want to deposit all?(${balance}$)`)], components: [button] });

    }
    else {
        let replyEmbed = new EmbedBuilder().setTitle("DEPOSITED").setDescription(`your deposit of ${deposit}$ was succesful!`).setFields({ name: "BANK", value: String(bank + deposit), inline: true },
            { name: "ON HAND", value: String(balance - deposit), inline: true }).setColor(Colors.Green);
        await interaction.reply({ embeds: [replyEmbed] });
        let update = await db.query("UPDATE money set bankbalance = bankbalance + ?, balance = balance - ? WHERE userid = ?", [deposit, deposit, user.id]);
        transferOK = true;
        console.log(update);
    }
    //wait for button response
    // check interactivity
    let startTime = Date.now();
    function checkTime() {
        if (Date.now() - startTime >= 60000 && !transferOK) {
            let timeOutEmbed = new EmbedBuilder().setTitle("Closed").setDescription("This TAB was closed do to inactivity! NOTHING HAPPEND");
            interaction.editReply({ embeds: [timeOutEmbed], components: [] });
            transferOK = true;
            return;

        }
        else {
            setTimeout(checkTime, 60000);
        }
    }
    checkTime();
    const collector = interaction.channel.createMessageComponentCollector();
    collector.on("collect", async i => {

        if (interaction.id != i.message.interaction.id) {
            console.log(interaction.id + "    " + i.message.interaction.id);
            return
        }
        if (interaction.user.id != i.user.id) {
            return
        }
        if (i.customId == "all") {
            console.log(i.customId);
            deposit = balance;
            let update = await db.query("UPDATE money set bankbalance = bankbalance + ?, balance = 0 WHERE userid = ?", [deposit, user.id]);
            console.log(deposit);
            let replyEmbed = new EmbedBuilder().setTitle("DEPOSITED").setDescription(`your deposit of ${deposit}$ was succesful!`).setFields({ name: "BANK", value: String(bank + deposit), inline: true },
                { name: "ON HAND", value: String(balance - deposit), inline: true }).setColor(Colors.Green);
            interaction.editReply({ embeds: [replyEmbed], components: [] });
            transferOK = true;
            return
        }
        if (i.customId == "no") {
            let replyEmbed = new EmbedBuilder().setTitle("NOTHING WAS DEPOSITED").setColor(Colors.Green);
            interaction.editReply({ embeds: [replyEmbed], components: [] });
            transferOK = true;
            return
        }
    })
}

exports.withdraw = async (interaction) => {
    let user = interaction.user
    let res = await db.query("SELECT balance, bankbalance FROM money WHERE userid = ?", [user.id]);
    let balance = res.rows[0].balance;
    let bank = res.rows[0].bankbalance;
    let amount = interaction.options.get("amount").value;
    let errEmbed = new EmbedBuilder().setTitle("ERROR").setColor(Colors.Red);
    if (res.rows[0].length === 0) {
        interaction.reply({ embeds: [errEmbed.setDescription("You arent in the money system! /money for help!")] });
        transferOK = true;
        return
    }
    if (amount < 0) {
        interaction.reply({ embeds: [errEmbed.setDescription("Bro... - ?")] });
    }
    if (bank < amount) {
        if (bank == 0) {
            interaction.reply({ embeds: [errEmbed.setDescription("Bro you have 0 dollars in the bank!")] });
            return
        }
        // if dont have enough money ask if Want to deposit all
        let button = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("all").setLabel("WITHDRAW ALL").setStyle(ButtonStyle.Danger),
            new ButtonBuilder().setCustomId("no").setLabel("NO").setStyle(ButtonStyle.Success));
        await interaction.reply({ embeds: [errEmbed.setDescription(`You dont have that much money in the bank! DO you want to withdraw all(${bank}$)?`)], components: [button] });

    }
    else {
        let replyEmbed = new EmbedBuilder().setTitle("WITHDRAWN").setDescription(`your withdraw of ${amount}$ was succesful!`).setFields({ name: "BANK", value: String(bank - amount), inline: true },
            { name: "ON HAND", value: String(balance + amount), inline: true }).setColor(Colors.Green);
        await interaction.reply({ embeds: [replyEmbed] });
        let update = await db.query("UPDATE money set bankbalance = bankbalance - ?, balance = balance + ? WHERE userid = ?", [amount, amount, user.id]);
        transferOK = true;
        console.log(update);
    }
    // check interactivity
    let startTime = Date.now();
    function checkTime() {
        if (Date.now() - startTime >= 60000 && !transferOK) {
            let timeOutEmbed = new EmbedBuilder().setTitle("Closed").setDescription("This TAB was closed do to inactivity! NOTHING HAPPEND");
            interaction.editReply({ embeds: [timeOutEmbed], components: [] });
            transferOK = true;
            return;

        }
        else {
            setTimeout(checkTime, 60000);
        }
    }
    checkTime();
    const collector = interaction.channel.createMessageComponentCollector();
    collector.on("collect", async i => {

        if (interaction.id != i.message.interaction.id) {
            console.log(interaction.id + "    " + i.message.interaction.id);
            return
        }
        if (interaction.user.id != i.user.id) {
            return
        }
        if (i.customId == "all") {
            amount = bank;
            await db.query("UPDATE money set bankbalance = bankbalance - ?, balance = balance + ? WHERE userid = ?", [amount, amount, user.id]);
            let replyEmbed = new EmbedBuilder().setTitle("WIDTH").setDescription(`your withdraw of ${amount}$ was succesful!`).setFields({ name: "BANK", value: String(bank - amount), inline: true },
                { name: "ON HAND", value: String(balance + amount), inline: true }).setColor(Colors.Green);
            interaction.editReply({ embeds: [replyEmbed], components: [] });
            transferOK = true;
            return
        }
        if (i.customId == "no") {
            let replyEmbed = new EmbedBuilder().setTitle("NOTHING WAS DEPOSITED").setColor(Colors.Green);
            interaction.editReply({ embeds: [replyEmbed], components: [] });
            transferOK = true;
            return
        }
    })

}