const { REST, Routes, Embed, EmbedBuilder, channelLink, ReactionUserManager, InteractionCollector, ApplicationCommandOptionType, moveElementInArray, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, Colors, Collector, } = require('discord.js');
const db = require('./db');
exports.rps = async (interaction) =>{
    //error Embed
    let errorEmbed = new EmbedBuilder()
    .setTitle("TITLE")
    .setColor(Colors.Red);
    //general variables
    let player1 = interaction.user;
    let player1Balance = await db.query("SELECT balance FROM money WHERE userid = ?", [player1.id]);
    player1Balance = player1Balance.rows[0].balance; //extraction from db response
    let bet = interaction.options.get("bet").value;
    let player2;
    let startTime = Date.now();
    let gameFinished = false; 
    //check if player 1 is in money system
    if(player1Balance === undefined){
        interaction.reply({embeds: [errorEmbed.setDescription("You arent in the money system, please work once to get some money")]});
        return
    }
    //check money of player 1;
    console.log(player1Balance)
    if(player1Balance < bet){
        interaction.reply({embeds: [errorEmbed.setDescription(`You balance(${player1Balance}) is lower than your bet(${bet})`)],ephemeral: true});
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
    interaction.reply({embeds:[startEmbed],components: [joinButton]});
    // check interactivity
    function checkTime() {
        //if game is done no need
        if(gameFinished){
            return;
        }
        // else check if now - start time is greater than 1 min
        if (Date.now() - startTime >= 60000) {
            //if yes send embed
          startTime = Date.now();
          let timeOutEmbed = new EmbedBuilder().setTitle("Closed").setDescription("This game was closed do to inactivity");
          interaction.editReply({embeds: [timeOutEmbed], components:[]});
          return;

        }
        else{
            //else call the function with a bit delay to not overload the system
            setTimeout(checkTime, 1000);
        }
      }
      //first call
      checkTime();
    
    //buttons

    //make collector
    const col = interaction.channel.createMessageComponentCollector();
    
} 