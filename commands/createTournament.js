const { MessageActionRow, MessageButton } = require('discord.js');
const db = require('../events/db.js');

module.exports = {
    name: 'createtournament',
    description: 'Create a new tournament',
    async execute(message, args, client) {
        try {
            const name = await askQuestion(message, 'Please enter the name of the tournament:');
            const type = await askQuestion(message, 'Please enter the type of the tournament:');
            const startDate = await askQuestion(message, 'Please enter the start date of the tournament (YYYY-MM-DD):');
            const duration = await askQuestion(message, 'Please enter the duration of the tournament (e.g., 1d for 1 day):');
            const channel = await askChannel(message, 'Please mention or provide the ID of the channel where you want to announce the tournament:', client);

            if (!channel) {
                return message.channel.send('Invalid channel specified. Please make sure to mention the channel or provide a valid channel ID.');
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
                const row = new MessageActionRow()
                    .addComponents(
                        new MessageButton()
                            .setCustomId(`register-${createdTournament.id}`)
                            .setLabel('Participate')
                            .setStyle('PRIMARY'),
                    );

                await channel.send({
                    content: `Tournament **${createdTournament.name}** starts on ${createdTournament.startDate} and will last ${createdTournament.duration}! Click below to register.`,
                    components: [row]
                });

                message.channel.send(`Tournament created: ${createdTournament.name}, Type: ${createdTournament.type}, Start Date: ${createdTournament.startDate}, Duration: ${createdTournament.duration}, Channel: ${channel.name}`);
            } else {
                message.channel.send('Failed to create tournament. Please try again later.');
            }
        } catch (error) {
            console.error('Error creating tournament:', error);
            message.channel.send('An error occurred while creating the tournament. Please try again later.');
        }
    },
};


async function askQuestion(message, question) {
    await message.channel.send(question);
    const filter = m => m.author.id === message.author.id;
    const response = await message.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });
    return response.first().content;
}

async function askChannel(message, question, client) {
    await message.channel.send(question);
    const filter = m => m.author.id === message.author.id;
    const response = await message.channel.awaitMessages({ filter, max: 1, time: 60000, errors: ['time'] });
    const collected = response.first();
    const channelMention = collected.mentions.channels.first();
    const channelId = collected.content.trim().replace(/<|#|>/g, '');
    const channel = channelMention || await client.channels.fetch(channelId).catch(console.error);
    return channel;
}

async function createTournamentInDatabase(tournament) {
    return new Promise((resolve, reject) => {
        const query = 'INSERT INTO Tournaments (Name, Type, Date, Duration, Channel) VALUES (?, ?, ?, ?, ?)';
        console.log(`Executing query: ${query}`);
        console.log(`With values: ${tournament.name}, ${tournament.type}, ${tournament.startDate}, ${tournament.duration}, ${tournament.channel}`);
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