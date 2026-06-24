const {
    Client,
    GatewayIntentBits,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ModalBuilder,
    TextInputBuilder,
    TextInputStyle,
    Events,
    EmbedBuilder
} = require('discord.js');

const fs = require('fs');

const client = new Client({
    intents: [GatewayIntentBits.Guilds]
});

// 💰 TU TARIFA
const ROBUX_PER_MXN = 10;

// 📌 ID DEL CANAL DONDE QUIERES EL EMBED
const CHANNEL_ID = '1519282552144138291';

// 💾 cargar datos guardados
let data = {};
try {
    data = JSON.parse(fs.readFileSync('./data.json', 'utf8'));
} catch {
    data = {};
}

client.once('ready', async () => {
    console.log(`✅ Logueado como ${client.user.tag}`);

    const channel = await client.channels.fetch(CHANNEL_ID);
    if (!channel) return console.log("❌ No encontré el canal");

    const embed = new EmbedBuilder()
        .setTitle("Calculadora de Robux")
        .setDescription("Aqui puedes calcular cuantos robux puedes comprar con tu dinero!\n\nNuestra tarifa: 10 Robux = 1 MXN\n\nPresiona el botón para calcular.")
        .setColor(0x00AEFF);

    const button = new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId('calcular')
            .setLabel('Calcular Robux')
            .setStyle(ButtonStyle.Primary)
    );

    // 🟢 SI YA EXISTE EL MENSAJE
    if (data.messageId) {
        try {
            await channel.messages.fetch(data.messageId);
            console.log("ℹ️ Embed ya existe, no se crea otro");
            return;
        } catch {
            console.log("⚠️ Mensaje no encontrado, creando uno nuevo...");
        }
    }

    // 🟢 CREAR MENSAJE NUEVO
    const msg = await channel.send({
        embeds: [embed],
        components: [button]
    });

    // 💾 guardar ID
    data.messageId = msg.id;
    fs.writeFileSync('./data.json', JSON.stringify(data, null, 2));
});

client.on(Events.InteractionCreate, async interaction => {

    // 🟦 BOTÓN
    if (interaction.isButton() && interaction.customId === 'calcular') {

        const modal = new ModalBuilder()
            .setCustomId('robux_modal')
            .setTitle('Calculadora de Robux');

        const input = new TextInputBuilder()
            .setCustomId('dinero')
            .setLabel('Cantidad en MXN')
            .setStyle(TextInputStyle.Short)
            .setPlaceholder('Escribe solo el numero ej: 150')
            .setRequired(true);

        const row = new ActionRowBuilder().addComponents(input);
        modal.addComponents(row);

        await interaction.showModal(modal);
    }

    // 🧮 MODAL
    if (interaction.isModalSubmit() && interaction.customId === 'robux_modal') {

        const dinero = parseFloat(interaction.fields.getTextInputValue('dinero'));

        if (isNaN(dinero)) {
            return interaction.reply({
                content: "❌ Ingresa un número válido",
                ephemeral: true
            });
        }

        const robux = Math.floor(dinero * ROBUX_PER_MXN);

        await interaction.reply({
            content: `💰 **Con ${dinero} MXN te alcanza para = ${robux} Robux!**`,
            ephemeral: true
        });
    }
});

client.login(process.env.TOKEN);
