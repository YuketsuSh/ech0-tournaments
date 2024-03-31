const { SlashCommandBuilder } = require('@discordjs/builders');
const { MessageActionRow, MessageButton } = require('discord.js');
const db = require('../../events/db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createtournament')
        .setDescription('Create a new tournament, specify the channel, and define the duration')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('Name of the tournament')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('date')
                .setDescription('Date of the tournament')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('Type of the tournament')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('Channel where the tournament will be announced')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('Duration of the tournament (e.g., 1d for 1 day)')
                .setRequired(true)),
    async execute(interaction) {
        const name = interaction.options.getString('name');
        const date = interaction.options.getString('date');
        const type = interaction.options.getString('type');
        const channelId = interaction.options.getChannel('channel').id;
        const duration = interaction.options.getString('duration');
        const channel = interaction.guild.channels.cache.get(channelId);

        if (!channel) {
            return interaction.reply("Invalid channel specified.");
        }

        const durationValue = convertDuration(duration);
        if (!durationValue) {
            return interaction.reply("Invalid duration format. Please use 1d for days, 1h for hours, 1w for weeks, or 1y for years.");
        }

        const query = 'INSERT INTO Tournaments (Name, Date, Type, Duration) VALUES (?, ?, ?, ?)';

        db.query(query, [name, date, type, durationValue], (err, result) => {
            if (err) {
                console.error(err);
                return interaction.channel.send('An error occurred while creating the tournament.');
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

            interaction.reply(`Tournament created and registration message sent to ${channel.name}`);
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
