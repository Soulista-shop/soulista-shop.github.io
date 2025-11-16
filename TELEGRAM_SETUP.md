# Telegram Order Notifications Setup

## Overview
This system allows users to subscribe to order notifications using a secret token. When someone places an order, all subscribed users receive a notification.

## Step 1: Deploy the Database Migration

Run the migration to create the subscribers table:

```bash
supabase db push
```

Or if using Supabase CLI:
```bash
supabase migration up
```

## Step 2: Deploy the Supabase Edge Function

1. Deploy the webhook function:
```bash
supabase functions deploy telegram-webhook
```

2. Get your function URL (it will look like):
```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/telegram-webhook
```

## Step 3: Set the Telegram Webhook

Set your webhook URL using this command (replace YOUR_PROJECT_ID):

```bash
curl "https://api.telegram.org/bot8218756776:AAFp4Y---2ZIJfrgC8u43AROPFtk1PK3NoA/setWebhook?url=https://YOUR_PROJECT_ID.supabase.co/functions/v1/telegram-webhook"
```

Or open this URL in your browser:
```
https://api.telegram.org/bot8218756776:AAFp4Y---2ZIJfrgC8u43AROPFtk1PK3NoA/setWebhook?url=https://YOUR_PROJECT_ID.supabase.co/functions/v1/telegram-webhook
```

## Step 4: Subscribe to Notifications

1. Open your Telegram bot
2. Send this command (replace with your actual secret token):
```
/start soulista_secret_2024
```

3. You should receive a confirmation message: "✅ Successfully subscribed to order notifications!"

## Available Commands

- `/start SECRET_TOKEN` - Subscribe to order notifications
- `/stop` - Unsubscribe from notifications
- `/status` - Check your subscription status

## Customization

### Change the Secret Token

Edit `supabase/functions/telegram-webhook/index.ts` and change:
```typescript
const SECRET_TOKEN = "soulista_secret_2024"; // Change this
```

Then redeploy:
```bash
supabase functions deploy telegram-webhook
```

### Change Bot Token (if needed)

Update the token in both files:
- `supabase/functions/telegram-webhook/index.ts`
- `src/lib/telegram.ts`

## Testing

1. Subscribe to notifications using `/start SECRET_TOKEN`
2. Place a test order on your website
3. Check Telegram - you should receive the order details!

## Webhook URL Format

Your webhook URL will be:
```
https://YOUR_PROJECT_ID.supabase.co/functions/v1/telegram-webhook
```

Replace `YOUR_PROJECT_ID` with your actual Supabase project ID (found in your Supabase dashboard URL).

## Troubleshooting

- **Webhook not working?** Check the function logs: `supabase functions logs telegram-webhook`
- **Not receiving orders?** Make sure you're subscribed with `/start SECRET_TOKEN`
- **Database errors?** Verify the migration ran successfully
- **Function not deploying?** Make sure you're logged in: `supabase login`

## Security Notes

⚠️ **Important for Production:**
1. Change the SECRET_TOKEN to something unique
2. Consider moving tokens to environment variables
3. Keep your bot token private
4. Only share the secret token with authorized users
