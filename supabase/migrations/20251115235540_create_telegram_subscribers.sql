-- Create telegram_subscribers table
CREATE TABLE IF NOT EXISTS telegram_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id TEXT UNIQUE NOT NULL,
  username TEXT,
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_telegram_subscribers_chat_id ON telegram_subscribers(chat_id);
CREATE INDEX IF NOT EXISTS idx_telegram_subscribers_active ON telegram_subscribers(is_active) WHERE is_active = true;

-- Enable RLS
ALTER TABLE telegram_subscribers ENABLE ROW LEVEL SECURITY;

-- Create policy for service role only
CREATE POLICY "Service role can manage subscribers" ON telegram_subscribers
  FOR ALL
  USING (auth.role() = 'service_role');
