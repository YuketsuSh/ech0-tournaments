const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const db = require('../events/db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('viewregistrations')
        .setDescription('View all tournaments you are registered for'),
    async execute(interaction) {
        const userId = interaction.user.id;

        db.query('SELECT * FROM Registrations WHERE UserID = ?', [userId], (err, results) => {
            if (err) {
                console.error('Error fetching registrations from database:', err);
                return interaction.reply({ content: 'An error occurred while fetching the registrations.', ephemeral: true });
            }

            if (results.length === 0) {
                return interaction.reply({ content: 'You are not registered for any tournaments.', ephemeral: true });
            }

            const embed = new EmbedBuilder()
                .setTitle('Your Tournament Registrations')
                .setColor(0x00AE86)
                .setTimestamp();

            results.forEach(reg => {
                embed.addFields(
                    { name: 'Tournament ID', value: reg.TournamentID.toString(), inline: true },
                    { name: 'Email', value: reg.Email, inline: true },
                    { name: 'Clan Tag', value: reg.ClanTag, inline: true },
                    { name: 'Players', value: reg.Players, inline: false },
                );
            });

            interaction.reply({ embeds: [embed], ephemeral: true });
        });
    },
};
