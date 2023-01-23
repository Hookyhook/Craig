const { REST, Routes, Embed, EmbedBuilder, channelLink, ReactionUserManager, InteractionCollector, ApplicationCommandOptionType, moveElementInArray,ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, } = require('discord.js');
exports.tictactoe = (interaction) => {
    let player1 = interaction.user;
    let player2;
    let activePlayer = player1;
    let gameStarted = false;
    let startEmbed = new EmbedBuilder()
    .setColor(15105570)
    .setTitle("Tic-Tac-Toe")
    .setDescription("from "+ interaction.user.username)
    .setFields({name: "Bet Amount", value: interaction.options.get("bet").value + "$"});
    let startButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel("JOIN").setCustomId("join").setStyle(ButtonStyle.Success)
    )
    interaction.reply({embeds: [startEmbed],components: [startButtons]});
    let gameBoard = [["none","none","none"],
                    ["none","none","none"],
                    ["none","none","none"]
                    ];
    const collector = interaction.channel.createMessageComponentCollector();
    collector.on("collect", async i => {
        if (i.message.interaction.id !== interaction.id){
            return
        }
        if(i.user.id === interaction.user.id  && !gameStarted){
            //cant join your own game
            let sameUserEmbed = new EmbedBuilder().setTitle("ERROR").setDescription("you cant join you own game").setColor(15548997);
            interaction.editReply({embeds: [sameUserEmbed],components:[]});
            collector.stop();
        }
        //turn game on and start board
        if(!gameStarted){
            player2 = i.user;
            let playEmbed =new EmbedBuilder()
            .setColor(15105570)
            .setTitle("Tic-Tac-Toe")
            .addFields(
                {
                    name: ":x: ",
                    value: "**"+player1.username+"**",
                    inline: true,
                },
                {
                    name: ":green_circle:",
                    value: player2.username,
                    inline: true,
                }
            )
            .setFooter({text:"The **bold** on in the one whose turn it is"});
            let row1 = new ActionRowBuilder();
            let row2 = new ActionRowBuilder();
            let row3 = new ActionRowBuilder();
            for(let i = 0;i<3;i++){
                row1.addComponents(new ButtonBuilder().setLabel(" ").setCustomId("row+0+"+i).setStyle(ButtonStyle.Secondary));
            }
            for(let i = 0;i<3;i++){
                row2.addComponents(new ButtonBuilder().setLabel(" ").setCustomId("row+1+"+i).setStyle(ButtonStyle.Secondary));
            }
            for(let i = 0;i<3;i++){
                row3.addComponents(new ButtonBuilder().setLabel(" ").setCustomId("row+2+"+i).setStyle(ButtonStyle.Secondary));
            }
            interaction.editReply({embeds: [playEmbed],components: [row1,row2,row3]});
            gameStarted = true;
        }
        if(i.customId.includes("row")){
            if(i.user != activePlayer){
                //false player
                let errorEmbed = new EmbedBuilder().setTitle("ERROR").setDescription("it isnt your turn please wait").setColor(15548997);
                await i.user.send({embeds: [errorEmbed]});
                return;
            }
            //then we have clicked a button
            row = i.customId.split("+")[1];
            pos = i.customId.split("+")[2];
            console.log(row +"+"+pos);
            let input;
            if(activePlayer == player1){
                input = "1";
            }
            else{
                input = "2";
            }
            gameBoard[row][pos] = input;
            //play embed
            let playEmbed =new EmbedBuilder().setColor(15105570).setTitle("Tic-Tac-Toe").setFooter({text:"The **bold** on in the one whose turn it is"});
            if(activePlayer == player1){
                activePlayer = player2;
                playEmbed.addFields({name: ":x: ",value: ""+player1.username+"",inline: true,},{name: ":green_circle:",value: "**"+player2.username+"**",inline: true,})
            }
            else{
                activePlayer = player1;
                playEmbed.addFields({name: ":x: ",value: "**"+player1.username+"**",inline: true,},{name: ":green_circle:",value: player2.username,inline: true,})
            }
            //biuld action bar
            let buttons = [];
            for (let i = 0; i < gameBoard.length; i++) {
                let row = new ActionRowBuilder();
                for (let j = 0; j < gameBoard[i].length; j++) {
                    if(gameBoard[i][j]=="none"){
                        row.addComponents(new ButtonBuilder().setLabel(" ").setCustomId("row+"+i+"+"+j).setStyle(ButtonStyle.Secondary));
                    }else if(gameBoard[i][j]=="1"){
                        row.addComponents(new ButtonBuilder().setLabel("X").setCustomId("row+"+i+"+"+j).setStyle(ButtonStyle.Danger));
                    }
                    else{
                        row.addComponents(new ButtonBuilder().setLabel("O").setCustomId("row+"+i+"+"+j).setStyle(ButtonStyle.Success));
                    }
                }
                buttons.push(row);                
            }
            i.update({embeds: [playEmbed],components: buttons});
        }
    })
    collector.on('end', collected => console.log(`Collected ${collected.size} items`));
}