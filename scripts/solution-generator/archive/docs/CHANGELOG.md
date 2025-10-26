# AI Solution Generator - Changelog

## [2.0.0] - August 2025

### 🎉 Major Changes
- **Migrated from Claude to Gemini API**
  - Cost reduced from $137 per run to $0 (free tier)
  - Trade-off: Takes 2-3 days instead of 2-3 hours due to rate limits
  - Model: Claude 3.5 Sonnet → Gemini 2.0 Flash

### ✅ Data Quality Fixes

#### Variant Naming
- **Fixed**: "nullnull" prefix on beauty_skincare and natural_remedies variants
- **Solution**: Updated `database/inserter.ts` to check for null amount/unit before concatenation
- **Impact**: 9 variants fixed

#### Frequency Mapping
- **Fixed**: Exercise solutions incorrectly showing "three times daily" instead of weekly frequencies
- **Solution**: Enhanced `mapFrequencyToDropdown()` in `utils/value-mapper.ts` with better weekly pattern detection
- **Impact**: 24 exercise frequency values corrected

#### Time Commitment Mapping
- **Fixed**: Solutions incorrectly defaulting to "Under 5 minutes"
- **Solution**: Added dedicated `mapTimeCommitmentToDropdown()` function with proper time scaling
- **Impact**: 200+ time commitment values fixed
- **Note**: "Multiple times throughout the day" and "Ongoing/Background habit" are valid dropdown options

#### Diet Cost Logic
- **Fixed**: All diet solutions incorrectly marked as "Significantly more expensive"
- **Solution**: Created `fix-diet-cost-logic.ts` to apply logical cost impacts based on solution type
- **Impact**: 32 of 46 diet solutions updated with appropriate cost impacts

### 🛠️ New Validation Tools

#### Created Scripts
1. **`validate-and-fix.ts`** - Comprehensive validation and auto-fix for all issues
2. **`fix-exercise-frequency.ts`** - Specific fix for exercise frequency mapping
3. **`fix-dropdown-mappings.ts`** - Validates and fixes dropdown field values
4. **`fix-diet-cost-logic.ts`** - Applies logical cost impacts to diet solutions
5. **`check-progress.ts`** - Monitors generation progress and coverage

#### Testing
- Created `tests/e2e/ai-solutions-display.spec.ts` for front-end verification
- Verified solutions display correctly on goal pages
- Confirmed all dropdown values match exact options

### 📊 Results
- **Field Completion**: 100% (all required fields populated)
- **Dropdown Compliance**: 100% (all values use valid options)
- **Variant Naming**: 100% correct (no "nullnull" issues)
- **Logical Accuracy**: 95%+ (values make sense contextually)
- **Front-End Display**: Verified working

### 📚 Documentation Updates
- Enhanced README with validation instructions
- Updated CONTEXT.md with data quality section
- Added troubleshooting guides for common issues
- Created this CHANGELOG for version tracking

## [1.5.0] - December 2024

### Added
- Smart selection strategies for goal prioritization
- Breadth-first, depth-first, arena-based selection modes
- Progress tracking and resumption capabilities
- Usage tracking for Gemini API limits

## [1.0.0] - December 2024

### Initial Release
- AI-powered solution generation using Claude
- Support for all 23 solution categories
- Evidence-based effectiveness ratings
- Prevalence distributions for realistic variations
- Automatic variant creation for dosage categories

---

## Migration Notes

### From Claude to Gemini (v2.0.0)
1. Update `.env.local` with `GEMINI_API_KEY`
2. Run validation after generation: `npm run generate:validate`
3. Expect 2-3 days for full generation due to rate limits
4. Use `--start-from` flag to resume if interrupted

### Rollback Instructions
If you need to revert to Claude:
1. Uncomment `ANTHROPIC_API_KEY` in `.env.local`
2. Comment out `GEMINI_API_KEY`
3. The Claude integration code is preserved in comments for reference