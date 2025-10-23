#!/usr/bin/env tsx

/**
 * Test Gemini API connectivity and functionality
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import chalk from 'chalk'
import dotenv from 'dotenv'

// Load environment variables
dotenv.config({ path: '.env.local' })

async function testGeminiAPI() {
  console.log(chalk.cyan('🔍 Testing Gemini API Configuration'))
  console.log(chalk.cyan('━'.repeat(50)))

  // Check if API key exists
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error(chalk.red('❌ GEMINI_API_KEY not found in environment'))
    console.log(chalk.yellow('Set GEMINI_API_KEY in .env.local file'))
    process.exit(1)
  }

  console.log(chalk.green('✅ API key found'))
  console.log(chalk.blue(`Key starts with: ${apiKey.substring(0, 8)}...`))

  // Initialize client
  try {
    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
    console.log(chalk.green('✅ Gemini client initialized'))

    // Test a simple API call
    console.log(chalk.yellow('\n🧪 Testing API call...'))

    const prompt = `For the medication "Ibuprofen", what percentage of patients typically experience these side effects:
Nausea, Headache, Dizziness

Respond with ONLY a JSON object:
{
  "percentages": [
    {"value": "Nausea", "percentage": 15},
    {"value": "Headache", "percentage": 10},
    {"value": "Dizziness", "percentage": 8}
  ]
}`

    const result = await model.generateContent(prompt)
    const response = result.response.text().trim()

    console.log(chalk.green('✅ API call successful!'))
    console.log(chalk.blue('Response:'))
    console.log(response)

    // Try to parse as JSON
    try {
      const jsonMatch = response.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0])
        console.log(chalk.green('✅ Response is valid JSON'))
        console.log(chalk.blue('Parsed data:'), parsed)
      } else {
        console.log(chalk.yellow('⚠️ No JSON found in response'))
      }
    } catch (parseError) {
      console.log(chalk.yellow('⚠️ Response is not valid JSON:'), parseError)
    }

    console.log(chalk.cyan('\n━'.repeat(50)))
    console.log(chalk.green('🎉 Gemini API is working correctly!'))
    console.log(chalk.blue('Ready to process solution data.'))

  } catch (error) {
    console.error(chalk.red('❌ API call failed:'), error)

    if (error instanceof Error) {
      if (error.message.includes('API_KEY_INVALID')) {
        console.log(chalk.yellow('💡 Check that your API key is valid'))
      } else if (error.message.includes('QUOTA_EXCEEDED')) {
        console.log(chalk.yellow('💡 API quota exceeded - wait or upgrade plan'))
      } else if (error.message.includes('RATE_LIMIT_EXCEEDED')) {
        console.log(chalk.yellow('💡 Rate limit exceeded - wait and retry'))
      }
    }

    process.exit(1)
  }
}

// Execute if run directly
if (require.main === module) {
  testGeminiAPI().catch(error => {
    console.error(chalk.red('Fatal error:'), error)
    process.exit(1)
  })
}