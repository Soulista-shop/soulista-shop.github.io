# Database Migration Guide

## Export from Old Database (qwcddnoieksbunyuotww)

### 1. Export Products
Go to: https://supabase.com/dashboard/project/qwcddnoieksbunyuotww/sql/new

```sql
-- Export products as INSERT statements
SELECT 
  'INSERT INTO products (id, name, category, price, discount_price, description, main_image, images, featured, sort_order, created_at, updated_at) VALUES (' ||
  quote_literal(id::text) || '::uuid, ' ||
  quote_literal(name) || ', ' ||
  quote_literal(category) || ', ' ||
  price || ', ' ||
  COALESCE(discount_price::text, 'NULL') || ', ' ||
  quote_literal(description) || ', ' ||
  quote_literal(main_image) || ', ' ||
  quote_literal(images::text) || '::jsonb, ' ||
  featured || ', ' ||
  sort_order || ', ' ||
  quote_literal(created_at::text) || '::timestamptz, ' ||
  quote_literal(updated_at::text) || '::timestamptz);'
FROM products
ORDER BY sort_order;
```

Copy all the INSERT statements.

### 2. Export Category Settings
```sql
SELECT 
  'INSERT INTO category_settings (id, category_name, frame_enabled, frame_image, background_image, background_opacity, background_blur, created_at, updated_at) VALUES (' ||
  quote_literal(id::text) || '::uuid, ' ||
  quote_literal(category_name) || ', ' ||
  frame_enabled || ', ' ||
  COALESCE(quote_literal(frame_image), 'NULL') || ', ' ||
  COALESCE(quote_literal(background_image), 'NULL') || ', ' ||
  background_opacity || ', ' ||
  background_blur || ', ' ||
  quote_literal(created_at::text) || '::timestamptz, ' ||
  quote_literal(updated_at::text) || '::timestamptz);'
FROM category_settings;
```

### 3. Export Gallery/Media
```sql
SELECT 
  'INSERT INTO gallery (id, url, name, size, type, created_at) VALUES (' ||
  quote_literal(id::text) || '::uuid, ' ||
  quote_literal(url) || ', ' ||
  quote_literal(name) || ', ' ||
  size || ', ' ||
  quote_literal(type) || ', ' ||
  quote_literal(created_at::text) || '::timestamptz);'
FROM gallery
ORDER BY created_at;
```

### 4. Export Orders (Optional)
```sql
SELECT 
  'INSERT INTO orders (id, customer_name, customer_email, customer_phone, customer_address, items, total_amount, payment_method, status, created_at) VALUES (' ||
  quote_literal(id::text) || '::uuid, ' ||
  quote_literal(customer_name) || ', ' ||
  quote_literal(customer_email) || ', ' ||
  quote_literal(customer_phone) || ', ' ||
  quote_literal(customer_address) || ', ' ||
  quote_literal(items::text) || '::jsonb, ' ||
  total_amount || ', ' ||
  quote_literal(payment_method) || ', ' ||
  quote_literal(status) || ', ' ||
  quote_literal(created_at::text) || '::timestamptz);'
FROM orders
ORDER BY created_at DESC;
```

## Import to New Database (ktaaodvqxiqqtlekneqj)

Go to: https://supabase.com/dashboard/project/ktaaodvqxiqqtlekneqj/sql/new

1. Paste all the INSERT statements from above
2. Click "Run" or press Ctrl+Enter
3. Check for any errors

## Alternative: Export/Import as CSV

### Export:
1. Go to old database Table Editor
2. Select table → Click "..." → "Download as CSV"

### Import:
1. Go to new database Table Editor
2. Select table → Click "..." → "Import data from CSV"
3. Upload the CSV file

## Verify Migration

After importing, run these checks in the new database:

```sql
-- Check products count
SELECT COUNT(*) as product_count FROM products;

-- Check category settings
SELECT COUNT(*) as category_count FROM category_settings;

-- Check gallery
SELECT COUNT(*) as media_count FROM gallery;

-- Check orders
SELECT COUNT(*) as order_count FROM orders;

-- List all products
SELECT id, name, category, price FROM products ORDER BY sort_order;
```

## Storage/Media Files

If you uploaded images to Supabase Storage:

1. **Old storage:** https://supabase.com/dashboard/project/qwcddnoieksbunyuotww/storage/buckets
2. **Download all files** from the bucket
3. **New storage:** https://supabase.com/dashboard/project/ktaaodvqxiqqtlekneqj/storage/buckets
4. **Create same bucket** (e.g., "media")
5. **Upload files** to new bucket
6. **Update URLs** in database if needed

## Quick Migration Script

If you want to do it programmatically, I can create a Node.js script that:
1. Connects to both databases
2. Exports all data from old
3. Imports to new
4. Verifies the migration

Let me know if you want this script!
