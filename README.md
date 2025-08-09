# WWFM Platform - What Works For Me

> Crowdsourcing what actually works for life's challenges

WWFM aggregates real experiences from real people to show which solutions are most effective for specific life goals. From managing anxiety to getting promoted, users can discover what worked for others facing similar challenges.

## 🎯 Why WWFM?

- **652 Life Goals**: Covering everything from mental health to career growth
- **Real Effectiveness Data**: Aggregated ratings from actual users
- **No Fluff**: Just solutions ranked by what actually worked
- **Smart Categorization**: 10,000+ keywords automatically organize contributions
- **Progressive Disclosure**: Simple overviews or detailed breakdowns - you choose

## 📊 Current Status

- **Platform**: ✅ Fully operational with all core features
- **Forms**: ✅ 9/9 form templates implemented and tested
- **Testing**: ✅ Complete E2E test suite with Playwright
- **Goal Coverage**: 240/652 goals have solutions (37%) → targeting 80% for launch
- **Solutions**: 529 entries across 23 categories (need 2,000+ for launch)
- **Search**: ✅ Fixed and operational with aggressive quality filtering
- **Next Priority**: Content expansion and admin tools

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

### 🧪 Running Tests

```bash
# Ensure test fixtures are approved
npm run test:fixtures:verify

# Run form tests
npm run test:forms

# Run with UI for debugging
npm run test:forms:ui

# Run specific form test
npm run test:forms -- session-form
```

**Important**: Test fixtures must have "(Test)" suffix to bypass search filters. See [Testing Documentation](tests/e2e/TEST_SOLUTIONS_SETUP.md) for complete testing guide.

## 🏗️ Architecture

WWFM uses a modern JAMstack architecture with aggressive search filtering to ensure data quality:

```
Next.js 15 (React) → Vercel Edge → Supabase (PostgreSQL)
```

- **Frontend**: Server-first React with TypeScript
- **Database**: PostgreSQL with Row Level Security
- **Search**: Fuzzy matching with pg_trgm + aggressive client-side filtering
- **Auth**: Supabase Auth with email verification
- **Testing**: Playwright E2E with permanent test fixtures

**Key Innovation**: Search filtering enforces specificity - "Therapy" is blocked, "CBT with BetterHelp" is allowed. Test fixtures use "(Test)" suffix to bypass filters.

For detailed architecture information, see:
- [ARCHITECTURE.md](./ARCHITECTURE.md) - System design and patterns
- [Solution Search Data Flow](./docs/architecture/SOLUTION_SEARCH_DATA_FLOW.md) - Complete search pipeline

## 📁 Documentation

### Core Documentation
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design, patterns, and key decisions
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
│   ├── supabase/         # Database clients
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
npm run type-check        # TypeScript checking
npm run test:forms        # Run E2E form tests
npm run test:fixtures:verify # Verify test fixtures are ready
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

**Need help?** Check the [documentation](#-documentation) or open an issue.