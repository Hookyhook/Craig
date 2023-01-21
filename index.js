const { REST, Routes, Embed, EmbedBuilder, channelLink, ReactionUserManager, InteractionCollector, ApplicationCommandOptionType } = require('discord.js');
const process = require('node:process');
const meme = require("./meme.js")
const pi = require("./pi.js")
const usermessage = require("./usermessage.js")
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
  }
];

const rest = new REST({ version: '10' }).setToken("token");

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
//
process.on('exit', (code) => {
  console.log('Process exit event with code: ', code);
  const channel = client.channels.cache.get('1049677949881811005');
  console.log("bot status channel: "+channel);
  channel.send(":red_square:  OFF  :red_square:");
});

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
  interaction.user.id


}) 
client.login("token");
