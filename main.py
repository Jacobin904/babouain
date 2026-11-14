
import os
import asyncio
import logging
import discord
from discord import app_commands
from discord.ext import commands
from dotenv import load_dotenv

load_dotenv()
TOKEN = os.getenv("DISCORD_TOKEN")

if not TOKEN:
    raise RuntimeError("DISCORD_TOKEN manquant dans .env")

logging.basicConfig(level=logging.INFO)

# =========================
# RÔLES
# =========================

ROLES = [
    ("Fondateur", "#E74C3C"),
    ("Co-Fondateur", "#C0392B"),
    ("Directeur", "#9B59B6"),
    ("Administrateur", "#E67E22"),
    ("Modérateur", "#3498DB"),
    ("Assistant-Modérateur", "#5DADE2"),
    ("Responsable Communauté", "#1ABC9C"),
    ("Responsable Événements", "#F1C40F"),
    ("Partenaire", "#E91E63"),
    ("Booster", "#F47FFF"),
    ("Membre vérifié", "#2ECC71"),
    ("Nouveau membre", "#95A5A6"),
    ("Bot", "#607D8B"),
    ("Québécois/Québécoise", "#FFFFFF"),
    ("Gamer", "#5865F2"),
    ("Rencontre", "#FF69B4"),
    ("Chill", "#1ABC9C"),
    ("Créateur de contenu", "#E67E22"),
    ("Recherche de joueurs", "#2ECC71"),
    ("Amateur de musique", "#9B59B6"),
    ("Roblox", "#FFFFFF"),
    ("Minecraft", "#27AE60"),
    ("Fortnite", "#9B59B6"),
    ("GTA V", "#3498DB"),
    ("Valorant", "#E74C3C"),
    ("Call of Duty", "#566573"),
    ("Rocket League", "#F39C12"),
    ("Autres jeux", "#95A5A6"),
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

# =========================
# CATÉGORIES ET SALONS
# =========================

STRUCTURE = {
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

    "ADMINISTRATION": [
        "staff-chat",
        "staff-annonces",
        "logs",
        "dossiers-membres",
        "réunion-staff",
    ],
}

VOCALS = {
    "COMMUNAUTÉ": [
        "Général 1",
        "Général 2",
        "AFK",
    ],

    "GAMING": [
        "Gaming 1",
        "Gaming 2",
    ],

    "RENCONTRES": [
        "Rencontre",
    ],

    "DIVERTISSEMENT": [
        "Chill / Musique",
    ],
}


def normalize(name):
    return name.strip().casefold()


def is_voice(channel):
    return isinstance(
        channel,
        (discord.VoiceChannel, discord.StageChannel)
    )


# =========================
# BOT
# =========================

intents = discord.Intents.default()

bot = commands.Bot(
    command_prefix="!",
    intents=intents
)


@bot.event
async def on_ready():
    print("--------------------------------")
    print("Zone Québec est prêt !")
    print(f"Connecté : {bot.user}")
    print("--------------------------------")


async def get_or_create_role(guild, name, hex_color):
    existing = discord.utils.find(
        lambda r: normalize(r.name) == normalize(name),
        guild.roles
    )

    if existing:
        return existing, False

    color = discord.Color(
        int(hex_color.replace("#", ""), 16)
    )

    role = await guild.create_role(
        name=name,
        color=color,
        hoist=name in STAFF_ROLES,
        reason="Création automatique Zone Québec"
    )

    await asyncio.sleep(0.3)
    return role, True


async def get_or_create_category(guild, name, overwrites=None):
    existing = discord.utils.find(
        lambda c: normalize(c.name) == normalize(name),
        guild.categories
    )

    if existing:
        if overwrites is not None:
            await existing.edit(overwrites=overwrites)
        return existing, False

    category = await guild.create_category(
        name=name,
        overwrites=overwrites,
        reason="Création automatique Zone Québec"
    )

    await asyncio.sleep(0.3)
    return category, True


async def get_or_create_text(guild, category, name):
    existing = discord.utils.find(
        lambda c: (
            isinstance(c, discord.TextChannel)
            and normalize(c.name) == normalize(name)
        ),
        guild.channels
    )

    if existing:
        if existing.category_id != category.id:
            await existing.edit(category=category)
        return existing, False

    channel = await guild.create_text_channel(
        name=name,
        category=category,
        reason="Création automatique Zone Québec"
    )

    await asyncio.sleep(0.3)
    return channel, True


async def get_or_create_voice(guild, category, name):
    # Un vocal existant n'est jamais déplacé ni supprimé.
    existing = discord.utils.find(
        lambda c: is_voice(c) and normalize(c.name) == normalize(name),
        guild.channels
    )

    if existing:
        return existing, False

    channel = await guild.create_voice_channel(
        name=name,
        category=category,
        reason="Création automatique Zone Québec"
    )

    await asyncio.sleep(0.3)
    return channel, True


# =========================
# RECONSTRUCTION
# =========================

@bot.tree.command(
    name="reconstruire",
    description="Crée automatiquement les salons et catégories de Zone Québec."
)
@app_commands.guild_only()
async def reconstruire(interaction: discord.Interaction):

    if not interaction.user.guild_permissions.administrator:
        await interaction.response.send_message(
            "Tu dois être administrateur pour utiliser cette commande.",
            ephemeral=True
        )
        return

    await interaction.response.defer(
        ephemeral=True,
        thinking=True
    )

    guild = interaction.guild

    roles_created = 0
    categories_created = 0
    channels_created = 0
    voices_created = 0
    errors = []

    try:
        # 1. Créer les rôles manquants.

        for name, color in ROLES:
            try:
                _, created = await get_or_create_role(
                    guild,
                    name,
                    color
                )

                if created:
                    roles_created += 1

            except discord.HTTPException as error:
                errors.append(f"Rôle {name}: {error}")

        # 2. Préparer les permissions du staff.

        everyone = guild.default_role

        staff_overwrites = {
            everyone: discord.PermissionOverwrite(
                view_channel=False
            )
        }

        for role in guild.roles:
            if role.name in STAFF_ROLES:
                staff_overwrites[role] = (
                    discord.PermissionOverwrite(
                        view_channel=True,
                        send_messages=True,
                        read_message_history=True
                    )
                )

        # 3. Créer TOUTES les catégories avant les salons.

        categories = {}

        for category_name in STRUCTURE:

            overwrites = None

            if category_name == "ADMINISTRATION":
                overwrites = staff_overwrites

            try:
                category, created = await get_or_create_category(
                    guild,
                    category_name,
                    overwrites
                )

                categories[category_name] = category

                if created:
                    categories_created += 1

            except discord.HTTPException as error:
                errors.append(
                    f"Catégorie {category_name}: {error}"
                )

        # Si une catégorie manque, on arrête avant de créer
        # des salons avec une catégorie inexistante.

        if len(categories) != len(STRUCTURE):
            await interaction.edit_original_response(
                content=(
                    "Impossible de créer toutes les catégories. "
                    "Vérifie les permissions du bot.\n\n"
                    + "\n".join(errors[:10])
                )
            )
            return

        # 4. Conserver les salons système obligatoires Discord.

        protected_ids = set()

        system_channels = [
            (guild.rules_channel, "règlements"),
            (guild.public_updates_channel, "annonces"),
        ]

        for system_channel, new_name in system_channels:

            if system_channel is None:
                continue

            protected_ids.add(system_channel.id)

            try:
                await system_channel.edit(
                    name=new_name,
                    category=categories["INFORMATIONS"]
                )
            except discord.HTTPException as error:
                errors.append(
                    f"Salon système {system_channel.name}: {error}"
                )

        # 5. Créer tous les salons textuels.

        for category_name, channel_names in STRUCTURE.items():

            category = categories[category_name]

            for channel_name in channel_names:

                try:
                    protected_match = next(
                        (
                            c for c in guild.text_channels
                            if c.id in protected_ids
                            and normalize(c.name) == normalize(channel_name)
                        ),
                        None
                    )

                    if protected_match:
                        continue

                    _, created = await get_or_create_text(
                        guild,
                        category,
                        channel_name
                    )

                    if created:
                        channels_created += 1

                except discord.HTTPException as error:
                    errors.append(
                        f"Salon #{channel_name}: {error}"
                    )

        # 6. Créer les vocaux manquants.

        for category_name, channel_names in VOCALS.items():

            category = categories[category_name]

            for channel_name in channel_names:

                try:
                    _, created = await get_or_create_voice(
                        guild,
                        category,
                        channel_name
                    )

                    if created:
                        voices_created += 1

                except discord.HTTPException as error:
                    errors.append(
                        f"Vocal {channel_name}: {error}"
                    )

        # 7. Supprimer les anciens salons textuels non prévus.
        # Aucun vocal, rôle ou salon système ne sera supprimé.

        wanted_text = {
            normalize(name)
            for names in STRUCTURE.values()
            for name in names
        }

        for channel in list(guild.text_channels):

            if channel.id in protected_ids:
                continue

            if normalize(channel.name) in wanted_text:
                continue

            try:
                await channel.delete(
                    reason="Nettoyage de Zone Québec"
                )
                await asyncio.sleep(0.2)

            except discord.HTTPException as error:
                errors.append(
                    f"Suppression #{channel.name}: {error}"
                )

        # 8. Supprimer uniquement les anciennes catégories vides.
        # Une catégorie contenant un vocal est conservée.

        wanted_category_ids = {
            category.id for category in categories.values()
        }

        for category in list(guild.categories):

            if category.id in wanted_category_ids:
                continue

            if len(category.channels) == 0:
                try:
                    await category.delete(
                        reason="Nettoyage des anciennes catégories"
                    )
                    await asyncio.sleep(0.2)

                except discord.HTTPException as error:
                    errors.append(
                        f"Suppression catégorie {category.name}: {error}"
                    )

        # 9. Résultat final.

        result = (
            "## Zone Québec — Reconstruction terminée\n\n"
            f"**Rôles créés :** {roles_created}\n"
            f"**Catégories créées :** {categories_created}\n"
            f"**Salons textuels créés :** {channels_created}\n"
            f"**Vocaux créés :** {voices_created}\n\n"
            "Les rôles existants et les vocaux existants ont été conservés."
        )

        if errors:
            result += (
                "\n\n**Erreurs à vérifier :**\n"
                + "\n".join(f"• {e[:200]}" for e in errors[:10])
            )

        await interaction.edit_original_response(
            content=result
        )

    except discord.NotFound:
        print("L'interaction Discord n'est plus disponible.")

    except discord.Forbidden:
        await interaction.edit_original_response(
            content=(
                "Le bot n'a pas les permissions nécessaires. "
                "Vérifie Gérer les salons et Gérer les rôles."
            )
        )

    except Exception as error:
        logging.exception("Erreur durant la reconstruction")

        try:
            await interaction.edit_original_response(
                content=f"Erreur inattendue : `{error}`"
            )
        except discord.HTTPException:
            pass


# =========================
# APERÇU
# =========================

@bot.tree.command(
    name="apercu",
    description="Affiche les catégories et salons prévus."
)
@app_commands.guild_only()
async def apercu(interaction: discord.Interaction):

    if not interaction.user.guild_permissions.administrator:
        await interaction.response.send_message(
            "Commande réservée aux administrateurs.",
            ephemeral=True
        )
        return

    lines = ["## Structure de Zone Québec"]

    for category, channels in STRUCTURE.items():
        lines.append(
            f"\n**{category}**\n"
            + " • ".join(channels)
        )

    for category, channels in VOCALS.items():
        lines.append(
            f"\n**Vocaux — {category}**\n"
            + " • ".join(channels)
        )

    await interaction.response.send_message(
        "\n".join(lines),
        ephemeral=True
    )


bot.run(TOKEN)
