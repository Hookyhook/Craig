const { REST, Routes, Embed, EmbedBuilder, channelLink, ReactionUserManager, InteractionCollector, ApplicationCommandOptionType, moveElementInArray,ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, Colors } = require('discord.js');
exports.info = async(interaction) => {
    //biuld info embde
    let info = new EmbedBuilder().setTitle("CRAIG").setDescription("by Sycrw").setColor(Colors.Orange)
    .addFields({name: "What this?",value:"Craig is a bot that basicly lets you play some mini game for some money. This money you can earn through working and playing for it. You can learn more with the commands below"},
    {name: "```/games```",value: "some info to the games",inline:true},{name: "```/money```",value: "some info to the money system",inline:true},{name: "```/others```",value: "some other commands",inline:true});
    //biuld buttons
    let buttons = new  ActionRowBuilder()
    .addComponents(new ButtonBuilder().setURL("https://sycrw.ga").setLabel("SYCRW").setStyle(ButtonStyle.Link),
    new ButtonBuilder().setURL("https://github.com/sycrw/craig").setStyle(ButtonStyle.Link).setLabel("GITHUB"),
    new ButtonBuilder().setStyle(ButtonStyle.Link).setURL("https://discord.gg/hUgDWzJpkK").setLabel("COMMUNITY DISCORD")
    );
    //send
    interaction.reply({embeds:[info],components:[buttons]});

}
exports.games = async(interaction) => {
    let games = new EmbedBuilder().setTitle("Games").setDescription("here are some games").addFields({name: "```/coinflip```",value: "coinflip: If you win you double your money, if you lose you lose your bet!",inline: true},
    {name: "```/tictactoe```",value: "TicTacToe: The standart game to ply with to people for some money. If you win you get the money from the others, if you loose you the other player get the money!",inline: true},).setColor(Colors.Orange);
    interaction.reply({embeds:[games]})
}
exports.money = async(interaction) => {
    let money = new EmbedBuilder().setTitle("Money").setDescription("Info to the money system").addFields({name: "General",value:"The money system, at the moment is mainly used to play games. Well how do you get money? Look below?"},
        {name: "```/work```",value: "You can work once an hour, to gain some cash! You will also need to run this command once, if you have never used the bot.",inline: true},
    {name: "```/balance```",value: "Returns the money, that the player has!",inline: true},
    {name: "```/rob```",value: "You can rob somebody, to hopefully get some of their cash! But watch out, you could be caught and land in jail",inline: true},
    {name: "```/jail```",value: "Tells you, how long you still are in jail!",inline: true},).setColor(Colors.Orange);
    interaction.reply({embeds:[money]})
}
exports.others = async(interaction) => {
let others = new EmbedBuilder().setTitle("Money").setDescription("Some other commands of this bot!").addFields({name: "```/meme```",value: "Gives you a random meme from reddit!",inline: true},
    {name: "```/stats```",value: "Gives you how many messages somebody has written on this server!",inline: true}).setColor(Colors.Orange);
    interaction.reply({embeds:[others]})
}
