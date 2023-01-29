const token = "not for you mate";
const { REST, Routes, Embed, EmbedBuilder, channelLink, ReactionUserManager, InteractionCollector, ApplicationCommandOptionType, moveElementInArray,ActionRowBuilder, ButtonBuilder, ButtonStyle, Events } = require('discord.js');
const meme = require("./meme.js")
const usermessage = require("./usermessage.js");
const money = require("./money.js");
const tictactoe = require("./tictactoe.js");
const rps = require("./rock-paper-scissors.js");
const commands = [
  {
    name: "meme",
    description:"????"
  },{
    name: "stats",
    description:"gives stats dor how many messages you have sent in this server",
    options: [
      {
        "name": "user",
        "description": "from which user you want the stats",
        "type": ApplicationCommandOptionType.User,
        "required": true,
        "value": "nice"
      }
    ]
  },
  {
    name: "work",
    description: "work! This gives you money! You can do it once an hour"
  },
  {
    name:"coinflip",
    description: "You can bet on head or tails. If you win you get double the bet, if not you lose all of it",
    options: [
      {
        name: "bet",
        description: "Amount you want to bet on",
        type: ApplicationCommandOptionType.Integer,
        "required": true
      }
    ]
  },
  {
    name: "tictactoe",
    description: "play tic tac toe with a friend for some bet",
    options: [
      {name: "bet",
       description: "how much money you want to bet on",
       type: ApplicationCommandOptionType.Integer,   
       "required": true
      }
    ]
  }
  ,{
    name: "rps",
    description: "play rockPaperScissors",
    options: [
      {name: "bet",
       description: "how much money you want to bet on",
       type: ApplicationCommandOptionType.Integer,   
       "required": true
      }
    ]
  },
  {
    name: "balance",
    description:"your amount of money!",
    options: [
      {
        "name": "user",
        "description": "from which user you want the balance is",
        "type": ApplicationCommandOptionType.User,
        "required": true,
      }
    ]
  }
];

const rest = new REST({ version: '10' }).setToken(token);

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
const { rockPaperScissors } = require('./rock-paper-scissors.js');
const client = new Client({ intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent]});


//messages
client.on("messageCreate", (message) =>{
  if (message.author.bot){return}
  usermessage.messageUpdate(message);
  if(message.content.startsWith("$")){
    if(message.content.startsWith("$pi")){
     pi.pi(message);     
    }
  }
  //update message count
  

})

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

  if(interaction.commandName === "meme"){
    await meme.meme(client,interaction);
  }
  if(interaction.commandName === "stats"){
    await usermessage.giveStats(interaction);
  }
  //work
  if(interaction.commandName === "work"){
    await money.work(interaction);
  }
  if(interaction.commandName === "coinflip"){
    await money.coinflip(interaction);
  }
  if(interaction.commandName === "balance"){
    await money.balance(interaction);
  }
  if(interaction.commandName === "tictactoe"){
    tictactoe.tictactoe(interaction);
  }
  if(interaction.commandName === "rps"){
    rps.rps(interaction);
  }
}) 
//buttons

client.login(token);
