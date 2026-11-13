
require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    Events
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

client.once(Events.ClientReady, (bot) => {
    console.log(`Connecté en tant que ${bot.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    if (message.content !== '!test') return;

    const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('Test des boutons')
        .setDescription(
            'Bienvenue ! Clique sur un bouton ci-dessous pour tester son fonctionnement.'
        )
        .setFooter({ text: 'Bot de test Discord' })
        .setTimestamp();

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('bouton_1')
            .setLabel('Bouton 1')
            .setStyle(ButtonStyle.Primary),

        new ButtonBuilder()
            .setCustomId('bouton_2')
            .setLabel('Bouton 2')
            .setStyle(ButtonStyle.Success),

        new ButtonBuilder()
            .setCustomId('bouton_3')
            .setLabel('Bouton 3')
            .setStyle(ButtonStyle.Secondary)
    );

    await message.channel.send({
        embeds: [embed],
        components: [row]
    });
});

client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;

    const messages = {
        bouton_1: 'Tu as cliqué sur le bouton 1 !',
        bouton_2: 'Tu as cliqué sur le bouton 2 !',
        bouton_3: 'Tu as cliqué sur le bouton 3 !'
    };

    await interaction.reply({
        content: messages[interaction.customId],
        ephemeral: true
    });
});

client.login(process.env.DISCORD_TOKEN);
  
