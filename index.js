require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    Events,
    MessageFlags,
    PermissionFlagsBits,
    SlashCommandBuilder,
    ContainerBuilder,
    SectionBuilder,
    TextDisplayBuilder,
    ThumbnailBuilder,
    SeparatorBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    SeparatorSpacingSize
} = require('discord.js');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// Garde en mémoire les messages de règlements pour les mettre à jour
// Format : guildId -> { channelId, messageId, signature }
const reglementMessages = new Map();

// ================================
// ENREGISTREMENT DE LA COMMANDE
// ================================
client.once(Events.ClientReady, async (bot) => {
    console.log(`Connecté en tant que ${bot.user.tag}`);

    const command = new SlashCommandBuilder()
        .setName('reglements')
        .setDescription('Afficher les règlements du serveur dans ce salon.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

    await client.application.commands.set([command]);
    console.log('Commande /reglements enregistrée (Administrateur seulement) !');

    // Vérifie périodiquement si les infos du serveur ont changé
    setInterval(refreshAllMessages, 5 * 60 * 1000);
});

// ================================
// INFOS DU SERVEUR
// ================================
function getGuildSignature(guild) {
    return `${guild.name}|${guild.icon}|${guild.memberCount}`;
}

function getGuildIcon(guild) {
    return guild.iconURL({ size: 512 }) ?? 'https://cdn.discordapp.com/embed/avatars/0.png';
}

// ================================
// PAGE PRINCIPALE (Components V2)
// ================================
function createMainPage(guild) {
    return new ContainerBuilder()
        .setAccentColor(0x5865F2)

        // SECTION = texte à gauche + LOGO EN HAUT À DROITE
        .addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `# Règlements du serveur\nBienvenue sur **${guild.name}** !`
                    )
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder()
                        .setURL(getGuildIcon(guild))
                        .setDescription(`Logo de ${guild.name}`)
                )
        )

        .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true)
        )

        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `Afin de garantir une communauté agréable, organisée et respectueuse, chaque membre doit prendre connaissance des règlements et les respecter.\n\n` +
                `**Informations du serveur**\n` +
                `- Nom : ${guild.name}\n` +
                `- Membres : ${guild.memberCount}\n` +
                `- Règlements applicables : Discord, Roblox et ER:LC\n\n` +
                `Veuillez sélectionner la catégorie de règlements que vous souhaitez consulter.`
            )
        )

        .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
        )

        // BOUTONS À L'INTÉRIEUR DU CONTAINER
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
            new TextDisplayBuilder().setContent(
                '-# En restant sur ce serveur, vous acceptez de respecter les règlements applicables.'
            )
        );
}

// ================================
// RÈGLEMENTS DISCORD
// ================================
function createDiscordRules(guild) {
    return new ContainerBuilder()
        .setAccentColor(0x5865F2)

        .addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `# Règlements Discord\nServeur : **${guild.name}**`
                    )
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder()
                        .setURL(getGuildIcon(guild))
                        .setDescription(`Logo de ${guild.name}`)
                )
        )

        .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true)
        )

        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
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
                `- Les tentatives d'arnaque, de phishing et de piratage sont interdites.\n` +
                `- Le partage de liens dangereux est interdit.\n\n` +
                `**4. Comptes et plateformes**\n` +
                `- Le respect des Conditions d'utilisation de Discord est obligatoire.\n` +
                `- Toute tentative de contournement d'une sanction est interdite.\n` +
                `- L'usurpation d'identité est interdite.\n\n` +
                `**5. Personnel et modération**\n` +
                `- Les consignes du personnel doivent être respectées.\n` +
                `- Toute contestation doit être faite dans les espaces prévus.\n` +
                `- L'abus des systèmes de signalement est interdit.\n\n` +
                `**Sanctions possibles**\n` +
                `Avertissement, mute, expulsion ou bannissement selon la gravité et la répétition des infractions.`
            )
        )

        .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
        )

        .addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('retour_reglements')
                    .setLabel('Retour')
                    .setStyle(ButtonStyle.Secondary)
            )
        );
}

// ================================
// RÈGLEMENTS ROBLOX / ERLC
// ================================
function createRobloxRules(guild) {
    return new ContainerBuilder()
        .setAccentColor(0x248046)

        .addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `# Règlements Roblox / ER:LC\nServeur : **${guild.name}**`
                    )
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder()
                        .setURL(getGuildIcon(guild))
                        .setDescription(`Logo de ${guild.name}`)
                )
        )

        .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Large).setDivider(true)
        )

        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**1. Respect des règles Roblox**\n` +
                `- Le respect des Conditions d'utilisation de Roblox est obligatoire.\n` +
                `- Les exploits, cheats, scripts de triche et logiciels de manipulation sont interdits.\n` +
                `- Toute tentative de contourner les sanctions est interdite.\n\n` +
                `**2. Qualité du roleplay**\n` +
                `- Le FailRP est interdit : vos actions doivent rester réalistes.\n` +
                `- Le RDM est interdit : ne tuez pas un joueur sans raison RP valable.\n` +
                `- Le VDM est interdit : ne renversez pas volontairement des joueurs sans raison RP valable.\n` +
                `- Le Powergaming est interdit : ne forcez pas des actions irréalistes sur les autres joueurs.\n` +
                `- Le Metagaming est interdit : n'utilisez pas des informations obtenues hors RP.\n\n` +
                `**3. Comportement en jeu**\n` +
                `- Respectez les autres joueurs et leurs scènes RP.\n` +
                `- Respectez les consignes du personnel en jeu.\n` +
                `- Ne perturbez pas volontairement les interventions et les scènes RP.\n` +
                `- Le combat logging est interdit : ne quittez pas une scène pour éviter ses conséquences.\n` +
                `- Respectez la valeur de la vie de votre personnage.\n\n` +
                `**4. Conduite et véhicules**\n` +
                `- La conduite doit être cohérente et réaliste.\n` +
                `- Les collisions volontaires et dangereuses sans raison RP sont interdites.\n` +
                `- L'utilisation abusive des véhicules d'urgence est interdite.\n\n` +
                `**5. Sanctions en jeu**\n` +
                `Selon la gravité : avertissement, exclusion de la session ou bannissement du serveur de jeu.\n\n` +
                `**Important :** les Conditions d'utilisation de Roblox et les règles officielles d'ER:LC restent prioritaires.`
            )
        )

        .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(false)
        )

        .addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('retour_reglements')
                    .setLabel('Retour')
                    .setStyle(ButtonStyle.Secondary)
            )
        );
}

// ================================
// MISE À JOUR AUTO DU MESSAGE PUBLIC
// (seulement si les infos du serveur changent)
// ================================
async function refreshAllMessages() {
    for (const [guildId, data] of reglementMessages) {
        try {
            const guild = await client.guilds.fetch(guildId);
            const signature = getGuildSignature(guild);

            // Aucun changement = on ne touche pas au message
            if (signature === data.signature) continue;

            const channel = await client.channels.fetch(data.channelId);
            const message = await channel.messages.fetch(data.messageId);

            await message.edit({
                components: [createMainPage(guild)],
                flags: MessageFlags.IsComponentsV2
            });

            data.signature = signature;
        } catch (error) {
            // Message supprimé, salon inaccessible, bot retiré, etc.
            if (error.code === 10008 || error.code === 10003 || error.code === 50001) {
                reglementMessages.delete(guildId);
            } else {
                console.error(`Mise à jour échouée pour ${guildId} :`, error.message);
            }
        }
    }
}

// ================================
// INTERACTIONS
// ================================
client.on(Events.InteractionCreate, async (interaction) => {
    try {
        // -------- COMMANDE --------
        if (interaction.isChatInputCommand()) {
            if (interaction.commandName !== 'reglements') return;

            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({
                    content: '❌ Tu dois avoir la permission **Administrateur** pour utiliser cette commande.',
                    flags: MessageFlags.Ephemeral
                });
            }

            // Réponse fantôme : on accuse réception puis on l'efface => aucune trace visible
            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const message = await interaction.channel.send({
                components: [createMainPage(interaction.guild)],
                flags: MessageFlags.IsComponentsV2
            });

            reglementMessages.set(interaction.guildId, {
                channelId: message.channelId,
                messageId: message.id,
                signature: getGuildSignature(interaction.guild)
            });

            await interaction.deleteReply();
            return;
        }

        // -------- BOUTONS --------
        if (!interaction.isButton()) return;

        switch (interaction.customId) {
            case 'regles_discord':
                await interaction.reply({
                    components: [createDiscordRules(interaction.guild)],
                    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
                });
                break;

            case 'regles_roblox':
                await interaction.reply({
                    components: [createRobloxRules(interaction.guild)],
                    flags: MessageFlags.IsComponentsV2 | MessageFlags.Ephemeral
                });
                break;

            case 'retour_reglements':
                // deferUpdate rattache l'interaction au message éphémère,
                // ensuite deleteReply le supprime pour vrai.
                await interaction.deferUpdate();
                await interaction.deleteReply();
                break;
        }
    } catch (error) {
        console.error('Erreur interaction :', error);
    }
});

client.login(process.env.DISCORD_TOKEN);
