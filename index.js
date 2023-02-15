const token = "no";
const { REST, Routes, Embed, EmbedBuilder, channelLink, ReactionUserManager, InteractionCollector, ApplicationCommandOptionType, moveElementInArray, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, roleMention, ApplicationCommandOptionWithChoicesAndAutocompleteMixin } = require('discord.js');
const meme = require("./meme.js")
const usermessage = require("./usermessage.js");
const money = require("./money.js");
const tictactoe = require("./tictactoe.js");
const rps = require("./rock-paper-scissors.js");
const help = require("./help.js");
const rob = require("./rob.js");
const db = require("./db.js");
const bank = require("./bank");
const commands = [
  {
    name: "meme",
    description: "????"
  }, {
    name: "stats",
    description: "gives stats dor how many messages you have sent in this server",
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
    name: "coinflip",
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
      {
        name: "bet",
        description: "how much money you want to bet on",
        type: ApplicationCommandOptionType.Integer,
        "required": true
      }
    ]
  },
  {
    name: "jail",
    description: "Check if you are in Jail, and for how long!"
  },
  {
    name: "balance",
    description: "your amount of money!",
    options: [
      {
        "name": "user",
        "description": "from which user you want the balance is",
        "type": ApplicationCommandOptionType.User,
        "required": true,
      }
    ]
  },
  {
    name: "info",
    description: "Some infos"
  },
  {
    name: "rob",
    description: "rob somebody, but watch out it could go wrong",
    options: [
      {
        name: "user",
        description: "who you want to rob",
        type: ApplicationCommandOptionType.User,
        required: true
      }
    ]
  }
  ,
  {
    name: "deposit",
    description: "doposit into bank",
    options: [
      {
        name: "amount",
        description: "how much you want to deposit",
        type: ApplicationCommandOptionType.Integer,
        required: true
      }
    ]
  },
  {
    name: "withdraw",
    description: "withdraw from bank",
    options: [
      {
        name: "amount",
        description: "how much you want to withdraw",
        type: ApplicationCommandOptionType.Integer,
        required: true
      }
    ]
  },
  {
    name: "games",
    description: "some infos to games"
  },
  {
    name: "money",
    description: "some infos to the money system"
  },
  {
    name: "others",
    description: "some infos to the others commands"
  },
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
const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });


//messages
client.on("messageCreate", async (message) => {
  usermessage.messageUpdate(message);
})

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "meme") {
    await meme.meme(client, interaction);
    return
  }
  if (interaction.commandName === "stats") {
    await usermessage.giveStats(interaction);
  }
  if (interaction.commandName === "info") {
    await help.info(interaction);
    return
  }
  if (interaction.commandName === "balance") {
    await money.balance(interaction);
    return
  }
  if (interaction.commandName === "jail") {
    await rob.jail(interaction);
    return
  }
  //help
  if (interaction.commandName === "games") {
    await help.games(interaction);
    return
  }
  if (interaction.commandName === "money") {
    await help.money(interaction);
    return
  }
  if (interaction.commandName === "others") {
    await help.others(interaction);
    return
  }
  //everything with money comes after here so we check if in jail
  if (await money.injail(interaction.user) == true) {
    console.log("in jail")
    interaction.reply({ embeds: [money.injailEmbed] });
    return;
  }
  if (interaction.commandName === "work") {
    await money.work(interaction);
  }
  if (interaction.commandName === "coinflip") {
    await money.coinflip(interaction);
  }
  if (interaction.commandName === "tictactoe") {
    tictactoe.tictactoe(interaction);
  }
  if (interaction.commandName === "rps") {
    await rps.rps(interaction);
  }
  if (interaction.commandName === "rob") {
    rob.rob(interaction);
  }
  if (interaction.commandName === "deposit") {
    await bank.deposit(interaction);
    return
  }
  if (interaction.commandName === "withdraw") {
    await bank.withdraw(interaction);
    return
  }

})
//buttons

client.login(token);
