import { redirect } from 'next/navigation'

export default function Home() {
  // Redirect to browse page as the main entry point
  redirect('/browse')
}
