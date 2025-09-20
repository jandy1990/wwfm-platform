# Database Client - Supabase Integration

## 📎 Purpose

Centralized Supabase client management for the WWFM platform. This folder provides both client-side and server-side database clients with optimized patterns for Next.js 15 App Router.

## 📁 Structure

```
lib/database/
├── README.md                  # This file
├── client.ts                  # Browser client (singleton pattern)
├── server.ts                  # Server client (cookie-aware)
├── debug.ts                   # Database debugging utilities
└── index.ts                   # Barrel exports
```

## 🔌 Usage Patterns

### Client-Side Usage (Browser)

```typescript
// For client components ('use client')
import { supabase } from '@/lib/database/client';

// Or use the factory function
import { createClient } from '@/lib/database/client';
const supabase = createClient();

// Example usage
const { data: { user } } = await supabase.auth.getUser();
```

### Server-Side Usage (RSC/Server Actions)

```typescript
// For server components and server actions
import { createServerSupabaseClient } from '@/lib/database/server';

export default async function Page() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  // ... rest of component
}
```

### Barrel Exports

```typescript
// All exports available from index
import {
  supabase,           // Client singleton
  createClient,       // Client factory
  createServerSupabaseClient  // Server factory
} from '@/lib/database';
```

## 🏗️ Implementation Details

### Client (`client.ts`)
- **Singleton Pattern**: Ensures single instance across app
- **Browser-Optimized**: Uses `createBrowserClient` from `@supabase/ssr`
- **Performance**: Reuses connection, reduces initialization overhead

### Server (`server.ts`)
- **Cookie-Aware**: Handles Next.js 15 cookie management
- **Async Pattern**: Uses `await cookies()` for latest Next.js compatibility
- **Error Handling**: Graceful cookie operation failures
- **Modern Methods**: Uses `getAll()`/`setAll()` for better performance

### Debug (`debug.ts`)
- Database connection testing
- Query debugging utilities
- Performance monitoring helpers

## 🔄 Migration Notes

This consolidates the previous `/lib/supabase/` implementation:

### Previous vs Current
```typescript
// OLD (deprecated)
import { supabase } from '@/lib/supabase';
import { createServerClient } from '@/lib/supabase/server';

// NEW (current)
import { supabase } from '@/lib/database/client';
import { createServerSupabaseClient } from '@/lib/database/server';
```

### Key Improvements
1. **Better singleton pattern** in client
2. **Newer cookie handling** in server client
3. **Consistent naming** across functions
4. **Better error handling** for server operations

## 🧪 Common Patterns

### Authentication Check
```typescript
// Server Component
import { createServerSupabaseClient } from '@/lib/database/server';

export default async function ProtectedPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect('/login');
  // ... page content
}
```

### Data Fetching
```typescript
// Server Component
const supabase = await createServerSupabaseClient();
const { data: solutions } = await supabase
  .from('solutions')
  .select('*')
  .eq('is_approved', true);
```

### Client-Side Interactivity
```typescript
// Client Component
'use client';
import { supabase } from '@/lib/database/client';

export function InteractiveComponent() {
  const handleSubmit = async () => {
    const { data, error } = await supabase
      .from('ratings')
      .insert({ ... });
  };
}
```

## ⚠️ Important Notes

### Environment Variables Required
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### RLS (Row Level Security)
All tables have RLS enabled. Ensure policies are configured for:
- Public read access for approved content
- Authenticated user operations
- Admin-only sensitive operations

### Error Handling
Both clients include error handling for:
- Network failures
- Authentication errors
- Cookie operation failures (server)
- Rate limiting

## 🔮 Future Improvements

- Connection pooling optimization
- Query caching layer
- Performance monitoring integration
- Type-safe query builders