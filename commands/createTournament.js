const { MessageActionRow, MessageButton } = require('discord.js');
const db = require('../events/db.js');

module.exports = {
    name: 'createtournament',
    description: 'Create a new tournament and specify the channel for the registration message',
    execute(message, args, client) {
        const [name, date, type, channelId] = args;
        const channel = client.channels.cache.get(channelId) || client.channels.cache.find(c => c.name === channelId);

        if (!channel) {
            return message.reply("Invalid channel specified.");
        }

        const query = 'INSERT INTO Tournaments (Name, Date, Type) VALUES (?, ?, ?)';

        db.query(query, [name, date, type], (err, result) => {
            if (err) {
                console.error(err);
                return message.channel.send('An error occurred while creating the tournament.');
            }

            const tournamentId = result.insertId;
            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId(`register-${tournamentId}`)
                        .setLabel('Participate')
                        .setStyle('SUCCESS'),
                );

            channel.send({
                content: `Tournament **${name}** is created! Click below to register.`,
                components: [row]
            });

            message.reply(`Tournament created and registration message sent to ${channel.name}`);
        });
    },
};