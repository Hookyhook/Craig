const { REST, Routes, Embed, EmbedBuilder, channelLink, ReactionUserManager } = require('discord.js');
const process = require('node:process');
const meme = require("./meme.js")
const pi = require("./pi.js")
const message = require("./messages.js")
const commands = [
  {
    name: "meme",
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
  if(message.content.startsWith("$")){
    console.log(`a message was created(/)`);
    if(message.content.startsWith("$pi")){
     pi.pi(message);     
    }
  }else{
    
  }
  //update message count
  message.messageUpdate(message);

})

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

  if(interaction.commandName === "meme"){
    await meme.meme(client,interaction);
  }


}) 
client.login("token");
