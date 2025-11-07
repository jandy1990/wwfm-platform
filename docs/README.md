# WWFM Documentation Hub

**Purpose**: Central index for all platform documentation
**Last Updated**: November 7, 2025

---

## 📊 Visual Diagrams (Start Here!)

All diagrams are in the **[diagrams/](./diagrams/)** folder using Mermaid syntax.

### C4 Architecture Diagrams
These use the industry-standard C4 Model for different audience levels:

| Diagram | Audience | Purpose | Path |
|---------|----------|---------|------|
| **System Context** | Everyone | How WWFM fits in ecosystem | [View](./diagrams/system-context.md) |
| **Container** | Technical reviewers, Architects | Tech stack & components | [View](./diagrams/container-diagram.md) |
| **Database ERD** | Database devs, Backend devs | Table relationships | [View](./diagrams/database-erd.md) |

### User Flow Diagrams
Step-by-step process diagrams with decision points:

| Flow | Purpose | Path |
|------|---------|------|
| **Browse & Discover** | User journey for finding solutions | [View](./diagrams/browse-discover-flow.md) |
| **User Contribution** | Form submission to display | [View](./diagrams/user-contribution-flow.md) |
| **Form System** | 9 templates → 23 categories routing | [View](./diagrams/form-system-flow.md) |

**How to View**: All diagrams use Mermaid syntax. They render automatically on GitHub or in VSCode with the [Mermaid Preview extension](https://marketplace.visualstudio.com/items?itemName=vstirbu.vscode-mermaid-preview).

---

## 📁 Documentation by Topic

### Architecture & Design
- **[ARCHITECTURE.md](../ARCHITECTURE.md)** (Root) - Complete system design guide
- [System Context](./diagrams/system-context.md) - Level 1: Ecosystem view
- [Container Diagram](./diagrams/container-diagram.md) - Level 2: Tech components
- [Solution Search Data Flow](./architecture/SOLUTION_SEARCH_DATA_FLOW.md) - Search pipeline

### Database
- [Database ERD](./diagrams/database-erd.md) - Visual schema with relationships
- [Database Schema](./database/schema.md) - Complete SQL definitions and RLS policies

### Forms & Data Entry
- [Form System Flow](./diagrams/form-system-flow.md) - How forms route to categories
- [Form Templates](./forms/README.md) - Specifications for all 9 templates
- [User Contribution Flow](./diagrams/user-contribution-flow.md) - Complete submission process

### User Flows
- [Browse & Discover Flow](./diagrams/browse-discover-flow.md) - Primary user journey
- [User Contribution Flow](./diagrams/user-contribution-flow.md) - How users add solutions
- [Form System Flow](./diagrams/form-system-flow.md) - Category detection and routing

### Data & Fields
- [Solution Fields SSOT](./solution-fields-ssot.md) - Category-field mappings (authority)
- [Solution Field Data Flow](./solution-field-data-flow.md) - End-to-end field pipeline
- [Dropdown Options Reference](../FORM_DROPDOWN_OPTIONS_REFERENCE.md) (Root) - Exact dropdown values

### Testing
- [Testing Guide](../tests/README.md) (Root) - Complete testing documentation
- [Quick Reference](./testing/QUICK_REFERENCE.md) - Common test commands
- [Test Solutions Setup](../tests/e2e/TEST_SOLUTIONS_SETUP.md) - Fixture requirements

### Configuration & Setup
- **[CLAUDE.md](../CLAUDE.md)** (Root) - AI assistant guide, quality standards, database setup
- **[README.md](../README.md)** (Root) - Project overview and quick start

### For Reviewers
- **[FOR_REVIEWER.md](../FOR_REVIEWER.md)** (Root) - Start here for external review
- **[PLATFORM_STATUS.md](../PLATFORM_STATUS.md)** (Root) - Current status, launch blockers
- **[SECURITY_REVIEW.md](../SECURITY_REVIEW.md)** (Root) - Security assessment
- **[TEST_STATUS.md](../TEST_STATUS.md)** (Root) - Testing status

---

## 🎯 Quick Navigation by Role

### New Developer
1. [README.md](../README.md) - Get started
2. [ARCHITECTURE.md](../ARCHITECTURE.md) - Understand the system
3. [System Context](./diagrams/system-context.md) - See the big picture
4. [Container Diagram](./diagrams/container-diagram.md) - Learn tech stack
5. [Browse & Discover Flow](./diagrams/browse-discover-flow.md) - Understand user experience

### Technical Reviewer
1. [FOR_REVIEWER.md](../FOR_REVIEWER.md) - Start here
2. [PLATFORM_STATUS.md](../PLATFORM_STATUS.md) - What works, what's blocking
3. [System Context](./diagrams/system-context.md) - Ecosystem overview
4. [Container Diagram](./diagrams/container-diagram.md) - Architecture
5. [Database ERD](./diagrams/database-erd.md) - Data model
6. [SECURITY_REVIEW.md](../SECURITY_REVIEW.md) - Security posture

### Frontend Developer
1. [Browse & Discover Flow](./diagrams/browse-discover-flow.md) - User journey
2. [Form System Flow](./diagrams/form-system-flow.md) - Form routing
3. [Form Templates](./forms/README.md) - Form specifications
4. [Solution Fields SSOT](./solution-fields-ssot.md) - What fields to display

### Backend Developer
1. [Container Diagram](./diagrams/container-diagram.md) - Backend components
2. [Database ERD](./diagrams/database-erd.md) - Data model
3. [Database Schema](./database/schema.md) - Full SQL schema
4. [User Contribution Flow](./diagrams/user-contribution-flow.md) - Data flow
5. [Solution Field Data Flow](./solution-field-data-flow.md) - Field pipeline

### Database Developer
1. [Database ERD](./diagrams/database-erd.md) - Visual schema
2. [Database Schema](./database/schema.md) - Complete definitions
3. [Solution Fields SSOT](./solution-fields-ssot.md) - Field requirements

### UX Designer / Product Manager
1. [Browse & Discover Flow](./diagrams/browse-discover-flow.md) - User journey
2. [User Contribution Flow](./diagrams/user-contribution-flow.md) - Submission UX
3. [Form System Flow](./diagrams/form-system-flow.md) - Form experience
4. [System Context](./diagrams/system-context.md) - Platform value

### QA Tester
1. [Testing Guide](../tests/README.md) - Test setup
2. [Browse & Discover Flow](./diagrams/browse-discover-flow.md) - Test scenarios
3. [User Contribution Flow](./diagrams/user-contribution-flow.md) - Form testing
4. [Form System Flow](./diagrams/form-system-flow.md) - Category routing tests

---

## 📚 Documentation Standards

### Diagram Standards
- **Format**: Mermaid.js (renders in markdown)
- **Location**: `docs/diagrams/`
- **Naming**: Kebab-case (e.g., `system-context.md`)
- **Content**: Diagram + explanation + code references

### Markdown Standards
- **Headers**: ATX style (`#` not `===`)
- **Lists**: Consistent bullets (`-` not `*`)
- **Code blocks**: Always specify language
- **Links**: Relative paths, not absolute

### Maintenance
- **Review**: Quarterly (avoid 55% outdated trap)
- **Update triggers**: Architecture changes, new features
- **Ownership**: Team decides

---

## 🔄 Recently Updated

| Document | Date | What Changed |
|----------|------|--------------|
| System Context | Nov 7, 2025 | Created |
| Container Diagram | Nov 7, 2025 | Created |
| Database ERD | Nov 7, 2025 | Created |
| User Contribution Flow | Nov 7, 2025 | Created |
| Form System Flow | Nov 7, 2025 | Created |
| Browse & Discover Flow | Nov 7, 2025 | Created |
| FOR_REVIEWER.md | Nov 7, 2025 | Added diagram references |
| README.md | Nov 7, 2025 | Added Visual Diagrams section |

---

## 🆘 Need Help?

### Can't Find What You Need?
1. Use GitHub search within `/docs` directory
2. Check the [root README](../README.md) for links
3. Ask the platform owner

### Want to Add Documentation?
1. Choose appropriate directory (`architecture/`, `flows/`, etc.)
2. Follow naming conventions (kebab-case)
3. Add entry to this hub
4. Update "Recently Updated" section

### Found an Issue?
- Outdated content? Update it and note in "Recently Updated"
- Broken link? Fix it
- Missing docs? Create an issue or add them

---

## 📖 External Resources

### Tools Used
- **Mermaid.js**: https://mermaid.js.org/
- **C4 Model**: https://c4model.com/
- **Next.js**: https://nextjs.org/docs
- **Supabase**: https://supabase.com/docs
- **PostgreSQL**: https://www.postgresql.org/docs/

### Best Practices
- **C4 Model Guide**: https://www.lucidchart.com/blog/c4-model
- **Data Flow Diagrams**: https://www.businessanalystlearnings.com/ba-techniques/2013/2/12/how-to-draw-a-data-flow-diagram
- **ERD Best Practices**: https://vertabelo.com/blog/postgresql-er-diagram-tool/

---

**Last Updated**: November 7, 2025
**Maintained By**: WWFM Development Team
