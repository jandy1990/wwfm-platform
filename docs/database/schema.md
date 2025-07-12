# WWFM Database Schema Documentation

> **Source of truth for database structure**  
> Extracted from Technical Reference, Architecture.md, and Product Roadmap  
> Last updated: December 2024

## Overview

WWFM uses Supabase (PostgreSQL) with Row Level Security (RLS) for data storage. The database follows a two-layer architecture where solutions are generic and variants handle specific implementations.

### Key Design Principles

1. **Solutions are GENERIC**: One "Vitamin D" entry serves all goals, not duplicates per goal
2. **Two-Layer Architecture**:
   - Solutions: Generic approaches (474 total as of June 2025)
   - Solution Variants: Specific versions (113 total)
3. **Effectiveness Storage**: Stored in `goal_implementation_links`, NOT in variants
4. **JSONB for Flexibility**: Form-specific data stored in `solution_fields` JSONB column
5. **Fuzzy Search Enabled**: pg_trgm extension for typo-tolerant searching

### Database Statistics (June 2025)
- Solutions: 474 (consolidated from 835)
- Variants: 113 (only 4 categories have multiple variants)
- Goal-Solution Connections: 657
- Goals: 652 across 75 categories in 13 arenas
- Categories with variants: 4 (medications, supplements_vitamins, natural_remedies, beauty_skincare)

## Core Tables

### 1. users
User profiles and contribution tracking.

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  username TEXT,
  email TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Contribution metrics
  contribution_points INTEGER DEFAULT 0,
  ratings_count INTEGER DEFAULT 0,
  solutions_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  
  -- Demographics (optional)
  age_range TEXT,
  gender TEXT,
  location TEXT,
  share_demographics BOOLEAN DEFAULT false,
  show_activity BOOLEAN DEFAULT true,
  
  -- Trust & Safety
  registration_ip TEXT,
  registration_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  captcha_score NUMERIC,
  trust_score INTEGER DEFAULT 0,
  auth_id UUID
);

-- Indexes
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_users_trust_score ON users(trust_score);
```

### 2. arenas
Top-level categorization (13 total).

```sql
CREATE TABLE arenas (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  slug TEXT UNIQUE,
  display_order INTEGER,
  order_rank INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Example data
-- Beauty & Wellness, Feeling & Emotion, Relationships, Work & Career, etc.
```

### 3. categories
Sub-categories within arenas (75 total).

```sql
CREATE TABLE categories (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  arena_id UUID REFERENCES arenas(id),
  name TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  slug TEXT UNIQUE,
  order_rank INTEGER,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_categories_arena_id ON categories(arena_id);
CREATE INDEX idx_categories_slug ON categories(slug);
```

### 4. goals
Individual user goals (652 total).

```sql
CREATE TABLE goals (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  category_id UUID REFERENCES categories(id),
  arena_id UUID REFERENCES arenas(id), -- Denormalized for performance
  title TEXT NOT NULL,
  description TEXT,
  created_by UUID REFERENCES users(id),
  is_approved BOOLEAN DEFAULT true,
  meta_tags TEXT[],
  view_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_goals_category_id ON goals(category_id);
CREATE INDEX idx_goals_arena_id ON goals(arena_id);
CREATE INDEX idx_goals_is_approved ON goals(is_approved);
```

## Solution Tables

### 5. solutions
Generic solution entries (474 total).

```sql
CREATE TABLE solutions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(200) NOT NULL,
  description TEXT,
  solution_category VARCHAR(50) NOT NULL,
  solution_model VARCHAR(20) DEFAULT 'standard',
  parent_concept VARCHAR(100),
  
  -- Legacy migration fields
  legacy_solution_id UUID,
  legacy_implementation_id UUID,
  
  -- Metadata
  search_keywords TEXT[],
  source_type VARCHAR(50) DEFAULT 'community_contributed',
  created_by UUID REFERENCES users(id),
  is_approved BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT solutions_solution_category_check 
  CHECK (solution_category IN (
    'supplements_vitamins', 'medications', 'natural_remedies', 'beauty_skincare',
    'therapists_counselors', 'doctors_specialists', 'coaches_mentors', 
    'alternative_practitioners', 'professional_services', 'medical_procedures',
    'crisis_resources', 'exercise_movement', 'meditation_mindfulness',
    'habits_routines', 'hobbies_activities', 'groups_communities',
    'support_groups', 'apps_software', 'products_devices', 'books_courses',
    'diet_nutrition', 'sleep', 'financial_products'
  ))
);

-- Indexes
CREATE INDEX idx_solutions_title_trgm ON solutions USING gin (LOWER(title) gin_trgm_ops);
CREATE INDEX idx_solutions_category ON solutions(solution_category);
CREATE INDEX idx_solutions_is_approved ON solutions(is_approved);
```

### 6. solution_variants
Specific implementations of solutions (113 total).

```sql
CREATE TABLE solution_variants (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  solution_id UUID REFERENCES solutions(id) ON DELETE CASCADE,
  variant_name VARCHAR(255) NOT NULL,
  
  -- Variant-specific data (only for 4 categories)
  amount NUMERIC,
  unit VARCHAR(50),
  form VARCHAR(100),
  
  -- Metadata
  legacy_implementation_id UUID,
  is_default BOOLEAN DEFAULT false,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_variants_solution_id ON solution_variants(solution_id);

-- Note: 19 categories use single "Standard" variant
-- Only medications, supplements_vitamins, natural_remedies, beauty_skincare have multiple
```

### 7. goal_implementation_links
The critical connection table - links goals to solution variants with effectiveness data.

```sql
CREATE TABLE goal_implementation_links (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  goal_id UUID REFERENCES goals(id),
  implementation_id UUID REFERENCES solution_variants(id), -- Links to variant, not solution!
  
  -- Effectiveness data (THIS is where ratings are aggregated)
  avg_effectiveness NUMERIC DEFAULT 0.00,
  rating_count INTEGER DEFAULT 0,
  
  -- Form-specific data storage
  solution_fields JSONB DEFAULT '{}',
  
  -- Additional context
  typical_application TEXT,
  contraindications TEXT,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_gil_goal_id ON goal_implementation_links(goal_id);
CREATE INDEX idx_gil_implementation_id ON goal_implementation_links(implementation_id);
CREATE INDEX idx_gil_effectiveness ON goal_implementation_links(avg_effectiveness DESC);

-- Example solution_fields content:
-- {
--   "cost": "$10-25/month",
--   "time_to_results": "3-4 weeks",
--   "side_effects": ["Nausea", "Headache"],
--   "frequency": "Once daily",
--   "brand_manufacturer": "Generic available"
-- }
```

## Rating & Contribution Tables

### 8. ratings
Individual user ratings (used to calculate aggregates in goal_implementation_links).

```sql
CREATE TABLE ratings (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  solution_id UUID REFERENCES solutions(id),
  implementation_id UUID REFERENCES solution_variants(id), -- Required!
  goal_id UUID REFERENCES goals(id),
  
  -- Rating data
  effectiveness_score NUMERIC NOT NULL CHECK (effectiveness_score >= 1 AND effectiveness_score <= 5),
  is_quick_rating BOOLEAN DEFAULT false,
  
  -- Optional detailed feedback
  duration_used TEXT,
  severity_before INTEGER,
  side_effects TEXT,
  completion_percentage INTEGER DEFAULT 0,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Prevent duplicate ratings
  UNIQUE(user_id, implementation_id, goal_id)
);

-- Indexes
CREATE INDEX idx_ratings_user_id ON ratings(user_id);
CREATE INDEX idx_ratings_implementation_goal ON ratings(implementation_id, goal_id);
```

### 9. user_ratings (Legacy/Alternative table)
Alternative rating structure used in some parts of the codebase.

```sql
CREATE TABLE user_ratings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  solution_id UUID REFERENCES solutions(id),
  implementation_id UUID REFERENCES solution_variants(id),
  goal_id UUID REFERENCES goals(id),
  
  effectiveness_rating INTEGER CHECK (effectiveness_rating >= 1 AND effectiveness_rating <= 5),
  is_primary BOOLEAN DEFAULT true, -- false for "didn't work" ratings
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);
```

## Auto-Categorization Tables

### 10. category_keywords
Powers the auto-categorization system with 10,000+ keywords.

```sql
CREATE TABLE category_keywords (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category VARCHAR(50) NOT NULL,
  keywords TEXT[] NOT NULL,
  patterns TEXT[], -- For regex matching
  solution_names TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_keywords_category ON category_keywords(category);

-- Example data:
-- category: 'medications'
-- keywords: ['antidepressant', 'ssri', 'zoloft', 'sertraline', 'prozac']
-- patterns: ['%azepam', '%olol', '%pril'] -- Drug suffix patterns
```

## Admin & Moderation Tables

### 11. admin_users
Admin access control (RLS disabled to prevent recursion).

```sql
CREATE TABLE admin_users (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  notes TEXT
);

-- Note: RLS is DISABLED on this table to prevent infinite recursion
```

## Database Functions

### Auto-Categorization Functions

```sql
-- 1. Check exact keyword match
CREATE OR REPLACE FUNCTION check_keyword_match(search_term TEXT)
RETURNS TABLE(category TEXT) AS $
BEGIN
  RETURN QUERY
  SELECT DISTINCT ck.category::TEXT
  FROM category_keywords ck
  WHERE search_term = ANY(ck.keywords);
END;
$ LANGUAGE plpgsql;

-- 2. Pattern matching for drug suffixes, etc.
CREATE OR REPLACE FUNCTION match_category_patterns(input_text TEXT)
RETURNS TABLE(category TEXT) AS $
BEGIN
  RETURN QUERY
  SELECT DISTINCT ck.category::TEXT
  FROM category_keywords ck
  WHERE EXISTS (
    SELECT 1 
    FROM unnest(ck.patterns) AS pattern
    WHERE input_text ILIKE pattern
  );
END;
$ LANGUAGE plpgsql;
```

### Fuzzy Search Functions

```sql
-- Enable fuzzy matching extension
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- Search solutions with fuzzy matching
CREATE OR REPLACE FUNCTION search_solutions_fuzzy(search_term TEXT)
RETURNS TABLE(
  id UUID,
  title TEXT,
  solution_category TEXT,
  description TEXT,
  match_score NUMERIC
) AS $
BEGIN
  IF LENGTH(search_term) < 3 THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT 
    s.id,
    s.title::TEXT,
    s.solution_category::TEXT,
    s.description::TEXT,
    CASE 
      WHEN LOWER(s.title) = LOWER(search_term) THEN 1.0
      WHEN LOWER(s.title) LIKE LOWER(search_term || '%') THEN 0.9
      WHEN LOWER(s.title) LIKE LOWER('%' || search_term || '%') THEN 0.8
      ELSE similarity(LOWER(s.title), LOWER(search_term))
    END::NUMERIC as match_score
  FROM solutions s
  WHERE 
    s.is_approved = true
    AND (
      LOWER(s.title) LIKE LOWER('%' || search_term || '%')
      OR similarity(LOWER(s.title), LOWER(search_term)) > 0.4
    )
  ORDER BY 
    match_score DESC,
    s.title
  LIMIT 10;
END;
$ LANGUAGE plpgsql;
```

### Rating Aggregation Functions

```sql
-- Update effectiveness after new rating
CREATE OR REPLACE FUNCTION update_goal_implementation_effectiveness()
RETURNS TRIGGER AS $
BEGIN
  UPDATE goal_implementation_links
  SET 
    avg_effectiveness = (
      SELECT AVG(effectiveness_score)
      FROM ratings
      WHERE implementation_id = NEW.implementation_id
      AND goal_id = NEW.goal_id
    ),
    rating_count = (
      SELECT COUNT(*)
      FROM ratings
      WHERE implementation_id = NEW.implementation_id
      AND goal_id = NEW.goal_id
    ),
    updated_at = NOW()
  WHERE implementation_id = NEW.implementation_id
  AND goal_id = NEW.goal_id;
  
  RETURN NEW;
END;
$ LANGUAGE plpgsql;

-- Trigger to auto-update effectiveness
CREATE TRIGGER update_effectiveness_after_rating
AFTER INSERT OR UPDATE ON ratings
FOR EACH ROW
EXECUTE FUNCTION update_goal_implementation_effectiveness();
```

## Row Level Security (RLS) Policies

### Public Access Policies

```sql
-- Enable RLS on all tables except admin_users
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE solution_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_implementation_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;

-- Public read access for approved content
CREATE POLICY "Public can view approved goals" ON goals
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Public can view approved solutions" ON solutions
  FOR SELECT USING (is_approved = true);

CREATE POLICY "Public can view all variants" ON solution_variants
  FOR SELECT USING (true);

CREATE POLICY "Public can view all goal implementations" ON goal_implementation_links
  FOR SELECT USING (true);
```

### User Contribution Policies

```sql
-- Users can create solutions
CREATE POLICY "Users can create solutions" ON solutions
  FOR INSERT WITH CHECK (auth.uid() = created_by);

-- Users can rate solutions
CREATE POLICY "Users can create ratings" ON ratings
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Users can update their own ratings
CREATE POLICY "Users can update own ratings" ON ratings
  FOR UPDATE USING (auth.uid() = user_id);

-- Users can view their own ratings
CREATE POLICY "Users can view own ratings" ON ratings
  FOR SELECT USING (auth.uid() = user_id);
```

### Admin Policies

```sql
-- Check if user is admin
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_users
    WHERE user_id = auth.uid()
  );
END;
$ LANGUAGE plpgsql SECURITY DEFINER;

-- Admins can do everything
CREATE POLICY "Admins can manage all solutions" ON solutions
  FOR ALL USING (is_admin());

CREATE POLICY "Admins can manage all ratings" ON ratings
  FOR ALL USING (is_admin());
```

## Enum Types & Constraints

### Valid Enum Values

```sql
-- Time to results (EXACT strings required)
CREATE TYPE time_to_results_enum AS ENUM (
  'Immediately',
  'Within days',
  '1-2 weeks',
  '3-4 weeks',
  '1-2 months',
  '3-6 months',
  '6+ months',
  'Still evaluating'
);

-- Cost types
CREATE TYPE cost_type_enum AS ENUM (
  'free',
  'one_time',
  'monthly',
  'per_session',
  'per_week',
  'subscription',
  'dual_cost',
  'donation',
  'startup_ongoing'
);

-- Source types
CREATE TYPE source_type_enum AS ENUM (
  'ai_foundation',
  'community_contributed'
);

-- Solution categories (23 total)
CREATE TYPE solution_category_enum AS ENUM (
  -- Things you take (4)
  'supplements_vitamins',
  'medications',
  'natural_remedies',
  'beauty_skincare',
  
  -- People you see (7)
  'therapists_counselors',
  'doctors_specialists',
  'coaches_mentors',
  'alternative_practitioners',
  'professional_services',
  'medical_procedures',
  'crisis_resources',
  
  -- Things you do (6)
  'exercise_movement',
  'meditation_mindfulness',
  'habits_routines',
  'hobbies_activities',
  'groups_communities',
  'support_groups',
  
  -- Things you use (3)
  'apps_software',
  'products_devices',
  'books_courses',
  
  -- Changes you make (2)
  'diet_nutrition',
  'sleep',
  
  -- Financial (1)
  'financial_products'
);
```

## Indexes & Performance

### Critical Indexes

```sql
-- Text search
CREATE INDEX idx_goals_title_search ON goals USING gin(to_tsvector('english', title));
CREATE INDEX idx_solutions_search ON solutions USING gin(to_tsvector('english', title || ' ' || COALESCE(description, '')));

-- Foreign keys
CREATE INDEX idx_gil_goal_variant ON goal_implementation_links(goal_id, implementation_id);
CREATE INDEX idx_ratings_all ON ratings(user_id, implementation_id, goal_id);

-- Sorting
CREATE INDEX idx_gil_effectiveness_desc ON goal_implementation_links(avg_effectiveness DESC NULLS LAST);
CREATE INDEX idx_solutions_created ON solutions(created_at DESC);
```

## Data Integrity Rules

### Business Logic Constraints

1. **Every solution must have at least one variant**
   - Even non-variant categories have a "Standard" variant
   - Enforced by application logic, not database constraints

2. **Effectiveness is stored at goal level**
   - Same solution can have different effectiveness for different goals
   - Stored in goal_implementation_links, not variants

3. **Ratings link to variants, not solutions**
   - implementation_id must be valid solution_variant.id
   - This is why the rating bug occurred - missing variant reference

4. **Categories determine form type**
   - solution_category determines which of 9 forms to use
   - Form determines which fields go in solution_fields JSONB

### Data Quality Checks

```sql
-- Check for orphaned variants
SELECT sv.* FROM solution_variants sv
LEFT JOIN solutions s ON sv.solution_id = s.id
WHERE s.id IS NULL;

-- Check for solutions without variants
SELECT s.* FROM solutions s
LEFT JOIN solution_variants sv ON sv.solution_id = s.id
WHERE sv.id IS NULL;

-- Check for goals without any solutions
SELECT g.* FROM goals g
LEFT JOIN goal_implementation_links gil ON gil.goal_id = g.id
WHERE gil.id IS NULL;

-- Check effectiveness data integrity
SELECT gil.* FROM goal_implementation_links gil
WHERE gil.avg_effectiveness > 5 OR gil.avg_effectiveness < 0;
```

## Category → Form Mappings

Each solution category maps to one of 9 form templates:

### DosageForm (4 categories)
- `supplements_vitamins`
- `medications`
- `natural_remedies`
- `beauty_skincare`

**Key Fields**: dosage amount, frequency, form, side_effects (multi-select)

### SessionForm (7 categories)
- `therapists_counselors`
- `doctors_specialists`
- `coaches_mentors`
- `alternative_practitioners`
- `professional_services`
- `medical_procedures`
- `crisis_resources`

**Key Fields**: session frequency, format (in-person/virtual), session length, insurance coverage

### PracticeForm (3 categories)
- `exercise_movement`
- `meditation_mindfulness`
- `habits_routines`

**Key Fields**: frequency, duration, location, challenges (multi-select)

### PurchaseForm (2 categories)
- `products_devices`
- `books_courses`

**Key Fields**: cost (one-time/subscription), format/type, ease of use

### AppForm (1 category)
- `apps_software`

**Key Fields**: subscription type, usage frequency, most valuable feature

### CommunityForm (2 categories)
- `groups_communities`
- `support_groups`

**Key Fields**: group size, meeting frequency, format, accessibility level

### LifestyleForm (2 categories)
- `diet_nutrition`
- `sleep`

**Key Fields**: cost impact, challenges experienced, sustainability

### HobbyForm (1 category)
- `hobbies_activities`

**Key Fields**: time to enjoyment, time commitment, startup/ongoing costs

### FinancialForm (1 category)
- `financial_products`

**Key Fields**: minimum requirements, key features, interest rate, access time

## Migration History & Notes

### June 2025 Database Migration

**Before Migration**:
- 835 "solutions" including junk like "Monthly Subscription"
- 906 implementation variants with confusing duplicates
- 3,755 goal connections

**After Migration**:
- 474 clean solutions
- 113 meaningful variants (only in 4 categories)
- 657 restored connections
- 421 "Standard" variants created for non-variant categories

**Key Changes**:
1. Consolidated duplicate solutions
2. Removed generic variants like "Free Version"
3. Created proper foreign key relationships
4. Fixed effectiveness storage location

### Migration Queries Used

```sql
-- Example: Create Standard variants for non-variant categories
INSERT INTO solution_variants (solution_id, variant_name, is_default, display_order)
SELECT 
  s.id,
  'Standard',
  true,
  0
FROM solutions s
WHERE s.solution_category NOT IN (
  'medications', 'supplements_vitamins', 
  'natural_remedies', 'beauty_skincare'
)
AND NOT EXISTS (
  SELECT 1 FROM solution_variants sv 
  WHERE sv.solution_id = s.id
);

-- Example: Fix effectiveness location
UPDATE goal_implementation_links gil
SET avg_effectiveness = (
  SELECT AVG(r.effectiveness_score)
  FROM ratings r
  WHERE r.implementation_id = gil.implementation_id
  AND r.goal_id = gil.goal_id
)
WHERE EXISTS (
  SELECT 1 FROM ratings r
  WHERE r.implementation_id = gil.implementation_id
  AND r.goal_id = gil.goal_id
);
```

## Current Database State (December 2024)

### Table Row Counts
- `users`: ~50 (test users)
- `arenas`: 13
- `categories`: 75
- `goals`: 652
- `solutions`: 529 (474 original + 55 from anxiety cluster)
- `solution_variants`: 190 (113 original + 77 new)
- `goal_implementation_links`: 1,229 (657 original + 572 from anxiety cluster)
- `ratings`: ~100 (mostly AI-seeded with rating_count = 1)
- `category_keywords`: 23 (with 10,000+ total keywords)

### Coverage Metrics
- Goals with solutions: 240/652 (37%)
- Target for launch: 80% coverage
- Categories with multiple variants: 4/23
- Average variants per solution: 1.36

## Common Queries

### Get all solutions for a goal with effectiveness

```sql
SELECT 
  s.id,
  s.title,
  s.description,
  s.solution_category,
  sv.id as variant_id,
  sv.variant_name,
  gil.avg_effectiveness,
  gil.rating_count,
  gil.solution_fields
FROM goal_implementation_links gil
JOIN solution_variants sv ON sv.id = gil.implementation_id
JOIN solutions s ON s.id = sv.solution_id
WHERE gil.goal_id = $1
AND s.is_approved = true
ORDER BY gil.avg_effectiveness DESC;
```

### Check if user has rated a solution

```sql
SELECT 
  r.id,
  r.effectiveness_score,
  r.created_at
FROM ratings r
WHERE r.user_id = $1
AND r.implementation_id = $2
AND r.goal_id = $3
LIMIT 1;
```

### Get category statistics

```sql
SELECT 
  s.solution_category,
  COUNT(DISTINCT s.id) as solution_count,
  COUNT(DISTINCT sv.id) as variant_count,
  COUNT(DISTINCT gil.id) as connection_count,
  AVG(gil.avg_effectiveness) as avg_effectiveness
FROM solutions s
LEFT JOIN solution_variants sv ON sv.solution_id = s.id
LEFT JOIN goal_implementation_links gil ON gil.implementation_id = sv.id
GROUP BY s.solution_category
ORDER BY solution_count DESC;
```

## Troubleshooting

### Common Issues

1. **Foreign key constraint errors on ratings**
   - Ensure implementation_id references a valid solution_variant.id
   - Check that variant is passed to rating component

2. **Missing effectiveness data**
   - Effectiveness is stored in goal_implementation_links, not variants
   - Run aggregation function after inserting ratings

3. **Fuzzy search not working**
   - Ensure pg_trgm extension is enabled
   - Check that search term is >= 3 characters

4. **RLS preventing access**
   - Check auth.uid() is set correctly
   - Verify user has necessary permissions
   - Admin_users table has RLS disabled

### Useful Diagnostic Queries

```sql
-- Check RLS policies for a table
SELECT * FROM pg_policies WHERE tablename = 'solutions';

-- View all foreign key constraints
SELECT
  tc.table_name, 
  kcu.column_name, 
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name 
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
  AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
  AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY';

-- Check for missing indexes
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'public'
AND n_distinct > 100
AND correlation < 0.1
ORDER BY n_distinct DESC;
```

---

**Note**: This schema documentation is the source of truth for WWFM database structure. Keep it updated as the schema evolves.
