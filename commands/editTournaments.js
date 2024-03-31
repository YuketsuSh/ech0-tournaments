const db = require('../events/db.js');

module.exports = {
    name: 'edittournament',
    description: 'Edit an existing tournament, including its duration',
    execute(message, args) {
        if (args.length < 5) {
            return message.reply('Please provide the tournament ID, new name, new date, new type, and new duration.');
        }

        const [tournamentId, newName, newDate, newType, newDuration] = args;

        const durationValue = convertDuration(newDuration);
        if (!durationValue) {
            return message.reply("Invalid duration format. Please use 1d for days, 1h for hours, 1w for weeks, or 1y for years.");
        }

        const query = 'UPDATE Tournaments SET Name = ?, Date = ?, Type = ?, Duration = ? WHERE TournamentID = ?';

        db.query(query, [newName, newDate, newType, durationValue, tournamentId], (err, result) => {
            if (err) {
                console.error(err);
                return message.channel.send('An error occurred while editing the tournament.');
            }
            if (result.affectedRows === 0) {
                return message.reply('Tournament not found or no changes made.');
            }
            message.channel.send(`Tournament ${newName} updated successfully with new duration: ${newDuration}.`);
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
