require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    Events,
    MessageFlags,
    PermissionFlagsBits,
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
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

    const embed = new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle(`Règlements du serveur`)
        .setThumbnail(iconURL) // C'est CECI qui met le logo en haut à droite de l'embed
        .setDescription(
            `Bienvenue sur **${guild.name}** !\n\n` +
            `Afin de garantir une communauté agréable, organisée et respectueuse, chaque membre doit prendre connaissance des règlements et les respecter.\n\n` +
            `**Informations du serveur**\n` +
            `- Nom : ${guild.name}\n` +
            `- Membres : ${guild.memberCount}\n` +
            `- Règlements applicables : Discord, Roblox et ER:LC\n\n` +
            `Veuillez sélectionner la catégorie de règlements que vous souhaitez consulter.`
        )
        .setFooter({ text: 'En restant sur ce serveur, vous acceptez de respecter les règlements applicables.' });

    const row = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('regles_discord')
            .setLabel('Règlements Discord')
            .setStyle(ButtonStyle.Primary),
        new ButtonBuilder()
            .setCustomId('regles_roblox')
            .setLabel('Règlements Roblox / ERLC')
            .setStyle(ButtonStyle.Success)
    );

    return { embeds: [embed], components: [row] };
}

// ================================
// RÈGLEMENTS DISCORD
// ================================
function createDiscordRules() {
    return new EmbedBuilder()
        .setColor(0x5865F2)
        .setTitle('Règlements Discord')
        .setDescription(
            `Voici les règles applicables à tous les membres du serveur.\n\n` +
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
        );
}

// ================================
// RÈGLEMENTS ROBLOX / ERLC
// ================================
function createRobloxRules() {
    return new EmbedBuilder()
        .setColor(0x248046)
        .setTitle('Règlements Roblox / ER:LC')
        .setDescription(
            `Ces règles encadrent toutes les activités de jeu et les scènes de roleplay.\n\n` +
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
        );
}

// ================================
// BOUTON RETOUR
// ================================
function createBackRow() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('retour_reglements')
            .setLabel('Retour (Fermer)')
            .setStyle(ButtonStyle.Secondary)
    );
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

        // ÉTAPE A : On dit à Discord "je m'en occupe" en mode caché pour éviter l'erreur "Interaction failed"
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });

        // ÉTAPE B : On envoie le VRAI message public dans le salon
        const mainData = createMainPage(interaction.guild);
        await interaction.channel.send({
            embeds: mainData.embeds,
            components: mainData.components
        });

        // ÉTAPE C : On supprime la réponse éphémère de l'étape A. Résultat : RIEN n'apparaît pour toi.
        await interaction.deleteReply();
        return;
    }

    // 2. Gestion des boutons
    if (!interaction.isButton()) return;

    switch (interaction.customId) {
        case 'regles_discord':
            await interaction.reply({
                embeds: [createDiscordRules()],
                components: [createBackRow()],
                flags: MessageFlags.Ephemeral
            });
            break;

        case 'regles_roblox':
            await interaction.reply({
                embeds: [createRobloxRules()],
                components: [createBackRow()],
                flags: MessageFlags.Ephemeral
            });
            break;

        case 'retour_reglements':
            // C'est LA méthode officielle pour supprimer un message éphémère
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
