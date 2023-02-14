// TODO:
    //optimization and refractoring

const { REST, Routes, Embed, EmbedBuilder, channelLink, ReactionUserManager, InteractionCollector, ApplicationCommandOptionType, moveElementInArray, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, } = require('discord.js');
const db = require('./db');
const { balance } = require('./money');
exports.tictactoe = async (interaction) => {
    let player1 = interaction.user;
    let gameFinisched = false
    let player2;
    let activePlayer = player1;
    let gameStarted = false;
    let errorEmbed = new EmbedBuilder().setTitle("ERROR").setColor(15548997);
    let balance1 = await db.query("SELECT balance FROM money WHERE userid = ?", [player1.id]);
    console.log(balance1)
    if(balance1.rows.length === 0){
        errorEmbed.setDescription("You have never worked, please join the system by running /work");
        interaction.reply({embeds:[errorEmbed]});
        return
    }
    balance1 = balance1.rows[0].balance;
    // check money
    if (balance1 <= interaction.options.get("bet").value) {
        errorEmbed.setDescription(player1.username + "`s Balance is to low");
        interaction.reply({ embeds: [errorEmbed] });
        return;
    }
    let startEmbed = new EmbedBuilder()
        .setColor(3447003)
        .setTitle("Tic-Tac-Toe")
        .setDescription("from " + interaction.user.username)
        .setFields({ name: "Bet Amount", value: interaction.options.get("bet").value + "$" });
    let startButtons = new ActionRowBuilder().addComponents(
        new ButtonBuilder().setLabel("JOIN").setCustomId("join").setStyle(ButtonStyle.Success)
    )
    interaction.reply({ embeds: [startEmbed], components: [startButtons] });
    let gameBoard = [["none", "none", "none"],
    ["none", "none", "none"],
    ["none", "none", "none"]
    ];
    const collector = interaction.channel.createMessageComponentCollector();
    // check interactivity
    let startTime = Date.now();
    function checkTime() {
        if(gameFinisched){
            return;
        }
        if (Date.now() - startTime >= 60000) {
          startTime = Date.now();
          let timeOutEmbed = new EmbedBuilder().setTitle("Closed").setDescription("This game was closed do to inactivity");
          interaction.editReply({embeds: [timeOutEmbed], components:[]});
          return;

        }
        else{
            setTimeout(checkTime, 1000);
        }
      }
      checkTime();

    collector.on("collect", async i => {
        startTime = Date.now();
        if (i.message.interaction.id !== interaction.id) {
            return
        }
        if (i.user.id === interaction.user.id && !gameStarted) {
            //cant join your own game
            errorEmbed = new EmbedBuilder().setTitle("ERROR").setDescription("you cant join you own game");
            interaction.editReply({ embeds: [errorEmbed], components: [] });
            collector.stop();
            return;
        }
        //turn game on and start board
        if (!gameStarted) {
            player2 = i.user;
            let balance2 = await db.query("SELECT balance FROM money WHERE userid = ?", [player2.id]);
           
            if(balance2.rows.length === 0){
                errorEmbed.setDescription(i.user.username + " has not worked! Work once to acces these games").setColor(15548997);
                interaction.editReply({embeds: [errorEmbed],components: []});
                return
            }
            balance2 = balance2.rows[0].balance;
            
            if (balance2 <= interaction.options.get("bet").value) {
                errorEmbed.setDescription(player2.username + "`s Balance is to low");
                interaction.editReply({ embeds: [errorEmbed], components: [] });
                return;
            }
            let playEmbed = new EmbedBuilder()
                .setColor(3447003)
                .setTitle("Tic-Tac-Toe")
                .addFields(
                    {
                        name: ":x: ",
                        value: "**" + player1.username + "**",
                        inline: true,
                    },
                    {
                        name: ":green_circle:",
                        value: player2.username,
                        inline: true,
                    }
                )
                .setFooter({ text: "The **bold** on in the one whose turn it is" });
            let row1 = new ActionRowBuilder();
            let row2 = new ActionRowBuilder();
            let row3 = new ActionRowBuilder();
            for (let i = 0; i < 3; i++) {
                row1.addComponents(new ButtonBuilder().setLabel(".").setCustomId("row+0+" + i).setStyle(ButtonStyle.Secondary));
            }
            for (let i = 0; i < 3; i++) {
                row2.addComponents(new ButtonBuilder().setLabel(".").setCustomId("row+1+" + i).setStyle(ButtonStyle.Secondary));
            }
            for (let i = 0; i < 3; i++) {
                row3.addComponents(new ButtonBuilder().setLabel(".").setCustomId("row+2+" + i).setStyle(ButtonStyle.Secondary));
            }
            console.log(row3);
            interaction.editReply({embeds: [playEmbed], components: [row1, row2, row3] });
            gameStarted = true;
        }
        if (i.customId.includes("row")) {
            if (i.user != activePlayer) {
                //false player
                let errorEmbed = new EmbedBuilder().setTitle("ERROR").setDescription("it isnt your turn please wait").setColor(15548997);
                await i.user.send({ embeds: [errorEmbed] });
                return;
            }
            //then we have clicked a button
            row = i.customId.split("+")[1];
            pos = i.customId.split("+")[2];
            console.log(row + "+" + pos);
            let input;
            if (activePlayer == player1) {
                input = "1";
            }
            else {
                input = "2";
            }
            gameBoard[row][pos] = input;
            //check game board
            //check column
            console.log(gameBoard);
            for (let i = 0; i < 3; i++) {
                console.log(gameBoard[i]);
                if (gameBoard[i][0] == gameBoard[i][1] && gameBoard[i][0] == gameBoard[i][2] && gameBoard[i][1] == gameBoard[i][2]) {
                    if (gameBoard[i][0] != "none") {
                        if (gameBoard[i][0] == 1) {
                            interaction.editReply(player1.username + " wins ! COLUMN");
                            let balance2 = await db.query("SELECT balance FROM money WHERE userid = ?", [player2.id]);
                            balance2 = balance2.rows[0].balance;
                            await win(player1, player2, 1, interaction, gameBoard, balance1, balance2);
                            gameFinisched = true;
                            return
                        }
                        else {
                            interaction.editReply(player1.username + " wins ! COLUMN");
                            let balance2 = await db.query("SELECT balance FROM money WHERE userid = ?", [player2.id]);
                            balance2 = balance2.rows[0].balance;
                            await win(player1, player2, 2, interaction, gameBoard, balance1, balance2);
                            gameFinisched = true;
                            return
                        }
                    }
                }
            }
            //check rows
            for (let i = 0; i < 3; i++) {
                console.log(gameBoard[i]);
                if (gameBoard[0][i] == gameBoard[1][i] && gameBoard[0][i] == gameBoard[2][i] && gameBoard[1][i] == gameBoard[2][i]) {
                    if (gameBoard[0][i] != "none") {
                        if (gameBoard[0][i] == 1) {
                            interaction.editReply(player1.username + " wins ! COLUMN");
                            let balance2 = await db.query("SELECT balance FROM money WHERE userid = ?", [player2.id]);
                            balance2 = balance2.rows[0].balance;
                            await win(player1, player2, 1, interaction, gameBoard, balance1, balance2);
                            gameFinisched = true;
                            return
                        }
                        else {
                            interaction.editReply(player1.username + " wins ! COLUMN");
                            let balance2 = await db.query("SELECT balance FROM money WHERE userid = ?", [player2.id]);
                            balance2 = balance2.rows[0].balance;
                            await win(player1, player2, 2, interaction, gameBoard, balance1, balance2);
                            gameFinisched = true;
                            return
                        }
                    }
                }
            }
            //check normal diagonal
            if (gameBoard[0][0] == gameBoard[1][1] && gameBoard[2][2] == gameBoard[1][1] && gameBoard[0][0] == gameBoard[2][2]) {
                if (gameBoard[0][0] !== "none") {
                    if (gameBoard[0][0] == 1) {
                        interaction.editReply(player1.username + " wins ! Diagonal");
                        let balance2 = await db.query("SELECT balance FROM money WHERE userid = ?", [player2.id]);
                        balance2 = balance2.rows[0].balance;
                        await win(player1, player2, 1, interaction, gameBoard, balance1, balance2);
                        gameFinisched = true;
                        return;
                    }
                    else {
                        interaction.editReply(player2.username + " wins ! Diagonal");
                        let balance2 = await db.query("SELECT balance FROM money WHERE userid = ?", [player2.id]);
                        balance2 = balance2.rows[0].balance;
                        await win(player1, player2, 2, interaction, gameBoard, balance1, balance2);
                        gameFinisched = true;
                        return
                    }
                }

            }
            //check anti diagonal

            if (gameBoard[0][2] == gameBoard[1][1] && gameBoard[0][2] == gameBoard[2][0] && gameBoard[1][1] == gameBoard[2][0]) {
                if (gameBoard[0][2] !== "none") {
                    if (gameBoard[1][1] == 1) {
                        interaction.editReply(player1.username + " wins ! Anti Diagonal");
                        let balance2 = await db.query("SELECT balance FROM money WHERE userid = ?", [player2.id]);
                        balance2 = balance2.rows[0].balance;
                        await win(player1, player2, 1, interaction, gameBoard, balance1, balance2);
                        gameFinisched = true;
                        return;
                    }
                    else {
                        interaction.editReply(player2.username + " wins ! Diagonal");
                        let balance2 = await db.query("SELECT balance FROM money WHERE userid = ?", [player2.id]);
                        balance2 = balance2.rows[0].balance;
                        await win(player1, player2, 2, interaction, gameBoard, balance1, balance2);
                        gameFinisched = true;
                        return
                    }
                }
            }
            //all boxes pos
            if (!gameBoard.some(row => row.includes("none"))) {
                let balance2 = await db.query("SELECT balance FROM money WHERE userid = ?", [player2.id]);
                balance2 = balance2.rows[0].balance;
                await win(player1, player2, 0, interaction, gameBoard, balance1, balance2);
                gameFinisched = true;
                collector.stop();
                return
            }

            //play embed
            let playEmbed = new EmbedBuilder().setColor(3447003).setTitle("Tic-Tac-Toe").setFooter({ text: "The **bold** on in the one whose turn it is" });
            if (activePlayer == player1) {
                activePlayer = player2;
                playEmbed.addFields({ name: ":x: ", value: "" + player1.username + "", inline: true, }, { name: ":green_circle:", value: "**" + player2.username + "**", inline: true, })
            }
            else {
                activePlayer = player1;
                playEmbed.addFields({ name: ":x: ", value: "**" + player1.username + "**", inline: true, }, { name: ":green_circle:", value: player2.username, inline: true, })
            }
            //biuld action bar
            let buttons = [];
            for (let i = 0; i < gameBoard.length; i++) {
                let row = new ActionRowBuilder();
                for (let j = 0; j < gameBoard[i].length; j++) {
                    if (gameBoard[i][j] == "none") {
                        row.addComponents(new ButtonBuilder().setLabel(".").setCustomId("row+" + i + "+" + j).setStyle(ButtonStyle.Secondary));
                    } else if (gameBoard[i][j] == "1") {
                        row.addComponents(new ButtonBuilder().setLabel("X").setCustomId("row+" + i + "+" + j).setStyle(ButtonStyle.Danger).setDisabled(true));
                    }
                    else {
                        row.addComponents(new ButtonBuilder().setLabel("O").setCustomId("row+" + i + "+" + j).setStyle(ButtonStyle.Success).setDisabled(true));
                    }
                }
                buttons.push(row);
            }
            i.update({ embeds: [playEmbed], components: buttons });
        }
    })
    collector.on('end', collected => console.log(`Collected ${collected.size} items`));
}
async function win(player1, player2, status, interaction, gameBoard, balance1, balance2) {
    resultEmbed = new EmbedBuilder();
    if (status == "0") {
        resultEmbed.setTitle("DRAW");
        resultEmbed.setColor(3447003)
    } else if (status == 1) {
        resultEmbed.setTitle(`**${player1.username}** WON!`);
    }
    else {
        resultEmbed.setTitle(`**${player2.username}** WON!`);
    }
    let gamePos = "";
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            if (gameBoard[i][j] == "none") {
                gamePos += ":black_large_square:";
            }
            else if (gameBoard[i][j] == "1") {
                gamePos += ":x:";
            }
            else {
                gamePos += ":green_circle:";
            }
        }
        gamePos += " \n ";
    }
    console.log(gamePos);
    resultEmbed.addFields({ name: "``" + player1.username + "``: :x:", inline: true, value: "\u200B" }, { name: "``" + player2.username + "``: :green_circle:", inline: true, value: "\u200B" }, { name: "BOARD", value: gamePos });
    // balance set and show in input
    console.log(interaction.options.get("bet").value);
    if (status == "0") {
        resultEmbed.addFields({ name: "\u200B", inline: false, value: "\u200B" }, { name: "``Balance " + player1.username + ":``" + balance1, inline: true, value: "\u200B" }, { name: "``Balance " + player2.username + ":``" + balance2, inline: true, value: "\u200B" });
    } else if (status == 1) {
        var res = await db.query("UPDATE money SET balance = ?  WHERE userid = ?", [balance1 + interaction.options.get("bet").value, player1.id]);
        var res1 = await db.query("UPDATE money SET balance = ?  WHERE userid = ?", [balance2 - interaction.options.get("bet").value, player2.id]);
        resultEmbed.addFields({ name: "``Balance " + player1.username + ":``" + (balance1 + interaction.options.get("bet").value), inline: true, value: "\u200B" }, { name: "``Balance " + player2.username + ":``" + (balance2 - interaction.options.get("bet").value), inline: true, value: "\u200B" });
    }
    else {
        var res = await db.query("UPDATE money SET balance = ?  WHERE userid = ?", [balance1 - interaction.options.get("bet").value, player1.id]);
        var res1 = await db.query("UPDATE money SET balance = ?  WHERE userid = ?", [balance2 + interaction.options.get("bet").value, player2.id]);
        resultEmbed.addFields({ name: "``Balance " + player1.username + ":``" + (balance1 - interaction.options.get("bet").value), inline: true, value: "\u200B" }, { name: "``Balance " + player2.username + ":``" + (balance2 + interaction.options.get("bet").value), inline: true, value: "\u200B" });

    }
    interaction.editReply({ embeds: [resultEmbed], components: [] });


}