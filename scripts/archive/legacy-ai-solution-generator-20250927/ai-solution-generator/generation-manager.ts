/**
 * Generation Manager
 * 
 * Intelligently manages which goals to generate solutions for
 * based on current coverage and strategy
 */

import { SupabaseClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import chalk from 'chalk'

export type GenerationStrategy = 
  | 'breadth_first'  // All goals get minimum solutions first
  | 'depth_first'    // Complete goals fully before moving on
  | 'arena_based'    // Complete arenas systematically
  | 'priority_based' // High-traffic goals first
  | 'random'         // Random selection (testing)

export interface GenerationConfig {
  strategy: GenerationStrategy
  minSolutionsPerGoal: number
  targetSolutionsPerGoal: number
  maxSolutionsPerGoal: number
  priorityArenas?: string[]
  resumeFromFailures: boolean
}

export interface GoalCoverage {
  goalId: string
  title: string
  arena: string
  currentSolutionCount: number
  aiGeneratedCount: number
  userGeneratedCount: number
  lastGenerationAttempt?: Date
  lastGenerationStatus?: 'success' | 'failed' | 'partial'
  priority?: number
}

export interface GenerationProgress {
  totalGoals: number
  goalsWithNoSolutions: number
  goalsWithMinimumSolutions: number
  goalsWithTargetSolutions: number
  goalsFullyComplete: number
  totalSolutionsGenerated: number
  lastUpdated: Date
}

const PROGRESS_FILE = path.join(process.cwd(), '.generation-progress.json')
const CONFIG_FILE = path.join(process.cwd(), 'generation-config.json')

export class GenerationManager {
  private supabase: SupabaseClient
  private config: GenerationConfig
  private progress: GenerationProgress | null = null
  
  constructor(supabase: SupabaseClient) {
    this.supabase = supabase
    this.config = this.loadConfig()
  }
  
  /**
   * Load or create configuration
   */
  private loadConfig(): GenerationConfig {
    const defaultConfig: GenerationConfig = {
      strategy: 'breadth_first',
      minSolutionsPerGoal: 5,
      targetSolutionsPerGoal: 10,
      maxSolutionsPerGoal: 20,
      resumeFromFailures: true
    }
    
    if (fs.existsSync(CONFIG_FILE)) {
      try {
        const saved = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'))
        return { ...defaultConfig, ...saved }
      } catch (e) {
        console.log(chalk.yellow('⚠️  Invalid config file, using defaults'))
      }
    }
    
    // Save default config
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2))
    return defaultConfig
  }
  
  /**
   * Get current coverage statistics from database
   */
  async getCurrentCoverage(): Promise<GoalCoverage[]> {
    const { data, error } = await this.supabase
      .from('goals')
      .select(`
        id,
        title,
        arenas!inner(name),
        goal_implementation_links(
          id,
          solution_variants!inner(
            solutions!inner(
              source_type
            )
          )
        )
      `)
      .order('title')
    
    if (error) throw error
    
    return data.map(goal => {
      const links = goal.goal_implementation_links || []
      const aiCount = links.filter(l => 
        l.solution_variants?.solutions?.source_type === 'ai_foundation'
      ).length
      const userCount = links.filter(l => 
        l.solution_variants?.solutions?.source_type === 'user'
      ).length
      
      return {
        goalId: goal.id,
        title: goal.title,
        arena: goal.arenas?.name || 'Unknown',
        currentSolutionCount: links.length,
        aiGeneratedCount: aiCount,
        userGeneratedCount: userCount
      }
    })
  }
  
  /**
   * Determine which goals to generate next based on strategy
   */
  async selectGoalsForGeneration(limit: number = 10): Promise<GoalCoverage[]> {
    const coverage = await this.getCurrentCoverage()
    
    switch (this.config.strategy) {
      case 'breadth_first':
        return this.selectBreadthFirst(coverage, limit)
      
      case 'depth_first':
        return this.selectDepthFirst(coverage, limit)
      
      case 'arena_based':
        return this.selectArenaBaseed(coverage, limit)
      
      case 'priority_based':
        return this.selectPriorityBased(coverage, limit)
      
      case 'random':
        return this.selectRandom(coverage, limit)
      
      default:
        return this.selectBreadthFirst(coverage, limit)
    }
  }
  
  /**
   * Breadth-first: Prioritize goals with no/few solutions
   */
  private selectBreadthFirst(coverage: GoalCoverage[], limit: number): GoalCoverage[] {
    return coverage
      .filter(g => g.currentSolutionCount < this.config.minSolutionsPerGoal)
      .sort((a, b) => a.currentSolutionCount - b.currentSolutionCount)
      .slice(0, limit)
  }
  
  /**
   * Depth-first: Complete goals to target before moving on
   */
  private selectDepthFirst(coverage: GoalCoverage[], limit: number): GoalCoverage[] {
    return coverage
      .filter(g => 
        g.currentSolutionCount > 0 && 
        g.currentSolutionCount < this.config.targetSolutionsPerGoal
      )
      .sort((a, b) => b.currentSolutionCount - a.currentSolutionCount)
      .slice(0, limit)
  }
  
  /**
   * Arena-based: Complete one arena at a time
   */
  private selectArenaBaseed(coverage: GoalCoverage[], limit: number): GoalCoverage[] {
    // Group by arena
    const arenaGroups = coverage.reduce((acc, goal) => {
      if (!acc[goal.arena]) acc[goal.arena] = []
      acc[goal.arena].push(goal)
      return acc
    }, {} as Record<string, GoalCoverage[]>)
    
    // Find first incomplete arena
    for (const arena of this.config.priorityArenas || Object.keys(arenaGroups).sort()) {
      const incomplete = arenaGroups[arena]?.filter(g => 
        g.currentSolutionCount < this.config.minSolutionsPerGoal
      )
      
      if (incomplete && incomplete.length > 0) {
        return incomplete.slice(0, limit)
      }
    }
    
    return []
  }
  
  /**
   * Priority-based: Use custom priority scores
   */
  private selectPriorityBased(coverage: GoalCoverage[], limit: number): GoalCoverage[] {
    // Priority factors:
    // - Mental Health arena gets 2x weight
    // - Goals with 0 solutions get 3x weight
    // - Goals with some user solutions get 1.5x weight (proven interest)
    
    const prioritized = coverage.map(goal => {
      let priority = 1
      
      // Arena weights
      if (goal.arena === 'Mental Health') priority *= 2
      if (goal.arena === 'Physical Health') priority *= 1.5
      
      // Coverage weights
      if (goal.currentSolutionCount === 0) priority *= 3
      else if (goal.currentSolutionCount < 3) priority *= 2
      
      // User interest signal
      if (goal.userGeneratedCount > 0) priority *= 1.5
      
      return { ...goal, priority }
    })
    
    return prioritized
      .filter(g => g.currentSolutionCount < this.config.targetSolutionsPerGoal)
      .sort((a, b) => b.priority! - a.priority!)
      .slice(0, limit)
  }
  
  /**
   * Random selection for testing
   */
  private selectRandom(coverage: GoalCoverage[], limit: number): GoalCoverage[] {
    const eligible = coverage.filter(g => 
      g.currentSolutionCount < this.config.maxSolutionsPerGoal
    )
    
    const shuffled = [...eligible].sort(() => Math.random() - 0.5)
    return shuffled.slice(0, limit)
  }
  
  /**
   * Update progress tracking
   */
  async updateProgress(): Promise<GenerationProgress> {
    const coverage = await this.getCurrentCoverage()
    
    const progress: GenerationProgress = {
      totalGoals: coverage.length,
      goalsWithNoSolutions: coverage.filter(g => g.currentSolutionCount === 0).length,
      goalsWithMinimumSolutions: coverage.filter(g => 
        g.currentSolutionCount >= this.config.minSolutionsPerGoal
      ).length,
      goalsWithTargetSolutions: coverage.filter(g => 
        g.currentSolutionCount >= this.config.targetSolutionsPerGoal
      ).length,
      goalsFullyComplete: coverage.filter(g => 
        g.currentSolutionCount >= this.config.maxSolutionsPerGoal
      ).length,
      totalSolutionsGenerated: coverage.reduce((sum, g) => sum + g.aiGeneratedCount, 0),
      lastUpdated: new Date()
    }
    
    // Save to file
    fs.writeFileSync(PROGRESS_FILE, JSON.stringify(progress, null, 2))
    this.progress = progress
    
    return progress
  }
  
  /**
   * Display progress report
   */
  displayProgress(progress?: GenerationProgress): void {
    const p = progress || this.progress
    if (!p) return
    
    const coveragePercent = ((p.totalGoals - p.goalsWithNoSolutions) / p.totalGoals * 100).toFixed(1)
    const minCoveragePercent = (p.goalsWithMinimumSolutions / p.totalGoals * 100).toFixed(1)
    const targetCoveragePercent = (p.goalsWithTargetSolutions / p.totalGoals * 100).toFixed(1)
    
    console.log(chalk.cyan('\n📊 Generation Coverage Report'))
    console.log(chalk.cyan('═'.repeat(50)))
    console.log(chalk.white(`Total Goals: ${p.totalGoals}`))
    console.log(chalk.red(`Without Solutions: ${p.goalsWithNoSolutions} (${(100 - parseFloat(coveragePercent)).toFixed(1)}%)`))
    console.log(chalk.yellow(`With Some Solutions: ${p.totalGoals - p.goalsWithNoSolutions} (${coveragePercent}%)`))
    console.log(chalk.green(`With Minimum (${this.config.minSolutionsPerGoal}+): ${p.goalsWithMinimumSolutions} (${minCoveragePercent}%)`))
    console.log(chalk.green(`With Target (${this.config.targetSolutionsPerGoal}+): ${p.goalsWithTargetSolutions} (${targetCoveragePercent}%)`))
    console.log(chalk.gray(`\nTotal AI Solutions: ${p.totalSolutionsGenerated}`))
    console.log(chalk.gray(`Strategy: ${this.config.strategy}`))
  }
  
  /**
   * Get recommended next action
   */
  async getRecommendation(): Promise<string> {
    const progress = await this.updateProgress()
    const nextGoals = await this.selectGoalsForGeneration(5)
    
    if (nextGoals.length === 0) {
      return 'All goals have sufficient solutions! Consider increasing target.'
    }
    
    const recommendation = `
Next recommended generation:
- Strategy: ${this.config.strategy}
- Next ${nextGoals.length} goals to generate:
${nextGoals.map(g => `  • ${g.title} (${g.currentSolutionCount} current)`).join('\n')}

Run: npm run generate:ai-solutions -- --limit=5
    `
    
    return recommendation
  }
}