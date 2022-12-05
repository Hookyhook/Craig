const { EmbedBuilder, Colors } = require("discord.js")
const axios = require("axios");
exports.meme = async (client, interaction) => {

    let subReddit = [
        'techhumor',
        'programmerhumor',
        'ITMemes'
    ]

    let pickSubReddit = subReddit[Math.floor(Math.random() * subReddit.length)]

    let { data } = await axios.get(`https://meme-api.com/gimme/${pickSubReddit}`);
    console.log(data);

    let postMeme = new EmbedBuilder()
        .setAuthor({
            name: `/u/${data.author}`,
        })
        .setTitle(data.title)
        .setImage(data.url)
        .setURL(data.postLink)
        .setColor(Colors.Green)
        .setTimestamp()
        .setFooter({ text: `/r/${data.subreddit}  • Upvotes: ${data.ups} ` })

    try {
        await interaction.reply({
            embeds: [postMeme]
        })
    } catch (e) {
    }
}