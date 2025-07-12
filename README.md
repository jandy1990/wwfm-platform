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

- **Platform**: ✅ Operational and accepting contributions
- **Goal Coverage**: 240/652 goals have solutions (37%) → targeting 80% for launch
- **Solutions**: 529 entries across 23 categories
- **Forms**: 1/9 form templates implemented
- **Next Priority**: Complete remaining forms and expand content

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

## 🏗️ Architecture

WWFM uses a modern JAMstack architecture:

```
Next.js 15 (React) → Vercel Edge → Supabase (PostgreSQL)
```

- **Frontend**: Server-first React with TypeScript
- **Database**: PostgreSQL with Row Level Security
- **Search**: Fuzzy matching with pg_trgm
- **Auth**: Supabase Auth with email verification

For detailed architecture information, see [ARCHITECTURE.md](./ARCHITECTURE.md).

## 📁 Documentation

### Core Documentation
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - System design, patterns, and key decisions
- **[Database Schema](/docs/database/schema.md)** - Complete database structure and relationships
- **[Form Templates](/docs/forms/README.md)** - All 9 form specifications and field mappings
- **[Goals Taxonomy](/data/taxonomy.md)** - Complete hierarchy of 652 goals

### Development Guides
- **[DEBUGGING.md](./DEBUGGING.md)** - Common issues and solutions
- **[WORKFLOW.md](./WORKFLOW.md)** - Development best practices
- **[CLAUDE.md](./CLAUDE.md)** - AI assistant collaboration guide

## 🛠️ Development

### Project Structure
```
wwfm-platform/
├── app/                    # Next.js App Router pages
├── components/             # React components
│   ├── solutions/         # Solution forms and displays
│   │   └── forms/        # 9 form templates
│   └── ui/               # Reusable UI components
├── lib/                   # Utilities and services
│   ├── supabase/         # Database clients
│   └── services/         # Business logic
├── types/                 # TypeScript definitions
├── data/                  # Reference data
│   └── taxonomy.md       # Goals hierarchy
└── docs/                  # Documentation
    ├── database/         # Schema documentation
    └── forms/            # Form specifications
```

### Key Concepts

1. **Solutions vs Variants**: Solutions are generic ("Vitamin D"), variants are specific ("1000 IU softgel")
2. **Goal-Specific Effectiveness**: Same solution can work differently for different goals
3. **Form System**: 23 categories map to 9 form templates
4. **Auto-Categorization**: Keywords determine which form to show

### Available Scripts

```bash
npm run dev          # Start development server (port 3002)
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run type-check   # TypeScript checking
npm run format       # Prettier formatting
```

### Making Contributions

1. **Adding a Solution**: 
   - User types solution name
   - System auto-categorizes or shows picker
   - Appropriate form loads (1 of 9 types)
   - Data saved to `solutions`, `solution_variants`, and `goal_implementation_links`

2. **Rating a Solution**:
   - Hover (desktop) or swipe (mobile) to reveal stars
   - Rating updates aggregate effectiveness
   - Private individual ratings, public aggregates

## 🐛 Known Issues

1. **Rating Bug**: Fixed! Was missing variant prop in InteractiveRating component
2. **Forms**: 8/9 forms still need implementation
3. **Content**: Need ~1,500 more solutions for launch readiness

See [DEBUGGING.md](./DEBUGGING.md) for detailed troubleshooting.

## 🚧 Roadmap

### Immediate (This Week)
- [ ] Implement remaining 8 form templates
- [ ] Fix TypeScript strict mode errors
- [ ] Add loading skeletons

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

## 📄 License

Private repository - all rights reserved.

## 🙏 Acknowledgments

WWFM exists to help people find what actually works for life's challenges. Every contribution makes the platform more valuable for someone seeking solutions.

---

**Need help?** Check the [documentation](#-documentation) or open an issue.