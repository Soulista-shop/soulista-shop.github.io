// Simple Express server for local Telegram webhook testing
import express from 'express';

const app = express();
const TELEGRAM_BOT_TOKEN = "8218756776:AAFp4Y---2ZIJfrgC8u43AROPFtk1PK3NoA";
const SECRET_TOKEN = "soulista_secret_2024";
const SUPABASE_URL = "https://ktaaodvqxiqqtlekneqj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0YWFvZHZxeGlxcXRsZWtuZXFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMzUwMjIsImV4cCI6MjA3ODgxMTAyMn0.dawgkm2EeFa0UVp6dl-iUrppAqi2fvfGcxb3BRnvbfc";

app.use(express.json());

app.post('/api/telegram-webhook', async (req, res) => {
  try {
    const update = req.body;
    console.log("Received update:", JSON.stringify(update, null, 2));

    if (update.message?.text) {
      const text = update.message.text.trim();
      const chatId = update.message.chat.id;
      const username = update.message.from.username || "Unknown";

      if (text.startsWith("/start")) {
        const parts = text.split(" ");
        const token = parts[1];

        if (token === SECRET_TOKEN) {
          // Save to Supabase
          const supabaseResponse = await fetch(
            `${SUPABASE_URL}/rest/v1/telegram_subscribers`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                "apikey": SUPABASE_KEY,
                "Authorization": `Bearer ${SUPABASE_KEY}`,
                "Prefer": "resolution=merge-duplicates"
              },
              body: JSON.stringify({
                chat_id: chatId.toString(),
                username: username,
                is_active: true,
                subscribed_at: new Date().toISOString()
              })
            }
          );

          if (supabaseResponse.ok) {
            await sendTelegramMessage(
              chatId,
              "✅ Successfully subscribed to order notifications!\n\nYou will now receive notifications when new orders are placed."
            );
          } else {
            console.error("Supabase error:", await supabaseResponse.text());
            await sendTelegramMessage(
              chatId,
              "❌ Error subscribing. Please try again later."
            );
          }
        } else if (token) {
          await sendTelegramMessage(
            chatId,
            "❌ Invalid token. Please use the correct secret token to subscribe."
          );
        } else {
          await sendTelegramMessage(
            chatId,
            "👋 Welcome to Soulista Order Notifications!\n\nTo subscribe, use:\n/start YOUR_SECRET_TOKEN"
          );
        }
      }
    }

    res.json({ ok: true });
  } catch (error) {
    console.error("Error:", error);
    res.status(500).json({ error: error.message });
  }
});

async function sendTelegramMessage(chatId, text) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: "Markdown"
    })
  });
}

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Telegram webhook server running on port ${PORT}`);
  console.log(`Webhook URL: http://localhost:${PORT}/api/telegram-webhook`);
});
