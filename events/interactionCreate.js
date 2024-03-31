const { Modal, TextInputComponent, showModal } = require('discord-modals');
const db = require('./db.js');

module.exports = {
    name: 'interactionCreate',
    execute: async (interaction, client) => {
        if (interaction.isButton()) {
            const [action, tournamentId] = interaction.customId.split('-');

            if (action === 'register') {
                const modal = new Modal()
                    .setCustomId(`registerModal-${tournamentId}`)
                    .setTitle('Tournament Registration')
                    .addComponents(
                        new TextInputComponent()
                            .setCustomId('email')
                            .setLabel("Enter your email")
                            .setStyle('SHORT')
                            .setRequired(true),
                        new TextInputComponent()
                            .setCustomId('clanTag')
                            .setLabel("Enter your clan tag")
                            .setStyle('SHORT')
                            .setRequired(true),
                        new TextInputComponent()
                            .setCustomId('player1')
                            .setLabel("Player 1 Name")
                            .setStyle('SHORT')
                            .setRequired(true),
                        new TextInputComponent()
                            .setCustomId('player2')
                            .setLabel("Player 2 Name")
                            .setStyle('SHORT')
                            .setRequired(true),
                        new TextInputComponent()
                            .setCustomId('player3')
                            .setLabel("Player 3 Name (Optional)")
                            .setStyle('SHORT')
                            .setRequired(false),
                        new TextInputComponent()
                            .setCustomId('player4')
                            .setLabel("Player 4 Name (Optional)")
                            .setStyle('SHORT')
                            .setRequired(false)
                    );

                showModal(modal, {
                    client: client,
                    interaction: interaction
                });
            }
        } else if (interaction.isModalSubmit()) {
            const [action, tournamentId] = interaction.customId.split('-');

            if (action === 'registerModal') {
                const email = interaction.fields.getTextInputValue('email');
                const clanTag = interaction.fields.getTextInputValue('clanTag');
                const player1 = interaction.fields.getTextInputValue('player1');
                const player2 = interaction.fields.getTextInputValue('player2');
                const player3 = interaction.fields.getTextInputValue('player3');
                const player4 = interaction.fields.getTextInputValue('player4');

                const players = [player1, player2, player3, player4].filter(Boolean).join(', ');

                db.query('INSERT INTO Registrations (TournamentID, UserID, Email, ClanTag, Players) VALUES (?, ?, ?, ?, ?)',
                    [tournamentId, interaction.user.id, email, clanTag, players], (err, results) => {
                        if (err) {
                            console.error(err);
                            interaction.reply({ content: 'An error occurred during the registration.', ephemeral: true });
                            return;
                        }
                        interaction.reply({ content: 'You have been registered successfully!', ephemeral: true });
                    });
            }
        }
    }
};
