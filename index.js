const { REST, Routes, Embed, EmbedBuilder, channelLink, ReactionUserManager } = require('discord.js');
const process = require('node:process');
const meme = require("./meme.js")
const pi = require("./pi.js")
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

client.on('ready', () => {
  console.log(`Logged in as ${client.user.tag}!`);
  const channel = client.channels.cache.get('1049677949881811005');
  console.log("bot status channel: "+channel);
  channel.send(":green_square:  ON  :green_square:");
  
});
process.on('exit', (code) => {
  console.log('Process exit event with code: ', code);
  const channel = client.channels.cache.get('1049677949881811005');
  console.log("bot status channel: "+channel);
  channel.send(":red_square:  OFF  :red_square:");
});


client.on("messageCreate", (message) =>{
  if (message.author.bot){return}

  if(message.content.startsWith("$")){
    console.log(`a message was created(/)`);
    //help----------------------------------------------------
    if(message.content == "$help" ){
      message.channel.send({"embeds":[
        {
          "type": "rich",
          "title": "List of Commmands",
          "description": "",
          "color": 15548997,
          "fields": [
            {
              "name": "$lauterbach",
              "value": "shows the man himself"
            },
            {
              "name":"$help",
              "value": "shows a list of commands"
            },
            {
              "name":"$lautergame",
              "value":`
                      Starts a game and you have to type what you see:
            -Lauterbach : lauterbach
            -Hr.Ulshöfer : ulsi
            -POTUS: biden
            `
            },
            {
              "name":"/meme",
              "value": "shows a random meme related to IT from reddit"
            }
          ]
        }
      ]}); 
    }else if(message.content == "$lauterbach"){
      message.channel.send({
        "embeds": [
          {
            "type": "rich",
            "title": "Lauterbach",
            "description": "THE MAN HIMSELF",
            "color": 0x5aff07,
            "image": {
              "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/73/MJK_67610_Karl_Lauterbach_%28Bundestag_2020%29.jpg/330px-MJK_67610_Karl_Lauterbach_%28Bundestag_2020%29.jpg",
              "height": 100,
              "width": 100
            },
            "footer": {
              "text": "FULL NAME:Karl Wilhelm Lauterbach \nAGE: 59 Jahre" 
            }
          }
        ]
      })
    }else if(message.content == "$lautergame"){
      console.log("started lautergame")
    }else if(message.content.startsWith("$pi")){
     pi.pi(message);     
    }else{
     
      //message not knows-------
      message.channel.send({
        "embeds": [
          {
            "type": "rich",
            "title": "Unknown Command",
            "description": "This commad is not know",
            "color": 15548997,
            "fields": [
              {
                "name": "Help",
                "value": 'to see a list of commands please type "$help"'
              }
            ],
            "image": {
              "url": "https://upload.wikimedia.org/wikipedia/commons/thumb/4/46/Confused.svg/2048px-Confused.svg.png",
              "height": 100,
              "width": 100
            }
          }
        ]
        });
    }
  }else{
    console.log("not my message(/)")
}})

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

  if(interaction.commandName === "meme"){
    await meme.meme(client,interaction);
  }


}) 
client.login("token hier");
