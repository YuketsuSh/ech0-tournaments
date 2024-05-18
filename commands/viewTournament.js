const { SlashCommandBuilder } = require('discord.js');
const db = require('../events/db.js');
const moment = require('moment');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('viewtournament')
        .setDescription('View details of a tournament')
        .addIntegerOption(option =>
            option.setName('id')
                .setDescription('The ID of the tournament')
                .setRequired(true)),
    async execute(interaction) {
        const id = interaction.options.getInteger('id');

        db.query('SELECT * FROM Tournaments WHERE TournamentID = ?', [id], (err, results) => {
            if (err) {
                console.error(err);
                return interaction.reply({ content: 'An error occurred while fetching the tournament details.', ephemeral: true });
            }
            if (results.length === 0) {
                return interaction.reply({ content: 'Tournament not found.', ephemeral: true });
            }

            const tournament = results[0];
            const startDate = moment(tournament.Date);
            const endDate = calculateEndDate(startDate, tournament.Duration);

            interaction.reply({ content: `Details of Tournament **${tournament.Name}**: Start Date - ${tournament.Date}, End Date - ${endDate}, Type - ${tournament.Type}`, ephemeral: true });
        });
    },
};

function calculateEndDate(startDate, duration) {
    const durationMatch = duration.match(/^(\d+)(\s*)(.*)$/);
    if (!durationMatch) return 'Unknown';

    const [, num, , unit] = durationMatch;
    return startDate.add(num, unit).format('YYYY-MM-DD HH:mm:ss');
}
