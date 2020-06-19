const fs = require('fs');
const Discord = require('discord.js');
const { prefix, token } = require('./config.json');

const client = new Discord.Client();
client.commands = new Discord.Collection();

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}

const cooldowns = new Discord.Collection();
//Login 
client.once('ready', () => {
    //Bot Activity
    client.user.setActivity('the Kaiser', { type: 'WATCHING' })
  .then(presence => console.log(`Activity set to ${presence.activities[0].name}`))
  .catch(console.error);
    //Status
    console.log('Ich bin jetzt online!');
})

//Messaging
client.on('message', message => {
	if(message.content.toLowerCase() === `${prefix}verif`){
		const verification = new Discord.MessageEmbed();
		verification.setColor('#2f3640')
		verification.setTitle('Reich Ministry of Manpower')
		verification.setDescription('Willkommen to Deutsch Kaiserreich,\n We first need to verify you which town you belong.')
		verification.setThumbnail('https://media.discordapp.net/attachments/723032726701211709/723032845299482715/GM_CoA.png?width=399&height=499');
		verification.addField('Verification', 'To get verify you must choose one of the towns below.\n <:Berlin:723066491011858463> - **Berlin**')
		verification.setTimestamp()
		verification.setFooter('The Kaiserreich welcomes you!,', image = 'https://media.discordapp.net/attachments/723032726701211709/723032845299482715/GM_CoA.png?width=399&height=499')

		message.channel.send({embed: verification}).then(embedMessage => {
			embedMessage.react("723066491011858463")
		})
	}	
});

//Command Handler
client.on('message', message => {
	if (!message.content.startsWith(prefix) || message.author.bot) return;

	const args = message.content.slice(prefix.length).split(/ +/);
	const commandName = args.shift().toLowerCase();

	const command = client.commands.get(commandName)
		|| client.commands.find(cmd => cmd.aliases && cmd.aliases.includes(commandName));

	if (!command) return;

	if (command.guildOnly && message.channel.type !== 'text') {
		return message.reply('I can\'t execute that command inside DMs!');
	}

	if (command.args && !args.length) {
		let reply = `You didn't provide any arguments, ${message.author}!`;

		if (command.usage) {
			reply += `\nThe proper usage would be: \`${prefix}${command.name} ${command.usage}\``;
		}

		return message.channel.send(reply);
	}

	if (!cooldowns.has(command.name)) {
		cooldowns.set(command.name, new Discord.Collection());
	}

	const now = Date.now();
	const timestamps = cooldowns.get(command.name);
	const cooldownAmount = (command.cooldown || 3) * 1000;

	if (timestamps.has(message.author.id)) {
		const expirationTime = timestamps.get(message.author.id) + cooldownAmount;

		if (now < expirationTime) {
			const timeLeft = (expirationTime - now) / 1000;
			return message.reply(`please wait ${timeLeft.toFixed(1)} more second(s) before reusing the \`${command.name}\` command.`);
		}
	}

	timestamps.set(message.author.id, now);
	setTimeout(() => timestamps.delete(message.author.id), cooldownAmount);

	try {
		command.execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
});

client.login(token);