const db = require('../events/db.js');
const moment = require('moment');

module.exports = {
    name: 'viewtournament',
    description: 'View details of a tournament',
    execute(message, args) {
        if (args.length < 1) {
            return message.reply('Please provide the tournament ID.');
        }

        const [tournamentId] = args;
        const query = 'SELECT * FROM Tournaments WHERE TournamentID = ?';

        db.query(query, [tournamentId], (err, results) => {
            if (err) {
                console.error(err);
                return message.channel.send('An error occurred while fetching the tournament details.');
            }
            if (results.length === 0) {
                return message.reply('Tournament not found.');
            }

            const tournament = results[0];
            const startDate = moment(tournament.Date);
            const endDate = calculateEndDate(startDate, tournament.Duration);

            message.channel.send(`Details of Tournament **${tournament.Name}**: Start Date - ${tournament.Date}, End Date - ${endDate}, Type - ${tournament.Type}`);
        });
    },
};

function calculateEndDate(startDate, duration) {
    const durationMatch = duration.match(/^(\d+)(\s*)(.*)$/);
    if (!durationMatch) return 'Unknown';

    const [, num, , unit] = durationMatch;
    return startDate.add(num, unit).format('YYYY-MM-DD HH:mm:ss');
}