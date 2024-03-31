const db = require('../events/db.js');

module.exports = {
    name: 'edittournament',
    description: 'Edit an existing tournament, including its duration',
    execute(message, args) {
        if (args.length < 1) {
            return message.reply('Please provide the tournament ID.');
        }

        const tournamentId = args[0];

        db.query('SELECT * FROM Tournaments WHERE TournamentID = ?', [tournamentId], async (err, results) => {
            if (err) {
                console.error(err);
                return message.channel.send('An error occurred while fetching the tournament.');
            }

            if (results.length === 0) {
                return message.reply('Tournament not found.');
            }

            const newName = await askQuestion(message, 'Please enter the new name of the tournament:');
            const newType = await askQuestion(message, 'Please enter the new type of the tournament:');
            const newDate = await askQuestion(message, 'Please enter the new start date of the tournament (YYYY-MM-DD):');
            const newDuration = await askQuestion(message, 'Please enter the new duration of the tournament (e.g., 1d for 1 day):');

            const durationValue = convertDuration(newDuration);
            if (!durationValue) {
                return message.reply("Invalid duration format. Please use 1d for days, 1h for hours, 1w for weeks, or 1y for years.");
            }

            const updateQuery = 'UPDATE Tournaments SET Name = ?, Date = ?, Type = ?, Duration = ? WHERE TournamentID = ?';
            db.query(updateQuery, [newName, newDate, newType, durationValue, tournamentId], (updateErr, updateResult) => {
                if (updateErr) {
                    console.error(updateErr);
                    return message.channel.send('An error occurred while updating the tournament.');
                }
                if (updateResult.affectedRows === 0) {
                    return message.reply('No changes made to the tournament.');
                }
                message.channel.send(`Tournament ${newName} updated successfully with new duration: ${newDuration}.`);
            });
        });
    },
};

async function askQuestion(message, question) {
    await message.channel.send(question);
    const filter = m => m.author.id === message.author.id;
    const collected = await message.channel.awaitMessages({ filter, max: 1, time: 30000, errors: ['time'] });
    return collected.first().content;
}

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
