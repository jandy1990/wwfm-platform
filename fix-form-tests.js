#!/usr/bin/env node

/**
 * Fix Form Tests Script
 * Addresses the 98 failing tests in the test factory
 * 
 * Issues identified:
 * 1. Forms are submitting but success detection is failing
 * 2. Validation tests expect wrong behavior
 * 3. Double submission in some tests
 */

const fs = require('fs');
const path = require('path');

console.log('🔧 Fixing Form Test Issues...\n');

// Fix 1: Update form configs to ensure they don't double-submit
const formConfigsPath = path.join(__dirname, 'tests/e2e/forms/form-configs.ts');
let formConfigs = fs.readFileSync(formConfigsPath, 'utf8');

// Ensure fillFormSteps doesn't submit the form (submission handled by test)
if (!formConfigs.includes('// Note: Do not submit')) {
  console.log('✅ Adding submission note to form configs');
  formConfigs = formConfigs.replace(
    /fillFormSteps: async \(page: Page, testData: any\) => \{/g,
    `fillFormSteps: async (page: Page, testData: any) => {
    // Note: Do not submit the form here - test handles submission`
  );
  fs.writeFileSync(formConfigsPath, formConfigs);
}

// Fix 2: Update form-specific-fillers to not auto-submit
const fillersPath = path.join(__dirname, 'tests/e2e/forms/form-specific-fillers.ts');
let fillers = fs.readFileSync(fillersPath, 'utf8');

// Find all submit button clicks and comment them out with a flag
const submitRegex = /await submitBtn\.click\(\)\s*\n\s*console\.log\(['"]Submitted form['"]\)/g;
if (!fillers.includes('// AUTO_SUBMIT_DISABLED')) {
  console.log('✅ Disabling auto-submit in form fillers');
  fillers = fillers.replace(submitRegex, 
    `// AUTO_SUBMIT_DISABLED: Submission handled by test
  // await submitBtn.click()
  // console.log('Submitted form')
  console.log('Form ready for submission')`);
  fs.writeFileSync(fillersPath, fillers);
}

// Fix 3: Restore submission in form-test-factory
const factoryPath = path.join(__dirname, 'tests/e2e/forms/form-test-factory.ts');
let factory = fs.readFileSync(factoryPath, 'utf8');

// Restore the submission logic
const needsSubmit = factory.includes('// Note: fillFormSteps already handles the submission');
if (needsSubmit) {
  console.log('✅ Restoring submission logic in test factory');
  factory = factory.replace(
    `// Fill form using step-based approach
          // Note: fillFormSteps already handles the submission
          await config.fillFormSteps(page, testData)
          
          // Wait for success after form submission (handled by fillFormSteps)
          await waitForSuccessPage(page)`,
    `// Fill form using step-based approach
          await config.fillFormSteps(page, testData)
          
          // Submit the form
          const submitBtn = page.locator('button:has-text("Submit"):visible').first()
          const submitExists = await submitBtn.count() > 0
          
          if (submitExists) {
            console.log('Clicking submit button...')
            await submitBtn.click()
          } else {
            // For multi-step forms that auto-progress
            console.log('No submit button found, checking if already submitted')
          }
          
          // Wait for success
          await waitForSuccessPage(page)`
  );
  fs.writeFileSync(factoryPath, factory);
}

console.log('\n📋 Summary of Changes:');
console.log('1. Disabled auto-submission in form fillers');
console.log('2. Restored submission control to test factory');
console.log('3. Fixed double-submission issue');

console.log('\n✅ Form test fixes applied!');
console.log('Run "npm run test:forms" to verify the fixes');