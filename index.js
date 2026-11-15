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

// Garde en mémoire les messages d'informations pour les mettre à jour
const infoMessages = new Map();

// ================================
// ENREGISTREMENT DE LA COMMANDE
// ================================
client.once(Events.ClientReady, async (bot) => {
    console.log(`Connecté en tant que ${bot.user.tag}`);

    const command = new SlashCommandBuilder()
        .setName('informations')
        .setDescription('Afficher les informations du serveur dans ce salon.')
        .setDefaultMemberPermissions(PermissionFlagsBits.Administrator);

    await client.application.commands.set([command]);
    console.log('Commande /informations enregistrée (Administrateur seulement) !');

    // Vérifie périodiquement si les infos du serveur ont changé
    setInterval(refreshAllMessages, 5 * 60 * 1000);
});

// ================================
// INFOS DU SERVEUR
// ================================
function getGuildSignature(guild) {
    return `${guild.name}|${guild.icon}|${guild.memberCount}|${guild.premiumSubscriptionCount}|${guild.description}`;
}

function getGuildIcon(guild) {
    return guild.iconURL({ size: 512 }) ?? 'https://cdn.discordapp.com/embed/avatars/0.png';
}

// ================================
// PAGE PRINCIPALE
// ================================
function createMainPage(guild) {
    const owner = guild.ownerId ? `<@${guild.ownerId}>` : 'Non disponible';
    const createdDate = guild.createdAt.toLocaleDateString('fr-CA', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });

    return new ContainerBuilder()
        .setAccentColor(0x5865F2)

        // SECTION = titre + logo en haut à droite
        .addSectionComponents(
            new SectionBuilder()
                .addTextDisplayComponents(
                    new TextDisplayBuilder().setContent(
                        `# Bienvenue sur ${guild.name} !`
                    )
                )
                .setThumbnailAccessory(
                    new ThumbnailBuilder()
                        .setURL(getGuildIcon(guild))
                        .setDescription(`Logo de ${guild.name}`)
                )
        )

        // Gros paragraphe de bienvenue
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `Nous sommes ravis de vous accueillir dans notre communauté ! Ce serveur a été créé pour rassembler des passionnés de roleplay, de jeux vidéo et de discussions enrichissantes. Que vous soyez nouveau ici ou un membre de longue date, nous espérons que vous trouverez ici un espace accueillant, respectueux et divertissant.\n\n` +
                `Notre communauté repose sur des valeurs fondamentales : le respect mutuel, l'entraide et le plaisir partagé. Nous encourageons tous les membres à participer activement, à partager leurs expériences et à contribuer positivement à l'ambiance du serveur. N'hésitez pas à explorer les différents salons, à rejoindre les activités organisées et à vous lier d'amitié avec les autres membres.\n\n` +
                `Avant de commencer, nous vous invitons à prendre connaissance des règlements du serveur afin de garantir une expérience agréable pour tous. Le non-respect de ces règles peut entraîner des sanctions allant de l'avertissement au bannissement, selon la gravité des infractions.`
            )
        )

        // Infos du serveur
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `**📋 Informations du serveur**\n` +
                `- **Nom :** ${guild.name}\n` +
                `- **Propriétaire :** ${owner}\n` +
                `- **Date de création :** ${createdDate}\n` +
                `- **Nombre de membres :** ${guild.memberCount}\n` +
                `- **Nombre de boosts :** ${guild.premiumSubscriptionCount || 0}\n` +
                `- **Niveau de boost :** ${guild.premiumTier || 0}\n` +
                `${guild.description ? `- **Description :** ${guild.description}\n` : ''}` +
                `- **Règlements applicables :** Discord, Roblox et ER:LC\n\n` +
                `Consultez les règlements en cliquant sur les boutons ci-dessous.`
            )
        )

        // Séparateur JUSTE AVANT les boutons
        .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        )

        // Boutons
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

        // Crédits à la fin
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `-# Développé par **jacobin904**`
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

        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `Voici les règles applicables à tous les membres du serveur.\n\n` +
                `**1. Respect et comportement**\n` +
                `- Le respect envers tous les membres est obligatoire, peu importe le contexte.\n` +
                `- Les insultes, menaces, discriminations et provocations abusives sont interdites.\n` +
                `- Le harcèlement, le doxxing et les comportements toxiques ne sont pas tolérés.\n` +
                `- Les conflits personnels doivent être réglés en message privé, pas dans les salons publics.\n\n` +
                `**2. Messages et communications**\n` +
                `- Le spam, le flood, les caps lock excessifs et les mentions abusives sont interdits.\n` +
                `- La publicité sans autorisation du personnel est interdite (serveurs, liens, réseaux sociaux).\n` +
                `- Utilisez les salons selon leur fonction (pas de hors-sujet dans les salons dédiés).\n` +
                `- Les contenus inappropriés, NSFW, violents ou choquants sont interdits.\n` +
                `- Les messages vocaux excessifs ou perturbateurs sont interdits.\n\n` +
                `**3. Confidentialité et sécurité**\n` +
                `- Le partage d'informations personnelles sans consentement est interdit.\n` +
                `- Les tentatives d'arnaque, de phishing et de piratage sont interdites.\n` +
                `- Le partage de liens dangereux ou malveillants est interdit.\n` +
                `- Ne partagez jamais vos identifiants ou codes de vérification.\n\n` +
                `**4. Comptes et plateformes**\n` +
                `- Le respect des Conditions d'utilisation de Discord est obligatoire.\n` +
                `- Toute tentative de contournement d'une sanction (bannissement, mute) est interdite.\n` +
                `- L'usurpation d'identité (membres ou staff) est interdite.\n` +
                `- Les comptes alternatifs (alts) utilisés pour contourner les sanctions sont interdits.\n\n` +
                `**5. Personnel et modération**\n` +
                `- Les consignes du personnel doivent être respectées en tout temps.\n` +
                `- Toute contestation doit être faite dans les espaces prévus (ticket, salon dédié).\n` +
                `- L'abus des systèmes de signalement est interdit.\n` +
                `- Ne prétendez pas être un membre du staff si vous ne l'êtes pas.\n\n` +
                `**6. Sanctions possibles**\n` +
                `- Avertissement verbal ou écrit\n` +
                `- Mute temporaire ou permanent\n` +
                `- Expulsion du serveur\n` +
                `- Bannissement temporaire ou permanent\n` +
                `- La gravité de la sanction dépend de la nature et de la répétition des infractions.`
            )
        )

        // Séparateur JUSTE AVANT le bouton retour
        .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        )

        .addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('retour_reglements')
                    .setLabel('Retour')
                    .setStyle(ButtonStyle.Secondary)
            )
        )

        // Crédits
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `-# Développé par **jacobin904**`
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

        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `Ces règles encadrent toutes les activités de jeu et les scènes de roleplay.\n\n` +
                `**1. Respect des règles Roblox**\n` +
                `- Le respect des Conditions d'utilisation de Roblox est obligatoire.\n` +
                `- Les exploits, cheats, scripts de triche et logiciels de manipulation sont interdits.\n` +
                `- Toute tentative de contourner les sanctions est interdite.\n` +
                `- L'utilisation de bugs ou de glitches pour gagner un avantage est interdite.\n\n` +
                `**2. Qualité du roleplay**\n` +
                `- Le FailRP est interdit : vos actions doivent rester réalistes et cohérentes.\n` +
                `- Le RDM (Random Death Match) est interdit : ne tuez pas un joueur sans raison RP valable.\n` +
                `- Le VDM (Vehicle Death Match) est interdit : ne renversez pas volontairement des joueurs sans raison RP.\n` +
                `- Le Powergaming est interdit : ne forcez pas des actions irréalistes sur les autres joueurs.\n` +
                `- Le Metagaming est interdit : n'utilisez pas des informations obtenues hors RP (Discord, stream, etc.).\n` +
                `- Le Combat Logging est interdit : ne quittez pas une scène pour éviter ses conséquences.\n` +
                `- Respectez la valeur de la vie de votre personnage (Value of Life).\n\n` +
                `**3. Comportement en jeu**\n` +
                `- Respectez les autres joueurs et leurs scènes RP en cours.\n` +
                `- Respectez les consignes du personnel en jeu (policiers, médecins, etc.).\n` +
                `- Ne perturbez pas volontairement les interventions et les scènes RP.\n` +
                `- Les crimes doivent avoir une raison RP valable (pas de crimes gratuits).\n` +
                `- Les otages doivent être traités avec respect (pas de torture excessive).\n` +
                `- Les poursuites policières doivent être réalistes et sécuritaires.\n\n` +
                `**4. Conduite et véhicules**\n` +
                `- La conduite doit être cohérente et réaliste (respectez le code de la route RP).\n` +
                `- Les collisions volontaires et dangereuses sans raison RP sont interdites.\n` +
                `- L'utilisation abusive des véhicules d'urgence est interdite.\n` +
                `- Les véhicules ne doivent pas être utilisés pour bloquer volontairement des zones.\n` +
                `- Les courses illégales doivent être organisées et sécuritaires.\n\n` +
                `**5. Communication et langues**\n` +
                `- La communication en jeu doit se faire en français ou en anglais (selon le serveur).\n` +
                `- Le mic spam et les sons perturbateurs sont interdits.\n` +
                `- Utilisez le radio RP de manière réaliste (pas de blagues hors contexte).\n\n` +
                `**6. Sanctions en jeu**\n` +
                `- Avertissement verbal\n` +
                `- Exclusion temporaire de la session\n` +
                `- Bannissement temporaire du serveur de jeu\n` +
                `- Bannissement permanent selon la gravité\n` +
                `- La gravité de la sanction dépend de la nature et de la répétition des infractions.\n\n` +
                `**Important :** les Conditions d'utilisation de Roblox et les règles officielles d'ER:LC restent prioritaires sur les règles du serveur.`
            )
        )

        // Séparateur JUSTE AVANT le bouton retour
        .addSeparatorComponents(
            new SeparatorBuilder().setSpacing(SeparatorSpacingSize.Small).setDivider(true)
        )

        .addActionRowComponents(
            new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId('retour_reglements')
                    .setLabel('Retour')
                    .setStyle(ButtonStyle.Secondary)
            )
        )

        // Crédits
        .addTextDisplayComponents(
            new TextDisplayBuilder().setContent(
                `-# Développé par **jacobin904**`
            )
        );
}

// ================================
// MISE À JOUR AUTO DU MESSAGE PUBLIC
// ================================
async function refreshAllMessages() {
    for (const [guildId, data] of infoMessages) {
        try {
            const guild = await client.guilds.fetch(guildId);
            const signature = getGuildSignature(guild);

            if (signature === data.signature) continue;

            const channel = await client.channels.fetch(data.channelId);
            const message = await channel.messages.fetch(data.messageId);

            await message.edit({
                components: [createMainPage(guild)],
                flags: MessageFlags.IsComponentsV2
            });

            data.signature = signature;
        } catch (error) {
            if (error.code === 10008 || error.code === 10003 || error.code === 50001) {
                infoMessages.delete(guildId);
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
            if (interaction.commandName !== 'informations') return;

            if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
                return interaction.reply({
                    content: '❌ Tu dois avoir la permission **Administrateur** pour utiliser cette commande.',
                    flags: MessageFlags.Ephemeral
                });
            }

            await interaction.deferReply({ flags: MessageFlags.Ephemeral });

            const message = await interaction.channel.send({
                components: [createMainPage(interaction.guild)],
                flags: MessageFlags.IsComponentsV2
            });

            infoMessages.set(interaction.guildId, {
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
                await interaction.deferUpdate();
                await interaction.deleteReply();
                break;
        }
    } catch (error) {
        console.error('Erreur interaction :', error);
    }
});

client.login(process.env.DISCORD_TOKEN);
