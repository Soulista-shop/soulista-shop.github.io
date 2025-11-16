const TELEGRAM_BOT_TOKEN = "8218756776:AAFp4Y---2ZIJfrgC8u43AROPFtk1PK3NoA";
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

interface OrderItem {
  id: string | number;
  name: string;
  price: number;
  quantity: number;
}

interface OrderData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_address: string;
  items: OrderItem[];
  total_amount: number;
}

interface TelegramSubscriber {
  chat_id: string;
}

export async function sendOrderToTelegram(orderData: OrderData): Promise<void> {
  try {
    // Fetch active subscribers directly using REST API
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
    
    const subscribers = await response.json() as TelegramSubscriber[];
    
    if (!subscribers || subscribers.length === 0) {
      console.log("No active Telegram subscribers");
      return;
    }

    // Format the order message
    const itemsList = orderData.items
      .map(
        (item) =>
          `• ${item.name}\n  Quantity: ${item.quantity}\n  Price: ${item.price} LE\n  Subtotal: ${item.price * item.quantity} LE`
      )
      .join("\n\n");

    const message = `
🛍️ *NEW ORDER RECEIVED*

👤 *Customer Information:*
Name: ${orderData.customer_name}
Email: ${orderData.customer_email}
Phone: ${orderData.customer_phone}
Address: ${orderData.customer_address}

📦 *Order Items:*
${itemsList}

💰 *Total Amount: ${orderData.total_amount.toFixed(2)} LE*

Payment Method: Cash on Delivery
Status: Pending
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
    console.log(`Order notification sent to ${subscribers.length} subscriber(s)`);
  } catch (error) {
    console.error("Error sending order to Telegram:", error);
    // Don't throw error to prevent order placement failure
  }
}
