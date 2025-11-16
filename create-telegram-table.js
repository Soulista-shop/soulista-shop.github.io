import fetch from 'node-fetch';

const SUPABASE_URL = "https://ktaaodvqxiqqtlekneqj.supabase.co";
const SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imt0YWFvZHZxeGlxcXRsZWtuZXFqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjMyMzUwMjIsImV4cCI6MjA3ODgxMTAyMn0.dawgkm2EeFa0UVp6dl-iUrppAqi2fvfGcxb3BRnvbfc";

const sql = `
CREATE TABLE IF NOT EXISTS telegram_subscribers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  chat_id TEXT UNIQUE NOT NULL,
  username TEXT,
  is_active BOOLEAN DEFAULT true,
  subscribed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telegram_subscribers_chat_id ON telegram_subscribers(chat_id);
CREATE INDEX IF NOT EXISTS idx_telegram_subscribers_active ON telegram_subscribers(is_active) WHERE is_active = true;

ALTER TABLE telegram_subscribers ENABLE ROW LEVEL SECURITY;

CREATE POLICY IF NOT EXISTS "Service role can manage subscribers" ON telegram_subscribers
  FOR ALL
  USING (true);
`;

console.log('Creating telegram_subscribers table...');
console.log('Please run this SQL in Supabase dashboard:');
console.log('https://supabase.com/dashboard/project/ktaaodvqxiqqtlekneqj/sql/new');
console.log('\n' + sql);
