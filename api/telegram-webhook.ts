// Netlify/Vercel Function for Telegram Webhook
import { createClient } from '@supabase/supabase-js';

const TELEGRAM_BOT_TOKEN = "8218756776:AAFp4Y---2ZIJfrgC8u43AROPFtk1PK3NoA";
const SECRET_TOKEN = "soulista_secret_2024";

const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.VITE_SUPABASE_PUBLISHABLE_KEY || "";

export default async function handler(req: any, res: any) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const update = req.body;
    console.log("Received update:", update);

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Handle /start command with token
    if (update.message?.text) {
      const text = update.message.text.trim();
      const chatId = update.message.chat.id;
      const username = update.message.from.username || "Unknown";

      if (text.startsWith("/start")) {
        const parts = text.split(" ");
        const token = parts[1];

        if (token === SECRET_TOKEN) {
          // Save chat ID to database
          const { error } = await supabase
            .from("telegram_subscribers")
            .upsert(
              {
                chat_id: chatId.toString(),
                username: username,
                is_active: true,
                subscribed_at: new Date().toISOString(),
              },
              { onConflict: "chat_id" }
            );

          if (error) {
            console.error("Database error:", error);
            await sendTelegramMessage(
              chatId,
              "❌ Error subscribing. Please try again later."
            );
          } else {
            await sendTelegramMessage(
              chatId,
              "✅ Successfully subscribed to order notifications!\n\nYou will now receive notifications when new orders are placed."
            );
          }
        } else if (parts.length > 1) {
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
        await supabase
          .from("telegram_subscribers")
          .update({ is_active: false })
          .eq("chat_id", chatId.toString());

        await sendTelegramMessage(
          chatId,
          "🔕 You have been unsubscribed from order notifications."
        );
      } else if (text === "/status") {
        // Check subscription status
        const { data } = await supabase
          .from("telegram_subscribers")
          .select("is_active")
          .eq("chat_id", chatId.toString())
          .single();

        if (data?.is_active) {
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
  } catch (error: any) {
    console.error("Error:", error);
    return res.status(500).json({ error: error.message });
  }
}

async function sendTelegramMessage(chatId: number, text: string) {
  await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: "Markdown",
    }),
  });
}
