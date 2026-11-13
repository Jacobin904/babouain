
require('dotenv').config();

const {
    Client,
    GatewayIntentBits,
    EmbedBuilder,
    Events
} = require('discord.js');

const { createCanvas, loadImage } = require('canvas');

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Création de l'image avec les boutons dessinés
function createButtonImage() {
    const canvas = createCanvas(1000, 360);
    const ctx = canvas.getContext('2d');

    // Fond
    ctx.fillStyle = '#232428';
    ctx.fillRect(0, 0, 1000, 360);

    // Barre latérale
    ctx.fillStyle = '#5865F2';
    ctx.fillRect(0, 0, 8, 360);

    // Titre
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 42px Arial';
    ctx.fillText('Test des boutons', 40, 65);

    // Description
    ctx.fillStyle = '#DCDDDE';
    ctx.font = '23px Arial';
    ctx.fillText('Cliquez sur les options ci-dessous :', 40, 115);

    // Fonction de dessin des boutons
    function drawButton(x, text, color) {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.roundRect(x, 175, 285, 90, 15);
        ctx.fill();

        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'bold 25px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(text, x + 142, 230);
    }

    drawButton(40, 'Présentation', '#5865F2');
    drawButton(357, 'Paramètres', '#248046');
    drawButton(674, 'Nous contacter', '#4E5058');

    return canvas.toBuffer('image/png');
}

client.once(Events.ClientReady, (bot) => {
    console.log(`Connecté en tant que ${bot.user.tag}`);
});

client.on(Events.MessageCreate, async (message) => {
    if (message.author.bot) return;
    if (message.content !== '!test') return;

    const image = createButtonImage();

    const embed = new EmbedBuilder()
        .setColor('#5865F2')
        .setTitle('Test des boutons')
        .setDescription('Voici notre interface de démonstration.')
        .setImage('attachment://boutons.png')
        .setFooter({ text: 'Bot de test' })
        .setTimestamp();

    await message.channel.send({
        embeds: [embed],
        files: [{
            attachment: image,
            name: 'boutons.png'
        }]
    });
});

client.login(process.env.DISCORD_TOKEN);
