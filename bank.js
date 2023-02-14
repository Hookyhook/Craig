const { REST, Routes, Embed, EmbedBuilder, channelLink, ReactionUserManager, InteractionCollector, ApplicationCommandOptionType, moveElementInArray,ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, Colors } = require('discord.js');
const db = require("./db.js");

exports.deposit = (interaction) => {
    interaction.reply("this isnt ready right now");
}