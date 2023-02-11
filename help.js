const { REST, Routes, Embed, EmbedBuilder, channelLink, ReactionUserManager, InteractionCollector, ApplicationCommandOptionType, moveElementInArray,ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, Colors } = require('discord.js');
exports.info = async(interaction) => {
    //biuld info embde
    let info = new EmbedBuilder().setTitle("CRAIG").setDescription("by Sycrw").setColor(Colors.Orange)
    .addFields({name: "What this?",value:"Craig is a bot that basicly lets you play some mini game for some money. This money you can earn through working and playing for it. You can learn more with /help"});
    //biuld buttons
    let buttons = new  ActionRowBuilder()
    .addComponents(new ButtonBuilder().setURL("https://sycrw.ga").setLabel("SYCRW").setStyle(ButtonStyle.Link),
    new ButtonBuilder().setURL("https://github.com/sycrw/craig").setStyle(ButtonStyle.Link).setLabel("GITHUB"),
    new ButtonBuilder().setStyle(ButtonStyle.Link).setURL("https://discord.gg/hUgDWzJpkK").setLabel("COMMUNITY DISCORD")
    );
    //send
    interaction.reply({embeds:[info],components:[buttons]});

}