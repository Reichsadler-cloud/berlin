module.exports = {
	name: 'poke',
	description: 'poke',
	cooldown: 5,
	execute(message, args) {
		message.channel.send('Im alive!');
	},
};