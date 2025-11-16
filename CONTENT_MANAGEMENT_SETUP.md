# Content Management System Setup

## Overview
You now have a Content Management tab in the Admin panel where you can edit text, font sizes, and font styles for different sections of your website without touching code!

## Setup Steps

1. **Run the database migration:**
   ```bash
   supabase db push
   ```

2. **Access the Content tab:**
   - Go to your website admin panel: `/admin`
   - Click on the "Content" tab
   - You'll see all editable sections

## Editable Sections

- **Hero Slogan** - "Your Style, Your Soul"
- **Hero Description** - The paragraph below the slogan
- **About Page Title** - "Our Story"
- **About Page Description** - The text below "Our Story"
- **Mission Title** - "Our Mission"
- **Mission Description** - The mission statement
- **Vision Title** - "The Soulista Vision"
- **Vision Description** - The vision statement

## How to Use

For each section, you can edit:

1. **Text Content** - The actual text that appears
2. **Font Size** - Choose from predefined sizes (Small to 7XL, including responsive options)
3. **Font Style** - Choose font family and weight:
   - Sans Serif (Inter) - Modern, clean
   - Serif (Playfair Display) - Elegant, classic
   - Didot (Bodoni Moda) - Sophisticated, fashion-forward
   - Bold, Semi Bold, Medium, Normal, Light

## Font Size Options

- **Responsive sizes** (recommended): Automatically adjust for mobile/desktop
  - Example: "4XL / 5XL (Responsive)" = smaller on mobile, larger on desktop
- **Fixed sizes**: Same size on all devices

## Tips

- Use **responsive font sizes** for better mobile experience
- **Didot font** works great for headlines and slogans
- **Sans Serif** is best for body text and descriptions
- Click "Save Changes" after editing each section
- Changes appear immediately on your website

## Example Use Cases

- Change slogan for seasonal campaigns
- A/B test different descriptions
- Adjust font sizes for better readability
- Switch between elegant (Didot) and modern (Sans) styles
- Update mission/vision statements as your brand evolves

No code changes needed - just edit and save!
