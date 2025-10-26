#!/usr/bin/env tsx

/**
 * Diagnostic test to identify API errors
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import dotenv from 'dotenv'
import path from 'path'

// Load environment variables - try multiple paths
const envPath = path.resolve(__dirname, '../../.env.local')
console.log('Loading env from:', envPath)
dotenv.config({ path: envPath })

async function diagnoseAPI() {
  console.log('🔍 DIAGNOSTIC TEST')
  console.log('='.repeat(50))
  
  // Check API key
  const apiKey = process.env.GEMINI_API_KEY
  if (!apiKey) {
    console.error('❌ No GEMINI_API_KEY found in environment')
    return
  }
  console.log(`✅ API Key found: ${apiKey.substring(0, 10)}...`)
  
  // Try a simple request
  try {
    console.log('\n📡 Testing API connection...')
    const genAI = new GoogleGenerativeAI(apiKey)
    
    // Try different models
    const models = [
      'gemini-2.5-flash-lite',
      'gemini-1.5-flash',
      'gemini-pro'
    ]
    
    for (const modelName of models) {
      console.log(`\nTesting model: ${modelName}`)
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 100,
            responseMimeType: 'application/json'
          }
        })
        
        const prompt = 'Generate 1 solution for reducing anxiety. Return JSON: [{"title": "solution name"}]'
        const result = await model.generateContent(prompt)
        const response = await result.response
        const text = response.text()
        
        console.log(`✅ ${modelName} works!`)
        console.log(`   Response: ${text.substring(0, 100)}...`)
        
        // If this model works, use it for further testing
        return modelName
        
      } catch (error: any) {
        console.log(`❌ ${modelName} failed`)
        console.log(`   Error: ${error.message}`)
        
        // Log more details if it's a 429 error
        if (error.message?.includes('429')) {
          console.log('   Rate limit details:', error.message.match(/quotaValue.*?}/)?.[0])
        }
      }
      
      // Wait between model tests
      await new Promise(resolve => setTimeout(resolve, 2000))
    }
    
  } catch (error: any) {
    console.error('\n❌ General API Error:')
    console.error(error)
  }
  
  // Check usage file
  console.log('\n📊 Checking usage tracking...')
  try {
    const usageFile = path.join(process.cwd(), '.gemini-usage.json')
    const usage = require(usageFile)
    console.log('Usage data:', usage)
  } catch (e) {
    console.log('No usage file found')
  }
}

// Run diagnostic
diagnoseAPI().catch(console.error)