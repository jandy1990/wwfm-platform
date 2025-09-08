import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/database/server'
import RetrospectiveForm from '@/components/organisms/retrospective/RetrospectiveForm'

export default async function RetrospectivePage({ 
  params 
}: { 
  params: { id: string } 
}) {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/signin')
  }

  // Get schedule details with goal and solution info
  const { data: schedule } = await supabase
    .from('retrospective_schedules')
    .select(`
      *,
      goals (title, description),
      solutions (title),
      ratings (created_at)
    `)
    .eq('id', params.id)
    .eq('user_id', user.id)
    .single()

  if (!schedule || schedule.status !== 'pending') {
    redirect('/mailbox')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <RetrospectiveForm 
        scheduleId={params.id}
        goalTitle={schedule.goals?.title || ''}
        goalDescription={schedule.goals?.description || ''}
        solutionTitle={schedule.solutions?.title || ''}
        achievementDate={schedule.ratings?.created_at || schedule.created_at}
      />
    </div>
  )
}