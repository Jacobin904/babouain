
import os
import discord
from discord import app_commands
from discord.ext import commands
from dotenv import load_dotenv

load_dotenv()
TOKEN = os.getenv("DISCORD_TOKEN")

# =====================================
# CONFIGURATION
# =====================================

ROLES = [
    ("Fondateur", 0xE74C3C),
    ("Co-Fondateur", 0xC0392B),
    ("Directeur", 0x9B59B6),
    ("Administrateur", 0xE67E22),
    ("Modérateur", 0x3498DB),
    ("Assistant-Modérateur", 0x5DADE2),
    ("Responsable Communauté", 0x1ABC9C),
    ("Responsable Événements", 0xF1C40F),
    ("Partenaire", 0xE91E63),
    ("Booster", 0xF47FFF),
    ("Membre vérifié", 0x2ECC71),
    ("Nouveau membre", 0x95A5A6),
    ("Bot", 0x607D8B),
    ("Québécois", 0xFFFFFF),
    ("Québécoise", 0xFFFFFF),
    ("Gamer", 0x5865F2),
    ("Rencontre", 0xFF69B4),
    ("Chill", 0x1ABC9C),
    ("Créateur de contenu", 0xE67E22),
    ("Recherche de joueurs", 0x2ECC71),
    ("Amateur de musique", 0x9B59B6),
    ("Roblox", 0xFFFFFF),
    ("Minecraft", 0x27AE60),
    ("Fortnite", 0x9B59B6),
    ("GTA V", 0x3498DB),
    ("Valorant", 0xE74C3C),
    ("Call of Duty", 0x566573),
    ("Rocket League", 0xF39C12),
    ("Autres jeux", 0x95A5A6),
]

CHANNELS = {
    "INFORMATIONS": [
        "accueil",
        "règlements",
        "annonces",
        "rôles",
        "présentation",
    ],
    "COMMUNAUTÉ": [
        "général",
        "discussions",
        "questions",
        "médias",
        "memes",
        "photos-et-vidéos",
        "suggestions",
    ],
    "RENCONTRES": [
        "faire-connaissance",
        "recherche-damis",
        "rencontres",
        "présentation-personnelle",
        "recherche-de-groupe",
    ],
    "GAMING": [
        "gaming-général",
        "recherche-de-joueurs",
        "roblox",
        "minecraft",
        "fortnite",
        "gta-v",
        "autres-jeux",
    ],
    "DIVERTISSEMENT": [
        "musique",
        "vidéos",
        "sondages",
        "clips-gaming",
    ],
    "SUPPORT": [
        "assistance",
        "signalements",
        "tickets",
    ],
}

STAFF_CHANNELS = [
    "staff-chat",
    "staff-annonces",
    "logs",
    "dossiers-membres",
]

STAFF_ROLES = [
    "Fondateur",
    "Co-Fondateur",
    "Directeur",
    "Administrateur",
    "Modérateur",
    "Assistant-Modérateur",
    "Responsable Communauté",
    "Responsable Événements",
]

intents = discord.Intents.default()

bot = commands.Bot(
    command_prefix="!",
    intents=intents
)


# =====================================
# OUTILS
# =====================================

def is_admin(interaction):
    return interaction.user.guild_permissions.administrator


def is_voice(channel):
    return isinstance(
        channel,
        (discord.VoiceChannel, discord.StageChannel)
    )


def get_protected_channels(guild):
    """
    Les salons obligatoires des serveurs Communauté
    ne doivent jamais être supprimés.
    """

    protected = {}

    if guild.rules_channel:
        protected[guild.rules_channel.id] = (
            "INFORMATIONS",
            "règlements"
        )

    if guild.public_updates_channel:
        protected[guild.public_updates_channel.id] = (
            "INFORMATIONS",
            "annonces"
        )

    return protected


# =====================================
# APERÇU
# =====================================

@bot.tree.command(
    name="apercu",
    description="Afficher les changements prévus."
)
@app_commands.guild_only()
async def apercu(interaction: discord.Interaction):

    if not is_admin(interaction):
        await interaction.response.send_message(
            "Tu dois être administrateur.",
            ephemeral=True
        )
        return

    guild = interaction.guild

    protected = get_protected_channels(guild)

    non_voice = [
        c for c in guild.channels
        if not is_voice(c)
        and not isinstance(c, discord.CategoryChannel)
    ]

    missing_roles = [
        name for name, color in ROLES
        if not discord.utils.get(guild.roles, name=name)
    ]

    new_channels = sum(
        len(channels) for channels in CHANNELS.values()
    ) + len(STAFF_CHANNELS)

    await interaction.response.send_message(
        f"**ZONE QUÉBEC — APERÇU**\n\n"
        f"Salons textuels existants : {len(non_voice)}\n"
        f"Salons obligatoires protégés : {len(protected)}\n"
        f"Salons vocaux conservés : "
        f"{sum(is_voice(c) for c in guild.channels)}\n"
        f"Rôles manquants : {len(missing_roles)}\n"
        f"Nouveaux salons prévus : {new_channels}\n\n"
        "**Aucun rôle existant ne sera supprimé.**",
        ephemeral=True
    )


# =====================================
# RECONSTRUCTION
# =====================================

@bot.tree.command(
    name="reconstruire",
    description="Reconstruire la structure de Zone Québec."
)
@app_commands.guild_only()
@app_commands.describe(
    confirmation='Écris exactement "JE CONFIRME".'
)
async def reconstruire(
    interaction: discord.Interaction,
    confirmation: str
):

    if not is_admin(interaction):
        await interaction.response.send_message(
            "Tu dois être administrateur.",
            ephemeral=True
        )
        return

    if confirmation != "JE CONFIRME":
        await interaction.response.send_message(
            "Confirmation incorrecte.",
            ephemeral=True
        )
        return

    guild = interaction.guild
    bot_member = guild.get_member(bot.user.id)

    if not bot_member.guild_permissions.manage_channels:
        await interaction.response.send_message(
            "Permission Gérer les salons manquante.",
            ephemeral=True
        )
        return

    if not bot_member.guild_permissions.manage_roles:
        await interaction.response.send_message(
            "Permission Gérer les rôles manquante.",
            ephemeral=True
        )
        return

    await interaction.response.defer(ephemeral=True)

    try:

        # -----------------------------
        # 1. CRÉATION DES RÔLES
        # -----------------------------

        roles_created = 0

        for name, color in ROLES:

            existing = discord.utils.get(
                guild.roles,
                name=name
            )

            if existing is None:

                await guild.create_role(
                    name=name,
                    colour=discord.Colour(color),
                    reason="Configuration Zone Québec"
                )

                roles_created += 1

        # -----------------------------
        # 2. PROTECTION DES SALONS
        # -----------------------------

        protected = get_protected_channels(guild)

        protected_channels = {
            channel_id: guild.get_channel(channel_id)
            for channel_id in protected
        }

        # -----------------------------
        # 3. CRÉATION DES CATÉGORIES
        # -----------------------------

        categories = {}

        for category_name in CHANNELS:

            category = await guild.create_category(
                category_name,
                reason="Reconstruction Zone Québec"
            )

            categories[category_name] = category

        # Catégorie privée du personnel

        staff_overwrites = {
            guild.default_role:
                discord.PermissionOverwrite(
                    view_channel=False
                )
        }

        for role_name in STAFF_ROLES:

            role = discord.utils.get(
                guild.roles,
                name=role_name
            )

            if role:
                staff_overwrites[role] = (
                    discord.PermissionOverwrite(
                        view_channel=True,
                        send_messages=True,
                        read_message_history=True,
                        connect=True,
                        speak=True
                    )
                )

        staff_category = await guild.create_category(
            "ADMINISTRATION",
            overwrites=staff_overwrites,
            reason="Configuration Zone Québec"
        )

        categories["ADMINISTRATION"] = staff_category

        # -----------------------------
        # 4. RÉUTILISATION DES SALONS
        # OBLIGATOIRES COMMUNAUTAIRES
        # -----------------------------

        reused_channels = set()

        for channel_id, destination in protected.items():

            channel = protected_channels[channel_id]

            if channel is None:
                continue

            category_name, channel_name = destination

            await channel.edit(
                name=channel_name,
                category=categories[category_name],
                reason="Conservation salon obligatoire"
            )

            reused_channels.add(channel_id)

        # -----------------------------
        # 5. SUPPRESSION DES AUTRES
        # SALONS NON VOCAUX
        # -----------------------------

        deleted = 0
        preserved = 0
        warnings = []

        existing_channels = list(guild.channels)

        # Supprimer les salons avant les catégories

        existing_channels.sort(
            key=lambda c: isinstance(
                c, discord.CategoryChannel
            )
        )

        for channel in existing_channels:

            # Ne jamais toucher aux salons vocaux
            if is_voice(channel):
                continue

            # Ne jamais supprimer les salons obligatoires
            if channel.id in protected:
                continue

            # Garder les anciennes catégories contenant
            # encore des salons vocaux
            if isinstance(channel, discord.CategoryChannel):

                has_voice = any(
                    is_voice(c) and c.category_id == channel.id
                    for c in guild.channels
                )

                if has_voice:
                    preserved += 1
                    continue

                # Ne pas supprimer une catégorie contenant
                # un salon qui n'a pas pu être supprimé
                has_remaining = any(
                    c.category_id == channel.id
                    for c in guild.channels
                    if c.id != channel.id
                )

                if has_remaining:
                    preserved += 1
                    continue

            try:

                await channel.delete(
                    reason="Reconstruction Zone Québec"
                )

                deleted += 1

            except discord.HTTPException as error:

                if error.code == 50074:
                    warnings.append(
                        f"{channel.name} : salon protégé par Discord"
                    )
                    preserved += 1
                    continue

                raise

        # -----------------------------
        # 6. CRÉATION DES SALONS TEXTUELS
        # -----------------------------

        created = 0

        for category_name, channel_names in CHANNELS.items():

            for channel_name in channel_names:

                # Les salons obligatoires ont déjà été
                # déplacés et réutilisés.
                already_exists = any(
                    channel.id in reused_channels
                    and channel.name == channel_name
                    for channel in guild.channels
                )

                if already_exists:
                    continue

                await guild.create_text_channel(
                    channel_name,
                    category=categories[category_name],
                    reason="Configuration Zone Québec"
                )

                created += 1

        # -----------------------------
        # 7. SALONS STAFF
        # -----------------------------

        for channel_name in STAFF_CHANNELS:

            await guild.create_text_channel(
                channel_name,
                category=staff_category,
                reason="Configuration Zone Québec"
            )

            created += 1

        # -----------------------------
        # 8. RAPPORT FINAL
        # -----------------------------

        voice_count = sum(
            is_voice(c) for c in guild.channels
        )

        report = (
            "**ZONE QUÉBEC — RECONSTRUCTION TERMINÉE**\n\n"
            f"Rôles créés : {roles_created}\n"
            f"Salons supprimés : {deleted}\n"
            f"Salons créés : {created}\n"
            f"Salons obligatoires réutilisés : {len(reused_channels)}\n"
            f"Salons/catégories conservés : {preserved}\n"
            f"Vocaux conservés : {voice_count}\n\n"
            "**Rôles supprimés : 0**"
        )

        if warnings:
            report += "\n\n**Avertissements :**\n"
            report += "\n".join(warnings[:10])

        await interaction.followup.send(
            report,
            ephemeral=True
        )

    except discord.Forbidden:
        await interaction.followup.send(
            "Erreur : le bot n'a pas les permissions nécessaires. "
            "Vérifie ses permissions et sa position dans la hiérarchie.",
            ephemeral=True
        )

    except discord.HTTPException as error:
        await interaction.followup.send(
            f"Erreur Discord : {error}\n"
            "La reconstruction s'est arrêtée. "
            "Vérifie les salons avant de relancer la commande.",
            ephemeral=True
        )

    except Exception as error:
        await interaction.followup.send(
            f"Erreur inattendue : {error}",
            ephemeral=True
        )


# =====================================
# DÉMARRAGE
# =====================================

@bot.event
async def on_ready():

    try:
        synced = await bot.tree.sync()

        print("--------------------------------")
        print(f"Connecté : {bot.user}")
        print(f"Commandes synchronisées : {len(synced)}")
        print("Zone Québec est prêt !")
        print("--------------------------------")

    except Exception as error:
        print(f"Erreur synchronisation : {error}")


if not TOKEN:
    raise RuntimeError(
        "DISCORD_TOKEN est absent du fichier .env"
    )

bot.run(TOKEN)
