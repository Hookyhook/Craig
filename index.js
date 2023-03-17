const token = "no";
const { REST, Routes, Embed, EmbedBuilder, channelLink, SlashCommandSubcommandBuilder, SlashCommandChannelOption, SlashCommandIntegerOption, ReactionUserManager, InteractionCollector, ApplicationCommandOptionType, SlashCommandStringOption, moveElementInArray, ActionRowBuilder, ButtonBuilder, ButtonStyle, Events, roleMention, ApplicationCommandOptionWithChoicesAndAutocompleteMixin, Options, SlashCommandAssertions, SlashCommandAttachmentOption, SlashCommandBooleanOption, SlashCommandBuilder } = require('discord.js');
const meme = require("./meme.js")
const usermessage = require("./usermessage.js");
const money = require("./money.js");
const tictactoe = require("./tictactoe.js");
const rps = require("./rock-paper-scissors.js");
const help = require("./help.js");
const rob = require("./rob.js");
const db = require("./db.js");
const bank = require("./bank");
const shop = require("./shop");
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
    description: "deposit into bank",
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
  {
    name: "leaderboard",
    description: "leaderboard"
  },
  // {
  // name: "shop",
  // options: [{
  //   name: "list",
  //   description: "list of shop",
  //   type: ApplicationCommandOptionType.Subcommand
  // },
  // {
  //   name: "buy",
  //   description: "buy things from list with index",
  //   type: ApplicationCommandOptionType.Subcommand,
  //   options:[
  //     {
  //       name:"index",
  //       description:"which item you want to buy",
  //       type:ApplicationCommandOptionType.Integer,
  //       required: true,
  //     }
  //   ]
  // },
  // {
  //   name:"sell",
  //   description:"sell some item from your inventory",
  //   type:ApplicationCommandOptionType.Subcommand,
  //   options:[{
  //     name:"item",
  //     description:"which item you want to sell",
  //     type:ApplicationCommandOptionType.String,
  //     choices:[{name: "axe",value:":axe:"},{name: "car",value:":blue_car:"}],
  //   }]
  // }

  // ]
  // },
  {
    name: "inventory",
    description: "showns you all the objects you have!"
  },
  {
    name: "gift",
    description: "gift some money to someone",
    options: [
      {
        name: "amount",
        description: "how much you want to gift",
        type: ApplicationCommandOptionType.Integer,
        required: true
      },
      {
        name: "target-user",
        description: "to who you want to give the money",
        type: ApplicationCommandOptionType.User,
        required: true
      }
    ]
  }
];
let choichesInput = new SlashCommandStringOption().setName("to-sell").setDescription("which item you want to sell!").setRequired(true);

async function loadCommand(){
  let choiches = await db.query("SELECT name,emogi,id FROM items", []);
  console.log(choiches)
  choiches = choiches.rows;
  for (let i = 0; i < choiches.length; i++) {
    const e = choiches[i];
    choichesInput.addChoices({ name: e.name, value:String(e.id)},);
    console.log({ name: e.name +e.emogi, value:e.name},)
  }
  let Shopcommands = new SlashCommandBuilder()
  .setName("shop").setDescription("well a shop... To buy things")
  .addSubcommand(new SlashCommandSubcommandBuilder().
    setName("list").
    setDescription("list of everything you can buy"))
  .addSubcommand(new SlashCommandSubcommandBuilder()
    .setName("buy")
    .setDescription("buy things from list with index").
    addIntegerOption(new SlashCommandIntegerOption().
      setName("index").
      setRequired(true).
      setDescription("the index of the item you want to buy")))
  .addSubcommand(new SlashCommandSubcommandBuilder().
    setName("sell").
    setDescription("sell some items, with option and index").
    addIntegerOption(new SlashCommandIntegerOption().setRequired(true).
      setName("amount").
      setDescription("the amount you want to sell"))
      .addStringOption(choichesInput));
   commands.push(Shopcommands);
}

const rest = new REST({ version: '10' }).setToken(token);

(async () => {
  try {
    console.log('Started refreshing application (/) commands.');
    await loadCommand();
    console.log("Pushed shop commands(/)")
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
  if(message.content.includes("i am")){
    if(message.author.bot == true){return}
    let msg = message.content.split("i am");
    message.channel.send("hi "+msg[msg.length-1]+", i am dad!");
  }
})

client.on('interactionCreate', async interaction => {
  if (!interaction.isChatInputCommand()) return;

  if (interaction.commandName === "meme") {
    await meme.meme(client, interaction);
    return
  }
  if (interaction.commandName === "stats") {
    await usermessage.giveStats(interaction);
    return;
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
  if (interaction.commandName === "leaderboard") {
    await money.leaderboard(interaction, rest);
    return
  }
  if (interaction.commandName === "inventory") {
    await shop.inventory(interaction);
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
    interaction.reply({ embeds: [money.injailEmbed] });
    return;
  }
  //Shop subcommands
  if (interaction.commandName === "shop") {
    if (interaction.options._subcommand === "buy") {
      shop.buy(interaction);
      return
    }
    if (interaction.options._subcommand === "list") {
      shop.list(interaction)
      return
    }
    if (interaction.options._subcommand === "sell") {
      shop.sell(interaction)
      return
    }
  }
  if (interaction.commandName === "work") {
    await money.work(interaction);
    return
  }
  if (interaction.commandName === "coinflip") {
    await money.coinflip(interaction);
    return
  }
  if (interaction.commandName === "tictactoe") {
    tictactoe.tictactoe(interaction);
    return
  }
  if (interaction.commandName === "rps") {
    await rps.rps(interaction);
    return
  }
  if (interaction.commandName === "rob") {
    rob.rob(interaction);
    return
  }
  if (interaction.commandName === "deposit") {
    await bank.deposit(interaction);
    return
  }
  if (interaction.commandName === "withdraw") {
    await bank.withdraw(interaction);
    return
  }
  if (interaction.commandName === "gift") {
    await money.gift(interaction, rest);
    return
  }

})
//buttons

client.login(token);
