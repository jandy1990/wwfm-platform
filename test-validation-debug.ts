import { getRequiredFields } from './lib/config/solution-fields'

console.log('=== TESTING getRequiredFields ===')
console.log('medications:', getRequiredFields('medications'))
console.log('therapists_counselors:', getRequiredFields('therapists_counselors'))
console.log('books_courses:', getRequiredFields('books_courses'))
