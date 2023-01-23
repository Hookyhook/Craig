let players = [];

exports.tictactoe = (interaction) => {
    players += interaction.user.id;
    player1 = interaction.user.id;
    console.log(players);
}