#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// List of forms to update with backup functionality
const formsToUpdate = [
  { file: 'AppForm.tsx', fields: ['cost', 'timeToResults', 'usageFrequency', 'subscriptionType', 'effectiveness', 'challenges', 'platform', 'otherInfo', 'failedSolutions'] },
  { file: 'HobbyForm.tsx', fields: ['startupCost', 'ongoingCost', 'timeInvestment', 'frequency', 'effectiveness', 'timeToResults', 'challenges', 'communityName', 'otherInfo', 'failedSolutions'] },
  { file: 'SessionForm.tsx', fields: ['sessionFrequency', 'sessionCount', 'sessionCost', 'effectiveness', 'timeToResults', 'sideEffects', 'selectedBarriers', 'failedSolutions'] },
  { file: 'PracticeForm.tsx', fields: ['timeCommitment', 'frequency', 'effectiveness', 'timeToResults', 'difficulty', 'issues', 'failedSolutions'] },
  { file: 'PurchaseForm.tsx', fields: ['purchasePrice', 'purchaseType', 'effectiveness', 'timeToResults', 'issues', 'failedSolutions'] },
  { file: 'CommunityForm.tsx', fields: ['engagementLevel', 'communitySize', 'cost', 'effectiveness', 'timeToResults', 'issues', 'failedSolutions'] },
  { file: 'LifestyleForm.tsx', fields: ['difficulty', 'timeCommitment', 'effectiveness', 'timeToResults', 'challenges', 'failedSolutions'] },
  { file: 'FinancialForm.tsx', fields: ['initialInvestment', 'monthlyCommitment', 'effectiveness', 'timeToResults', 'risks', 'failedSolutions'] }
];

const formsDir = path.join(__dirname, '../components/organisms/solutions/forms');

formsToUpdate.forEach(({ file, fields }) => {
  const filePath = path.join(formsDir, file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${file}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // 1. Add import for useFormBackup if not already present
  if (!content.includes('useFormBackup')) {
    const importPattern = /import { submitSolution, type SubmitSolutionData } from '@\/app\/actions\/submit-solution';/;
    if (importPattern.test(content)) {
      content = content.replace(
        importPattern,
        `import { submitSolution, type SubmitSolutionData } from '@/app/actions/submit-solution';\nimport { useFormBackup } from '@/lib/hooks/useFormBackup';`
      );
    }
  }
  
  // 2. Add restoredFromBackup state if not present
  if (!content.includes('restoredFromBackup')) {
    const submissionResultPattern = /const \[submissionResult, setSubmissionResult\] = useState<{[^}]+}>.*?\);/s;
    if (submissionResultPattern.test(content)) {
      const match = content.match(submissionResultPattern);
      if (match) {
        content = content.replace(
          match[0],
          `${match[0]}\n  const [restoredFromBackup, setRestoredFromBackup] = useState(false);`
        );
      }
    }
  }
  
  // 3. Add clearBackup() call in handleSubmit success
  if (!content.includes('clearBackup()')) {
    const successPattern = /\/\/ Show success screen\s+setShowSuccessScreen\(true\);/;
    if (successPattern.test(content)) {
      content = content.replace(
        successPattern,
        `// Clear backup on successful submission
        clearBackup();
        
        // Show success screen
        setShowSuccessScreen(true);`
      );
    }
  }
  
  // 4. Add restore notification UI
  if (!content.includes('Your previous progress has been restored')) {
    // This is more complex and varies by form, so we'll just log it
    console.log(`📝 Note: Add restore notification UI manually to ${file}`);
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${file} with backup imports and basic setup`);
  } else {
    console.log(`⚠️  ${file} may need manual updates`);
  }
});

console.log(`
📋 Manual steps remaining:
1. Add formBackupData object with all form fields
2. Add useFormBackup hook call with onRestore callback
3. Add restore notification UI
4. Test backup/restore functionality

Example implementation is in DosageForm.tsx
`);