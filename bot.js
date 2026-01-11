const TelegramBot = require('node-telegram-bot-api');
const mc = require('minecraft-protocol');

// توكن البوت الخاص بك
const TOKEN = "8477577679:AAFnTtAnWxkzlZXEm_KZyfRB9O4skylpw2M";

// إعداد بوت تيليجرام
const tgBot = new TelegramBot(TOKEN, { polling: true });

let mcBot = null;

// أمر /start
tgBot.onText(/\/start/, (msg) => {
  tgBot.sendMessage(msg.chat.id, "🤖 Bedrock Minecraft Bot Ready!\nCommands:\n/startserver IP PORT\n/stopserver");
});

// أمر /startserver مع IP و PORT (مرن)
tgBot.onText(/\/startserver (.+)/, (msg, match) => {
  const chatId = msg.chat.id;

  if (!match || !match[1]) {
    tgBot.sendMessage(chatId, "⚠️ Please provide IP and PORT like: /startserver IP PORT");
    return;
  }

  // نفصل IP و PORT من النص
  const args = match[1].trim().split(/\s+/);
  const ip = args[0];
  const port = parseInt(args[1]);

  if (!ip || !port) {
    tgBot.sendMessage(chatId, "⚠️ Invalid IP or PORT. Example: /startserver play123.aternos.me 19132");
    return;
  }

  if (mcBot) {
    tgBot.sendMessage(chatId, "⚠️ Bot already running!");
    return;
  }

  // إنشاء البوت Bedrock
  mcBot = mc.createClient({
    host: ip,
    port: port,
    username: "AternosBot",
    version: "1.21.131",
    offline: false
  });

  mcBot.on('login', () => {
    tgBot.sendMessage(chatId, "✅ Bot joined Bedrock server!");
  });

  mcBot.on('kick', (reason) => {
    tgBot.sendMessage(chatId, "❌ Kicked: " + reason);
    mcBot = null;
  });

  mcBot.on('error', (err) => {
    tgBot.sendMessage(chatId, "⚠️ Error: " + err.message);
    mcBot = null;
  });

  // Anti-AFK بسيط
  setInterval(() => {
    if (!mcBot) return;
    mcBot.write('move', { x: 0, y: 0, z: 0 });
    mcBot.write('chat', { message: "AFK" });
  }, 30000);

  tgBot.sendMessage(chatId, "🚀 Connecting Bedrock bot...");
});

// أمر /stopserver
tgBot.onText(/\/stopserver/, (msg) => {
  const chatId = msg.chat.id;
  if (!mcBot) {
    tgBot.sendMessage(chatId, "⚠️ Bot is not running");
    return;
  }
  mcBot.end(); // خروج من السيرفر
  mcBot = null;
  tgBot.sendMessage(chatId, "🛑 Bot stopped");
});
