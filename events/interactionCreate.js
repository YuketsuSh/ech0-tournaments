const { Modal, TextInputComponent, showModal } = require('discord-modals');
const db = require('./db.js');

module.exports = {
    name: 'interactionCreate',
    execute(interaction, client) {
        if (interaction.isButton() && interaction.customId.startsWith('register')) {
            const tournamentId = interaction.customId.split('-')[1];

            const modal = new Modal()
                .setCustomId(`registrationModal-${tournamentId}`)
                .setTitle('Tournament Registration')
                .addComponents(
                    new TextInputComponent()
                        .setCustomId('emailInput')
                        .setLabel("What's your email?")
                        .setStyle('SHORT')
                        .setRequired(true),
                    new TextInputComponent()
                        .setCustomId('clanTagInput')
                        .setLabel("What's your clan tag?")
                        .setStyle('SHORT')
                        .setRequired(true)
                );

            showModal(modal, {
                client: client,
                interaction: interaction
            });
        } else if (interaction.isModalSubmit() && interaction.customId.startsWith('registrationModal')) {
            const tournamentId = interaction.customId.split('-')[1];
            const email = interaction.fields.getTextInputValue('emailInput');
            const clanTag = interaction.fields.getTextInputValue('clanTagInput');

            const insertQuery = 'INSERT INTO Registrations (TournamentID, UserID, Email, ClanTag) VALUES (?, ?, ?, ?)';

            db.query(insertQuery, [tournamentId, interaction.user.id, email, clanTag], (err, result) => {
                if (err) {
                    console.error(err);
                    return interaction.reply({ content: 'An error occurred during the registration.', ephemeral: true });
                }
                interaction.reply({ content: 'Thank you for your registration!', ephemeral: true });
            });
        }
    },
};
