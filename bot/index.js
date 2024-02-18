const { Client, GatewayIntentBits, Events } = require('discord.js');
const sharp = require('sharp');
const fs = require('fs');

const PICS_PATH = process.env.PICS.toString();

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
  ],
});

const ALLOWED_IDS = [
  '237643381478653962',
  '357248412061663235',
  '379211403380260864',
];

client.on(Events.ClientReady, (client) => {
  console.log(`logged in as ${client.user.username}`);
});

client.on(Events.MessageCreate, async (message) => {
  try {
    if (message.author.bot) return;
    if (!ALLOWED_IDS.includes(message.author.id)) return;
    const args = message.content.split(' ');
    if (args[0].toLowerCase() !== '!vader') return;
    if (message.partial) await message.fetch();
    if (message.reference) message = await message.fetchReference();

    if (message.attachments.size > 0) {
      // has image
      message.attachments.forEach(async (v, k) => {
        if (
          v.contentType !== 'image/jpg' &&
          v.contentType !== 'image/jpeg' &&
          v.contentType !== 'image/png'
        ) return;

        const buffer = await (await fetch(v.url)).arrayBuffer();
        const hash = Buffer.from(buffer).toString('hex').slice(-28);
        if (fs.existsSync(`${PICS_PATH}/${hash}.webp`)) return message.reply({ content: 'image already exists', allowedMentions: { repliedUser: false } });

        await sharp(buffer)
          .resize(v.width / 4, v.height / 4)
          .webp({ quality: 80 })
          .toFile(`${PICS_PATH}/${hash}.webp`);

        message.reply({ content: 'uploaded', allowedMentions: { repliedUser: false } });
      });
    } else {
      message.reply({ content: 'no attachments', allowedMentions: { repliedUser: false } });
    }

  } catch (e) {
    console.error(e);
    message.reply('There was an error :(');
  }
});

client.login(process.env.TOKEN || '');