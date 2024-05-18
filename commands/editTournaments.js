const { SlashCommandBuilder } = require('discord.js');
const db = require('../events/db.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('edittournament')
        .setDescription('Edit an existing tournament')
        .addIntegerOption(option =>
            option.setName('id')
                .setDescription('The ID of the tournament')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('name')
                .setDescription('The new name of the tournament')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('type')
                .setDescription('The new type of the tournament')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('startdate')
                .setDescription('The new start date of the tournament (YYYY-MM-DD)')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('duration')
                .setDescription('The new duration of the tournament (e.g., 1d for 1 day)')
                .setRequired(true)),
    async execute(interaction) {
        const id = interaction.options.getInteger('id');
        const name = interaction.options.getString('name');
        const type = interaction.options.getString('type');
        const startDate = interaction.options.getString('startdate');
        const duration = interaction.options.getString('duration');

        const updates = {};
        if (name) updates.name = name;
        if (type) updates.type = type;
        if (startDate) updates.startDate = startDate;
        if (duration) updates.duration = duration;

        if (Object.keys(updates).length === 0) {
            return interaction.reply({ content: 'No updates provided.', ephemeral: true });
        }

        const query = `UPDATE Tournaments SET 
            ${Object.keys(updates).map(key => `${key} = ?`).join(', ')} 
            WHERE id = ?`;
        const values = [...Object.values(updates), id];

        db.query(query, values, (err, result) => {
            if (err) {
                console.error('Error updating tournament in database:', err);
                return interaction.reply({ content: 'An error occurred while updating the tournament.', ephemeral: true });
            }

            if (result.affectedRows === 0) {
                return interaction.reply({ content: 'Tournament not found.', ephemeral: true });
            }

            interaction.reply({ content: `Tournament updated successfully: ${Object.entries(updates).map(([key, value]) => `${key} = ${value}`).join(', ')}`, ephemeral: true });
        });
    },
};
