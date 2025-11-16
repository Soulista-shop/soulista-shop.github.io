const TELEGRAM_BOT_TOKEN = "8218756776:AAFp4Y---2ZIJfrgC8u43AROPFtk1PK3NoA";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface ContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export async function sendContactMessageToTelegram(messageData: ContactMessage): Promise<void> {
  try {
    // Fetch active subscribers
    const response = await fetch(
      `${SUPABASE_URL}/rest/v1/telegram_subscribers?is_active=eq.true&select=chat_id`,
      {
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
        },
      }
    );
    
    if (!response.ok) {
      console.error("Error fetching subscribers");
      return;
    }
    
    const subscribers = await response.json() as { chat_id: string }[];
    
    if (!subscribers || subscribers.length === 0) {
      console.log("No active Telegram subscribers");
      return;
    }

    // Format the message
    const message = `
📧 *NEW CONTACT MESSAGE*
━━━━━━━━━━━━━━━━━━━━

👤 *From:* ${messageData.name}
📨 *Email:* ${messageData.email}
📋 *Subject:* ${messageData.subject}

💬 *Message:*
${messageData.message}
    `.trim();

    // Send message to all subscribers
    const sendPromises = subscribers.map((subscriber) =>
      fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          chat_id: subscriber.chat_id,
          text: message,
          parse_mode: "Markdown",
        }),
      })
    );

    await Promise.allSettled(sendPromises);
    console.log(`Contact message sent to ${subscribers.length} subscriber(s)`);
  } catch (error) {
    console.error("Error sending contact message to Telegram:", error);
    // Don't throw error to prevent form submission failure
  }
}
