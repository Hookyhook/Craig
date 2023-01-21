const { REST, Routes, Embed, EmbedBuilder, channelLink, ReactionUserManager, InteractionCollector, ApplicationCommandOptionType, moveElementInArray } = require('discord.js');
const meme = require("./meme.js")
const pi = require("./pi.js")
const usermessage = require("./usermessage.js");
const money = require("./money.js");
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
  }
];

const rest = new REST({ version: '10' }).setToken("asdadada");

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
const client = new Client({ intents: [GatewayIntentBits.Guilds,GatewayIntentBits.GuildMessages,GatewayIntentBits.MessageContent] });


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
  


}) 
client.login("asdad");
