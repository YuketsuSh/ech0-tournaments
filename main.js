const fs = require('fs');
const { Client, Collection, Intents } = require('discord.js');
const client = new Client({
    intents: [
        Intents.FLAGS.GUILDS,
        Intents.FLAGS.GUILD_MESSAGES,
        Intents.FLAGS.GUILD_MESSAGE_REACTIONS
    ]
});

client.commands = new Collection();
client.events = new Collection();

const loadCommands = (dir) => {
    console.log("Loading commands...");
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = `${dir}/${file}`;
        const stat = fs.lstatSync(filePath);
        if (stat.isDirectory()) {
            loadCommands(filePath);
        } else if (file.endsWith('.js')) {
            const command = require(filePath);
            client.commands.set(command.name, command);
            console.log(`Command loaded: ${command.name}`);
        }
    }
    console.log("Commands loaded successfully.");
};

const loadEvents = (dir) => {
    console.log("Loading events...");
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const filePath = `${dir}/${file}`;
        const stat = fs.lstatSync(filePath);
        if (stat.isDirectory()) {
            loadEvents(filePath);
        } else if (file.endsWith('.js')) {
            const event = require(filePath);
            if (event.once) {
                client.once(event.name, (...args) => event.execute(...args, client));
            } else {
                client.on(event.name, (...args) => event.execute(...args, client));
            }
            console.log(`Event loaded: ${event.name}`);
        }
    }
    console.log("Events loaded successfully.");
};

const commandDir = './commands';
const eventDir = './events';

loadCommands(commandDir);
loadEvents(eventDir);

client.on('messageCreate', async (message) => {
    if (!message.content.startsWith('!') || message.author.bot) return;

    const args = message.content.slice(1).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    if (!client.commands.has(commandName)) return;

    const command = client.commands.get(commandName);
    try {
        await command.execute(message, args, client);
    } catch (error) {
        console.error(error);
        message.reply('There was an error executing that command.');
    }
});

client.login('YOUR_TOKEN_BOT');
