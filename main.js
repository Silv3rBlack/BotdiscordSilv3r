const Discord = require('discord.js');
const YoutubeStream = require('youtube-audio-stream');
const low = require('lowdb');
const FileSync = require('lowdb/adapters/FileSync');
const ms = require("ms");

const adapter = new FileSync('database.json');
const db = low(adapter);


db.defaults({blague : [], xp: []})
    .write();

var bot = new Discord.Client();
var prefix = ("/");
var randnum = 0;
var storynumber = db.get('blague').size().value();

bot.login(process.env.TOKEN)

bot.on('ready', () => {
    bot.user.setPresence({ game: { name: '/help [Full commands]', type: 0}});
    console.log('Bot Ready !');
});

bot.on("guildMemberAdd", member => {
    member.guild.channels.find("name", "welcome-bye").send(`**Soit le bienvenue ${member} !\nN'oublie pas de lire les régles à ton arrivée** :wink: `)
})

bot.on("guildMemberRemove", member => {
    member.guild.channels.find("name", "welcome-bye").send(`**${member} viens de nous quitter :sob:**`)
})
    
bot.on("guildMemberAdd" , member => {
    var role = member.guild.roles.find('name', 'Membres');
    member.addRole(role);
})

bot.on('message', message => {
    
    var msgauthor = message.author.tag;
     

    if(message.author.bot)return

    if(!db.get("xp").find({user: msgauthor}).value()){
        db.get("xp").push({user: msgauthor, xp: 1}).write();
    }else{
        var userxpdb = db.get("xp").filter({user: msgauthor}).find("xp").value();
        console.log(userxpdb);
        var userxp = Object.values(userxpdb)
        console.log(userxp);
        console.log(`Nombre d'xp : ${userxp[1]}`);

        db.get("xp").find({user: msgauthor}).assign({user: msgauthor, xp: userxp[1] += 1}).write();
        
    }
  
    if (message.content === bot.user.name){
        message.reply("Hello");
        console.log('salut Hello');

    }

    if (!message.content.startsWith(prefix)) return
    var args = message.content.substring(prefix.length).split(" ");

    switch (args[0].toLowerCase()){

        case "newblague":
        var value = message.content.substr(10);
        var author = message.author.toString();
        var number = db.get('blague').map('id').value();
        console.log(value);
        message.reply("Ajout de la blague à la base de données")
       
        db.get('blague')
            .push({story_value: value, story_author: author})
            .write()
        break;

        case "blague" :

        story_random()
        console.log(randnum)

        var story = db.get(`blague[${randnum}].story_value`).toString().value();
        var author_story = db.get(`blague[${randnum}].story_author`).toString().value();
        console.log(story)

        message.channel.send(`${story}`)
    
    break;

    case "ping" :
    message.channel.send('**Temps de latence avec le serveur :hourglass:** `' + `${message.createdTimestamp - Date.now()}` + ' ms`')
    console.log("Commande ping demandée !");
    
    break;

    case "clear" :
    
    let modMess = message.guild.roles.find("name", "😈 Admin");
        if(!message.member.roles.has(modMess.id))
            return message.reply("**Tu n'as pas la permission de faire cette commande :warning: !**").catch(console.error);
    if(message.member.hasPermission("MANAGE_MESSAGES")){
        message.channel.fetchMessages()
        .then(function(list) {
            message.channel.bulkDelete(list)
        }, function(err){message.channel.send("Erreur")})}
    
        break;

        case "mute" :
        
        let modRole = message.guild.roles.find("name", "😈 Admin");
        if(!message.member.roles.has(modRole.id))
            return message.reply("**Tu n'as pas la permission de faire cette commande :warning: !**").catch(console.error);
            
  
        let member = message.mentions.members.first();
        if(!member) return message.reply('**Merci de mentionner la personne à Mute !**');
        let muteRole = message.guild.roles.find("name", "Muted");
        if(!muteRole) return message.reply("**Aucun rôle Muted de créer !**");
        let params = message.content.split(" ").slice(1);
        let time = params[1];
        if(!time) return message.reply("**tu dois préciser le temps de mute !**");

        member.addRole(muteRole.id);
        message.channel.send(`**${member.user.tag} à bien été mute pour ${ms(ms(time), {long: true})} !** :mute:`);

        setTimeout(function() {
            member.removeRole(muteRole.id);
            message.channel.send(`**Le mute de ${member.user.tag} d'une durée de : ${ms(ms(time), {long: true})} est maintenant terminé !** :loud_sound:`);
        },ms(time));
      
        break;

      
    
        }

     if (message.content === prefix + "help"){
        var help_embed = new Discord.RichEmbed()
           
            .setColor('#FE0101')
            .addField("Silv3rBot","**v1.0**")
            .setDescription("**_Bot développé par Silv3rBlack_**")
            .addField(":computer: Commandes du bot !", ":small_orange_diamond: **/help :** Affiche les commandes du Bot\n:small_orange_diamond: **/info :** Infos sur le bot et le serveur\n:small_orange_diamond: **/stats :** Affiche vos stats\n:small_orange_diamond: **/dés :** Lance les dés\n:small_orange_diamond: **/blague :** Raconte une connerie")
            .addField(":headphones: Musique !", ":small_blue_diamond: **/play + url :** Lance la piste**\n:small_blue_diamond: /pause :** Met en pause la piste\n:small_blue_diamond: **/skip :** Passe à la piste suivante\n:small_blue_diamond: **/clearq :** vide la file d'attente\n:small_blue_diamond: **/ping :** Effectue un ping du serveur")
            .addField(":closed_lock_with_key: Administration !",":small_red_triangle: **/kick + @pseudo :** Kick l'utilisateur mentionné\n:small_red_triangle: **/ban + @pseudo :** Ban l'utilisateur mentionné\n:small_red_triangle: **/clear + (nombres de messages) :** Clear du nombre de messages defini\n:small_red_triangle: **/mute + @pseudo + 10m :** Mute l'utilisateur pour la durée définie")
            .setFooter("Bot en cours de développement V1.0 !")
        message.author.send(help_embed);
        console.log("Commande Help demandée !");
        message.reply("**je viens de t'envoyer la liste des commandes en MP !** :incoming_envelope: ");
     
    }
    
    if (message.content === "/dés"){
        random();
    
        if (randnum == 1){
            message.reply("**lance les dés et fait un score de :one: !**");
            console.log(randnum);
        }

        if (randnum == 2){ 
            message.reply("**lance les dés et fait un score de :two: !**");
            console.log(randnum);
        }

        if (randnum == 3){
            message.reply("**lance les dés et fait un score de :three: !**");
            console.log(randnum);
        }

        if (randnum == 4){
            message.reply("**lance les dés et fait un score de :four: !**");
            console.log(randnum);
        }

        if (randnum == 5){
            message.reply("**lance les dés et fait un score de :five: !**");
            console.log(randnum);
        }

        if (randnum == 6){
            message.reply("**lance les dés et fait un score de :six: !**");
            console.log(randnum);
        }

        if (randnum == 7){
            message.reply("**lance les dés et fait un score de :seven: !**");
            console.log(randnum);
        }

        if (randnum == 8){
            message.reply("**lance les dés et fait un score de :eight: !**");
            console.log(randnum);
        }

        if (randnum == 9){
            message.reply("**lance les dés et fait un score de :nine: !**");
            console.log(randnum);
        }

        if (randnum == 10){
            message.reply("**lance les dés et fait un score de :keycap_ten: !**");
            console.log(randnum);
        }

            
    }


    if (message.content === prefix + "stats"){
        var xp = db.get("xp").filter({user: msgauthor}).find("xp").value();
        var xpfinal = Object.values(xp);
        var xp_embed = new Discord.RichEmbed()
            .setTitle(`**Stats de ${message.author.tag}**`)
            .setColor('#BCE906')
            .setDescription("**Voici ton level et des bonbons** ! :candy:")
            .addField("**Level :**", `:arrow_right: ${xpfinal[1]}`)
            .addField("**Tu as rejoins ce serveur le :**", `:arrow_right: ${message.member.joinedAt}` )
            .setThumbnail(message.author.displayAvatarURL)          
            message.channel.send({embed: xp_embed});
            console.log("Commande stats demandée !");
    }
    });


function story_random(min, max) {
    min = Math.ceil(0);
    max = Math.floor(storynumber);
    randnum = Math.floor(Math.random() * (max - min +1) + min);
}

function random(min, max) {
    min = Math.ceil(1);
    max = Math.floor(10);
    randnum = Math.floor(Math.random() * (max - min +1) + min);

}

bot.on('message', message => {
    let command = message.content.split("")[0];
    const args = message.content.slice(prefix.length).split(/ +/);
    command = args.shift().toLowerCase();

    if (command === "kick") {
        let modRole = message.guild.roles.find("name", "😈 Admin");
        if(!message.member.roles.has(modRole.id)){
            return message.reply("**Tu n'as pas la permission de faire cette commande :warning:\nLe Kick / Ban est réservé aux Administrateurs !**").catch(console.error);
        }
        if(message.mentions.users.size === 0) {
            return message.reply("**Merci de mentionner l'utilisateur à expulser.**").catch(console.error);
        }
        let kickMember = message.guild.member(message.mentions.users.first());
        if(!kickMember) {
            return message.reply("**Cet utilisateur est introuvable ou impossible à expulser.**").catch(console.error);
        }
        if(!message.guild.member(bot.user).hasPermission("KICK_MEMBERS")) {
            return message.reply("**Je n'ai pas la permission KICK_MEMBERS pour faire ceci.**").catch(console.error);
        }
        kickMember.kick().then(member => {
            message.reply(`**${member.user.username} a été expulsé avec succès !**`).catch(console.error);
        
             
        }).catch(console.error);
        
    }

    if (command === "ban") {
        let modRole = message.guild.roles.find("name", "😈 Admin");
        if(!message.member.roles.has(modRole.id)){
            return message.reply("**Tu n'as pas la permission de faire cette commande :warning:\nLe Kick / Ban est réservé aux Administrateurs !**").catch(console.error);
        }
        if(message.mentions.users.size === 0) {
            return message.reply("**Merci de mentionner l'utilisateur à bannir.**").catch(console.error);
        }
        let banMember = message.guild.member(message.mentions.users.first());
        if(!banMember) {
            return message.reply("**Cet utilisateur est introuvable ou impossible à bannir.**").catch(console.error);
        }
        if(!message.guild.member(bot.user).hasPermission("BAN_MEMBERS")) {
            return message.reply("**Je n'ai pas la permission BAN_MEMBERS pour faire ceci.**").catch(console.error);
        }
        banMember.ban().then(member => {
            message.reply(`**${member.user.username} a été banni avec succès !**`).catch(console.error);
            
             
        }).catch(console.error);
    }
        if (message.content === prefix + "info"){
            var info_embed = new Discord.RichEmbed()
                .setThumbnail(bot.user.displayAvatarURL)
                .setColor('#9285E8')
                .addField("**Nom du bot :**", bot.user.username)
                .setDescription(":grey_exclamation: **Informations Serveur / Bot**")
                .addField("**Nom du serveur :**", message.guild.name)
                .addField("**Créer le :**", message.guild.createdAt)
                .addField("**Vous avez rejoint le :**", message.member.joinedAt)
                .addField("**Total des membres :**", message.guild.memberCount)
                .setFooter("Bot en cours de développement V1.0 !")
            message.channel.send(info_embed);
            console.log("Commande Info demandée !");
     
}});
    
