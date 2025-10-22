#!/usr/bin/env tsx

import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'

dotenv.config({ path: '.env.local' })

async function testGeminiAPI() {
  try {
    console.log('Testing Gemini API...')

    if (!process.env.GEMINI_API_KEY) {
      console.error('GEMINI_API_KEY not found')
      return
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

    const prompt = `For the medication category, what percentage of patients typically experience these side effects: Nausea, Headache, Drowsiness

Respond with ONLY this JSON format:
{
  "percentages": [
    {"value": "Nausea", "percentage": 40},
    {"value": "Headache", "percentage": 35},
    {"value": "Drowsiness", "percentage": 25}
  ]
}`

    console.log('Sending test prompt...')
    const result = await model.generateContent(prompt)
    const response = result.response.text()

    console.log('Raw response:', response)

    // Try to parse JSON
    const jsonMatch = response.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      console.log('Parsed JSON:', parsed)
      console.log('✅ API working correctly!')
    } else {
      console.log('❌ No JSON found in response')
    }

  } catch (error) {
    console.error('❌ API Error:', error)
  }
}

testGeminiAPI()