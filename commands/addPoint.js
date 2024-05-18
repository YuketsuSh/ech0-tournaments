const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, StringSelectMenuOptionBuilder } = require('discord.js');
const db = require('../events/db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('addpoints')
        .setDescription('Add points to a clan')
        .addIntegerOption(option =>
            option.setName('tournamentid')
                .setDescription('The ID of the tournament')
                .setRequired(true)),
    async execute(interaction) {
        const tournamentId = interaction.options.getInteger('tournamentid');

        db.query('SELECT DISTINCT ClanTag FROM Registrations WHERE TournamentID = ?', [tournamentId], async (err, results) => {
            if (err) {
                console.error('Error fetching clans from database:', err);
                return interaction.reply({ content: 'An error occurred while fetching the clans.', ephemeral: true });
            }

            if (results.length === 0) {
                return interaction.reply({ content: 'No clans found for this tournament.', ephemeral: true });
            }

            const selectMenu = new StringSelectMenuBuilder()
                .setCustomId('select-clan')
                .setPlaceholder('Select a clan to add points')
                .addOptions(results.map(clan =>
                    new StringSelectMenuOptionBuilder()
                        .setLabel(clan.ClanTag)
                        .setValue(clan.ClanTag)
                ));

            const row = new ActionRowBuilder().addComponents(selectMenu);

            await interaction.reply({ content: 'Select a clan to add points:', components: [row], ephemeral: true });

            const filter = i => i.customId === 'select-clan' && i.user.id === interaction.user.id;
            const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, time: 60000 });

            collector.on('collect', async i => {
                const clanTag = i.values[0];

                await i.reply({ content: 'Enter the number of points to add:', ephemeral: true });

                const filter = response => response.author.id === interaction.user.id;
                const collected = await interaction.channel.awaitMessages({ filter, max: 1, time: 30000 });

                if (!collected.size) {
                    return i.followUp({ content: 'No points entered. Command cancelled.', ephemeral: true });
                }

                const points = parseInt(collected.first().content, 10);

                if (isNaN(points)) {
                    return i.followUp({ content: 'Invalid number of points. Command cancelled.', ephemeral: true });
                }

                db.query('SELECT * FROM Leaderboard WHERE TournamentID = ? AND ClanTag = ?', [tournamentId, clanTag], (err, results) => {
                    if (err) {
                        console.error('Error fetching leaderboard from database:', err);
                        return i.followUp({ content: 'An error occurred while fetching the leaderboard.', ephemeral: true });
                    }

                    if (results.length === 0) {
                        db.query('INSERT INTO Leaderboard (TournamentID, ClanTag, Score, Position) VALUES (?, ?, ?, ?)', [tournamentId, clanTag, points, 0], (err, result) => {
                            if (err) {
                                console.error('Error inserting into leaderboard:', err);
                                return i.followUp({ content: 'An error occurred while updating the leaderboard.', ephemeral: true });
                            }

                            i.followUp({ content: `Added ${points} points to clan ${clanTag}.`, ephemeral: true });
                        });
                    } else {
                        const newScore = results[0].Score + points;
                        db.query('UPDATE Leaderboard SET Score = ? WHERE TournamentID = ? AND ClanTag = ?', [newScore, tournamentId, clanTag], (err, result) => {
                            if (err) {
                                console.error('Error updating leaderboard:', err);
                                return i.followUp({ content: 'An error occurred while updating the leaderboard.', ephemeral: true });
                            }

                            i.followUp({ content: `Added ${points} points to clan ${clanTag}. New score is ${newScore}.`, ephemeral: true });
                        });
                    }

                    db.query('SELECT * FROM Leaderboard WHERE TournamentID = ? ORDER BY Score DESC', [tournamentId], (err, results) => {
                        if (err) {
                            console.error('Error recalculating positions:', err);
                        }

                        results.forEach((result, index) => {
                            db.query('UPDATE Leaderboard SET Position = ? WHERE LeaderboardID = ?', [index + 1, result.LeaderboardID], (err, res) => {
                                if (err) {
                                    console.error('Error updating position:', err);
                                }
                            });
                        });
                    });
                });
            });

            collector.on('end', collected => {
                if (collected.size === 0) {
                    interaction.followUp({ content: 'No clan selected. Command cancelled.', ephemeral: true });
                }
            });
        });
    },
};
