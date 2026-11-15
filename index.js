require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    Events,
    MessageFlags,
    SlashCommandBuilder,
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
        GatewayIntentBits.GuildMembers // Ajouté pour garantir un nombre de membres à jour
    ]
});

// ================================
// ENREGISTREMENT DE LA COMMANDE
// ================================
client.once(Events.ClientReady, async (bot) => {
    console.log(`Connecté en tant que ${bot.user.tag}`);

    const command = new SlashCommandBuilder()
        .setName('reglements')
        .setDescription('Consulter les règlements du serveur.');

    await client.application.commands.set([command]);
    console.log('Commande /reglements enregistrée !');
});

// ================================
// PAGE PRINCIPALE
// ================================
function createMainPage(guild) {
    // Récupération du logo du serveur (ou un avatar par défaut si aucun logo)
    const iconURL = guild.iconURL({ dynamic: true, size: 256 }) || 'https://cdn.discordapp.com/embed/avatars/0.png';

    const container = new ContainerBuilder()
        .setAccentColor(0x5865F2)
        .addTextDisplayComponents(
            new TextDisplayBuilder()
                .setContent(
                    `# Règlements du serveur\n![Logo du serveur](${iconURL})\nBienvenue sur **${guild.name}** !\n\nAfin de garantir une communauté agréable, organisée et respectueuse, chaque membre doit prendre connaissance des règlements et les respecter.\n\n**Informations du serveur**\n- Nom : ${guild.name}\n- Membres : ${guild.memberCount}\n- Règlements applicables : Discord, Roblox et ER:LC\n\nVeuillez sélectionner la catégorie de règlements que vous souhaitez consulter.`
                )
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Large)
                .setDivider(true)
        )
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
                    `# Règlements Discord\nVoici les règles applicables à tous les membres du serveur.\n\n**1. Respect et comportement**\n- Le respect envers tous les membres est obligatoire.\n- Les insultes, menaces, discriminations et provocations abusives sont interdites.\n- Le harcèlement et les comportements toxiques ne sont pas tolérés.\n\n**2. Messages et communications**\n- Le spam, le flood et les mentions abusives sont interdits.\n- La publicité sans autorisation du personnel est interdite.\n- Utilisez les salons selon leur fonction.\n- Les contenus inappropriés ou NSFW sont interdits.\n\n**3. Confidentialité et sécurité**\n- Le partage d'informations personnelles sans consentement est interdit.\n- Les tentatives d'arnaque, de phishing et de piratage sont interdites.\n- Le partage de liens dangereux est interdit.\n\n**4. Comptes et plateformes**\n- Le respect des Conditions d'utilisation de Discord est obligatoire.\n- Toute tentative de contournement d'une sanction est interdite.\n- L'usurpation d'identité est interdite.\n\n**5. Personnel et modération**\n- Les consignes du personnel doivent être respectées.\n- Toute contestation doit être faite dans les espaces prévus.\n- L'abus des systèmes de signalement est interdit.\n\n**Sanctions possibles**\nAvertissement, mute, expulsion ou bannissement selon la gravité et la répétition des infractions.`
                )
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Large)
                .setDivider(true)
        )
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
                    `# Règlements Roblox / ER:LC\nCes règles encadrent toutes les activités de jeu et les scènes de roleplay.\n\n**1. Respect des règles Roblox**\n- Le respect des Conditions d'utilisation de Roblox est obligatoire.\n- Les exploits, cheats, scripts de triche et logiciels de manipulation sont interdits.\n- Toute tentative de contourner les sanctions est interdite.\n\n**2. Qualité du roleplay**\n- Le FailRP est interdit : vos actions doivent rester réalistes.\n- Le RDM est interdit : ne tuez pas un joueur sans raison RP valable.\n- Le VDM est interdit : ne renversez pas volontairement des joueurs sans raison RP valable.\n- Le Powergaming est interdit : ne forcez pas des actions irréalistes sur les autres joueurs.\n- Le Metagaming est interdit : n'utilisez pas des informations obtenues hors RP.\n\n**3. Comportement en jeu**\n- Respectez les autres joueurs et leurs scènes RP.\n- Respectez les consignes du personnel en jeu.\n- Ne perturbez pas volontairement les interventions et les scènes RP.\n- Le combat logging est interdit : ne quittez pas une scène pour éviter ses conséquences.\n- Respectez la valeur de la vie de votre personnage.\n\n**4. Conduite et véhicules**\n- La conduite doit être cohérente et réaliste.\n- Les collisions volontaires et dangereuses sans raison RP sont interdites.\n- L'utilisation abusive des véhicules d'urgence est interdite.\n\n**5. Sanctions en jeu**\nSelon la gravité : avertissement, exclusion de la session ou bannissement du serveur de jeu.\n\n**Important :** les Conditions d'utilisation de Roblox et les règles officielles d'ER:LC restent prioritaires.`
                )
        )
        .addSeparatorComponents(
            new SeparatorBuilder()
                .setSpacing(SeparatorSpacingSize.Large)
                .setDivider(true)
        )
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
    if (interaction.isChatInputCommand()) {
        if (interaction.commandName === 'reglements') {
            const container = createMainPage(interaction.guild);

            // MessageFlags.Ephemeral rend la commande invisible pour les autres
            await interaction.reply({
                components: [container],
                flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
            });
        }
        return;
    }

    // 2. Gestion des boutons
    if (!interaction.isButton()) return;

    let container;

    switch (interaction.customId) {
        case 'regles_discord':
            container = createDiscordRules();
            break;
        case 'regles_roblox':
            container = createRobloxRules();
            break;
        case 'retour_reglements':
            // On régénère la page principale avec les infos à jour du serveur
            container = createMainPage(interaction.guild);
            break;
        default:
            return;
    }

    // interaction.reply avec Ephemeral crée un NOUVEAU message privé au lieu de modifier l'ancien
    await interaction.reply({
        components: [container],
        flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
    });
});

// ================================
// CONNEXION
// ================================
client.login(process.env.DISCORD_TOKEN);
