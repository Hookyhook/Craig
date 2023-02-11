const { REST, Routes, Embed, EmbedBuilder, channelLink, ReactionUserManager, InteractionCollector, ApplicationCommandOptionType, moveElementInArray, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, Colors, Collector, InteractionResponse } = require('discord.js');
const db = require('./db');
exports.rps = async (interaction) => {
    //error Embed
    let errorEmbed = new EmbedBuilder()
        .setTitle("ERROR")
        .setColor(Colors.Red);
    //general variables
    let player1 = interaction.user;
    let player1Balance = await db.query("SELECT balance FROM money WHERE userid = ?", [player1.id]);
    player1Balance = player1Balance.rows[0].balance; //extraction from db response
    let player1move;// used later when buttons are clicked;
    let bet = interaction.options.get("bet").value;
    let player2;
    let player2Balance;
    let player2move;// used later when buttons are clicked;
    let startTime = Date.now();
    //follow up messages saved to edit later
    let followUp1;
    let gameFinished = false;
    //check if player 1 is in money system
    if (player1Balance === undefined) {
        //send error and delete after some time
        interaction.reply({ embeds: [errorEmbed.setDescription("You arent in the money system, please work once to get some money")] });
        return
    }
    //check money of player 1;
    if (player1Balance < bet) {
        //send error and delete after some time
        interaction.reply({ embeds: [errorEmbed.setDescription(`You balance(${player1Balance}) is lower than your bet(${bet})`)], ephemeral: true });
        return;
    }
    // if all ok make butotn row
    let joinButton = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("join")
            .setLabel("Join")
            .setStyle(ButtonStyle.Primary)
    );
    //and embed
    let startEmbed = new EmbedBuilder()
        .setTitle("Rock Paper Scissors")
        .setDescription(`Play Rock paper Siccors vs ${player1.username}`)
        .setFields({ name: "Bet", value: interaction.options.get("bet").value + "$" })
        .setColor(Colors.DarkNavy);
    //and send it
    interaction.reply({ embeds: [startEmbed], components: [joinButton] });
    // check interactivity
    function checkTime() {
        //if game is done no need
        if (gameFinished) {
            return;
        }
        // else check if now - start time is greater than 1 min
        if (Date.now() - startTime >= 60000) {
            //if yes send embed and delete after 1 min
            let timeOutEmbed = new EmbedBuilder().setTitle("Closed").setDescription("This game was closed do to inactivity");
            interaction.editReply({ embeds: [timeOutEmbed], components: [] });
            return;
        }
        else {
            //else call the function with a bit delay to not overload the system
            setTimeout(checkTime, 1000);
        }
    }
    //first call
    checkTime();

    //buttons

    //make collector
    const col = interaction.channel.createMessageComponentCollector();
    //collect recive
    col.on("collect", async i => {
        //update time for interactivity
        startTime = Date.now();
        //check if same user
        if (player1.id === i.user.id && i.customId == "join") {
            //if yes send error and delete
            i.update({ embeds: [errorEmbed.setDescription("You cant join your own game")], ephemeral: true, components: [] });
            return;
        }
        //else check 2nd player balance
        if (i.customId === "join") {
            player2 = i.user;
            //Get balance
            player2Balance = await db.query("SELECT balance FROM money WHERE userid = ?", [player2.id]);
            //convert db responce
            player2Balance = player2Balance.rows[0].balance;
            console.log(player2Balance + "  " + bet);
            if (player2Balance < bet) {
                //embed to tell that second player, doenst have enough money
                let notEnoughMoneyEmbed = new EmbedBuilder()
                    .setTitle("NOT ENOUGH MONEY")
                    .setFields({ name: "BET", value: bet + "$", inline: true }, { name: "BALANCE", value: player2Balance + "$", inline: true })
                    .setColor(Colors.Red);
                //send it to i and make ephemeral so only poor player sees
                i.reply({ embeds: [notEnoughMoneyEmbed], ephemeral: true });
                //set timeout function to delete after some seconds
                setTimeout(() => { i.deleteReply() }, 10000)
                return;
            }
            //send embed play embed
            let playEmbed = new EmbedBuilder().setColor(Colors.DarkBlue).setTitle("CHOOSE").addFields({ name: player1.username, value: "waiting", inline: true }, { name: player2.username, value: "waiting", inline: true });
            await interaction.editReply({ embeds: [playEmbed], components: [] });
            //biuld reaction for first player
            let reactionPlayer1 = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("1 rock").setLabel("ROCK").setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId("1 paper").setLabel("PAPER").setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId("1 scissors").setLabel("SCISSORS").setStyle(ButtonStyle.Primary));
            //send reaction for first player and save it so it can be changed later when clicked
            followUp1 = await interaction.followUp({ components: [reactionPlayer1], ephemeral: true });
            //biuld reaction for second player
            let reactionPlayer2 = new ActionRowBuilder().addComponents(new ButtonBuilder().setCustomId("2 rock").setLabel("ROCK").setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId("2 paper").setLabel("PAPER").setStyle(ButtonStyle.Primary),
                new ButtonBuilder().setCustomId("2 scissors").setLabel("SCISSORS").setStyle(ButtonStyle.Primary));
            //send reaction for second player
            await i.reply({ components: [reactionPlayer2], ephemeral: true });
            return;
        }
        //if custom id is not join it is a play button so check which player truog split at " " and which move he chose
        else {
            //get the player and what he cliced
            playerMove = i.customId.split(" ")[1];
            let player;
            //embed to tell user there move was registered
            let registerEmbed = new EmbedBuilder().setTitle(playerMove).setColor(Colors.DarkBlue).setDescription("Please Wait for you opponent to choose");
            //biuld embed update embed
            let updateEmbed = new EmbedBuilder().setColor(Colors.DarkBlue).setTitle("CHOOSE");
            console.log(i.customId.split(" ")[0])
            if (i.customId.split(" ")[0] == 1) {
                console.log("player 1 clicked !");
                player = player1;
                player1move = player1move;
                //updateEmded personolized
                updateEmbed.addFields({ name: player1.username, value: "choose", inline: true }, { name: player2.username, value: "waiting", inline: true });
                //Send player that his click was registered
                interaction.fetchReply()
                await followUp1.update("help");
            }
            else {
                player = player2;
                player2move = player2move;
                updateEmbed.addFields({ name: player1.username, value: "waiting", inline: true }, { name: player2.username, value: "choose", inline: true })
                i.editReply({embeds: [registerEmbed],ephemeral:true,components:[]})
            }
            //Send upadated embad
            //interaction.editReply({embeds:[updateEmbed]});    
        }
    });
} 