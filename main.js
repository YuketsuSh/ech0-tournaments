const { Client, GatewayIntentBits, Collection, REST, Routes } = require('discord.js');
const fs = require('fs/promises');
const { token, clientId, guildId } = require('./config.json');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.commands = new Collection();

const loadCommands = async () => {
    try {
        const cmdFiles = await fs.readdir('./commands');
        const commands = [];

        for (const file of cmdFiles.filter(file => file.endsWith('.js'))) {
            const cmd = require(`./commands/${file}`);
            if (cmd.data && cmd.data.name) {
                client.commands.set(cmd.data.name, cmd);
                commands.push(cmd.data.toJSON());
            } else {
                console.warn(`Command at ./commands/${file} is missing "data" or "data.name"`);
            }
        }

        const rest = new REST({ version: '10' }).setToken(token);
        console.log('Starting refresh of application slash commands.');
        await rest.put(Routes.applicationGuildCommands(clientId, guildId), { body: commands });
        console.log('Successfully reloaded application slash commands.');
    } catch (error) {
        console.error('Error loading commands:', error);
    }
};

const loadEvents = async () => {
    try {
        const eventFiles = await fs.readdir('./events');

        for (const file of eventFiles.filter(file => file.endsWith('.js'))) {
            const event = require(`./events/${file}`);
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args, client));
            } else {
                client.on(event.name, (...args) => event.execute(...args, client));
            }
        }
    } catch (error) {
        console.error('Error loading events:', error);
    }
};

client.on('interactionCreate', async interaction => {
    console.log('Interaction received');
    if (!interaction.isCommand()) return;

    const command = client.commands.get(interaction.commandName);
    console.log(`Command received: ${interaction.commandName}`);

    if (!command) {
        console.log('No command found');
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
    }
});

(async () => {
    await loadCommands();
    await loadEvents();
    client.login(token).catch(error => {
        console.error('Error logging in:', error);
    });
})();
