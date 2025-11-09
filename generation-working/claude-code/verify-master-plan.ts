import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

interface GoalCount {
  id: string;
  title: string;
  solution_count: number;
}

// Master plan targets from MASTER_EXPANSION_PLAN.md
const masterPlanTargets: Record<string, number> = {
  // Top 10 (Already complete per docs)
  'Reduce anxiety': 55,
  'Live with depression': 45,
  'Sleep better': 45,
  'Lose weight sustainably': 45,
  'Clear up acne': 55,
  'Quit smoking': 35,
  'Get out of debt': 35,
  'Improve focus': 39,
  'Manage stress': 51,
  'Stop emotional eating': 44,

  // Phase 1: Quick Wins
  'Overcome insomnia': 35,
  'Manage chronic fatigue': 35,
  'Fall asleep faster': 40,
  'Quit vaping': 35,
  'Change careers successfully': 35,
  'Live with ADHD': 45,
  'Reduce screen time': 35,

  // Phase 2: Medium Builds
  'Break bad habits': 35,
  'Build muscle': 35,
  'Manage IBS and gut issues': 35,
  'Manage PCOS': 40,
  'Live with social anxiety': 40,
  'Navigate menopause': 40,
  'Deal with hair loss': 35,
  'Control my drinking': 35,
  'Stop gambling': 35,
  'Quit drinking': 40,
  'Navigate autism challenges': 45,
  'Manage chronic pain': 40,
  'Get over dating anxiety': 40,

  // Phase 3: Major Builds
  'Manage autoimmune conditions': 35,
  'Save money': 40,
  'Build confidence': 40,
  'Overcome procrastination': 40,
  'Improve communication skills': 35,
  'Start exercising': 40,
  'Improve credit score': 40,

  // Phase 4: Parenting Challenges (NEW)
  'Manage autism meltdowns': 35,
  'Navigate IEP/special education': 35,
  'Help ADHD child focus on homework': 35,
  'Get special needs child to sleep': 35,

  // Phase 5: Women's Health (NEW)
  'Manage endometriosis pain': 40,
  'Manage painful periods': 40,
  'Reduce menopause hot flashes': 40,

  // Phase 6: Caregiving (NEW)
  'Prevent caregiver burnout': 30,
  'Find respite care': 30,
  'Manage dementia aggression': 30,
};

async function verifyMasterPlan() {
  console.log('='.repeat(80));
  console.log('MASTER PLAN VERIFICATION');
  console.log('='.repeat(80));

  // Get all goal counts
  const { data: goalCounts, error } = await supabase
    .from('goals')
    .select(`
      id,
      title,
      goal_implementation_links(count)
    `)
    .eq('is_active', true);

  if (error) {
    console.error('Error fetching goals:', error);
    return;
  }

  // Transform the data
  const counts: GoalCount[] = goalCounts.map(g => ({
    id: g.id,
    title: g.title,
    solution_count: (g.goal_implementation_links as any)[0]?.count || 0
  }));

  // Sort by count descending
  counts.sort((a, b) => b.solution_count - a.solution_count);

  // Categorize goals
  const complete: GoalCount[] = [];
  const inProgress: GoalCount[] = [];
  const notStarted: GoalCount[] = [];
  const notInPlan: GoalCount[] = [];

  for (const goal of counts) {
    const target = masterPlanTargets[goal.title];

    if (!target) {
      // Goal not in master plan
      if (goal.solution_count >= 35) {
        notInPlan.push(goal);
      }
      continue;
    }

    if (goal.solution_count >= target) {
      complete.push(goal);
    } else if (goal.solution_count > 0) {
      inProgress.push(goal);
    } else {
      notStarted.push(goal);
    }
  }

  // Print summary
  console.log('\n📊 SUMMARY');
  console.log('─'.repeat(80));
  console.log(`Total goals in master plan: ${Object.keys(masterPlanTargets).length}`);
  console.log(`✅ Complete: ${complete.length}`);
  console.log(`🔄 In Progress: ${inProgress.length}`);
  console.log(`⏳ Not Started: ${notStarted.length}`);
  console.log(`📌 Extra (not in plan): ${notInPlan.length}`);

  // Calculate total progress
  const totalTarget = Object.values(masterPlanTargets).reduce((a, b) => a + b, 0);
  const totalActual = complete.reduce((sum, g) => {
    const target = masterPlanTargets[g.title];
    return sum + (target || g.solution_count);
  }, 0) + inProgress.reduce((sum, g) => sum + g.solution_count, 0);

  console.log(`\nTotal solutions: ${totalActual} / ${totalTarget} (${Math.round(totalActual / totalTarget * 100)}%)`);

  // Print complete goals
  console.log('\n✅ COMPLETE GOALS (' + complete.length + ')');
  console.log('─'.repeat(80));
  complete.forEach(g => {
    const target = masterPlanTargets[g.title];
    console.log(`  ${g.title}: ${g.solution_count}/${target} ✅`);
  });

  // Print in-progress goals
  if (inProgress.length > 0) {
    console.log('\n🔄 IN PROGRESS (' + inProgress.length + ')');
    console.log('─'.repeat(80));
    inProgress.forEach(g => {
      const target = masterPlanTargets[g.title];
      const remaining = target - g.solution_count;
      console.log(`  ${g.title}: ${g.solution_count}/${target} (need +${remaining})`);
    });
  }

  // Print not started goals
  if (notStarted.length > 0) {
    console.log('\n⏳ NOT STARTED (' + notStarted.length + ')');
    console.log('─'.repeat(80));
    notStarted.forEach(g => {
      const target = masterPlanTargets[g.title];
      console.log(`  ${g.title}: 0/${target} (need +${target})`);
    });
  }

  // Print extra goals not in plan
  if (notInPlan.length > 0) {
    console.log('\n📌 EXTRA GOALS (Not in Master Plan)');
    console.log('─'.repeat(80));
    notInPlan.forEach(g => {
      console.log(`  ${g.title}: ${g.solution_count} solutions`);
    });
  }

  // Phase breakdown
  console.log('\n📋 PHASE BREAKDOWN');
  console.log('─'.repeat(80));

  const phases = {
    'Top 10 (Complete)': ['Reduce anxiety', 'Live with depression', 'Sleep better', 'Lose weight sustainably', 'Clear up acne', 'Quit smoking', 'Get out of debt', 'Improve focus', 'Manage stress', 'Stop emotional eating'],
    'Phase 1: Quick Wins': ['Overcome insomnia', 'Manage chronic fatigue', 'Fall asleep faster', 'Quit vaping', 'Change careers successfully', 'Live with ADHD', 'Reduce screen time'],
    'Phase 2: Medium Builds': ['Break bad habits', 'Build muscle', 'Manage IBS and gut issues', 'Manage PCOS', 'Live with social anxiety', 'Navigate menopause', 'Deal with hair loss', 'Control my drinking', 'Stop gambling', 'Quit drinking', 'Navigate autism challenges', 'Manage chronic pain', 'Get over dating anxiety'],
    'Phase 3: Major Builds': ['Manage autoimmune conditions', 'Save money', 'Build confidence', 'Overcome procrastination', 'Improve communication skills', 'Start exercising', 'Improve credit score'],
    'Phase 4: Parenting (NEW)': ['Manage autism meltdowns', 'Navigate IEP/special education', 'Help ADHD child focus on homework', 'Get special needs child to sleep'],
    'Phase 5: Women\'s Health (NEW)': ['Manage endometriosis pain', 'Manage painful periods', 'Reduce menopause hot flashes'],
    'Phase 6: Caregiving (NEW)': ['Prevent caregiver burnout', 'Find respite care', 'Manage dementia aggression'],
  };

  for (const [phaseName, goalTitles] of Object.entries(phases)) {
    const phaseGoals = goalTitles.map(title => {
      const goal = counts.find(g => g.title === title);
      return {
        title,
        current: goal?.solution_count || 0,
        target: masterPlanTargets[title] || 0
      };
    });

    const phaseComplete = phaseGoals.filter(g => g.current >= g.target).length;
    const phaseTotal = phaseGoals.length;
    const phaseStatus = phaseComplete === phaseTotal ? '✅' : '🔄';

    console.log(`\n${phaseStatus} ${phaseName} (${phaseComplete}/${phaseTotal} goals)`);
    phaseGoals.forEach(g => {
      const status = g.current >= g.target ? '✅' : g.current > 0 ? '🔄' : '⏳';
      console.log(`  ${status} ${g.title}: ${g.current}/${g.target}`);
    });
  }

  console.log('\n' + '='.repeat(80));
}

verifyMasterPlan()
  .then(() => {
    console.log('\n✓ Verification complete');
    process.exit(0);
  })
  .catch(error => {
    console.error('\n✗ Error:', error);
    process.exit(1);
  });
