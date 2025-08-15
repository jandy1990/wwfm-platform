import { createServerSupabaseClient } from '@/lib/database/server'
import { redirect } from 'next/navigation'
import { TimeTrackingDisplay } from './TimeTrackingDisplay'

export default async function TimeTrackingDashboard() {
  // Check authentication
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-gray-100">Your Time Investment</h1>
        
        {/* Client component for data display */}
        <TimeTrackingDisplay />
      </div>
    </div>
  )
}