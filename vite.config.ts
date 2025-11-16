import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

const TELEGRAM_BOT_TOKEN = "8218756776:AAFp4Y---2ZIJfrgC8u43AROPFtk1PK3NoA";
const SECRET_TOKEN = "soulista_secret_2024";
const SUPABASE_URL = "https://ktaaodvqxiqqtlekneqj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0YWFvZHZxeGlxcXRsZWtuZXFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMzUwMjIsImV4cCI6MjA3ODgxMTAyMn0.dawgkm2EeFa0UVp6dl-iUrppAqi2fvfGcxb3BRnvbfc";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: "::",
    port: 8080,
    allowedHosts: [
      "32d74de4c2f4.ngrok-free.app",
      ".ngrok-free.app",
    ],
  },
  plugins: [
    react(),
    {
      name: 'telegram-webhook',
      configureServer(server) {
        server.middlewares.use('/api/telegram-webhook', async (req, res) => {
          if (req.method !== 'POST') {
            res.statusCode = 405;
            res.end(JSON.stringify({ error: 'Method not allowed' }));
            return;
          }

          let body = '';
          req.on('data', chunk => body += chunk);
          req.on('end', async () => {
            try {
              const update = JSON.parse(body);
              console.log("Telegram update:", update);

              if (update.message?.text) {
                const text = update.message.text.trim();
                const chatId = update.message.chat.id;
                const username = update.message.from.username || "Unknown";

                if (text.startsWith("/start")) {
                  const parts = text.split(" ");
                  const token = parts[1];

                  if (token === SECRET_TOKEN) {
                    // Check if already subscribed
                    const checkResponse = await fetch(
                      `${SUPABASE_URL}/rest/v1/telegram_subscribers?chat_id=eq.${chatId}`,
                      {
                        headers: {
                          "apikey": SUPABASE_KEY,
                          "Authorization": `Bearer ${SUPABASE_KEY}`
                        }
                      }
                    );

                    const existing = await checkResponse.json() as any[];
                    let supabaseResponse;

                    if (existing && existing.length > 0) {
                      // Update existing
                      supabaseResponse = await fetch(
                        `${SUPABASE_URL}/rest/v1/telegram_subscribers?chat_id=eq.${chatId}`,
                        {
                          method: "PATCH",
                          headers: {
                            "Content-Type": "application/json",
                            "apikey": SUPABASE_KEY,
                            "Authorization": `Bearer ${SUPABASE_KEY}`
                          },
                          body: JSON.stringify({
                            username: username,
                            is_active: true,
                            updated_at: new Date().toISOString()
                          })
                        }
                      );
                    } else {
                      // Insert new
                      supabaseResponse = await fetch(
                        `${SUPABASE_URL}/rest/v1/telegram_subscribers`,
                        {
                          method: "POST",
                          headers: {
                            "Content-Type": "application/json",
                            "apikey": SUPABASE_KEY,
                            "Authorization": `Bearer ${SUPABASE_KEY}`
                          },
                          body: JSON.stringify({
                            chat_id: chatId.toString(),
                            username: username,
                            is_active: true,
                            subscribed_at: new Date().toISOString()
                          })
                        }
                      );
                    }

                    if (supabaseResponse.ok) {
                      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          chat_id: chatId,
                          text: "✅ Successfully subscribed to order notifications!\n\nYou will now receive notifications when new orders are placed.",
                          parse_mode: "Markdown"
                        })
                      });
                    } else {
                      console.error("Supabase error:", await supabaseResponse.text());
                      await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                          chat_id: chatId,
                          text: "❌ Error subscribing. Please try again later."
                        })
                      });
                    }
                  } else if (token) {
                    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        chat_id: chatId,
                        text: "❌ Invalid token. Please use the correct secret token to subscribe."
                      })
                    });
                  } else {
                    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({
                        chat_id: chatId,
                        text: "👋 Welcome to Soulista Order Notifications!\n\nTo subscribe, use:\n/start YOUR_SECRET_TOKEN"
                      })
                    });
                  }
                }
              }

              res.statusCode = 200;
              res.setHeader('Content-Type', 'application/json');
              res.end(JSON.stringify({ ok: true }));
            } catch (error: any) {
              console.error("Error:", error);
              res.statusCode = 500;
              res.end(JSON.stringify({ error: error?.message || 'Unknown error' }));
            }
          });
        });
      }
    }
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
