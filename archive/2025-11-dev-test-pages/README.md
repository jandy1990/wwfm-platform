# Development Test Pages Archive

**Archived**: November 2025
**Reason**: Production cleanup for external technical review

## Contents

This folder contains test and debug pages that were in the `/app/` directory during development. They were moved out to ensure they don't accidentally get deployed to production.

### Test Pages Archived:

1. **test/** - General test page
2. **test-dosage-form/** - Dosage form testing page
3. **test-env/** - Environment variable testing
4. **test-failed-picker/** - Failed solution picker testing
5. **test-forms/** - Form testing pages
6. **test-retrospective/** - Retrospective feature testing
7. **test-rpc/** - RPC/server action testing
8. **test-server-action/** - Server action testing

## Purpose

These pages were used during development for:
- Testing form submissions
- Debugging server actions
- Verifying environment configuration
- Testing component behavior in isolation

## Recovery

If any of these pages are needed, they can be moved back to `/app/` directory. However, they should NEVER be deployed to production.

## Production Safety

These pages are now excluded from the production build and will not be accessible in deployed environments.
