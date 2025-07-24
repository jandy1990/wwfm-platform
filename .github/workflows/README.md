# GitHub Actions Workflows for WWFM

## Form E2E Tests (`form-tests.yml`)

Runs Playwright E2E tests for form submissions on:
- Pull requests that modify form-related code
- Pushes to main branch
- Manual trigger via GitHub UI

### Required Secrets

Add these secrets to your GitHub repository settings:

1. `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anonymous key (safe to expose)
3. `SUPABASE_SERVICE_KEY` - Service role key (keep secret!)
4. `TEST_GOAL_ID` - UUID of the test goal (e.g., `91d4a950-bb87-4570-b32d-cf4f4a4bb20d`)

### Setting up Secrets

1. Go to your GitHub repository
2. Navigate to Settings → Secrets and variables → Actions
3. Click "New repository secret"
4. Add each secret with its corresponding value

### Workflow Triggers

The workflow runs when:
- Files in `components/organisms/solutions/forms/` are modified
- Files in `app/goal/**/add-solution/` are modified
- Test files in `tests/e2e/forms/` are modified
- The workflow file itself is modified
- Code is pushed to `main` branch
- Manually triggered from Actions tab

### Test Reports

After each run:
- HTML test report is uploaded as an artifact
- Test results are available for 30 days
- Download from the workflow run page

## Nightly Tests (`nightly-form-tests.yml`)

Comprehensive test suite that runs every night at 2 AM UTC.

### Features
- Tests across multiple browsers (Chrome, Firefox, WebKit)
- Longer timeout for comprehensive testing
- Failure notifications (add your notification service)

### Manual Trigger

Both workflows can be manually triggered:
1. Go to Actions tab in GitHub
2. Select the workflow
3. Click "Run workflow"
4. Select branch and run

## Local Testing Before Push

Always run tests locally before pushing:

```bash
# Quick test of modified forms
npm run test:forms -- --grep "form-name"

# Full test suite
npm run test:forms

# With UI to debug
npm run test:forms:ui
```

## Debugging CI Failures

If tests pass locally but fail in CI:

1. **Check secrets**: Ensure all 4 secrets are properly set
2. **Check logs**: Download artifacts for detailed error messages
3. **Run with same browser**: CI uses Chromium by default
4. **Check timeouts**: CI might be slower than local

## Best Practices

1. **Keep tests fast**: Aim for < 5 minutes total
2. **Use specific selectors**: Avoid brittle selectors
3. **Clean up test data**: Always cleanup in afterEach
4. **Test one thing**: Each test should verify one behavior
5. **Descriptive names**: Make test failures self-explanatory

## Monitoring

- Check Actions tab regularly for test status
- Enable GitHub notifications for workflow failures
- Review test reports weekly for flaky tests

## Future Enhancements

- [ ] Add PR comment bot with test summary
- [ ] Integrate with Slack/Discord for notifications
- [ ] Add performance benchmarks
- [ ] Screenshot comparisons for UI changes
- [ ] Parallel test execution for speed