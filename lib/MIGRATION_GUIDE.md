# Lib Folder Migration Guide

## Import Path Changes

### Database/Supabase
- OLD: `import { supabase } from '@/lib/supabase'`
- NEW: `import { supabase } from '@/lib/database/client'`

- OLD: `import { createSupabaseServerClient } from '@/lib/supabase/server'`
- NEW: `import { createServerSupabaseClient } from '@/lib/database/server'`

### Solutions
- OLD: `import { detectFromInput } from '@/lib/services/auto-categorization'`
- NEW: `import { detectFromInput } from '@/lib/solutions/categorization'`

- OLD: `import { ... } from '@/lib/services/failed-solutions'`
- NEW: `import { ... } from '@/lib/solutions/failed-solutions'`

- OLD: `import { ... } from '@/lib/services/related-goals'`
- NEW: `import { ... } from '@/lib/solutions/related-goals'`

- OLD: `import { ... } from '@/lib/goal-solutions'`
- NEW: `import { ... } from '@/lib/solutions/goal-solutions'`

### Forms
- OLD: `import { ... } from '@/lib/form-templates'`
- NEW: `import { ... } from '@/lib/forms/templates'`

### Utils
- OLD: `import { cn, debounce } from '@/lib/utils'`
- NEW: `import { cn, debounce } from '@/lib/utils'` (same, but now from index)

### Test Data
- OLD: `import { ... } from '@/lib/mock-distributions'`
- NEW: `import { ... } from '@/lib/test-data/mock-distributions'`

- OLD: `import { ... } from '@/lib/real-distributions'`
- NEW: `import { ... } from '@/lib/test-data/real-distributions'`

## New Directory Structure
```
/lib/
  /database/         # Supabase clients and database utilities
    - client.ts      # Browser client (formerly supabase.ts)
    - server.ts      # Server client (formerly supabase-server.ts)
    - debug.ts       # Debug utilities
    - index.ts       # Barrel exports
    
  /solutions/        # Solution-related business logic
    - categorization.ts
    - failed-solutions.ts
    - goal-solutions.ts
    - related-goals.ts
    - index.ts
    
  /forms/           # Form templates and validation
    - templates.ts
    - index.ts
    
  /test-data/       # Mock and test data
    - mock-distributions.ts
    - real-distributions.ts
    - index.ts
    
  /hooks/           # React hooks
    - useAutoCategorization.ts
    
  /utils/           # General utilities
    - cn.ts         # className utility
    - debounce.ts   # Debounce function
    - index.ts      # Barrel exports
```

## Files Removed
- `/lib/mockDistributions.ts` (duplicate of mock-distributions.ts)
- `/lib/utils.ts` (split into separate files)
- `/lib/services/` directory (contents moved to /solutions/)

## Next Steps
When updating components, update imports as you encounter them using the mapping above.
