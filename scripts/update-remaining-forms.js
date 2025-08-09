#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// List of remaining forms to update
const formsToUpdate = [
  'SessionForm.tsx',
  'PracticeForm.tsx', 
  'PurchaseForm.tsx',
  'CommunityForm.tsx',
  'LifestyleForm.tsx',
  'FinancialForm.tsx'
];

const formsDir = path.join(__dirname, '../components/organisms/solutions/forms');

formsToUpdate.forEach(formFile => {
  const filePath = path.join(formsDir, formFile);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${formFile}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // 1. Add import for server action
  if (!content.includes('submitSolution')) {
    content = content.replace(
      "import { ProgressCelebration, FormSectionHeader, CATEGORY_ICONS } from './shared';",
      "import { ProgressCelebration, FormSectionHeader, CATEGORY_ICONS } from './shared';\nimport { submitSolution, type SubmitSolutionData } from '@/app/actions/submit-solution';"
    );
  }
  
  // 2. Add submissionResult state
  if (!content.includes('submissionResult')) {
    // Find the pattern where state is declared
    const statePattern = /const \[highestStepReached, setHighestStepReached\] = useState\(1\);/;
    if (statePattern.test(content)) {
      content = content.replace(
        statePattern,
        `const [highestStepReached, setHighestStepReached] = useState(1);
  const [submissionResult, setSubmissionResult] = useState<{
    solutionId?: string;
    variantId?: string;
    otherRatingsCount?: number;
  }>({});`
      );
    }
  }
  
  // 3. Update success screen message
  const successMessagePattern = /Your experience with \{solutionName\} has been recorded/;
  if (successMessagePattern.test(content)) {
    content = content.replace(
      'Your experience with {solutionName} has been recorded',
      `{submissionResult.otherRatingsCount && submissionResult.otherRatingsCount > 0 ? (
              <>Your experience has been added to {submissionResult.otherRatingsCount} {submissionResult.otherRatingsCount === 1 ? 'other' : 'others'}</>
            ) : existingSolutionId ? (
              <>Your experience with {solutionName} has been recorded</>
            ) : (
              <>You're the first to review {solutionName}! It needs 2 more reviews to go live.</>
            )}`
    );
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${formFile}`);
  } else {
    console.log(`⚠️  No changes needed for ${formFile}`);
  }
});

console.log('\n✨ Script complete! Now manually update handleSubmit functions in each form.');