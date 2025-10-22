import { describe, it, expect, beforeEach } from 'vitest'
import { SolutionAggregator } from '@/lib/services/solution-aggregator'

describe('SolutionAggregator', () => {
  let aggregator: SolutionAggregator
  
  beforeEach(() => {
    aggregator = new SolutionAggregator()
  })
  
  describe('aggregateValueField', () => {
    it('should calculate mode correctly', () => {
      const ratings = [
        { solution_fields: { dosage_amount: '1000' } },
        { solution_fields: { dosage_amount: '1000' } },
        { solution_fields: { dosage_amount: '2000' } },
        { solution_fields: { dosage_amount: '1000' } }
      ]
      
      const result = (aggregator as any).aggregateValueField(ratings, 'dosage_amount')
      
      expect(result).toEqual({
        mode: '1000',
        values: [
          { value: '1000', count: 3, percentage: 75 },
          { value: '2000', count: 1, percentage: 25 }
        ],
        totalReports: 4
      })
    })
    
    it('should handle missing fields gracefully', () => {
      const ratings = [
        { solution_fields: { dosage_amount: '1000' } },
        { solution_fields: {} },
        { solution_fields: { dosage_amount: '2000' } }
      ]
      
      const result = (aggregator as any).aggregateValueField(ratings, 'dosage_amount')
      
      expect(result).toEqual({
        mode: '1000',
        values: [
          { value: '1000', count: 1, percentage: 50 },
          { value: '2000', count: 1, percentage: 50 }
        ],
        totalReports: 2
      })
    })
  })
  
  describe('aggregateArrayField', () => {
    it('should aggregate array fields correctly', () => {
      const ratings = [
        { solution_fields: { time_of_day: ['Morning', 'Evening'] } },
        { solution_fields: { time_of_day: ['Morning'] } },
        { solution_fields: { time_of_day: ['Morning', 'Afternoon'] } }
      ]
      
      const result = (aggregator as any).aggregateArrayField(ratings, 'time_of_day')
      
      expect(result).toEqual({
        mode: 'Morning',
        values: [
          { value: 'Morning', count: 3, percentage: 100 },
          { value: 'Evening', count: 1, percentage: 33 },
          { value: 'Afternoon', count: 1, percentage: 33 }
        ],
        totalReports: 3
      })
    })
  })
  
  describe('aggregateBooleanField', () => {
    it('should aggregate boolean fields correctly', () => {
      const ratings = [
        { solution_fields: { would_recommend: true } },
        { solution_fields: { would_recommend: true } },
        { solution_fields: { would_recommend: false } },
        { solution_fields: { would_recommend: true } }
      ]
      
      const result = (aggregator as any).aggregateBooleanField(ratings, 'would_recommend')
      
      expect(result).toEqual({
        mode: 'Yes',
        values: [
          { value: 'Yes', count: 3, percentage: 75 },
          { value: 'No', count: 1, percentage: 25 }
        ],
        totalReports: 4
      })
    })
  })
  
  describe('New field aggregations', () => {
    it('should aggregate meeting_frequency for CommunityForm', () => {
      const ratings = [
        { solution_fields: { meeting_frequency: 'Weekly' } },
        { solution_fields: { meeting_frequency: 'Weekly' } },
        { solution_fields: { meeting_frequency: 'Monthly' } }
      ]
      
      const result = (aggregator as any).aggregateValueField(ratings, 'meeting_frequency')
      
      expect(result.mode).toBe('Weekly')
      expect(result.totalReports).toBe(3)
    })
    
    it('should aggregate group_size for CommunityForm', () => {
      const ratings = [
        { solution_fields: { group_size: '5-10 people' } },
        { solution_fields: { group_size: '10-20 people' } },
        { solution_fields: { group_size: '5-10 people' } }
      ]
      
      const result = (aggregator as any).aggregateValueField(ratings, 'group_size')
      
      expect(result.mode).toBe('5-10 people')
    })
    
    it('should aggregate dosage fields with new naming', () => {
      const ratings = [
        { solution_fields: { dosage_amount: '5000', dosage_unit: 'IU' } },
        { solution_fields: { dosage_amount: '5000', dosage_unit: 'IU' } },
        { solution_fields: { dosage_amount: '10000', dosage_unit: 'IU' } }
      ]
      
      const amountResult = (aggregator as any).aggregateValueField(ratings, 'dosage_amount')
      const unitResult = (aggregator as any).aggregateValueField(ratings, 'dosage_unit')
      
      expect(amountResult.mode).toBe('5000')
      expect(unitResult.mode).toBe('IU')
    })
    
    it('should aggregate financial_benefit for FinancialForm', () => {
      const ratings = [
        { solution_fields: { financial_benefit: '$100-500/month' } },
        { solution_fields: { financial_benefit: '$100-500/month' } },
        { solution_fields: { financial_benefit: '$500-1000/month' } }
      ]
      
      const result = (aggregator as any).aggregateValueField(ratings, 'financial_benefit')
      
      expect(result.mode).toBe('$100-500/month')
    })
    
    it('should aggregate still_following for LifestyleForm', () => {
      const ratings = [
        { solution_fields: { still_following: true } },
        { solution_fields: { still_following: false } },
        { solution_fields: { still_following: true } }
      ]
      
      const result = (aggregator as any).aggregateBooleanField(ratings, 'still_following')
      
      expect(result.mode).toBe('Yes')
      expect(result.values[0].percentage).toBe(67) // 2 out of 3
    })
  })
  
})
