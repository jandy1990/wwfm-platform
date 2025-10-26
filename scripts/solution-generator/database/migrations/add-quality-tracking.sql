-- Quality tracking fields for solutions table
-- This migration adds fields to track AI generation quality and Claude review status

-- Add quality tracking columns to solutions table
ALTER TABLE solutions ADD COLUMN IF NOT EXISTS
  -- Generation tracking
  generation_source VARCHAR(10) DEFAULT 'gemini',
  generation_batch_id UUID,
  
  -- Quality scores (0-100 for each dimension)
  conversation_completeness_score INTEGER,
  evidence_alignment_score INTEGER,
  accessibility_truth_score INTEGER,
  expectation_accuracy_score INTEGER,
  category_accuracy_score INTEGER,
  
  -- Overall status
  quality_status VARCHAR(20) DEFAULT 'pending' CHECK (quality_status IN ('pending', 'checking', 'passed', 'failed', 'fixed')),
  quality_check_batch_id UUID,
  quality_issues JSONB,
  quality_fixes_applied JSONB,
  
  -- Timestamps
  generated_at TIMESTAMP DEFAULT NOW(),
  quality_checked_at TIMESTAMP;

-- Create index for efficient querying of pending solutions
CREATE INDEX IF NOT EXISTS idx_solutions_quality_status 
  ON solutions(quality_status) 
  WHERE quality_status = 'pending';

-- Batch tracking for cost management
CREATE TABLE IF NOT EXISTS quality_check_batches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at TIMESTAMP DEFAULT NOW(),
  solutions_checked INTEGER,
  
  -- Results
  avg_conversation_score DECIMAL(5,2),
  avg_evidence_score DECIMAL(5,2),
  avg_accessibility_score DECIMAL(5,2),
  avg_expectation_score DECIMAL(5,2),
  category_accuracy_rate DECIMAL(5,2),
  
  -- Outcomes
  passed_count INTEGER,
  fixed_count INTEGER,
  failed_count INTEGER,
  
  -- Cost tracking
  claude_tokens_used INTEGER,
  estimated_cost DECIMAL(10,4),
  
  -- Issues found
  common_issues JSONB,
  
  -- Processing metadata
  processing_time_ms INTEGER,
  claude_model VARCHAR(50) DEFAULT 'claude-3-5-sonnet-20241022'
);

-- Track individual solution quality checks
CREATE TABLE IF NOT EXISTS solution_quality_checks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  solution_id UUID REFERENCES solutions(id),
  batch_id UUID REFERENCES quality_check_batches(id),
  
  -- Individual scores
  conversation_completeness INTEGER,
  evidence_alignment INTEGER,
  accessibility_truth INTEGER,
  expectation_accuracy INTEGER,
  category_accuracy BOOLEAN,
  
  -- Issues and fixes
  issues_found JSONB,
  fixes_applied JSONB,
  
  -- Status
  status VARCHAR(20),
  checked_at TIMESTAMP DEFAULT NOW()
);

-- Create view for quality monitoring
CREATE OR REPLACE VIEW quality_metrics AS
SELECT 
  COUNT(*) FILTER (WHERE quality_status = 'pending') as pending_count,
  COUNT(*) FILTER (WHERE quality_status = 'passed') as passed_count,
  COUNT(*) FILTER (WHERE quality_status = 'fixed') as fixed_count,
  COUNT(*) FILTER (WHERE quality_status = 'failed') as failed_count,
  AVG(conversation_completeness_score) as avg_conversation_score,
  AVG(evidence_alignment_score) as avg_evidence_score,
  AVG(accessibility_truth_score) as avg_accessibility_score,
  AVG(expectation_accuracy_score) as avg_expectation_score,
  AVG(CASE WHEN category_accuracy_score IS NOT NULL THEN category_accuracy_score ELSE 0 END) as avg_category_accuracy
FROM solutions
WHERE generation_source = 'gemini';