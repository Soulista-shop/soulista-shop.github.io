// Vercel Serverless Function for Telegram Webhook
const TELEGRAM_BOT_TOKEN = "8218756776:AAFp4Y---2ZIJfrgC8u43AROPFtk1PK3NoA";
const SECRET_TOKEN = "soulista_secret_2024";
const SUPABASE_URL = "https://ktaaodvqxiqqtlekneqj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0YWFvZHZxeGlxcXRsZWtuZXFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMzUwMjIsImV4cCI6MjA3ODgxMTAyMn0.dawgkm2EeFa0UVp6dl-iUrppAqi2fvfGcxb3BRnvbfc";

export default async function handler(req, res) {
  // Only accept POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const update = req.body;
    console.log("Telegram update:", update);

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
      } else if (text === "/stop") {
        // Unsubscribe
        await fetch(
          `${SUPABASE_URL}/rest/v1/telegram_subscribers?chat_id=eq.${chatId}`,
          {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              "apikey": SUPABASE_KEY,
              "Authorization": `Bearer ${SUPABASE_KEY}`
            },
            body: JSON.stringify({ is_active: false })
          }
        );

        await sendTelegramMessage(
          chatId,
          "🔕 You have been unsubscribed from order notifications."
        );
      } else if (text === "/status") {
        // Check status
        const response = await fetch(
          `${SUPABASE_URL}/rest/v1/telegram_subscribers?chat_id=eq.${chatId}&select=is_active`,
          {
            headers: {
              "apikey": SUPABASE_KEY,
              "Authorization": `Bearer ${SUPABASE_KEY}`
            }
          }
        );

        const data = await response.json();

        if (data.length > 0 && data[0].is_active) {
          await sendTelegramMessage(
            chatId,
            "✅ You are currently subscribed to order notifications."
          );
        } else {
          await sendTelegramMessage(
            chatId,
            "❌ You are not subscribed to order notifications."
          );
        }
      }
    }

    return res.status(200).json({ ok: true });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({ error: error.message });
  }
}

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
