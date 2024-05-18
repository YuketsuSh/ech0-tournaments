const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../events/db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('viewleaderboard')
        .setDescription('View leaderboard of a tournament')
        .addIntegerOption(option =>
            option.setName('id')
                .setDescription('The ID of the tournament')
                .setRequired(true)),
    async execute(interaction) {
        const tournamentId = interaction.options.getInteger('id');

        db.query('SELECT * FROM Leaderboard WHERE TournamentID = ? ORDER BY Position ASC', [tournamentId], (err, results) => {
            if (err) {
                console.error('Error fetching leaderboard from database:', err);
                return interaction.reply({ content: 'An error occurred while fetching the leaderboard.', ephemeral: true });
            }

            if (results.length === 0) {
                return interaction.reply({ content: 'No leaderboard found for this tournament.', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle('Tournament Leaderboard')
                .setDescription(`Leaderboard for Tournament ID: ${tournamentId}`)
                .setColor(0xFFD700)
                .setTimestamp();

            results.forEach(leader => {
                embed.addFields(
                    { name: 'Position', value: leader.Position.toString(), inline: true },
                    { name: 'Clan Tag', value: leader.ClanTag, inline: true },
                    { name: 'Score', value: leader.Score.toString(), inline: true },
                );
            });

            interaction.reply({ embeds: [embed], ephemeral: true });
        });
    },
};
