import type { Database } from './types/supabase'

type Check = Database['public']['Tables']['user_feedback']['Insert']

const sample: Check = {
  rating: 5,
  feedback_text: 'hi',
  page_path: '/',
  page_url: 'https://example.com/'
}

// Ensure type not never
const ensureNotNever = <T>(value: T) => value

ensureNotNever<Check>(sample)
