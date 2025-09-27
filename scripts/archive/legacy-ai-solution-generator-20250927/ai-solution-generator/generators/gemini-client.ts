/**
 * Gemini AI Client Wrapper
 * 
 * Provides a rate-limited interface to Google's Gemini API
 * with automatic retry logic and daily limit tracking.
 */

import { GoogleGenerativeAI } from '@google/generative-ai'
import chalk from 'chalk'
import fs from 'fs'
import path from 'path'

// Rate limiting configuration for Gemini 2.5 Flash-Lite (free tier)
const MAX_REQUESTS_PER_MINUTE = 15
const MAX_REQUESTS_PER_DAY = 1000
const DELAY_BETWEEN_REQUESTS = 4000 // 4 seconds ensures < 15/minute
const TRACKING_FILE_PATH = path.join(process.cwd(), '.gemini-usage.json')

interface UsageTracking {
  date: string
  requestCount: number
  lastRequestTime: number
}

export class GeminiClient {
  private genAI: GoogleGenerativeAI
  private model: any
  private lastRequestTime: number = 0
  private usage: UsageTracking

  constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey)
    
    // Using Gemini 2.5 Flash-Lite for best balance of speed and daily limits
    this.model = this.genAI.getGenerativeModel({
      model: 'gemini-2.5-flash-lite',
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 8192, // Increased for 20 solutions (was 1024)
        responseMimeType: 'application/json' // Forces JSON response
      }
    })

    // Load or initialize usage tracking
    this.usage = this.loadUsageTracking()
  }

  /**
   * Load usage tracking from file or create new
   */
  private loadUsageTracking(): UsageTracking {
    const today = new Date().toISOString().split('T')[0]
    
    try {
      if (fs.existsSync(TRACKING_FILE_PATH)) {
        const data = JSON.parse(fs.readFileSync(TRACKING_FILE_PATH, 'utf-8'))
        
        // Reset if it's a new day
        if (data.date !== today) {
          return { date: today, requestCount: 0, lastRequestTime: 0 }
        }
        
        return data
      }
    } catch (error) {
      console.log(chalk.yellow('⚠️  Could not load usage tracking, starting fresh'))
    }
    
    return { date: today, requestCount: 0, lastRequestTime: 0 }
  }

  /**
   * Save usage tracking to file
   */
  private saveUsageTracking() {
    try {
      fs.writeFileSync(TRACKING_FILE_PATH, JSON.stringify(this.usage, null, 2))
    } catch (error) {
      console.log(chalk.yellow('⚠️  Could not save usage tracking'))
    }
  }

  /**
   * Check if we've hit the daily limit
   */
  private checkDailyLimit() {
    const today = new Date().toISOString().split('T')[0]
    
    // Reset counter if it's a new day
    if (this.usage.date !== today) {
      this.usage = {
        date: today,
        requestCount: 0,
        lastRequestTime: 0
      }
      this.saveUsageTracking()
    }
    
    if (this.usage.requestCount >= MAX_REQUESTS_PER_DAY) {
      throw new Error(
        `Daily limit reached (${MAX_REQUESTS_PER_DAY} requests). ` +
        `Resume tomorrow or continue with --start-from=${this.usage.requestCount}`
      )
    }
  }

  /**
   * Apply rate limiting before making a request
   */
  private async applyRateLimit() {
    const now = Date.now()
    const timeSinceLastRequest = now - this.lastRequestTime
    
    if (timeSinceLastRequest < DELAY_BETWEEN_REQUESTS) {
      const waitTime = DELAY_BETWEEN_REQUESTS - timeSinceLastRequest
      console.log(chalk.gray(`   ⏱️  Rate limiting: waiting ${Math.round(waitTime / 1000)}s...`))
      await new Promise(resolve => setTimeout(resolve, waitTime))
    }
    
    this.lastRequestTime = Date.now()
  }

  /**
   * Generate content with automatic rate limiting and tracking
   */
  async generateContent(prompt: string): Promise<string> {
    // Check daily limit
    this.checkDailyLimit()
    
    // Apply rate limiting
    await this.applyRateLimit()
    
    try {
      // Make the API call
      const result = await this.model.generateContent(prompt)
      const response = await result.response
      const text = response.text()
      
      // Update usage tracking
      this.usage.requestCount++
      this.usage.lastRequestTime = Date.now()
      this.saveUsageTracking()
      
      // Log progress
      if (this.usage.requestCount % 10 === 0) {
        console.log(chalk.cyan(
          `   📊 Progress: ${this.usage.requestCount}/${MAX_REQUESTS_PER_DAY} requests today`
        ))
      }
      
      return text
      
    } catch (error: any) {
      // Handle specific Gemini errors
      if (error.message?.includes('429') || error.message?.includes('RATE_LIMIT')) {
        console.log(chalk.yellow('   ⚠️  Rate limit hit, waiting 60 seconds...'))
        await new Promise(resolve => setTimeout(resolve, 60000))
        return this.generateContent(prompt) // Retry
      }
      
      throw error
    }
  }

  /**
   * Get current usage statistics
   */
  getUsageStats() {
    const today = new Date().toISOString().split('T')[0]
    
    if (this.usage.date !== today) {
      return {
        requestsToday: 0,
        requestsRemaining: MAX_REQUESTS_PER_DAY,
        willCompleteIn: 'Starting fresh today'
      }
    }
    
    const remaining = MAX_REQUESTS_PER_DAY - this.usage.requestCount
    const estimatedDays = Math.ceil(2000 / MAX_REQUESTS_PER_DAY) // For 2000 solutions
    
    return {
      requestsToday: this.usage.requestCount,
      requestsRemaining: remaining,
      willCompleteIn: `${estimatedDays} days at current rate`
    }
  }

  /**
   * Reset daily usage (for testing)
   */
  resetUsage() {
    this.usage = {
      date: new Date().toISOString().split('T')[0],
      requestCount: 0,
      lastRequestTime: 0
    }
    this.saveUsageTracking()
    console.log(chalk.green('✅ Usage tracking reset'))
  }
}