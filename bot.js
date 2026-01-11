const TelegramBot = require('node-telegram-bot-api');
const mc = require('minecraft-protocol');

// توكن البوت الخاص بك
const TOKEN = "8477577679:AAFnTtAnWxkzlZXEm_KZyfRB9O4skylpw2M";

// إعداد بوت تيليجرام
const tgBot = new TelegramBot(TOKEN, { polling: true });

let mcBot = null;

// أوامر تيليجرام
tgBot.onText(/\/start/, (msg) => {
  tgBot.sendMessage(msg.chat.id, "🤖 Bedrock Minecraft Bot Ready!\nCommands:\n/startserver IP PORT\n/stopserver");
});

tgBot.onText(/\/startserver (.+) (.+)/, (msg, match) => {
  const chatId = msg.chat.id;
  const ip = match[1];
  const port = parseInt(match[2]);

  if (mcBot) {
    tgBot.sendMessage(chatId, "⚠️ Bot already running!");
    return;
  }

  // إنشاء البوت Bedrock
  mcBot = mc.createClient({
    host: ip,
    port: port,
    username: "AternosBot",
    version: "1.21.131", // نسخة سيرفرك
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
