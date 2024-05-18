const { SlashCommandBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ChannelType, EmbedBuilder} = require('discord.js');
const db = require('../events/db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('createtournament')
        .setDescription('Create a new tournament')
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The name of the tournament')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('The type of the tournament')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('startdate')
                .setDescription('The start date of the tournament (YYYY-MM-DD)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('The duration of the tournament (e.g., 1d for 1 day)')
                .setRequired(true))
        .addChannelOption(option =>
            option.setName('channel')
                .setDescription('The channel where you want to announce the tournament')
                .setRequired(true)),
    async execute(interaction) {
        const name = interaction.options.getString('name');
        const type = interaction.options.getString('type');
        const startDate = interaction.options.getString('startdate');
        const duration = interaction.options.getString('duration');
        const channel = interaction.options.getChannel('channel');

        if (channel.type !== ChannelType.GuildText) {
            return interaction.reply({ content: 'Please select a TEXT CHANNEL!', ephemeral: true });
        }

        const tournament = {
            name: name,
            type: type,
            startDate: startDate,
            duration: duration,
            channel: channel.id
        };

        const createdTournament = await createTournamentInDatabase(tournament);
        if (createdTournament) {
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId(`register-${createdTournament.id}`)
                        .setLabel('Participate')
                        .setStyle(ButtonStyle.Primary)
                );

            const embeds = new EmbedBuilder()
                .setTitle(`Tournament: ${createdTournament.name}`)
                .setDescription(`**Type:** ${createdTournament.type}\n**Start Date:** ${createdTournament.startDate}\n**Duration:** ${createdTournament.duration}`)
                .setColor(0x00AE86)
                .setTimestamp();

            try {
                await channel.send({
                    embeds: [embeds],
                    components: [row]
                });

                await interaction.reply({ content: `Tournament created: ${createdTournament.name}, Type: ${createdTournament.type}, Start Date: ${createdTournament.startDate}, Duration: ${createdTournament.duration}, Channel: ${channel.name}`, ephemeral: true });
            } catch (error) {
                console.error('Error executing createTournament command:', error);
                await interaction.reply({ content: 'An error occurred while executing the command.', ephemeral: true });
            }
        } else {
            await interaction.reply('Failed to create tournament. Please try again later.');
        }
    },
};

async function createTournamentInDatabase(tournament) {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO Tournaments (Name, Type, Date, Duration, Channel) VALUES (?, ?, ?, ?, ?)';
        db.query(query, [tournament.name, tournament.type, tournament.startDate, tournament.duration, tournament.channel], (err, result) => {
            if (err) {
                console.error('Error creating tournament in database:', err);
                reject(null);
            } else {
                const createdTournament = {
                    id: result.insertId,
                    name: tournament.name,
                    type: tournament.type,
                    startDate: tournament.startDate,
                    duration: tournament.duration,
                    channel: tournament.channel
                };
                resolve(createdTournament);
            }
        });
    });
}
