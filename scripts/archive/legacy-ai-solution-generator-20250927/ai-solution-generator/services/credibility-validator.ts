/**
 * Credibility Validator Service
 *
 * Validates solution-goal pairs against strict credibility criteria
 * to prevent nonsensical connections like "Ashwagandha for saving money"
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { isCredibleConnection, getMaxExpansions } from '../config/expansion-rules'
import chalk from 'chalk'

export interface SolutionData {
  id: string
  title: string
  solution_category: string
  description: string
  effectiveness: number
  current_goals: Array<{
    id: string
    title: string
    arena: string
    category: string
  }>
}

export interface GoalData {
  id: string
  title: string
  description: string
  arena: string
  category: string
}

export interface CredibilityResult {
  credible: boolean
  reason?: string
  confidence: 'high' | 'medium' | 'low'
  suggested_effectiveness?: number
  semantic_relevance?: number
  domain_expertise?: number
}

export interface ValidationReport {
  solution: SolutionData
  candidates: Array<{
    goal: GoalData
    result: CredibilityResult
  }>
  approved_count: number
  rejected_count: number
  already_connected_count: number
}

export class CredibilityValidator {
  constructor(private supabase: SupabaseClient) {}

  /**
   * Find credible goal candidates for a solution expansion
   * With smart batching to optimize API costs while maximizing discovery
   */
  async findCredibleCandidates(
    solution: SolutionData,
    options: {
      maxCandidates?: number
      strictMode?: boolean
      dryRun?: boolean
      batchSize?: number
    } = {}
  ): Promise<ValidationReport> {
    const {
      maxCandidates = getMaxExpansions(solution.solution_category),
      strictMode = true,
      batchSize = 20 // Smart batch size for API cost control
    } = options

    console.log(chalk.cyan(`\n🔍 Finding credible candidates for: ${solution.title}`))
    console.log(chalk.gray(`   Category: ${solution.solution_category}`))
    console.log(chalk.gray(`   Current goals: ${(solution.current_goals || []).length}`))
    console.log(chalk.gray(`   Max new candidates: ${maxCandidates}`))
    console.log(chalk.gray(`   Batch size: ${batchSize}`))

    // Get all goals in relevant arenas for this solution category
    const potentialGoals = await this.getPotentialGoals(solution)
    if (!potentialGoals || !Array.isArray(potentialGoals)) {
      console.error(chalk.red(`❌ Failed to fetch potential goals for ${solution.title}`))
      return {
        solution,
        candidates: [],
        approved_count: 0,
        rejected_count: 0,
        already_connected_count: 0
      }
    }
    console.log(chalk.gray(`   Potential goals found: ${potentialGoals.length}`))

    // Filter out already connected goals
    const connectedGoalIds = new Set((solution.current_goals || []).map(g => g.id))
    const unconnectedGoals = potentialGoals.filter(goal => !connectedGoalIds.has(goal.id))

    console.log(chalk.gray(`   Unconnected goals: ${unconnectedGoals.length}`))

    // SMART BATCHING: Process in batches with relevance-based prioritization
    const prioritizedGoals = this.prioritizeGoalsByRelevance(solution, unconnectedGoals)
    const batches = this.createBatches(prioritizedGoals, batchSize)

    console.log(chalk.cyan(`   Processing ${batches.length} batches of ${batchSize} goals each`))

    const candidates: ValidationReport['candidates'] = []
    let approved_count = 0
    let rejected_count = 0

    for (let batchIndex = 0; batchIndex < batches.length; batchIndex++) {
      const batch = batches[batchIndex]
      console.log(chalk.gray(`   📦 Processing batch ${batchIndex + 1}/${batches.length}`))

      for (const goal of batch) {
        // Stop if we've found enough candidates across all batches
        if (approved_count >= maxCandidates) break

        const result = await this.validateSolutionGoalPair(solution, goal, strictMode)
        candidates.push({ goal, result })

        if (result.credible) {
          approved_count++
          console.log(chalk.green(`   ✅ ${goal.title} (${result.confidence} confidence, semantic: ${result.semantic_relevance?.toFixed(2)}, domain: ${result.domain_expertise?.toFixed(2)})`))
        } else {
          rejected_count++
          // Don't log all rejections to reduce noise since we're now allowing more candidates
        }
      }

      // Early termination if we have enough candidates
      if (approved_count >= maxCandidates) {
        console.log(chalk.yellow(`   🎯 Found enough candidates (${approved_count}), stopping early`))
        break
      }
    }

    console.log(chalk.gray(`   Processed ${candidates.length} total goals`))

    return {
      solution,
      candidates,
      approved_count,
      rejected_count,
      already_connected_count: solution.current_goals.length
    }
  }

  /**
   * Validate a specific solution-goal pair for credibility
   * NOTE: Expansion rules bypassed - laugh test validator now provides quality control
   */
  async validateSolutionGoalPair(
    solution: SolutionData,
    goal: GoalData,
    strictMode: boolean = true
  ): Promise<CredibilityResult> {
    // BYPASS EXPANSION RULES: Let laugh test handle quality control instead
    // This allows cross-domain connections that were previously blocked

    // Keep semantic relevance as soft signal for prioritization, not blocking
    const semanticResult = this.checkSemanticRelevance(solution, goal)
    const semanticScore = semanticResult.credible ? 1.0 : 0.5 // Lower score but don't block

    // Apply light domain expertise check (informational only)
    const expertiseResult = this.checkDomainExpertise(solution, goal, false) // Always non-strict
    const expertiseScore = expertiseResult.credible ? 1.0 : 0.7 // Lower score but don't block

    // Calculate suggested effectiveness based on relevance
    const suggested_effectiveness = this.calculateEffectiveness(solution, goal, semanticScore * expertiseScore)

    // ALLOW ALL CONNECTIONS: Let Gemini + laugh test decide what's credible
    return {
      credible: true,
      confidence: this.assessConfidence(solution, goal, semanticScore, expertiseScore),
      suggested_effectiveness,
      // Add context for Gemini to use
      semantic_relevance: semanticScore,
      domain_expertise: expertiseScore
    }
  }

  /**
   * Get potential goals that could be relevant for this solution
   */
  private async getPotentialGoals(solution: SolutionData): Promise<GoalData[]> {
    const { data, error } = await this.supabase
      .from('goals')
      .select(`
        id,
        title,
        description,
        arenas(name),
        categories(name)
      `)

    if (error) {
      console.error('Error fetching goals:', error)
      return []
    }

    return data?.map(goal => ({
      id: goal.id,
      title: goal.title,
      description: goal.description || '',
      arena: goal.arenas?.name || 'Unknown',
      category: goal.categories?.name || 'Unknown'
    })) || []
  }

  /**
   * Check semantic relevance between solution and goal
   */
  private checkSemanticRelevance(solution: SolutionData, goal: GoalData): CredibilityResult {
    const solutionWords = this.extractKeywords(solution.title + ' ' + solution.description)
    const goalWords = this.extractKeywords(goal.title + ' ' + goal.description)

    // Look for semantic overlap
    const overlap = solutionWords.filter(word => goalWords.includes(word))
    const overlapRatio = overlap.length / Math.max(solutionWords.length, goalWords.length)

    // Check for contradictory terms
    const contradictoryPairs = [
      ['physical', 'mental'],
      ['exercise', 'meditation'],
      ['supplement', 'therapy'],
      ['diet', 'exercise'],
      ['sleep', 'energy']
    ]

    for (const [term1, term2] of contradictoryPairs) {
      if (solutionWords.includes(term1) && goalWords.includes(term2)) {
        return {
          credible: false,
          reason: `Contradictory domains: solution is ${term1}-focused, goal is ${term2}-focused`,
          confidence: 'high'
        }
      }
    }

    // Require minimum semantic overlap (disabled for medical specialists due to broad expertise)
    const minOverlap = solution.solution_category === 'doctors_specialists' ? 0.0 : 0.1
    if (overlapRatio < minOverlap) {
      return {
        credible: false,
        reason: `Insufficient semantic overlap (${Math.round(overlapRatio * 100)}%)`,
        confidence: 'medium'
      }
    }

    return { credible: true, confidence: 'medium' }
  }

  /**
   * Check domain expertise - would an expert recommend this?
   */
  private checkDomainExpertise(solution: SolutionData, goal: GoalData, strictMode: boolean): CredibilityResult {
    // Define expert recommendation patterns
    const expertRecommendations = {
      // Exercise solutions for fitness goals
      exercise_movement: ['muscle', 'strength', 'fitness', 'weight', 'endurance', 'athletic'],

      // Meditation for mental/emotional goals
      meditation_mindfulness: ['stress', 'anxiety', 'calm', 'focus', 'emotional'],

      // Diet for nutrition/weight goals
      diet_nutrition: ['weight', 'nutrition', 'eating', 'metabolic', 'digestive'],

      // Sleep solutions for sleep/energy goals
      sleep: ['sleep', 'rest', 'energy', 'fatigue', 'tired'],

      // Supplements for health optimization
      supplements_vitamins: ['health', 'immune', 'energy', 'deficiency', 'wellness']
    }

    const categoryPatterns = expertRecommendations[solution.solution_category as keyof typeof expertRecommendations]
    if (!categoryPatterns) {
      return { credible: true, confidence: 'low' } // No specific rules, allow with low confidence
    }

    const goalTitleLower = goal.title.toLowerCase()
    const hasExpertMatch = categoryPatterns.some(pattern =>
      goalTitleLower.includes(pattern)
    )

    if (!hasExpertMatch && strictMode) {
      return {
        credible: false,
        reason: `Expert recommendation mismatch: ${solution.solution_category} not typically recommended for '${goal.title}'`,
        confidence: 'high'
      }
    }

    return {
      credible: true,
      confidence: hasExpertMatch ? 'high' : 'low'
    }
  }

  /**
   * Calculate projected effectiveness for this solution-goal pair
   */
  private calculateEffectiveness(solution: SolutionData, goal: GoalData, relevanceScore: number = 1.0): number {
    // Start with solution's current average effectiveness
    let baseEffectiveness = solution.effectiveness

    // Adjust based on goal relevance and semantic/domain scores
    const relevanceMultiplier = this.calculateRelevanceMultiplier(solution, goal) * relevanceScore
    const projectedEffectiveness = baseEffectiveness * relevanceMultiplier

    // For cross-domain connections, still ensure reasonable effectiveness
    // Allow lower minimums to encourage exploration
    return Math.max(3.5, Math.min(5.0, projectedEffectiveness))
  }

  /**
   * Calculate how relevant this solution is for the goal
   */
  private calculateRelevanceMultiplier(solution: SolutionData, goal: GoalData): number {
    // High relevance indicators
    if (solution.solution_category === 'exercise_movement' && goal.title.toLowerCase().includes('muscle')) {
      return 1.0 // Perfect match
    }

    if (solution.solution_category === 'meditation_mindfulness' && goal.title.toLowerCase().includes('stress')) {
      return 1.0 // Perfect match
    }

    // Medium relevance
    if (solution.solution_category === 'habits_routines' && goal.title.toLowerCase().includes('routine')) {
      return 0.95
    }

    // Cross-domain but still relevant
    if (solution.solution_category === 'exercise_movement' && goal.title.toLowerCase().includes('energy')) {
      return 0.85
    }

    // Default: slightly reduced effectiveness for new applications
    return 0.9
  }

  /**
   * Assess confidence level for this connection
   */
  private assessConfidence(solution: SolutionData, goal: GoalData, semanticScore: number = 1.0, expertiseScore: number = 1.0): 'high' | 'medium' | 'low' {
    const directKeywordMatch = this.hasDirectKeywordMatch(solution, goal)
    const categoryAlignment = this.hasCategoryAlignment(solution, goal)

    // Factor in semantic and expertise scores
    const combinedScore = (semanticScore + expertiseScore) / 2

    if (directKeywordMatch && categoryAlignment && combinedScore > 0.8) return 'high'
    if ((directKeywordMatch || categoryAlignment) && combinedScore > 0.6) return 'medium'
    if (combinedScore > 0.4) return 'medium'
    return 'low'
  }

  /**
   * Check for direct keyword matches between solution and goal
   */
  private hasDirectKeywordMatch(solution: SolutionData, goal: GoalData): boolean {
    const solutionKeywords = this.extractKeywords(solution.title)
    const goalKeywords = this.extractKeywords(goal.title)

    return solutionKeywords.some(keyword => goalKeywords.includes(keyword))
  }

  /**
   * Check if solution and goal categories are well-aligned
   */
  private hasCategoryAlignment(solution: SolutionData, goal: GoalData): boolean {
    const alignmentMap = {
      exercise_movement: ['Exercise & Fitness', 'Weight & Body', 'Physical Performance'],
      meditation_mindfulness: ['Mental Health', 'Stress Management', 'Emotional Growth'],
      diet_nutrition: ['Diet & Nutrition', 'Weight & Body', 'Health & Wellness']
    }

    const alignedCategories = alignmentMap[solution.solution_category as keyof typeof alignmentMap]
    return alignedCategories ? alignedCategories.includes(goal.category) : false
  }

  /**
   * Extract meaningful keywords from text
   */
  private extractKeywords(text: string): string[] {
    const stopWords = new Set(['the', 'a', 'an', 'and', 'or', 'but', 'for', 'with', 'to', 'of', 'in', 'on', 'at'])

    return text
      .toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter(word => word.length > 2 && !stopWords.has(word))
      .slice(0, 10) // Limit to most important words
  }

  /**
   * Prioritize goals by relevance to optimize batching
   */
  private prioritizeGoalsByRelevance(solution: SolutionData, goals: GoalData[]): GoalData[] {
    if (!goals || !Array.isArray(goals)) {
      console.warn(chalk.yellow(`⚠️  Invalid goals array for ${solution.title}`))
      return []
    }

    // Filter out problematic goals first
    const filteredGoals = goals.filter(goal => {
      // Remove TEST goals entirely
      if (goal.title.includes('TEST') || goal.title.includes('test')) {
        return false
      }

      // Remove overused generic goals that rarely make sense
      const genericGoals = [
        'Develop morning routine',
        'Improve emotional regulation'
      ]

      if (genericGoals.some(generic => goal.title === generic)) {
        // Only allow these for solutions that explicitly mention them
        const solutionText = (solution.title + ' ' + solution.description).toLowerCase()
        const goalText = goal.title.toLowerCase()

        if (goalText.includes('morning') && !solutionText.includes('morning') && !solutionText.includes('routine')) {
          return false
        }

        if (goalText.includes('emotional') && !solutionText.includes('emotion') && !solutionText.includes('feeling')) {
          return false
        }
      }

      return true
    })

    const solutionKeywords = this.extractKeywords(solution.title + ' ' + solution.description)
    const solutionDomain = this.detectSolutionDomain(solution)

    return filteredGoals
      .map(goal => ({
        goal,
        relevanceScore: this.calculateQuickRelevanceScore(solutionKeywords, goal, solutionDomain)
      }))
      .filter(item => item.relevanceScore >= 0.1) // Minimum relevance threshold
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .map(item => item.goal)
  }

  /**
   * Create batches of goals for processing
   */
  private createBatches<T>(items: T[], batchSize: number): T[][] {
    const batches: T[][] = []
    for (let i = 0; i < items.length; i += batchSize) {
      batches.push(items.slice(i, i + batchSize))
    }
    return batches
  }

  /**
   * Quick relevance scoring for prioritization (lighter than full validation)
   */
  private calculateQuickRelevanceScore(solutionKeywords: string[], goal: GoalData, solutionDomain?: string): number {
    const goalKeywords = this.extractKeywords(goal.title + ' ' + goal.description)

    // Keyword overlap
    const overlap = solutionKeywords.filter(word => goalKeywords.includes(word))
    const overlapScore = overlap.length / Math.max(solutionKeywords.length, goalKeywords.length)

    // Title overlap (more important)
    const titleKeywords = this.extractKeywords(goal.title)
    const titleOverlap = solutionKeywords.filter(word => titleKeywords.includes(word))
    const titleScore = titleOverlap.length / Math.max(solutionKeywords.length, titleKeywords.length)

    // Domain matching bonus (new)
    let domainBonus = 0
    if (solutionDomain) {
      domainBonus = this.calculateDomainMatch(solutionDomain, goal)
    }

    // Arena bonus (some arenas are more cross-applicable)
    const crossApplicableArenas = ['Personal Growth', 'Feeling & Emotion', 'Work & Career']
    const arenaBonus = crossApplicableArenas.includes(goal.arena) ? 0.1 : 0

    return (overlapScore * 0.3) + (titleScore * 0.4) + (domainBonus * 0.3) + arenaBonus
  }

  /**
   * Detect the domain/category of a solution for better goal matching
   */
  private detectSolutionDomain(solution: SolutionData): string {
    const text = (solution.title + ' ' + solution.description).toLowerCase()
    const category = solution.category?.toLowerCase() || ''

    // Fitness & Exercise
    if (text.includes('workout') || text.includes('exercise') || text.includes('fitness') ||
        text.includes('gym') || text.includes('training') || text.includes('strength') ||
        category.includes('exercise') || category.includes('movement')) {
      return 'fitness'
    }

    // Career & Professional
    if (text.includes('job') || text.includes('career') || text.includes('interview') ||
        text.includes('resume') || text.includes('work') || text.includes('professional') ||
        text.includes('networking') || category.includes('career')) {
      return 'career'
    }

    // Learning & Skills
    if (text.includes('learn') || text.includes('course') || text.includes('tutorial') ||
        text.includes('skill') || text.includes('training') || text.includes('education') ||
        category.includes('courses') || category.includes('books')) {
      return 'learning'
    }

    // Health & Wellness
    if (text.includes('health') || text.includes('medicine') || text.includes('therapy') ||
        text.includes('treatment') || text.includes('healing') ||
        category.includes('medical') || category.includes('natural_remedies')) {
      return 'health'
    }

    // Mental Health & Emotions
    if (text.includes('anxiety') || text.includes('depression') || text.includes('stress') ||
        text.includes('mindfulness') || text.includes('meditation') || text.includes('therapy') ||
        text.includes('emotional') || text.includes('mental health')) {
      return 'mental_health'
    }

    // Productivity & Organization
    if (text.includes('productivity') || text.includes('organize') || text.includes('task') ||
        text.includes('time management') || text.includes('planning') ||
        category.includes('apps_software')) {
      return 'productivity'
    }

    // Diet & Nutrition
    if (text.includes('diet') || text.includes('nutrition') || text.includes('food') ||
        text.includes('eating') || text.includes('weight') ||
        category.includes('diet_nutrition')) {
      return 'nutrition'
    }

    // Addiction & Habits
    if (text.includes('quit') || text.includes('stop') || text.includes('addiction') ||
        text.includes('habit') || text.includes('drinking') || text.includes('smoking')) {
      return 'addiction'
    }

    return 'general'
  }

  /**
   * Calculate how well a goal matches a solution's domain
   */
  private calculateDomainMatch(solutionDomain: string, goal: GoalData): number {
    const goalText = (goal.title + ' ' + goal.description).toLowerCase()
    const goalArena = goal.arena?.toLowerCase() || ''

    switch (solutionDomain) {
      case 'fitness':
        if (goalText.includes('exercise') || goalText.includes('fitness') || goalText.includes('strength') ||
            goalText.includes('workout') || goalText.includes('physical') || goalArena.includes('health')) {
          return 0.8
        }
        break

      case 'career':
        if (goalText.includes('job') || goalText.includes('career') || goalText.includes('work') ||
            goalText.includes('interview') || goalText.includes('professional') || goalArena.includes('career')) {
          return 0.8
        }
        break

      case 'learning':
        if (goalText.includes('learn') || goalText.includes('skill') || goalText.includes('study') ||
            goalText.includes('master') || goalText.includes('practice') || goalArena.includes('growth')) {
          return 0.8
        }
        break

      case 'health':
        if (goalText.includes('health') || goalText.includes('heal') || goalText.includes('pain') ||
            goalText.includes('medical') || goalText.includes('condition') || goalArena.includes('health')) {
          return 0.8
        }
        break

      case 'mental_health':
        if (goalText.includes('anxiety') || goalText.includes('stress') || goalText.includes('calm') ||
            goalText.includes('mindful') || goalText.includes('emotional') || goalArena.includes('emotion')) {
          return 0.8
        }
        break

      case 'productivity':
        if (goalText.includes('organize') || goalText.includes('routine') || goalText.includes('productive') ||
            goalText.includes('focus') || goalText.includes('time') || goalArena.includes('productivity')) {
          return 0.8
        }
        break

      case 'nutrition':
        if (goalText.includes('weight') || goalText.includes('eat') || goalText.includes('diet') ||
            goalText.includes('food') || goalText.includes('nutrition') || goalArena.includes('health')) {
          return 0.8
        }
        break

      case 'addiction':
        if (goalText.includes('quit') || goalText.includes('stop') || goalText.includes('addiction') ||
            goalText.includes('drinking') || goalText.includes('smoking') || goalText.includes('habit')) {
          return 0.8
        }
        break
    }

    return 0 // No domain match
  }

  /**
   * Generate validation summary report
   */
  generateReport(validationReport: ValidationReport): string {
    const { solution, candidates, approved_count, rejected_count, already_connected_count } = validationReport

    let report = chalk.cyan(`\n📊 Validation Report: ${solution.title}\n`)
    report += chalk.cyan('═'.repeat(60) + '\n')
    report += chalk.white(`Category: ${solution.solution_category}\n`)
    report += chalk.white(`Current connections: ${already_connected_count}\n`)
    report += chalk.green(`✅ Approved candidates: ${approved_count}\n`)
    report += chalk.red(`❌ Rejected candidates: ${rejected_count}\n`)
    report += chalk.white(`📋 Total evaluated: ${candidates.length}\n\n`)

    // Show approved candidates
    if (approved_count > 0) {
      report += chalk.green('Approved Connections:\n')
      candidates
        .filter(c => c.result.credible)
        .forEach(({ goal, result }) => {
          report += chalk.green(`  ✅ ${goal.title}`)
          report += chalk.gray(` (${result.confidence} confidence, `)
          report += chalk.yellow(`${result.suggested_effectiveness?.toFixed(1)} effectiveness`)
          report += chalk.gray(`)\n`)
        })
      report += '\n'
    }

    // Show some rejected examples (not all to avoid spam)
    const rejectedSamples = candidates.filter(c => !c.result.credible).slice(0, 5)
    if (rejectedSamples.length > 0) {
      report += chalk.red('Sample Rejections:\n')
      rejectedSamples.forEach(({ goal, result }) => {
        report += chalk.red(`  ❌ ${goal.title}`)
        report += chalk.gray(` - ${result.reason}\n`)
      })
      if (rejected_count > 5) {
        report += chalk.gray(`  ... and ${rejected_count - 5} more\n`)
      }
    }

    return report
  }
}