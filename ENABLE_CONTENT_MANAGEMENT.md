# How to Enable Content Management System

The content management system is ready but temporarily disabled. Here's how to enable it when you have Supabase access:

## Step 1: Run the Database Migration

**Option A: Using Supabase CLI**
```bash
supabase login
supabase link --project-ref your-project-id
supabase db push
```

**Option B: Using Supabase Dashboard**
1. Go to your Supabase project → SQL Editor
2. Run the SQL from: `supabase/migrations/20251116004331_create_content_settings.sql`

## Step 2: Enable the Content Tab in Admin

In `src/pages/Admin.tsx`, make these changes:

### Change 1: Import ContentSettings
```typescript
import { CategorySettings } from "@/components/CategorySettings";
import { MediaManager } from "@/components/MediaManager";
import { MediaPicker } from "@/components/MediaPicker";
import { ContentSettings } from "@/components/ContentSettings"; // ADD THIS LINE
```

### Change 2: Update activeTab type
```typescript
const [activeTab, setActiveTab] = useState<"products" | "orders" | "categories" | "media" | "users" | "content">("products");
// Add "content" to the type ↑
```

### Change 3: Add Content button
After the Media Library button, add:
```typescript
<Button
  variant={activeTab === "content" ? "default" : "outline"}
  onClick={() => setActiveTab("content")}
>
  Content
</Button>
```

### Change 4: Add Content tab content
After `{activeTab === "media" && <MediaManager />}`, add:
```typescript
{activeTab === "content" && <ContentSettings />}
```

## Step 3: Enable Dynamic Content in Pages

### Home.tsx
Replace the import:
```typescript
import { useContent } from "@/hooks/useContent";
```

Add the hook:
```typescript
const { getContent } = useContent();
```

Replace hardcoded text with:
```typescript
<h1 className={`${getContent('hero_slogan', 'Your Style, Your Soul', 'text-4xl md:text-5xl', 'font-didot').className} mb-6 animate-fade-in text-black`}>
  {getContent('hero_slogan', 'Your Style, Your Soul').text}
</h1>
```

### About.tsx
Same pattern - import useContent, add the hook, and replace hardcoded text.

## All Files Are Ready

All the content management files are already created and ready:
- ✅ `src/components/ContentSettings.tsx` - Admin interface
- ✅ `src/hooks/useContent.ts` - Hook to fetch content
- ✅ `src/pages/Setup.tsx` - Setup helper page
- ✅ `supabase/migrations/20251116004331_create_content_settings.sql` - Database migration

Just follow the steps above to enable it!

## Quick Copy-Paste Sections

### For Home.tsx hero section:
```typescript
<h1 className={`${getContent('hero_slogan', 'Your Style, Your Soul', 'text-4xl md:text-5xl', 'font-didot').className} mb-6 animate-fade-in text-black`}>
  {getContent('hero_slogan', 'Your Style, Your Soul').text}
</h1>
<p className={`${getContent('hero_description', 'Wear what makes you feel radiant, confident, and uniquely you, with every touch, every stitch, crafted to embrace your femininity and bring warmth, joy, and elegance to your life.', 'text-lg md:text-xl', 'font-sans').className} text-black mb-8 animate-fade-in`}>
  {getContent('hero_description', 'Wear what makes you feel radiant, confident, and uniquely you, with every touch, every stitch, crafted to embrace your femininity and bring warmth, joy, and elegance to your life.').text}
</p>
```

### For About.tsx:
```typescript
<h1 className={`${getContent('about_title', 'Our Story', 'text-4xl md:text-6xl', 'font-bold').className} mb-6`}>
  {getContent('about_title', 'Our Story').text}
</h1>
<p className={`${getContent('about_description', 'Soulista was born from a passion to create clothing that celebrates the modern woman\'s spirit', 'text-lg md:text-xl', 'font-normal').className} text-muted-foreground`}>
  {getContent('about_description', 'Soulista was born from a passion to create clothing that celebrates the modern woman\'s spirit').text}
</p>
```

That's it! Once the database table is created, just follow these steps and you'll have full content management! 🎉
