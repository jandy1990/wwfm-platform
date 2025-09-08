import { redirect } from 'next/navigation'
import { createServerSupabaseClient } from '@/lib/database/server'
import Mailbox from '@/components/organisms/mailbox/Mailbox'

export default async function MailboxPage() {
  const supabase = await createServerSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    redirect('/auth/signin')
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Mailbox userId={user.id} />
    </div>
  )
}