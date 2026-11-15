require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    Events,
    MessageFlags,
    PermissionFlagsBits,
    SlashCommandBuilder,
    ContainerBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
    SeparatorBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    SeparatorSpacingSize
} = require('discord.js');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers
    ]
});

// ================================
// ENREGISTREMENT DE LA COMMANDE
// ================================
client.once(Events.ClientReady, async (bot) => {
    console.log(`Connecté en tant que ${bot.user.tag}`);

    const command = new SlashCommandBuilder()
        .setName('reglements')
        .setDescription('Affiche les règlements du serveur dans le salon.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

    await client.application.commands.set([command]);
    console.log('Commande /reglements enregistrée (Admin seulement) !');
});

// ================================
// PAGE PRINCIPALE
// ================================
function createMainPage(guild) {
    const iconURL = guild.iconURL({ dynamic: true, size: 512 }) || 'https://cdn.discordapp.com/embed/avatars/0.png';

    const container = new ContainerBuilder()
        .setAccentColor(0x5865F2)
        // C'EST ÇA qui met le logo en haut à droite du container V2
        .setThumbnail(new ThumbnailBuilder().setURL(iconURL))
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(
                    `# Règlements du serveur\nBienvenue sur **${guild.name}** !\n\n` +
                    `Afin de garantir une communauté agréable, organisée et respectueuse, chaque membre doit prendre connaissance des règlements et les respecter.\n\n` +
                    `**Informations du serveur**\n` +
                    `- Nom : ${guild.name}\n` +
                    `- Membres : ${guild.memberCount}\n` +
                    `- Règlements applicables : Discord, Roblox et ER:LC\n\n` +
                    `Veuillez sélectionner la catégorie de règlements que vous souhaitez consulter.`
                )
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Large)
                .setDivider(true)
        )
        // Les boutons sont DANS le container
        .addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('regles_discord')
                    .setLabel('Règlements Discord')
                    .setStyle(ButtonStyle.Primary),
                new ButtonBuilder()
                    .setCustomId('regles_roblox')
                    .setLabel('Règlements Roblox / ERLC')
                    .setStyle(ButtonStyle.Success)
            )
        )
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent('-# En restant sur ce serveur, vous acceptez de respecter les règlements applicables.')
        );

    return container;
}

// ================================
// RÈGLEMENTS DISCORD
// ================================
function createDiscordRules() {
    const container = new ContainerBuilder()
        .setAccentColor(0x5865F2)
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(
                    `# Règlements Discord\nVoici les règles applicables à tous les membres du serveur.\n\n` +
                    `**1. Respect et comportement**\n` +
                    `- Le respect envers tous les membres est obligatoire.\n` +
                    `- Les insultes, menaces, discriminations et provocations abusives sont interdites.\n` +
                    `- Le harcèlement et les comportements toxiques ne sont pas tolérés.\n\n` +
                    `**2. Messages et communications**\n` +
                    `- Le spam, le flood et les mentions abusives sont interdits.\n` +
                    `- La publicité sans autorisation du personnel est interdite.\n` +
                    `- Utilisez les salons selon leur fonction.\n` +
                    `- Les contenus inappropriés ou NSFW sont interdits.\n\n` +
                    `**3. Confidentialité et sécurité**\n` +
                    `- Le partage d'informations personnelles sans consentement est interdit.\n` +
                    `- Les tentatives d'arnaque, de phishing et de piratage sont interdites.\n\n` +
                    `**4. Comptes et plateformes**\n` +
                    `- Le respect des Conditions d'utilisation de Discord est obligatoire.\n` +
                    `- Toute tentative de contournement d'une sanction est interdite.\n\n` +
                    `**5. Personnel et modération**\n` +
                    `- Les consignes du personnel doivent être respectées.\n\n` +
                    `**Sanctions possibles**\n` +
                    `Avertissement, mute, expulsion ou bannissement selon la gravité.`
                )
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Large)
                .setDivider(true)
        )
        // Bouton retour DANS le container
        .addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('retour_reglements')
                    .setLabel('Retour')
                    .setStyle(ButtonStyle.Secondary)
            )
        );

    return container;
}

// ================================
// RÈGLEMENTS ROBLOX / ERLC
// ================================
function createRobloxRules() {
    const container = new ContainerBuilder()
        .setAccentColor(0x248046)
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(
                    `# Règlements Roblox / ER:LC\nCes règles encadrent toutes les activités de jeu et les scènes de roleplay.\n\n` +
                    `**1. Respect des règles Roblox**\n` +
                    `- Le respect des Conditions d'utilisation de Roblox est obligatoire.\n` +
                    `- Les exploits, cheats, scripts de triche et logiciels de manipulation sont interdits.\n\n` +
                    `**2. Qualité du roleplay**\n` +
                    `- Le FailRP est interdit : vos actions doivent rester réalistes.\n` +
                    `- Le RDM est interdit : ne tuez pas un joueur sans raison RP valable.\n` +
                    `- Le VDM est interdit : ne renversez pas volontairement des joueurs sans raison RP valable.\n` +
                    `- Le Powergaming et le Metagaming sont interdits.\n\n` +
                    `**3. Comportement en jeu**\n` +
                    `- Respectez les autres joueurs et leurs scènes RP.\n` +
                    `- Ne perturbez pas volontairement les interventions.\n` +
                    `- Le combat logging est interdit.\n\n` +
                    `**4. Conduite et véhicules**\n` +
                    `- La conduite doit être cohérente et réaliste.\n` +
                    `- Les collisions volontaires et dangereuses sans raison RP sont interdites.\n\n` +
                    `**Important :** les Conditions d'utilisation de Roblox et les règles officielles d'ER:LC restent prioritaires.`
                )
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Large)
                .setDivider(true)
        )
        // Bouton retour DANS le container
        .addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('retour_reglements')
                    .setLabel('Retour')
                    .setStyle(ButtonStyle.Secondary)
            )
        );

    return container;
}

// ================================
// INTERACTIONS
// ================================
client.on(Events.InteractionCreate, async (interaction) => {

    // 1. Commande /reglements
    if (interaction.isChatInputCommand() && interaction.commandName === 'reglements') {
        
        if (!interaction.member.permissions.has(PermissionFlagsBits.Administrator)) {
            return interaction.reply({ 
                content: '❌ Tu dois avoir la permission **Administrateur**.', 
                flags: MessageFlags.Ephemeral 
            });
        }

        // On ack en éphémère pour éviter "Interaction failed"
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        // On envoie le message public dans le salon
        const mainContainer = createMainPage(interaction.guild);
        await interaction.channel.send({
            components: [mainContainer],
            flags: MessageFlags.IsComponentsV2
        });

        // On supprime la réponse éphémère = AUCUNE confirmation visible
        await interaction.deleteReply();
        return;
    }

    // 2. Gestion des boutons
    if (!interaction.isButton()) return;

    switch (interaction.customId) {
        case 'regles_discord':
            await interaction.reply({
                components: [createDiscordRules()],
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
            });
            break;

        case 'regles_roblox':
            await interaction.reply({
                components: [createRobloxRules()],
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
            });
            break;

        case 'retour_reglements':
            // Supprime le message éphémère proprement
            await interaction.deleteReply();
            break;

        default:
            return;
    }
});

// ================================
// CONNEXION
// ================================
client.login(process.env.DISCORD_TOKEN);
