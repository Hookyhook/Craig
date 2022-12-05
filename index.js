const { REST, Routes } = require('discord.js');
const meme = require("./meme.js")

const commands = [
  {
    name: 'ping',
    description: 'Replies with Pong!',
  },
  {
    name:"lauterbach",
    description:"was wohl?????"
  },{
    name: "random",
    description:"????"
  }
];

const rest = new REST({ version: '10' }).setToken("MTA0OTA0NTYyMTc2OTc2NDk4NQ.GkwrOp.h7KeSPiI3a_n4d6dXBj5QY_RLXXn_iXzMYWTyI");

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');

    await rest.put(Routes.applicationCommands("1049045621769764985"), { body: commands });

    console.log('Successfully reloaded application (/) commands.');
  } catch (error) {
    console.error(error);
  }
})();
const { Client, GatewayIntentBits } = require('discord.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

client.on('ready', () => {
  console.log("Logged in as ${client.user.tag}!");
});


client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === 'ping') {
    await interaction.reply('Pong!');
  }
  if (interaction.commandName === 'lauterbach') {
    await interaction.reply("https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/MJK_67610_Karl_Lauterbach_%28Bundestag_2020%29.jpg/330px-MJK_67610_Karl_Lauterbach_%28Bundestag_2020%29.jpg");
  }
  if(interaction.commandName === "random"){
    await interaction.reply("NO")
  }


}) 
client.login("MTA0OTA0NTYyMTc2OTc2NDk4NQ.GkwrOp.h7KeSPiI3a_n4d6dXBj5QY_RLXXn_iXzMYWTyI");