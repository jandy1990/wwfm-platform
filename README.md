# WWFM Platform - What Works For Me

> Crowdsourcing what actually works for life's challenges

WWFM aggregates real experiences from real people to show which solutions are most effective for specific life goals. From managing anxiety to getting promoted, users can discover what worked for others facing similar challenges.

## 🎯 Why WWFM?

- **228 Life Goals**: Curated challenges covering mental health to career growth
- **Real Effectiveness Data**: Aggregated ratings from actual users
- **Specific Solutions**: Not "try meditation" but "Headspace anxiety pack" - actual things you can do
- **Smart Categorization**: 10,000+ keywords automatically organize contributions
- **Progressive Disclosure**: Simple overviews or detailed breakdowns - you choose

## 📊 Current Status

- **Platform**: ✅ Fully operational - users can browse, search, and contribute
- **Content**: ✅ 3,873 solutions covering 227/228 goals (99.6% coverage!)
- **User Experience**: ✅ Auto-categorization, fuzzy search, progressive disclosure all working
- **Forms**: ✅ 9/9 form templates for 23 solution categories implemented
- **Data Model**: ✅ Clean 2-layer architecture (solutions + variants) proven effective
- **Testing**: ✅ E2E test coverage ensures reliability
- **Next Priority**: 🚀 Ready for beta testing and user feedback

## 🚀 Quick Start

Get the platform running locally in under 5 minutes:

```bash
# 1. Clone the repository
git clone https://github.com/yourusername/wwfm-platform.git
cd wwfm-platform

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env.local
# Add your Supabase credentials to .env.local

# 4. Run the development server
npm run dev

# 5. Open http://localhost:3002 in your browser
```

You should now see the WWFM homepage! Try:
- Browsing goals by arena
- Searching for "anxiety" or "sleep"
- Viewing solution effectiveness ratings

### 🧪 Testing

**Quick Start:**
```bash
npm run test:setup      # MANDATORY: Create test fixtures first!
npm run test:critical   # Run critical tests (~5 min)
npm run test:failures   # View any failures
```

> **⚠️ CRITICAL:** Must run `test:setup` first or ALL tests fail

**Full Testing Guide:** See **[Testing README](tests/README.md)** | **[Quick Reference](docs/testing/QUICK_REFERENCE.md)**

## ⚠️ Database Usage

**Two Databases:**
1. **Production (Supabase Cloud)** - Use for ALL development
2. **Local Test (Docker)** - Testing infrastructure only, DO NOT query directly

**Full Details:** See **[CLAUDE.md Database Section](CLAUDE.md#database-usage)**

## 🏗️ Architecture

WWFM uses a modern JAMstack architecture optimized for content discovery:

```
Next.js 15 (React) → Vercel Edge → Supabase (PostgreSQL)
```

- **Frontend**: Server Components with progressive enhancement
- **Database**: PostgreSQL with Row Level Security and JSONB flexibility
- **Search**: Fuzzy matching (pg_trgm) with quality filters
- **Data Model**: 2-layer system (solutions + variants) prevents duplication
- **Forms**: 9 templates handle 23 categories with smart routing

**Key Design**: Solutions are generic ("Vitamin D") with goal-specific effectiveness ratings, allowing one entry to serve all 652 goals with different results.

See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed design decisions.

## 📁 Documentation

### Core Documentation
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design, patterns, and key decisions
- **[Solution Field Data Flow](./docs/solution-field-data-flow.md)** - End-to-end pipeline from forms → aggregation → AI tooling
- **[Solution Search Data Flow](./docs/architecture/SOLUTION_SEARCH_DATA_FLOW.md)** - Complete search and filtering pipeline
- **[Database Schema](/docs/database/schema.md)** - Complete database structure and relationships
- **[Form Templates](/docs/forms/README.md)** - All 9 form specifications and field mappings
- **[Goals Taxonomy](/data/taxonomy.md)** - Complete hierarchy of 652 goals

### Development Guides
- **[DEBUGGING.md](./DEBUGGING.md)** - Common issues and solutions
- **[WORKFLOW.md](./WORKFLOW.md)** - Development best practices
- **[CLAUDE.md](./CLAUDE.md)** - AI assistant collaboration guide

### Testing Documentation
- **[Test Solutions Setup](tests/e2e/TEST_SOLUTIONS_SETUP.md)** - Test fixture requirements
- **[Testing Guide](tests/README.md)** - Complete E2E testing documentation

## 🛠️ Development

### Project Structure
```
wwfm-platform/
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── solutions/         # Solution forms and displays
│   │   └── forms/        # 9 form templates (ALL IMPLEMENTED)
│   └── ui/               # Reusable UI components
├── lib/                   # Utilities and services
│   ├── database/         # Database clients (Supabase)
│   └── solutions/        # Search & categorization logic
├── tests/                 # E2E tests with Playwright
│   └── e2e/forms/        # Form submission tests
├── types/                 # TypeScript definitions
├── data/                  # Reference data
│   └── taxonomy.md       # Goals hierarchy
└── docs/                  # Documentation
    ├── architecture/     # System design docs
    ├── database/         # Schema documentation
    └── forms/            # Form specifications
```

### Key Concepts

1. **Solutions vs Variants**: Solutions are generic ("Vitamin D"), variants are specific ("1000 IU softgel")
2. **Goal-Specific Effectiveness**: Same solution can work differently for different goals
3. **Form System**: 23 categories map to 9 form templates
4. **Auto-Categorization**: Keywords determine which form to show
5. **Search Filtering**: Aggressive filters prevent generic entries (e.g., "therapy" alone is blocked)
6. **Test Fixtures**: Use "(Test)" suffix to bypass production filters

### Available Scripts

```bash
npm run dev                # Start development server (port 3002)
npm run build             # Build for production
npm run start             # Start production server
npm run lint              # Run ESLint
npm run test:forms:local  # Full Chromium suite against disposable Supabase
npm run test:forms        # Legacy all-project suite (Supabase must be running)
npm run test:db:start     # Start disposable Supabase without running tests
npm run test:db:seed      # Reset + seed fixtures against running Supabase
npm run test:db:stop      # Stop disposable Supabase containers
npm run quality:audit:fields # Ensure docs/config/UI field mappings stay aligned
node scripts/cleanup-all.js # Clean all test artifacts
```

### Making Contributions

1. **Adding a Solution**: 
   - User types solution name
   - System auto-categorizes or shows picker
   - Appropriate form loads (1 of 9 types)
   - Data saved to `solutions`, `solution_variants`, and `goal_implementation_links`
   - Must be specific (e.g., "CBT Therapy" not just "Therapy")

2. **Rating a Solution**:
   - Hover (desktop) or swipe (mobile) to reveal stars
   - Rating updates aggregate effectiveness
   - Private individual ratings, public aggregates

## 🐛 Known Issues

1. **Search Filtering**: Intentionally aggressive - blocks generic terms to force specificity
2. **Content Gap**: Need ~1,500 more solutions for launch readiness
3. **Admin Tools**: Moderation queue not yet implemented

See [DEBUGGING.md](./DEBUGGING.md) for detailed troubleshooting.

## 🚧 Roadmap

### Immediate (Completed ✅)
- [✅] Implement all 9 form templates
- [✅] Fix search functionality 
- [✅] Add E2E testing infrastructure
- [✅] Document data flow architecture

### Short Term (This Month)
- [ ] Generate 1,500+ AI seed solutions
- [ ] Admin moderation queue
- [ ] Email notifications
- [ ] Performance optimization

### Medium Term
- [ ] User profiles and contribution history
- [ ] Advanced filtering and search
- [ ] Mobile app consideration
- [ ] Analytics dashboard

## 🤝 Contributing

We welcome contributions! Please:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Follow existing code patterns (see [ARCHITECTURE.md](./ARCHITECTURE.md))
4. Test with both anonymous and authenticated users
5. Submit a Pull Request

### Coding Standards
- TypeScript with no `any` types
- Server Components by default
- Comprehensive error handling
- Mobile-first responsive design
- Accessible UI (WCAG 2.1 AA target)
- Test fixtures must include "(Test)" suffix

## 📄 License

Private repository - all rights reserved.

## 🙏 Acknowledgments

WWFM exists to help people find what actually works for life's challenges. Every contribution makes the platform more valuable for someone seeking solutions.

---

## 📚 Documentation

**Quick Links:**
- [CLAUDE.md](CLAUDE.md) - AI assistant collaboration guide
- [ARCHITECTURE.md](ARCHITECTURE.md) - Technical architecture
- [Testing Guide](tests/README.md) - Test setup and debugging

**Complete Index:**
- [Documentation Hub](docs/README.md) - All documentation organized with navigation table

**Key Documents:**
- [Solution Fields SSOT](docs/solution-fields-ssot.md) - Category-field mappings
- [Dropdown Options](FORM_DROPDOWN_OPTIONS_REFERENCE.md) - Exact dropdown values

---

**Need help?** Check the [Documentation Hub](docs/README.md) or open an issue.
