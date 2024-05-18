const { ModalBuilder, TextInputBuilder, TextInputStyle, ActionRowBuilder } = require('discord.js');
const db = require('./db.js');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction, client) {
        console.log('Interaction handler activated');

        if (interaction.isButton()) {
            const [action, tournamentId] = interaction.customId.split('-');

            if (action === 'register') {
                try {
                    const modal = new ModalBuilder()
                        .setCustomId(`registerModal-${tournamentId}`)
                        .setTitle('Tournament Registration');

                    const emailRow = new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('email')
                            .setLabel("Enter your email")
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    );

                    const clanTagRow = new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('clanTag')
                            .setLabel("Enter your clan tag")
                            .setStyle(TextInputStyle.Short)
                            .setRequired(true)
                    );

                    const playersRow = new ActionRowBuilder().addComponents(
                        new TextInputBuilder()
                            .setCustomId('players')
                            .setLabel("Enter your teammates (comma-separated)")
                            .setStyle(TextInputStyle.Paragraph)
                            .setRequired(true)
                    );

                    modal.addComponents(emailRow, clanTagRow, playersRow);

                    await interaction.showModal(modal);
                    console.log('Modal shown successfully');
                } catch (error) {
                    console.error('Error showing modal:', error);
                    await interaction.reply({ content: 'An error occurred while showing the modal.', ephemeral: true });
                }
            }
        } else if (interaction.isModalSubmit()) {
            try {
                const [action, tournamentId] = interaction.customId.split('-');

                if (action === 'registerModal') {
                    const email = interaction.fields.getTextInputValue('email');
                    const clanTag = interaction.fields.getTextInputValue('clanTag');
                    const players = interaction.fields.getTextInputValue('players');

                    console.log('Inserting registration into database:', { tournamentId, userId: interaction.user.id, email, clanTag, players });

                    db.query('INSERT INTO Registrations (TournamentID, UserID, Email, ClanTag, Players) VALUES (?, ?, ?, ?, ?)',
                        [tournamentId, interaction.user.id, email, clanTag, players], (err, results) => {
                            if (err) {
                                console.error('Database error:', err);
                                interaction.reply({ content: 'An error occurred during the registration.', ephemeral: true });
                                return;
                            }
                            console.log('Registration successful');
                            interaction.reply({ content: 'You have been registered successfully!', ephemeral: true });
                        });
                }
            } catch (error) {
                console.error('Error handling modal submit:', error);
                await interaction.reply({ content: 'An error occurred while handling the modal submission.', ephemeral: true });
            }
        }
    }
};
