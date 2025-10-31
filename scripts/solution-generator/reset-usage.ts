import { GeminiClient } from './generators/gemini-client'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

const client = new GeminiClient(process.env.GEMINI_API_KEY!)
client.resetUsage()
console.log('Gemini usage counter reset to 0 for today.')
