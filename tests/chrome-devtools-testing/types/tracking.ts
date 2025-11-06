/**
 * Types for submission tracking and test results
 */

import type { FormTemplate, SolutionCategory } from './test-data'

// Submission record in tracking database
export interface SubmissionRecord {
  id: string // UUID
  timestamp: string // ISO timestamp
  category: SolutionCategory
  template: FormTemplate
  solutionName: string
  goalId: string

  // Database IDs captured during submission
  solutionId?: string
  variantId?: string
  ratingId?: string
  implementationId?: string

  // Verification status
  databaseVerified: boolean
  frontendVerified: boolean
  cleanedUp: boolean

  // Test metadata
  isAuthenticated: boolean
  isVariant: boolean // true if this is a specific variant (not "Standard")

  // Screenshots
  successScreenshot?: string // path to success screen screenshot
  goalPageScreenshot?: string // path to goal page with solution displayed

  // Errors (if any)
  errors?: string[]

  // Additional data
  effectiveness: number
  otherRatingsCount?: number
}

// Aggregated test statistics
export interface TestStatistics {
  totalSubmissions: number
  successfulSubmissions: number
  failedSubmissions: number

  // Coverage metrics
  templatesTestedCount: number // out of 9
  categoriesTestedCount: number // out of 23
  authenticatedTests: number
  anonymousTests: number
  variantTests: number // specific variants for 4 categories

  // Verification metrics
  databaseVerificationRate: number // percentage
  frontendVerificationRate: number // percentage
  cleanupRate: number // percentage

  // Template breakdown
  templateCoverage: Record<FormTemplate, {
    tested: boolean
    categoriesCompleted: SolutionCategory[]
    totalSubmissions: number
  }>

  // Category breakdown
  categoryCoverage: Record<SolutionCategory, {
    tested: boolean
    authenticatedTest: boolean
    anonymousTest: boolean
    variantTest: boolean // only for 4 variant categories
    submissions: string[] // submission IDs
  }>
}

// Test execution result
export interface TestExecutionResult {
  success: boolean
  submissionId?: string
  error?: string
  databaseIds?: {
    solutionId: string
    variantId: string
    ratingId: string
  }
  screenshots?: {
    success: string
    goalPage: string
  }
  verifications?: {
    database: boolean
    frontend: boolean
  }
  duration: number // milliseconds
}

// Tracking database structure
export interface TrackingDatabase {
  version: string
  lastUpdated: string
  submissions: SubmissionRecord[]
  statistics: TestStatistics
}

// Dashboard state
export interface DashboardState {
  isRunning: boolean
  currentTest?: {
    category: SolutionCategory
    template: FormTemplate
    step: string
  }
  lastUpdate: string
}
