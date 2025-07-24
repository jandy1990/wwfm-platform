import { createPlaceholderTest } from './form-test-factory'

// These tests are skipped but document which forms need implementation
// Remove each placeholder as the actual form is implemented

createPlaceholderTest('PurchaseForm', ['products_devices', 'books_courses'])
createPlaceholderTest('CommunityForm', ['groups_communities', 'support_groups'])
createPlaceholderTest('LifestyleForm', ['diet_nutrition', 'sleep'])
createPlaceholderTest('HobbyForm', ['hobbies_activities'])
createPlaceholderTest('FinancialForm', ['financial_products'])

// Note: SessionForm, PracticeForm, and AppForm configs are created but forms not yet implemented
// Move their tests from placeholder to actual implementation when ready