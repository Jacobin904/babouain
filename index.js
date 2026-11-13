
require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    Events,
    MessageFlags,
    ContainerBuilder,
    TextDisplayBuilder,
    SeparatorBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    SeparatorSpacingSize
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

// Commande !test
client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    if (message.content !== '!test') return;

    const container = new ContainerBuilder()
        .setAccentColor(0x5865F2)

        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent('# Test des boutons\nBienvenue ! Voici un exemple de message avec des boutons intégrés directement dans son interface.')
        )

        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Large)
                .setDivider(true)
        )

        .addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('presentation')
                    .setLabel('Présentation')
                    .setStyle(ButtonStyle.Primary),

                new ButtonBuilder()
                    .setCustomId('parametres')
                    .setLabel('Paramètres')
                    .setStyle(ButtonStyle.Success),

                new ButtonBuilder()
                    .setCustomId('contact')
                    .setLabel('Nous contacter')
                    .setStyle(ButtonStyle.Secondary)
            )
        )

        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Small)
                .setDivider(false)
        )

        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent('-# Bot de test • Components V2')
        );

    await message.channel.send({
        flags: MessageFlags.IsComponentsV2,
        components: [container]
    });
});

// Gestion des boutons
client.on(Events.InteractionCreate, async (interaction) => {
    if (!interaction.isButton()) return;

    const responses = {
        presentation: 'Tu as ouvert la présentation !',
        parametres: 'Tu as ouvert les paramètres !',
        contact: 'Tu as ouvert la section contact !'
    };

    const response = responses[interaction.customId];

    if (!response) return;

    await interaction.reply({
        content: response,
        ephemeral: true
    });
});

client.login(process.env.DISCORD_TOKEN);
