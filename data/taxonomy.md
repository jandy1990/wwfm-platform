# WWFM Goals Taxonomy

> **Source of truth for Claude Code**  
> Last updated from "WWFM Cleaned Goals Taxonomy.md"

## Database Implementation

This taxonomy is stored in the following Supabase tables:

- **`arenas`** - Top-level categories (13 total)
  - Columns: `id`, `name`, `description`, `slug`, `icon`, `display_order`
  
- **`categories`** - Sub-categories within arenas (75 total)  
  - Columns: `id`, `arena_id`, `name`, `description`, `slug`, `icon`, `order_rank`
  - Foreign key: `arena_id` → `arenas.id`
  
- **`goals`** - Individual user goals (652 total)
  - Columns: `id`, `category_id`, `title`, `description`, `meta_tags`
  - Foreign key: `category_id` → `categories.id`

### Query Example
```sql
-- Get all goals for a category
SELECT g.*, c.name as category_name, a.name as arena_name
FROM goals g
JOIN categories c ON g.category_id = c.id
JOIN arenas a ON c.arena_id = a.id
WHERE c.slug = 'anxiety-and-worry'
ORDER BY g.title;
```

### Frontend Access
```typescript
// Using Supabase client
const { data: goals } = await supabase
  .from('goals')
  .select(`
    *,
    categories!inner (
      name,
      slug,
      arenas!inner (
        name,
        slug
      )
    )
  `)
  .eq('categories.slug', 'anxiety-and-worry');
```

---

## 🪞 Beauty & Wellness

**✨ Appearance & Skin:**
- 🎯 Clear up acne [CLEAR/REDUCE/PREVENT/MANAGE]
- ✨ Get glowing skin [ACHIEVE/DEVELOP/MAINTAIN/RESTORE]
- 🌟 Look younger [LOOK/APPEAR/FEEL/MAINTAIN]
- 🎨 Even out skin tone [EVEN/IMPROVE/BRIGHTEN/CORRECT]
- 👁️ Reduce dark circles [REDUCE/MINIMIZE/COVER/TREAT]
- 🔍 Minimize pores [MINIMIZE/REDUCE/REFINE/SHRINK]
- 🩹 Fade scars and marks [FADE/REDUCE/HEAL/MINIMIZE]
- 💧 Control oily skin [CONTROL/MANAGE/REDUCE/BALANCE]
- 🏜️ Fix dry skin [FIX/HEAL/HYDRATE/REPAIR]
- 🚫 Stop breakouts [STOP/PREVENT/REDUCE/CONTROL]

**💇 Hair & Grooming:**
- 💆 Have healthier hair [HAVE/GROW/MAINTAIN/ACHIEVE]
- ✂️ Style hair better [STYLE/MANAGE/IMPROVE/LEARN]
- 🦲 Deal