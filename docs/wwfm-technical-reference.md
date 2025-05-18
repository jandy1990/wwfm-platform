WWFM Technical Reference
Document Type: Technical implementation details
Related Documents: Project Guide | Collaboration Guide | Current Session
Last Updated: May 18, 2025
Status: Active

This document contains the technical implementation details for the WWFM platform, including configuration information, database schema, and a decision log.

Table of Contents
1. Technical Stack Configuration
2. Database Schema
3. Pre-Launch Checklist
4. Decision Log
5. Open Design Questions
6. Third-Party Dependencies
7. Known Technical Debt
1. Technical Stack Configuration
GitHub Configuration
Repository Name: wwfm-platform
Repository Type: Private (for initial development)
Username: jandy1990
License: None initially, with "All rights reserved" copyright notice
Personal Access Token: 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 (expires June 17, 2025)
Rationale: Starting with a private repository protects intellectual property during development, with plans to potentially make it public later to align with community ownership model.
Supabase Configuration
Project Settings
Project Name: wwfm-platform
Organization Type: Personal
Region: US East (North Virginia)
Project URL: https://wqxkhxdbxdtpuvuvgirx.supabase.co
Anon Public Key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxeGtoeGRieGR0cHV2dXZnaXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MjgzMTUsImV4cCI6MjA2MzEwNDMxNX0.eBP6_TUB4Qa9KwPvEnUxrp7e7AGtOA3_Zs3CxaObPTo
Rationale: US region chosen to optimize for target market despite developer being in Australia. Personal organization type appropriate for early-stage development.
Connection Settings
Connection Type: Data API + Connection String
Rationale: Provides most flexibility, allowing both HTTP API access and direct PostgreSQL connections. Ideal for Next.js applications that might use both approaches.
Data API Configuration
Schema: Public schema for Data API
Rationale: Simplest option for development, makes all tables queryable by default without additional configuration.
Authentication Settings
Site URL: http://localhost:3000 (development environment)
Redirect URLs: http://localhost:3000/auth/callback
Email Confirmations: Enabled (using default templates)
Email Provider: Enabled (using built-in Supabase email service for development)
Phone Provider: Disabled
User Signups: Enabled
Manual Linking: Disabled
Anonymous Sign-ins: Disabled
OTP Expiry: Default (greater than 1 hour)
Rationale: Standard configuration for secure authentication with email verification. Using built-in email service for development simplicity.
Next.js Configuration
Framework: Next.js with TypeScript
Styling: Tailwind CSS
Environment Variables:
NEXT_PUBLIC_SUPABASE_URL=https://wqxkhxdbxdtpuvuvgirx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxeGtoeGRieGR0cHV2dXZnaXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MjgzMTUsImV4cCI6MjA2MzEwNDMxNX0.eBP6_TUB4Qa9KwPvEnUxrp7e7AGtOA3_Zs3CxaObPTo
Rationale: Next.js provides an excellent developer experience with built-in API routes, server-side rendering, and TypeScript support. Tailwind offers rapid UI development capabilities.
Deployment Configuration
Hosting Platform: Vercel
Production URL: wwfm-platform-6t2xbo4qg-jack-andrews-projects.vercel.app
Build Command: next build
Output Directory: .next
Install Command: npm install
Environment Variables:
NEXT_PUBLIC_SUPABASE_URL: https://wqxkhxdbxdtpuvuvgirx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndxeGtoeGRieGR0cHV2dXZnaXJ4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc1MjgzMTUsImV4cCI6MjA2MzEwNDMxNX0.eBP6_TUB4Qa9KwPvEnUxrp7e7AGtOA3_Zs3CxaObPTo
Rationale: Seamless integration with Next.js, excellent developer experience, and built-in CI/CD capabilities.
2. Database Schema
Core Entity Relationships
erDiagram
    ARENA ||--o{ CATEGORY : contains
    CATEGORY ||--o{ GOAL : contains
    GOAL ||--o{ SOLUTION : has
    SOLUTION ||--o{ RATING : receives
    SOLUTION ||--o{ COMMENT : has
    SOLUTION_TYPE ||--o{ SOLUTION : categorizes
    SOLUTION_TYPE ||--o{ ATTRIBUTE_DEFINITION : has
    ATTRIBUTE_DEFINITION ||--o{ SOLUTION_ATTRIBUTE : defines
    SOLUTION ||--o{ SOLUTION_ATTRIBUTE : has
    USER ||--o{ RATING : submits
    USER ||--o{ COMMENT : writes
    USER ||--o{ USER_SOLUTION : tracks
    USER ||--o{ GOAL : follows
    GOAL }o--o{ USER : follows
    SOLUTION }o--o{ USER : saves
Schema Definition
Users Table
sql
CREATE TABLE users (
    id UUID PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
    username TEXT UNIQUE,
    email TEXT UNIQUE,
    avatar_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Reputation/contribution tracking
    contribution_points INTEGER DEFAULT 0,
    ratings_count INTEGER DEFAULT 0,
    solutions_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    
    -- Optional demographic data
    age_range TEXT,
    gender TEXT,
    location TEXT,
    
    -- Privacy settings
    share_demographics BOOLEAN DEFAULT FALSE,
    show_activity BOOLEAN DEFAULT TRUE,
    
    -- User verification and security
    registration_ip TEXT,
    registration_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    captcha_score NUMERIC,
    trust_score INTEGER DEFAULT 0
);

-- Create index for IP lookups
CREATE INDEX idx_users_registration_ip ON users(registration_ip);
Arenas Table
sql
CREATE TABLE arenas (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    order_rank INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
Categories Table
sql
CREATE TABLE categories (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    arena_id UUID REFERENCES arenas ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    icon TEXT,
    order_rank INTEGER,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
Goals Table
sql
CREATE TABLE goals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    category_id UUID REFERENCES categories ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users ON DELETE SET NULL,
    is_approved BOOLEAN DEFAULT TRUE, -- Default to TRUE for post-moderation
    meta_tags TEXT[],
    view_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
Solution Types Table
sql
CREATE TABLE solution_types (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
Attribute Definitions Table
sql
CREATE TABLE attribute_definitions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    solution_type_id UUID REFERENCES solution_types(id),
    name TEXT NOT NULL,
    description TEXT,
    data_type TEXT NOT NULL, -- 'text', 'number', 'boolean', etc.
    unit TEXT, -- e.g., 'mg', 'minutes', 'percent'
    is_required BOOLEAN DEFAULT FALSE,
    is_system_defined BOOLEAN DEFAULT TRUE,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(solution_type_id, name)
);
Solutions Table
sql
CREATE TABLE solutions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    goal_id UUID REFERENCES goals ON DELETE CASCADE,
    solution_type_id UUID REFERENCES solution_types(id), -- New reference
    title TEXT NOT NULL,
    description TEXT,
    created_by UUID REFERENCES users ON DELETE SET NULL,
    is_approved BOOLEAN DEFAULT TRUE, -- Default to TRUE for post-moderation
    source_type TEXT, -- 'product', 'practice', 'service', etc.
    external_url TEXT,
    cost_category TEXT, -- 'free', 'low', 'medium', 'high'
    time_investment TEXT, -- 'minutes', 'hours', 'days', 'weeks'
    references TEXT[],
    completion_percentage INTEGER DEFAULT 0, -- New field for tracking data completeness
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
Solution Attributes Table
sql
CREATE TABLE solution_attributes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    solution_id UUID REFERENCES solutions(id) ON DELETE CASCADE,
    attribute_definition_id UUID REFERENCES attribute_definitions(id),
    text_value TEXT,
    numeric_value NUMERIC,
    boolean_value BOOLEAN,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(solution_id, attribute_definition_id)
);
Ratings Table
sql
CREATE TABLE ratings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    solution_id UUID REFERENCES solutions ON DELETE CASCADE,
    user_id UUID REFERENCES users ON DELETE SET NULL, -- Always track who rated
    effectiveness_score INTEGER NOT NULL CHECK (effectiveness_score BETWEEN 1 AND 5),
    duration_used TEXT,
    severity_before INTEGER CHECK (severity_before BETWEEN 1 AND 5),
    side_effects TEXT,
    completion_percentage INTEGER DEFAULT 0, -- New field for tracking data completeness
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
Comments Table
sql
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    solution_id UUID REFERENCES solutions ON DELETE CASCADE,
    user_id UUID REFERENCES users ON DELETE SET NULL,
    content TEXT NOT NULL,
    is_anonymous BOOLEAN DEFAULT FALSE, -- Option to hide identity for sensitive topics
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
User_Solutions Table (Progress Tracking)
sql
CREATE TABLE user_solutions (
    user_id UUID REFERENCES users ON DELETE CASCADE,
    solution_id UUID REFERENCES solutions ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'planning', -- 'planning', 'in_progress', 'completed', 'abandoned'
    start_date TIMESTAMP WITH TIME ZONE,
    target_end_date TIMESTAMP WITH TIME ZONE,
    actual_end_date TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (user_id, solution_id)
);
Goal_Followers Table (Many-to-Many)
sql
CREATE TABLE goal_followers (
    goal_id UUID REFERENCES goals ON DELETE CASCADE,
    user_id UUID REFERENCES users ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (goal_id, user_id)
);
Saved_Solutions Table (Many-to-Many)
sql
CREATE TABLE saved_solutions (
    solution_id UUID REFERENCES solutions ON DELETE CASCADE,
    user_id UUID REFERENCES users ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (solution_id, user_id)
);
Content_Flags Table (for Post-Moderation)
sql
CREATE TABLE content_flags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    flagged_by UUID REFERENCES users ON DELETE SET NULL,
    content_type TEXT NOT NULL, -- 'goal', 'solution', 'comment'
    content_id UUID NOT NULL,
    reason TEXT NOT NULL,
    status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'actioned', 'dismissed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
Views for Common Data Access Patterns
sql
-- View for solution effectiveness metrics
CREATE VIEW solution_effectiveness AS
SELECT 
    s.id,
    s.title,
    s.goal_id,
    COUNT(r.id) AS rating_count,
    ROUND(AVG(r.effectiveness_score), 2) AS avg_effectiveness,
    COUNT(CASE WHEN r.effectiveness_score >= 4 THEN 1 END) AS high_effectiveness_count
FROM solutions s
LEFT JOIN ratings r ON s.id = r.solution_id
GROUP BY s.id, s.title, s.goal_id;

-- View for popular goals
CREATE VIEW popular_goals AS
SELECT 
    g.id,
    g.title,
    g.category_id,
    g.view_count,
    COUNT(gf.user_id) AS follower_count,
    COUNT(s.id) AS solution_count
FROM goals g
LEFT JOIN goal_followers gf ON g.id = gf.goal_id
LEFT JOIN solutions s ON g.id = s.goal_id
GROUP BY g.id, g.title, g.category_id, g.view_count
ORDER BY g.view_count DESC;
Triggers for Automatic Reputation/Contribution Updates
sql
-- Function to increment a user's contribution points and specific counter
CREATE OR REPLACE FUNCTION increment_user_contribution()
RETURNS TRIGGER AS $$
BEGIN
    DECLARE
        completeness_score INTEGER := 0;
        base_points INTEGER;
    BEGIN
        -- Base points by contribution type
        IF TG_TABLE_NAME = 'ratings' THEN
            base_points := 2;
        ELSIF TG_TABLE_NAME = 'solutions' THEN
            base_points := 5;
        ELSIF TG_TABLE_NAME = 'comments' THEN
            base_points := 1;
        END IF;

        -- Calculate completeness score (0-100%)
        IF TG_TABLE_NAME = 'solutions' THEN
            -- Use the completion_percentage field
            completeness_score := NEW.completion_percentage;
        ELSIF TG_TABLE_NAME = 'ratings' THEN
            -- Use the completion_percentage field
            completeness_score := NEW.completion_percentage;
        END IF;

        -- Award bonus points based on completeness (up to double points for 100% complete)
        UPDATE users 
        SET contribution_points = contribution_points + base_points + (base_points * completeness_score / 100);

        -- Update counter fields as before
        IF TG_TABLE_NAME = 'ratings' THEN
            UPDATE users SET ratings_count = ratings_count + 1 WHERE id = NEW.user_id;
        ELSIF TG_TABLE_NAME = 'solutions' THEN
            UPDATE users SET solutions_count = solutions_count + 1 WHERE id = NEW.created_by;
        ELSIF TG_TABLE_NAME = 'comments' THEN
            UPDATE users SET comments_count = comments_count + 1 WHERE id = NEW.user_id;
        END IF;
        
        RETURN NEW;
    END;
END;
$$ LANGUAGE plpgsql;

-- Trigger for ratings
CREATE TRIGGER after_rating_insert
AFTER INSERT ON ratings
FOR EACH ROW
EXECUTE FUNCTION increment_user_contribution();

-- Trigger for solutions
CREATE TRIGGER after_solution_insert
AFTER INSERT ON solutions
FOR EACH ROW
EXECUTE FUNCTION increment_user_contribution();

-- Trigger for comments
CREATE TRIGGER after_comment_insert
AFTER INSERT ON comments
FOR EACH ROW
EXECUTE FUNCTION increment_user_contribution();
Function to Determine User Badge Level
sql
-- Function to get a user's badge level based on contribution points
CREATE OR REPLACE FUNCTION get_user_badge_level(user_id UUID)
RETURNS TEXT AS $$
DECLARE
    points INTEGER;
BEGIN
    SELECT contribution_points INTO points FROM users WHERE id = user_id;
    
    IF points >= 500 THEN
        RETURN 'Expert';
    ELSIF points >= 200 THEN
        RETURN 'Contributor';
    ELSIF points >= 50 THEN
        RETURN 'Regular';
    ELSE
        RETURN 'Newcomer';
    END IF;
END;
$$ LANGUAGE plpgsql;
Function to Calculate Solution Completeness
sql
-- Function to calculate the completeness percentage of a solution
CREATE OR REPLACE FUNCTION calculate_solution_completeness(solution_id UUID)
RETURNS INTEGER AS $$
DECLARE
    total_attributes INTEGER;
    filled_attributes INTEGER;
    required_attributes INTEGER;
    filled_required INTEGER;
    completeness NUMERIC;
BEGIN
    -- Get total number of attributes defined for this solution type
    SELECT COUNT(ad.id) INTO total_attributes
    FROM solutions s
    JOIN solution_types st ON s.solution_type_id = st.id
    JOIN attribute_definitions ad ON st.id = ad.solution_type_id
    WHERE s.id = solution_id;
    
    -- Get number of required attributes
    SELECT COUNT(ad.id) INTO required_attributes
    FROM solutions s
    JOIN solution_types st ON s.solution_type_id = st.id
    JOIN attribute_definitions ad ON st.id = ad.solution_type_id
    WHERE s.id = solution_id AND ad.is_required = TRUE;
    
    -- Get number of filled attributes
    SELECT COUNT(sa.id) INTO filled_attributes
    FROM solution_attributes sa
    WHERE sa.solution_id = solution_id
    AND (
        (sa.text_value IS NOT NULL AND sa.text_value != '') OR
        sa.numeric_value IS NOT NULL OR
        sa.boolean_value IS NOT NULL
    );
    
    -- Get number of filled required attributes
    SELECT COUNT(sa.id) INTO filled_required
    FROM solution_attributes sa
    JOIN attribute_definitions ad ON sa.attribute_definition_id = ad.id
    WHERE sa.solution_id = solution_id
    AND ad.is_required = TRUE
    AND (
        (sa.text_value IS NOT NULL AND sa.text_value != '') OR
        sa.numeric_value IS NOT NULL OR
        sa.boolean_value IS NOT NULL
    );
    
    -- If not all required fields are filled, completion is based on required fields only
    IF filled_required < required_attributes THEN
        completeness := (filled_required::NUMERIC / required_attributes) * 100;
    ELSE
        -- If all required fields are filled, remaining completion is based on optional fields
        IF total_attributes > required_attributes THEN
            completeness := 50 + ((filled_attributes - filled_required)::NUMERIC / 
                           (total_attributes - required_attributes)) * 50;
        ELSE
            completeness := 100; -- Only required fields exist and all are filled
        END IF;
    END IF;
    
    RETURN ROUND(completeness);
END;
$$ LANGUAGE plpgsql;
Trigger to Update Solution Completeness
sql
-- Trigger function to update solution completeness when attributes change
CREATE OR REPLACE FUNCTION update_solution_completeness()
RETURNS TRIGGER AS $$
BEGIN
    -- Update the completion_percentage field on the solution
    UPDATE solutions
    SET completion_percentage = calculate_solution_completeness(NEW.solution_id)
    WHERE id = NEW.solution_id;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update solution completeness when an attribute is added or changed
CREATE TRIGGER after_solution_attribute_change
AFTER INSERT OR UPDATE ON solution_attributes
FOR EACH ROW
EXECUTE FUNCTION update_solution_completeness();
Row Level Security Policies
sql
-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE arenas ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE solution_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE attribute_definitions ENABLE ROW LEVEL SECURITY;
ALTER TABLE solution_attributes ENABLE ROW LEVEL SECURITY;
ALTER TABLE ratings ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_followers ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_solutions ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_flags ENABLE ROW LEVEL SECURITY;

-- Users table policies
CREATE POLICY "Users can view all profiles" 
ON users FOR SELECT USING (true);

CREATE POLICY "Users can update their own profile" 
ON users FOR UPDATE USING (auth.uid() = id);

-- Arenas and Categories are read-only for normal users
CREATE POLICY "Anyone can view arenas" 
ON arenas FOR SELECT USING (true);

CREATE POLICY "Anyone can view categories" 
ON categories FOR SELECT USING (true);

-- Goals policies (post-moderation)
CREATE POLICY "Anyone can view goals" 
ON goals FOR SELECT USING (true);

CREATE POLICY "Users can create goals" 
ON goals FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own goals" 
ON goals FOR UPDATE USING (auth.uid() = created_by);

-- Solutions policies (post-moderation)
CREATE POLICY "Anyone can view solutions" 
ON solutions FOR SELECT USING (true);

CREATE POLICY "Users can create solutions" 
ON solutions FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own solutions" 
ON solutions FOR UPDATE USING (auth.uid() = created_by);

-- Solution types and attributes - visible to all
CREATE POLICY "Anyone can view solution types" 
ON solution_types FOR SELECT USING (true);

CREATE POLICY "Anyone can view attribute definitions" 
ON attribute_definitions FOR SELECT USING (true);

CREATE POLICY "Anyone can view solution attributes" 
ON solution_attributes FOR SELECT USING (true);

CREATE POLICY "Users can update attributes for their solutions" 
ON solution_attributes FOR INSERT WITH CHECK (
    EXISTS (
        SELECT 1 FROM solutions s 
        WHERE s.id = solution_id AND s.created_by = auth.uid()
    )
);

-- Ratings policies (private except to the user who created them)
CREATE POLICY "Users can view their own ratings" 
ON ratings FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own ratings" 
ON ratings FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ratings" 
ON ratings FOR UPDATE USING (auth.uid() = user_id);

-- Comments policies (public)
CREATE POLICY "Anyone can view comments" 
ON comments FOR SELECT USING (true);

CREATE POLICY "Users can create their own comments" 
ON comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own comments" 
ON comments FOR UPDATE USING (auth.uid() = user_id);

-- User solutions tracking (private)
CREATE POLICY "Users can view their tracked solutions" 
ON user_solutions FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can track solutions" 
ON user_solutions FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their tracked solutions" 
ON user_solutions FOR UPDATE USING (auth.uid() = user_id);

-- Content flags (visible to flaggers and admins)
CREATE POLICY "Users can view flags they created" 
ON content_flags FOR SELECT USING (auth.uid() = flagged_by);

CREATE POLICY "Users can create flags" 
ON content_flags FOR INSERT WITH CHECK (auth.uid() = flagged_by);
Key Schema Design Decisions
Solution Variants Handling: Implemented a flexible attribute system with solution types and contextual attributes
Data Collection Approach: Combined contextual required fields with progressive optional fields and incentivized completion
Post-moderation: Content is visible by default with flagging capabilities for community moderation
Separate Comments & Ratings: Quantitative ratings are private while qualitative comments are public
Progress Tracking: Comprehensive tracking of user's journey with solutions
Reputation System: Points scale with contribution completeness to reward detailed information
User Verification Strategy: Multi-layered approach with email verification, CAPTCHA, and registration rate limiting to prevent fake accounts and system gaming
Future Equity Model Support: Contribution tracking designed to support future equity allocation based on platform contributions
3. Pre-Launch Checklist
This section tracks items that need to be addressed before moving from development to production.

Security Enhancements
 OTP Expiry Time: Reduce from >1 hour to 30-45 minutes as per Supabase recommendation
 Set up custom SMTP server: Replace Supabase's built-in email service which has rate limits
 Configure proper CORS settings: Ensure only authorized domains can access the API
 Implement rate limiting: Protect against brute force and DoS attacks
 Audit authentication flows: Ensure all auth processes follow security best practices
 Set up proper error logging: Ensure no sensitive information is exposed in logs
 Implement reCAPTCHA: Add invisible reCAPTCHA v3 to authentication pages
 Configure IP-based rate limiting: Implement registration limits per IP address
Database Configuration
 Row-level security policies: Implement for all tables to control data access
 Database backup strategy: Configure automatic backups
 Review and optimize indexes: Ensure queries will be performant at scale
 Production database sizing: Evaluate resource needs for launch
Environment Configuration
 Update Site URL: Change from localhost to production domain
 Update Redirect URLs: Add production callback URLs
 Set up production environment variables: Create secure environment variables in Vercel
 Configure domain and SSL: Set up custom domain with proper SSL certificates
Performance & Scaling
 Enable Edge caching: Configure CDN for static assets
 Set up monitoring: Implement performance and error monitoring
 Load testing: Verify application can handle expected traffic
 Analytics setup: Implement privacy-focused analytics
Legal & Compliance
 Privacy Policy: Create and implement privacy policy
 Terms of Service: Create and implement terms of service
 Cookie Consent: Implement if applicable
 GDPR Compliance: Ensure data protection measures meet requirements
 CCPA Compliance: Ensure compliance with California regulations if applicable
Branding & Content
 Finalize product name: Confirm "WWFM" or select a different name
 Update all references: Ensure consistent branding throughout the application
 Seed initial content: Add starter goals and solutions to provide immediate value
Monitoring & Operations
 Set up log aggregation: Ensure proper visibility into application behavior
 Configure alerting: Set up notifications for critical errors or issues
 Create status page: Provide transparency about system status
 Document operational procedures: Create runbooks for common scenarios
4. Decision Log
This section documents key technical decisions, alternatives considered, and our reasoning.

Date	Decision	Alternatives	Reasoning
2025-05-18	Private GitHub repository	Public repository	Protect IP during early development while maintaining option to go public later to align with community ownership model
2025-05-18	US East region for Supabase	Australia, EU regions	US is likely the largest target market; optimizing for latency for most users despite developer being in Australia
2025-05-18	Next.js with TypeScript	React SPA, Vue.js, Angular	Built-in API routes, SSR for SEO, great DX, TypeScript for type safety, and robust ecosystem
2025-05-18	Supabase for backend	Firebase, custom Express backend	PostgreSQL for relational data, built-in auth, realtime capabilities, and developer-friendly tooling
2025-05-18	Keep WWFM as codename	Choose final name now	Flexibility to evolve the product before committing to final branding; minimizes technical debt if name changes
2025-05-18	Next.js App Router	Pages Router	More modern approach with better support for React Server Components, more efficient rendering, and future-proof architecture
2025-05-18	Standard Next.js build system	Turbopack	Opted for stability over speed improvements in development; Turbopack is still in beta and may have compatibility issues
2025-05-18	Tailwind CSS	Material UI, styled-components, Chakra UI	Utility-first approach allows for rapid development, consistent styling, and smaller bundle sizes; excellent integration with Next.js
2025-05-18	Email-based authentication	Social auth, passwordless	Starting with simplest approach; can add social providers later. Email verification provides basic security while minimizing friction
2025-05-18	TypeScript with strict type checking	JavaScript, loose TypeScript	Early investment in type safety will reduce bugs, improve documentation, and enhance developer experience as the codebase grows
2025-05-18	Post-moderation content approach	Pre-moderation, community moderation	Start with immediate content visibility to encourage contribution, with strong flagging/reporting features; based on successful approach of most social platforms
2025-05-18	Comprehensive progress tracking schema	Simple bookmarking, journal approach	Design schema to support future tracking features while starting with simple UI; avoids one-way door data migration issues
2025-05-18	Separate ratings and comments	Combined feedback model	Clear separation between quantitative data (ratings: private, aggregated) and qualitative data (comments: public, attributed)
2025-05-18	Moderate community features	Minimal social features, extensive social features	Focus on solution comments and goal following; defer advanced social features like direct messaging and user-to-user following until there's clear user demand
2025-05-18	Simple reputation system	No reputation tracking, complex badges system	Track contribution points and counts for user activities; automatically calculate badge levels; encourages engagement without complex gamification
2025-05-18	Attribute-based solution variants	Separate solutions, parent-child hierarchy, user-defined parameters	Flexible approach that handles varying attributes across solution types while keeping UI clean and providing powerful filtering capabilities
2025-05-18	Contextual + progressive data collection	Minimal required fields, incentivized data provision	Balance between gathering high-quality data and minimizing user friction; varying fields by solution type with progressive follow-ups for additional details
2025-05-18	Multi-layered user verification	Phone verification, government ID	Combination of email verification, CAPTCHA, and registration rate limiting provides strong protection against fake accounts and system gaming with minimal user friction
2025-05-18	Contribution-based equity model	Traditional investment, token model	Aligns platform incentives by enabling greater community ownership through a sliding scale of allocation based on platform contributions
5. Open Design Questions
All major design questions have been resolved. Implementation priorities will be tracked in session documents.

6. Third-Party Dependencies
This section tracks external libraries and services we depend on.

Dependency	Version	Purpose	Alternatives Considered	Rationale
Next.js	Latest	Frontend framework	Create React App, Remix	SSR, file-based routing, API routes in one package
Supabase	Latest	Backend & Auth	Firebase, Auth0 + PostgreSQL	Built-in PostgreSQL, auth, and realtime features
TypeScript	Latest	Type safety	JavaScript	Improved developer experience, catch errors early
Tailwind CSS	Latest	Styling	MUI, Styled Components, CSS Modules	Rapid development, consistent design, utility-first approach
Prisma	Latest	Database ORM	Raw SQL, Drizzle	Type-safe database access, schema migrations, great DX
Vercel	N/A	Hosting	Netlify, AWS	Seamless Next.js deployment, great DX, automatic previews
reCAPTCHA v3	Latest	Bot protection	hCaptcha, custom verification	Invisible to most users, strong bot detection, easy integration
7. Known Technical Debt
This section tracks intentional compromises made for development speed, along with plans to address them.

Item	Description	Impact	Plan to Address	Priority	Status
OTP expiry time	Using >1 hour expiry despite security recommendation	Slightly reduced security in dev environment	Address before production launch	Medium	⬜ Not Started
Built-in Supabase email	Using Supabase's email service with rate limits	Not suitable for production traffic	Set up custom SMTP before launch	High	⬜ Not Started
Public schema for all tables	Using default public schema for simplicity	Not optimal for complex permission models	Implement proper schema organization before scaling	Medium	⬜ Not Started
Document Review Log
Date	Reviewer	Changes Made	Next Review
2025-05-18	jandy1990 & Claude	Initial creation of document	End of next session
2025-05-18	jandy1990 & Claude	Combined configuration tracker and database schema	End of next session
2025-05-18	jandy1990 & Claude	Updated schema with solution variants and data collection approach	End of next session
2025-05-18	jandy1990 & Claude	Added multi-layered user verification strategy and equity model support	Before database implementation
