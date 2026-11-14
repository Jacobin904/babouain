
import os
import discord
from discord import app_commands
from discord.ext import commands
from dotenv import load_dotenv

load_dotenv()
TOKEN = os.getenv("DISCORD_TOKEN")

# =========================
# CONFIGURATION DES RÔLES
# =========================

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

# =========================
# CONFIGURATION DES SALONS
# =========================

CHANNELS = {
    "INFORMATIONS": [
        "accueil",
        "règlements",
        "annonces",
        "rôles",
        "présentation"
    ],
    "COMMUNAUTÉ": [
        "général",
        "discussions",
        "questions",
        "médias",
        "memes",
        "photos-et-vidéos",
        "suggestions"
    ],
    "RENCONTRES": [
        "faire-connaissance",
        "recherche-damis",
        "rencontres",
        "présentation-personnelle",
        "recherche-de-groupe"
    ],
    "GAMING": [
        "gaming-général",
        "recherche-de-joueurs",
        "roblox",
        "minecraft",
        "fortnite",
        "gta-v",
        "autres-jeux"
    ],
    "DIVERTISSEMENT": [
        "musique",
        "vidéos",
        "sondages",
        "clips-gaming"
    ],
    "SUPPORT": [
        "assistance",
        "signalements",
        "tickets"
    ]
}

STAFF_CHANNELS = [
    "staff-chat",
    "staff-annonces",
    "logs",
    "dossiers-membres"
]

STAFF_ROLES = [
    "Fondateur",
    "Co-Fondateur",
    "Directeur",
    "Administrateur",
    "Modérateur",
    "Assistant-Modérateur",
    "Responsable Communauté",
    "Responsable Événements"
]

intents = discord.Intents.default()
bot = commands.Bot(command_prefix="!", intents=intents)


# =========================
# VÉRIFICATION ADMIN
# =========================

def is_admin(interaction):
    return interaction.user.guild_permissions.administrator


# =========================
# APERÇU
# =========================

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

    missing_roles = [
        name for name, color in ROLES
        if discord.utils.get(guild.roles, name=name) is None
    ]

    non_voice = [
        channel for channel in guild.channels
        if not isinstance(channel, discord.VoiceChannel)
    ]

    text_count = sum(
        len(channels) for channels in CHANNELS.values()
    ) + len(STAFF_CHANNELS)

    await interaction.response.send_message(
        f"**Aperçu de Zone Québec**\n\n"
        f"Salons non vocaux à supprimer : {len(non_voice)}\n"
        f"Salons vocaux à conserver : {len(guild.voice_channels)}\n"
        f"Rôles manquants à créer : {len(missing_roles)}\n"
        f"Nouveaux salons textuels : {text_count}\n\n"
        f"Aucun rôle existant ne sera supprimé.",
        ephemeral=True
    )


# =========================
# RECONSTRUCTION
# =========================

@bot.tree.command(
    name="reconstruire",
    description="Reconstruire les salons de Zone Québec."
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
            'Confirmation incorrecte. Écris JE CONFIRME.',
            ephemeral=True
        )
        return

    guild = interaction.guild

    if not guild.me.guild_permissions.manage_channels:
        await interaction.response.send_message(
            "Le bot doit avoir la permission Gérer les salons.",
            ephemeral=True
        )
        return

    if not guild.me.guild_permissions.manage_roles:
        await interaction.response.send_message(
            "Le bot doit avoir la permission Gérer les rôles.",
            ephemeral=True
        )
        return

    await interaction.response.defer(ephemeral=True)

    # 1. CRÉATION DES RÔLES MANQUANTS

    created_roles = 0

    for name, color in ROLES:

        if discord.utils.get(guild.roles, name=name) is None:

            await guild.create_role(
                name=name,
                colour=discord.Colour(color),
                reason="Configuration Zone Québec"
            )

            created_roles += 1

    # 2. SUPPRESSION DES SALONS NON VOCAUX

    deleted = 0

    channels_to_delete = [
        channel for channel in list(guild.channels)
        if not isinstance(channel, discord.VoiceChannel)
    ]

    channels_to_delete.sort(
        key=lambda channel: isinstance(
            channel, discord.CategoryChannel
        )
    )

    for channel in channels_to_delete:

        await channel.delete(
            reason="Reconstruction Zone Québec"
        )

        deleted += 1

    # 3. CRÉATION DES SALONS PUBLICS

    created_channels = 0

    for category_name, channel_names in CHANNELS.items():

        category = await guild.create_category(
            category_name
        )

        for channel_name in channel_names:

            await guild.create_text_channel(
                channel_name,
                category=category
            )

            created_channels += 1

    # 4. CATÉGORIE STAFF PRIVÉE

    overwrites = {
        guild.default_role: discord.PermissionOverwrite(
            view_channel=False
        )
    }

    for role_name in STAFF_ROLES:

        role = discord.utils.get(
            guild.roles,
            name=role_name
        )

        if role:
            overwrites[role] = discord.PermissionOverwrite(
                view_channel=True,
                send_messages=True,
                read_message_history=True
            )

    staff_category = await guild.create_category(
        "ADMINISTRATION",
        overwrites=overwrites
    )

    for channel_name in STAFF_CHANNELS:

        await guild.create_text_channel(
            channel_name,
            category=staff_category
        )

        created_channels += 1

    await interaction.followup.send(
        f"**ZONE QUÉBEC : RECONSTRUCTION TERMINÉE**\n\n"
        f"Rôles créés : {created_roles}\n"
        f"Salons supprimés : {deleted}\n"
        f"Salons créés : {created_channels}\n"
        f"Vocaux conservés : {len(guild.voice_channels)}\n"
        f"Rôles existants supprimés : 0",
        ephemeral=True
    )


# =========================
# DÉMARRAGE
# =========================

@bot.event
async def on_ready():

    await bot.tree.sync()

    print(f"Bot connecté : {bot.user}")
    print("Zone Québec est prêt !")


if not TOKEN:
    raise RuntimeError("DISCORD_TOKEN est manquant dans .env")

bot.run(TOKEN)
