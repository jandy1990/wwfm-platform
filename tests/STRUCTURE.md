# Test Directory Structure

## Overview

All testing-related files are organized under the `/tests` directory for clarity.

```
tests/
├── README.md                    # Main testing guide
├── STRUCTURE.md                # This file
├── e2e/                        # End-to-end tests
│   ├── setup.spec.ts          # Basic setup verification
│   ├── forms/                 # Form-specific tests
│   │   ├── README.md          # Form testing guide
│   │   ├── form-test-factory.ts      # Reusable test factory
│   │   ├── form-configs.ts           # Form configurations
│   │   ├── dosage-form.spec.ts      # DosageForm tests (factory-based)
│   │   ├── dosage-form-complete.spec.ts  # Comprehensive DosageForm tests
│   │   └── placeholder-forms.spec.ts # Placeholder for unimplemented forms
│   ├── fixtures/              # Test data
│   │   └── test-data.ts       # Dropdown options, sample data
│   ├── utils/                 # Test utilities
│   │   └── test-helpers.ts    # Helper functions, Supabase client
│   └── notes/                 # Testing notes
│       └── handling-seeded-data.md
├── setup/                      # Setup scripts
│   └── create-test-goal.sql   # SQL to create test goal
└── manual/                     # Manual test scripts
    └── test-simplified-view.js # Manual testing script
```

## Documentation

Testing documentation is located in `/docs/testing/`:

```
docs/testing/
├── github-secrets-setup.md     # GitHub secrets configuration
├── implementation-plan.md      # Full implementation plan
└── testing-setup.md           # Original testing setup guide
```

## CI/CD Configuration

GitHub Actions workflows are in `/.github/workflows/`:

```
.github/workflows/
├── README.md                   # Workflow documentation
├── form-tests.yml             # Main test workflow
└── nightly-form-tests.yml     # Nightly comprehensive tests
```

## Environment Files

Test environment configuration:
- `.env.test.local` - Contains test credentials (gitignored)
- Never commit this file!

## Security

All files containing secrets are gitignored:
- `.env*` files
- `.env.test.local` specifically
- `/docs/technical/supabase-connection-guide.md`

## Running Tests

```bash
# All form tests
npm run test:forms

# Specific form
npm run test:forms -- dosage-form

# With UI
npm run test:forms:ui

# Debug mode
npm run test:forms:debug

# CI mode
npm run test:forms:ci
```