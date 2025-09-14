# Architecture Decision Records (ADRs)

This directory contains documentation of significant architectural and strategic decisions made during the development of WWFM.

## Purpose
To capture the context, reasoning, and implications of important decisions so that:
- Future developers understand why certain choices were made
- We don't repeat past mistakes
- We have a historical record of platform evolution

## Decisions Documented

| Date | Decision | File | Impact |
|------|----------|------|--------|
| Jan 2025 | Goal Curation | [goal-curation-2025.md](./goal-curation-2025.md) | Reduced from 781 to 228 goals, achieved 99.6% coverage |

## Format
Each decision document should include:
- **Context**: What prompted the decision
- **Problem**: What issue we were solving
- **Decision**: What we decided to do
- **Rationale**: Why this was the right choice
- **Impact**: What changed as a result
- **Status**: Current state of the decision

## When to Document
Document decisions when they:
- Significantly change the platform architecture
- Remove or reduce major features
- Change the core user experience
- Would be difficult to understand from code alone
- Involve trade-offs that might be questioned later