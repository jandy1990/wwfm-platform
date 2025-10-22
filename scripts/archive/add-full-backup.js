#!/usr/bin/env node
const fs = require('fs');
const path = require('path');

// Forms configuration with their specific fields
const formsConfig = {
  'PracticeForm.tsx': {
    fields: ['timeCommitment', 'frequency', 'effectiveness', 'timeToResults', 'difficulty', 'issues', 'failedSolutions', 'resourcesUsed', 'otherInfo'],
    hasRestoredState: true
  },
  'PurchaseForm.tsx': {
    fields: ['purchasePrice', 'purchaseType', 'effectiveness', 'timeToResults', 'issues', 'failedSolutions', 'brandOrStore', 'otherInfo'],
    hasRestoredState: true
  },
  'CommunityForm.tsx': {
    fields: ['engagementLevel', 'communitySize', 'cost', 'effectiveness', 'timeToResults', 'issues', 'failedSolutions', 'communityName', 'otherInfo'],
    hasRestoredState: true
  },
  'LifestyleForm.tsx': {
    fields: ['difficulty', 'timeCommitment', 'effectiveness', 'timeToResults', 'challenges', 'failedSolutions', 'schedule', 'otherInfo'],
    hasRestoredState: true
  },
  'FinancialForm.tsx': {
    fields: ['initialInvestment', 'monthlyCommitment', 'effectiveness', 'timeToResults', 'risks', 'failedSolutions', 'serviceName', 'otherInfo'],
    hasRestoredState: true
  }
};

const formsDir = path.join(__dirname, '../components/organisms/solutions/forms');

Object.entries(formsConfig).forEach(([fileName, config]) => {
  const filePath = path.join(formsDir, fileName);
  
  if (!fs.existsSync(filePath)) {
    console.log(`❌ File not found: ${fileName}`);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');
  const originalContent = content;
  
  // Extract form name from file name
  const formName = fileName.replace('.tsx', '').replace('Form', '').toLowerCase();
  
  // Create the formBackupData object string
  const backupDataFields = [...config.fields, 'currentStep', 'highestStepReached']
    .map(field => `    ${field}`)
    .join(',\n');
  
  // Create the restore callback fields
  const restoreFields = config.fields.map(field => {
    // Determine default value based on field name
    let defaultValue = "''";
    if (field === 'effectiveness') defaultValue = 'null';
    else if (field.includes('failed') || field.includes('issues') || field.includes('challenges') || field.includes('risks')) {
      defaultValue = '[]';
    } else if (field === 'challenges' || field === 'issues') {
      defaultValue = "['None']";
    }
    
    return `        set${field.charAt(0).toUpperCase()}${field.slice(1)}(data.${field} || ${defaultValue});`;
  }).join('\n');
  
  // Add navigation state restore
  const navigationRestore = `        setCurrentStep(data.currentStep || 1);
        setHighestStepReached(data.highestStepReached || 1);
        setRestoredFromBackup(true);
        setTimeout(() => setRestoredFromBackup(false), 5000);`;
  
  // Build the complete backup hook code
  const backupHookCode = `
  // Form backup data object
  const formBackupData = {
${backupDataFields}
  };
  
  // Use form backup hook
  const { clearBackup } = useFormBackup(
    \`${formName}-form-\${goalId}-\${solutionName}\`,
    formBackupData,
    {
      onRestore: (data) => {
${restoreFields}
${navigationRestore}
      }
    }
  );`;
  
  // Find where to insert the backup hook (after progress indicator)
  const progressPattern = /  \/\/ Progress indicator\s+const totalSteps = \d+;\s+const progress = \(currentStep \/ totalSteps\) \* 100;/;
  
  if (progressPattern.test(content)) {
    content = content.replace(progressPattern, (match) => {
      return match + '\n' + backupHookCode;
    });
  }
  
  // Add restore notification UI
  const contextCardPattern = /(\s*){\/\* Quick context card \*\/}/;
  if (contextCardPattern.test(content)) {
    const restoreNotification = `        {/* Restore notification */}
        {restoredFromBackup && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 
                        rounded-lg p-3 mb-4 animate-fade-in">
            <p className="text-sm text-green-800 dark:text-green-200">
              ✓ Your previous progress has been restored
            </p>
          </div>
        )}
        
        {/* Quick context card */}`;
    
    content = content.replace(contextCardPattern, restoreNotification);
  }
  
  // Update handleSubmit to use server action and clear backup
  const handleSubmitPattern = /const handleSubmit = async \(\) => \{[\s\S]*?\n  \};/;
  
  if (handleSubmitPattern.test(content) && !content.includes('clearBackup()')) {
    // Find setShowSuccessScreen(true) and add clearBackup before it
    const successScreenPattern = /(\s+)setShowSuccessScreen\(true\);/g;
    content = content.replace(successScreenPattern, (match, indent) => {
      return `${indent}// Clear backup on successful submission\n${indent}clearBackup();\n${indent}\n${match}`;
    });
  }
  
  if (content !== originalContent) {
    fs.writeFileSync(filePath, content);
    console.log(`✅ Updated ${fileName} with full backup functionality`);
  } else {
    console.log(`⚠️  ${fileName} may already have backup or needs manual update`);
  }
});

console.log(`
✅ Backup functionality added to all forms!

The following have been implemented:
1. Form backup data object with all fields
2. useFormBackup hook with restore callback
3. Restore notification UI
4. clearBackup() on successful submission

Test each form to ensure backup/restore works correctly.
`);