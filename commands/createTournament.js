const { MessageActionRow, MessageButton } = require('discord.js');
const db = require('../events/db.js');

module.exports = {
    name: 'createtournament',
    description: 'Create a new tournament, specify the channel, and define the duration',
    execute(message, args, client) {
        const [name, date, type, channelId, duration] = args;
        const channel = client.channels.cache.get(channelId) || client.channels.cache.find(c => c.name === channelId);

        if (!channel) {
            return message.reply("Invalid channel specified.");
        }

        const durationValue = convertDuration(duration);
        if (!durationValue) {
            return message.reply("Invalid duration format. Please use 1d for days, 1h for hours, 1w for weeks, or 1y for years.");
        }

        const query = 'INSERT INTO Tournaments (Name, Date, Type, Duration) VALUES (?, ?, ?, ?)';

        db.query(query, [name, date, type, durationValue], (err, result) => {
            if (err) {
                console.error(err);
                return message.channel.send('An error occurred while creating the tournament.');
            }

            const row = new MessageActionRow()
                .addComponents(
                    new MessageButton()
                        .setCustomId(`register-${result.insertId}`)
                        .setLabel('Participate')
                        .setStyle('SUCCESS'),
                );

            channel.send({
                content: `Tournament **${name}** is created and will last ${duration}! Click below to register.`,
                components: [row]
            });

            message.reply(`Tournament created and registration message sent to ${channel.name}`);
        });
    },
};

function convertDuration(duration) {
    const match = duration.match(/^(\d+)(d|h|w|y)$/);
    if (!match) return null;

    const [, num, unit] = match;
    switch (unit) {
        case 'd': return `${num} day(s)`;
        case 'h': return `${num} hour(s)`;
        case 'w': return `${num} week(s)`;
        case 'y': return `${num} year(s)`;
        default: return null;
    }
}
