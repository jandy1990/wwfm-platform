import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/database/server'
import RetrospectiveForm from '@/components/organisms/retrospective/RetrospectiveForm'
import type { Tables } from '@/types/supabase'

// Cache for 5 minutes - retrospective forms don't change frequently
export const revalidate = 300

type RetrospectiveScheduleRow = Tables<'retrospective_schedules'>
type ScheduleWithRelations = RetrospectiveScheduleRow & {
  goals: Pick<Tables<'goals'>, 'title' | 'description'> | null
  solutions: Pick<Tables<'solutions'>, 'title'> | null
  ratings: Pick<Tables<'ratings'>, 'created_at'> | null
}

export default async function RetrospectivePage({
  params
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/auth/signin')
  }

  // Get schedule details with goal and solution info
  const { data: schedule, error } = await supabase
    .from('retrospective_schedules')
    .select(`
      *,
      goals (title, description),
      solutions (title),
      ratings (created_at)
    `)
    .eq('id', id)
    .eq('user_id', user.id)
    .single()
    .returns<ScheduleWithRelations | null>()

  if (error && error.code !== 'PGRST116') {
    console.error('Error loading retrospective schedule:', error)
  }

  if (!schedule || schedule.status !== 'pending') {
    redirect('/mailbox')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <RetrospectiveForm
        scheduleId={id}
        goalTitle={schedule.goals?.title || ''}
        solutionTitle={schedule.solutions?.title || ''}
        achievementDate={schedule.ratings?.created_at || schedule.created_at}
      />
    </div>
  )
}
