const {
    REST,
    Routes,
    Embed,
    EmbedBuilder,
    channelLink,
    ReactionUserManager,
    InteractionCollector,
    ApplicationCommandOptionType,
    moveElementInArray,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Events,
    Collector,
    Collection,
    Colors
} = require("discord.js");
const db = require("./db.js");

exports.work = async (interaction) => {
    //Check if in db
    let inDb = await db.query("SELECT * FROM money WHERE userid = ?", [
        interaction.user.id,
    ]);
    if (inDb.rows.length === 0) {
        await db.query(
            "INSERT INTO money (userid, balance, lastworked) VALUES ( ? , ? , ?)",
            [interaction.user.id, 0, 0]
        );
        inDb = await db.query("SELECT * FROM money WHERE userid = ?", [
            interaction.user.id,
        ]);
    }
    //work
    if (inDb.rows[0].lastworked < Date.now() - 3600000) {
        let Wage = Math.floor(Math.random() * 30 + 10);

        await db.query(
            "UPDATE money SET balance = balance + ?, lastworked = ?  WHERE userid = ?",
            [Wage, Date.now(), interaction.user.id]
        );
        interaction.reply("Worked! Your balance: " + (inDb.rows[0].balance + Wage));
    } else {
        interaction.reply(
            `geez,take a break: you can work in ${Math.floor(
                (inDb.rows[0].lastworked - Date.now() + 3600000) / 60000
            )} min and ${Math.floor(
                ((inDb.rows[0].lastworked - Date.now() + 3600000) % 60000) / 1000
            )} sec`
        );
    }
};

//coinflip

exports.coinflip = async (interaction) => {
    //check if 0
    
    if (interaction.options.get("bet").value === 0) {
        const embed = new EmbedBuilder()
            .setColor(15548997)
            .setTitle("ERROR")
            .addFields({
                name: "Problem",
                value: `Please enter a value higher than 0`,
            });
        interaction.reply({ embeds: [embed] });
        return;
    }
    let balance = await db.query("SELECT balance FROM money WHERE userid = ?", [
        interaction.user.id,
    ]);
    if (balance.rows[0].balance < interaction.options.get("bet").value) {
        const embed = new EmbedBuilder()
            .setColor(15548997)
            .setTitle("ERROR")
            .addFields(
                { name: "Problem", value: `Your balance is not that high` },
                {
                    name: "Bet",
                    value: `${interaction.options.get("bet").value}`,
                    inline: true,
                },
                { name: "Balance", value: `${balance.rows[0].balance}`, inline: true }
            );
        interaction.reply({ embeds: [embed] });
        return;
    }

    //send dission
    const embed = new EmbedBuilder()
        .setColor(0x0099ff)
        .setTitle("Coinflip")
        .addFields(
            {
                name: "Bet amount:",
                value: `${interaction.options.get("bet").value}`,
                inline: true,
            },
            {
                name: "Balance now",
                value: `${balance.rows[0].balance - interaction.options.get("bet").value
                    }`,
                inline: true,
            }
        )
        .setDescription("Please choose heads or tails");
    let actions = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("head")
            .setLabel("heads")
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId("tail")
            .setLabel("tails")
            .setStyle(ButtonStyle.Primary)
    );
    await interaction.reply({ embeds: [embed], components: [actions] });

    const collector = interaction.channel.createMessageComponentCollector();

    collector.on("collect", async i => {
        
        if(i.user.id !== interaction.user.id){
            return;
        }
        if (i.message.interaction.id !== interaction.id){
            return
        }
        //check if coorect user
        let side;
        if (Math.random() > 0.5) {
            side = "head";
        } else {
            side = "tail";
        }
        if(side !== i.customId){
            if(Math.random()>0.95){
                i.customId = side;
                console.log("changed");
            }
        }
        let ResultEmbed = new EmbedBuilder();
        if (i.customId === side) {
            ResultEmbed.setColor(5763719)
                .setTitle("YOU WON")
                .addFields(
                    { name: "result", value: `${side}s` },
                    { name: "Your Bet", value: `${i.customId}s` },

                    {
                        name: "Payout",
                        value: `+${interaction.options.get("bet").value * 2}`,
                    },
                    {
                        name: "Balance",
                        value: `${balance.rows[0].balance + interaction.options.get("bet").value}` + "$",
                    }
                );
            var res = await db.query("UPDATE money SET balance = ?  WHERE userid = ?", [balance.rows[0].balance + interaction.options.get("bet").value, interaction.user.id]);
            console.log("Win " + balance.rows[0].balance + interaction.options.get("bet").value);
            console.log(res.err);
        } else {
            console.log("lose");

            ResultEmbed.setColor(15548997);
            ResultEmbed.setTitle("YOU LOST");
            ResultEmbed.addFields(
                { name: 'result', value: `${side}s` },
                { name: 'Your Bet', value: `${i.customId}s` },
                { name: "Payout", value: `+ 0` },
                { name: 'Balance', value: `${balance.rows[0].balance - interaction.options.get("bet").value}` + "$" });
            var res = await db.query("UPDATE money SET balance = ?  WHERE userid = ?", [balance.rows[0].balance - interaction.options.get("bet").value, interaction.user.id]);
            console.log("Lose: " + (balance.rows[0].balance - interaction.options.get("bet").value));
            console.log(res.err)
        }
        await interaction.editReply({ embeds: [ResultEmbed], components: [] });
        collector.stop();
        
    });
    collector.on('end', collected => console.log(`Collected ${collected.size} items`));
}
// balance
exports.balance = async (interaction) => {
    let balance = await db.query("SELECT balance FROM money WHERE userid = ?",[interaction.options.get("user").value]);
    if(balance.rows.length === 0){
        let embed = new EmbedBuilder()
            .setColor(15548997)
            .setTitle("ERROR")
            .addFields({
                name: "Problem",
                value: `THis person has never worked`,
            });
        return await interaction.reply({embeds: [embed]});
    }
    balance = balance?.rows[0].balance;
    let level = getLevel(balance);
    //levels
    let bar = "";
    for (let index = 0; index < level[3]; index++) {
        bar += " :blue_square:";
    }
    for (let index = 0; index < 10-level[3]; index++) {
        bar += " :black_large_square:";
        
    }
    console.log(level[3]);
    console.log(bar + "bar");

    await interaction.reply(
        {
            "embeds": [
                {
                    "title": "__" + balance +"$__",
                    "description": "is the balance of <@" +interaction.options.get("user").value + ">",
                    "fields": [
                        {
                            "name": "``level:``" + level[0],
                            "value": "",
                            "inline": true
                        },
                        {
                            "name": "``next level:``"+ level[1],
                            "value": "",
                            "inline": true
                        },
                        {
                            "name": "``Money Needed:``"+level[2],
                            "value": "",
                            "inline": true
                        },
                        {
                            "name": bar,
                            "value": "",
                            "inline": false
                        }
                    ]
                }
            ]
        }
    );
    return;
}
function getLevel(d){
    const lvl = [
            {name: "brokie", max: 100},
            {name: "Karl Lauterbach", max: 1000},
            {name: "Apple Monitor Stand", max: 1200},
            {name: "Jeff Bagels", max: 10000},
            {name: "Prince Marcus", max: 100000},
            {name: "Taylor Swift", max: 500000},
            {name: "Andrew Tata", max: 1000000},
            {name: "Yi Long Ma", max: 5000000},
            {name: "John Xina", max: 10000000},
            {name: "Ina", max: 50000000}
    ];
    const m = lvl.pop();
    for (let i = 0; i < lvl.length; i++) {
        for (const [key, value] of Object.entries(lvl[i])) {
            if(key == "max" && value > d){
              console.log(lvl[i].name);
              if(lvl[i+1]?.name !== undefined){
                return [lvl[i].name, lvl[i+1].name, lvl[i].max-d, Math.floor(d/lvl[i].max*10)];
            }else{
                return [lvl[i].name, m.name, lvl[i].max-d, Math.floor(d/lvl[i].max*10)];
            }
            }
        }
    }
    return [m.name, "There is no next Level", 0, 0];
    }

    
//check if in jail
exports.injail = async (user) =>{
    let time = await db.query("SELECT injailtill FROM money WHERE userid = ?", [user.id]);
    time = time.rows[0].injailtill;
    console.log(Date.now())
    if(time > Date.now()){
        return true;
    }
    else{
        return false;
    }
}  
exports.injailEmbed = new EmbedBuilder().setTitle("YOUR in JAIL").setColor(Colors.Red);