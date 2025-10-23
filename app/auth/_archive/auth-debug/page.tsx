// app/auth-debug/page.tsx
import { createServerSupabaseClient } from '@/lib/database/server'
import { cookies } from 'next/headers'

export default async function AuthDebugPage() {
  const supabase = await createServerSupabaseClient()
  
  // Get session
  const { data: { session }, error } = await supabase.auth.getSession()
  
  // Get cookies directly
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  const authCookie = allCookies.find(c => c.name.includes('auth-token'))
  
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Auth Debug Info</h1>
      
      <div className="space-y-4">
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Session Status:</h2>
          {session ? (
            <>
              <p className="text-green-600">✅ Session found</p>
              <p>Email: {session.user.email}</p>
              <p>User ID: {session.user.id}</p>
            </>
          ) : (
            <>
              <p className="text-red-600">❌ No session</p>
              {error && <p>Error: {error.message}</p>}
            </>
          )}
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">Auth Cookie:</h2>
          {authCookie ? (
            <>
              <p className="text-green-600">✅ Auth cookie found</p>
              <p className="text-xs">Name: {authCookie.name}</p>
            </>
          ) : (
            <p className="text-red-600">❌ No auth cookie found</p>
          )}
        </div>
        
        <div className="bg-gray-100 p-4 rounded">
          <h2 className="font-bold mb-2">All Cookies ({allCookies.length}):</h2>
          <ul className="text-xs">
            {allCookies.map(cookie => (
              <li key={cookie.name}>{cookie.name}</li>
            ))}
          </ul>
        </div>
      </div>
      
      <div className="mt-8 space-x-4">
        <a href="/auth/signin" className="text-purple-600 underline">Sign In</a>
        <a href="/browse" className="text-purple-600 underline">Browse</a>
      </div>
    </div>
  )
}