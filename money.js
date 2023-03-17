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
            "INSERT INTO money (userid, balance, lastworked,bankbalance, injailtill) VALUES ( ? , ? , ?, ?, ?)",
            [interaction.user.id, 0, 0,0,0]
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
        interaction.reply("Worked! You Got: " + (Wage));
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
    
    if (interaction.options.get("bet").value <= 0) {
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
                { name: "Problem", value: `You dont have enough money on hand!` },
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
    const res = await db.query("SELECT balance,bankbalance FROM money WHERE userid = ?",[interaction.options.get("user").value]);
    console.log(res);
    if(res.rows.length === 0){
        let embed = new EmbedBuilder()
            .setColor(15548997)
            .setTitle("ERROR")
            .addFields({
                name: "Problem",
                value: `THis person has never worked`,
            });
        return await interaction.reply({embeds: [embed]});
    }
    let balance = res.rows[0].balance;
    let bank = res.rows[0].bankbalance;
    let level = getLevel(balance + bank);
    //levels
    let bar = "";
    for (let index = 0; index < level[3]; index++) {
        bar += " :blue_square:";
    }
    for (let index = 0; index < 10-level[3]; index++) {
        bar += " :black_large_square:";
        
    }
    console.log( "**BANK** ```"+ bank + "```  ***ON HAND ```" + balance + "```");
    await interaction.reply(
        {
            "embeds": [
                {
                    "title": "__" + (balance + bank) +"$__",
                    "description": "**BANK:** ``"+ bank + "``   **ON HAND:  ** ``" + balance + "``",
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
    console.log(time)

    if(time.rows.length === 0){
        return;
    }
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

exports.leaderboard = async (interaction,rest) => {
    interaction.deferReply();
    let dbres = await db.query("SELECT (balance + money.bankbalance) AS total,CAST(userid as VARCHAR(100)) AS userid FROM money ",[]);
    // format dbres
    dbres = dbres.rows;
    for (let i = 0; i < dbres.length; i++) {
        const element = dbres[i];
        //check if they have items
        element.items = "\u200b";
        element.allMoney = element.total
        let dbitems = await db.query("SELECT items.emogi, items.price FROM inventory INNER JOIN items ON items.id = inventory.item WHERE userid = ?",[element.userid])
        if(dbitems.rows.length != 0){
            // has itemsitems
            dbitems.rows.forEach(async e => {
                element.items += e.emogi;
                element.allMoney += e.price;
            })
        }
        
    }
    dbres = dbres.sort((a,b) => (a.allMoney < b.allMoney) ? 1 : ((b.allMoney < a.allMoney) ? -1 : 0));
    let leaderboard = new EmbedBuilder().setTitle("Leaderboard");
    for (let i = 1; i <= 5; i++) {
        const element = dbres[i-1];
        const user = await rest.get(Routes.user(element.userid));
        leaderboard.addFields({name:"``"+i+":``**"+user.username+"**",value:String(element.total)+"$",inline:true},
        {name:"Inventory",value:String(element.items),inline:true},
        {name:"Total Value",value:String(element.allMoney),inline:true});
    }
    let buttons = new ActionRowBuilder().setComponents(new ButtonBuilder().setLabel("<--").setCustomId("back").setStyle(ButtonStyle.Success).setDisabled(true),
    new ButtonBuilder().setLabel("-->").setCustomId("next").setStyle(ButtonStyle.Success).setDisabled(false));
    let pageAmount = Math.ceil(dbres.length/5)
    let pageLocation = 1;
    await interaction.editReply({embeds:[leaderboard.setFooter({text:pageLocation+"/"+pageAmount})],components:[buttons]});

    //buttons for leaderboard next page
    
    const collector = interaction.channel.createMessageComponentCollector();

    //check time
    let startTime = Date.now();
    function checkTime() {
        if (Date.now() - startTime >= 180000) {
          startTime = Date.now();
          let timeOutEmbed = new EmbedBuilder().setTitle("Closed").setDescription("This leaderboard was closed do to inactivity,or an loading error");
          interaction.editReply({embeds: [timeOutEmbed], components:[]});
          return;

        }
        else{
            setTimeout(checkTime, 1000);
        }
      }
      checkTime();
    collector.on("collect", async i => {
        let startTime = Date.now();
        //check if right interactio 
        if (i.message.interaction.id !== interaction.id) {
            return
        }
        console.log(i.user.id +"   "+ interaction.user.id);
        //check if right user
        if(i.user.id !== interaction.user.id){
            return
        }
        if(i.customId == "next"){
            pageLocation++;
            leaderboard.setFields().setFooter({text:pageLocation+"/"+pageAmount});
            for (let i = ((pageLocation-1)*5)+1; i <= ((pageLocation)*5); i++) {
                try{
                    const element = dbres[i-1];
                const user = await rest.get(Routes.user(element.userid));
                leaderboard.addFields({name:"``"+i+":``**"+user.username+"**",value:String(element.total)+"$",inline:true},
                {name:"Inventory",value:String(element.items),inline:true},
                {name:"Total Value",value:String(element.allMoney) + "$",inline:true});
                }
                catch(err){
                    console.log(err);
                }
                
                
            }
            let backButton = new ButtonBuilder().setLabel("<--").setCustomId("back").setStyle(ButtonStyle.Success).setDisabled(false);
            let nextButton = new ButtonBuilder().setLabel("-->").setCustomId("next").setStyle(ButtonStyle.Success);
            if(pageLocation == pageAmount){
                nextButton.setDisabled(true);
            }
            i.update({embeds:[leaderboard],components:[new ActionRowBuilder().setComponents(backButton,nextButton)]});
        }
        if(i.customId == "back"){
            pageLocation--;
            leaderboard.setFields().setFooter({text:pageLocation+"/"+pageAmount});
            for (let i = ((pageLocation-1)*5)+1; i <= ((pageLocation)*5); i++) {
                try{
                    const element = dbres[i-1];
                const user = await rest.get(Routes.user(element.userid));
                leaderboard.addFields({name:"``"+i+":``**"+user.username+"**",value:String(element.total)+"$",inline:true},
                {name:"Inventory",value:String(element.items),inline:true},
                {name:"Total Value",value:String(element.allMoney) + "$",inline:true});
                }
                catch(err){
                    console.log(err);
                }
            }
            let backButton = new ButtonBuilder().setLabel("<--").setCustomId("back").setStyle(ButtonStyle.Success);
            if(pageLocation == 1){
                backButton.setDisabled(true);
            }
            let nextButton = new ButtonBuilder().setLabel("-->").setCustomId("next").setStyle(ButtonStyle.Success);
            if(pageLocation == pageAmount){
                nextButton.setDisabled(true);
            }
            i.update({embeds:[leaderboard],components:[new ActionRowBuilder().setComponents(backButton,nextButton)]});
        }
    });
}

exports.gift = async (interaction,rest) => {
    let err = new EmbedBuilder().setTitle("ERROR").setColor(Colors.Red);
    const gifter = {user:interaction.user};
    const target = {user:interaction.options.get("target-user").user};
    const amount = interaction.options.get("amount").value;
    let gifterBalance = await db.query("SELECT balance FROM money WHERE userid = ?",[gifter.user.id]);
    if(gifterBalance.rows.length === 0){
        await interaction.reply({embeds:[err.setDescription("You are not registered in the Database").setFooter({text:"Use /work to register"})],ephemeral:true});
        return
    }
    gifter.balance = gifterBalance.rows[0].balance;
    let targetBalance = await db.query("SELECT balance FROM money WHERE userid = ?",[target.user.id]);
    if(targetBalance.rows.length === 0){
        await interaction.reply({embeds:[err.setDescription("The target is not in the db!").setFooter({text:"Use /work to register"})],ephemeral:true});
        return
    }
    target.balance = targetBalance.rows[0].balance;
    if(amount <= 0){
        await interaction.reply({embeds:[err.setDescription("Brooooo... Technically that would be considered Robbery")],ephemeral:ture});
        return
    }
    if(amount > gifter.balance){
        await interaction.reply({embeds:[err.setDescription("Brooooo... You dont have that much money!")],ephemeral:true});
        return
    }
    let gifterRes = new EmbedBuilder().setTitle("GIFTED").setColor(Colors.Green).addFields({name:"Gave Away:",value: "``"+amount+"$``",inline:true},
    {name:"TO:",value: "``"+target.user.username+"$``",inline:true}).setFooter({text:"He will be notifided of this. ;)"});
    let updateQuery = await db.query("UPDATE money SET balance = balance + ? WHERE userid = ?",[amount,target.user.id]);
    updateQuery = await db.query("UPDATE money SET balance = balance - ? WHERE userid = ?",[amount,gifter.user.id]);
    interaction.reply({embeds:[gifterRes],ephemeral:true});
    console.log(gifter.user);
    let targetEmbed = new EmbedBuilder().setColor(Colors.Green).setTitle("YOU WERE GIFTED").addFields({name:"Amount",value:"``"+amount+"$``"},{name:"BY",value:"``"+gifter.user.username+"``"})
    .setImage(`https://cdn.discordapp.com/avatars/${gifter.user.id}/${gifter.user.avatar}`);
    target.user.send({embeds:[targetEmbed]});
}