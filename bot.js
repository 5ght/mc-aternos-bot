const TelegramBot = require('node-telegram-bot-api')
const mineflayer = require('mineflayer')

const TOKEN = "8477577679:AAFnTtAnWxkzlZXEm_KZyfRB9O4skylpw2M"

let mcBot = null

const tgBot = new TelegramBot(TOKEN, { polling: true })

tgBot.onText(/\/start/, (msg) => {
  tgBot.sendMessage(msg.chat.id, "🤖 Minecraft Aternos Bot Ready!\n\nCommands:\n/startserver IP PORT\n/stopserver")
})

tgBot.onText(/\/startserver (.+) (.+)/, (msg, match) => {
  const chatId = msg.chat.id
  const ip = match[1]
  const port = parseInt(match[2])

  if (mcBot) {
    tgBot.sendMessage(chatId, "⚠️ Bot already running!")
    return
  }

  mcBot = mineflayer.createBot({
    host: ip,
    port: port,
    username: "AternosBot"
  })

  mcBot.on("login", () => {
    tgBot.sendMessage(chatId, "✅ Minecraft bot joined server!")
  })

  mcBot.on("end", () => {
    tgBot.sendMessage(chatId, "❌ Minecraft bot disconnected!")
    mcBot = null
  })

  mcBot.on("error", (err) => {
    tgBot.sendMessage(chatId, "⚠️ Error: " + err.message)
  })

  // Anti AFK system
  setInterval(() => {
    if (!mcBot) return
    mcBot.setControlState('forward', true)
    setTimeout(() => mcBot.setControlState('forward', false), 1000)
    mcBot.swingArm()
    mcBot.chat("AFK")
  }, 30000)

  tgBot.sendMessage(chatId, "🚀 Connecting Minecraft bot...")
})

tgBot.onText(/\/stopserver/, (msg) => {
  const chatId = msg.chat.id
  if (!mcBot) {
    tgBot.sendMessage(chatId, "⚠️ Bot is not running")
    return
  }
  mcBot.quit()
  mcBot = null
  tgBot.sendMessage(chatId, "🛑 Minecraft bot stopped")
})
