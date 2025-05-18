WWFM Collaboration Guide
Document Type: Collaboration practices and documentation standards
Related Documents: Project Guide | Technical Reference
Last Updated: May 18, 2025
Status: Active

This document outlines how to effectively collaborate on the WWFM platform development, serving as a reference for current and future team members.

Table of Contents
1. Collaboration Principles
2. Session Workflow
3. Documentation Structure
4. Communication Guidelines
5. Onboarding New Team Members
1. Collaboration Principles
1.1. Simplify Technical Communication
Provide all instructions as if they were to a 12 year-old with no development experience. Assume no knowledge & use simple language.

In Practice:

Break down complex technical concepts into everyday analogies
Use step-by-step instructions with clear, explicit language
Avoid jargon or technical abbreviations without explanation
Include screenshots or visuals whenever possible
Confirm understanding before proceeding
1.2. Prioritize User Experience Impact
Wherever a decision will have an impact on the end-product & the user experience, please flag this clearly and walk through the implications.

In Practice:

Precede UX-impacting decisions with "🚩 UX IMPACT:" to make them visually distinct
Explain both immediate and long-term consequences of decisions
Present multiple options with their respective user experience trade-offs
Consider different user personas when evaluating impacts
Use simple mockups or user journey maps to illustrate effects
1.3. Seek Complete Context
At times, you will have 90% of the context needed to make a decision. Do not proceed with 90% context. Ask follow-up multiple choice questions to achieve full clarity on intent and vision.

In Practice:

Identify and acknowledge information gaps explicitly
Frame questions to clarify specific aspects of uncertainty
Provide multiple-choice options to simplify decision-making
Summarize understanding after receiving clarification
Document the complete context that led to a decision
1.4. Maintain Living Documentation
Ensure all documentation is kept up to date frequently, as we never know when our context window will close.

In Practice:

Update documentation immediately after implementing changes
Create session transition documents at the end of each working session
Use clear version history with dates and key changes
Store documentation in the GitHub repository
Review documentation regularly for completeness and accuracy
1.5. Break Down Complex Tasks
Always divide technical implementations into clearly defined, manageable chunks that can be explained and completed one at a time.

In Practice:

Structure work into small, logical increments
Label steps clearly with numbers or phase names
Provide context for how each piece fits into the larger whole
Identify dependencies between tasks
Celebrate completion of each chunk to maintain momentum
1.6. Confirm Understanding Regularly
Regularly validate that we have the same understanding of goals and requirements before implementing them.

In Practice:

Summarize understanding in simple terms before starting work
Use examples to illustrate interpretations
Ask specific questions to verify alignment
Create lightweight specifications for significant features
Check in after completing key milestones
1.7. Use Visual Representations
Use diagrams, ASCII charts, or simplified visualizations to explain complex relationships and architectures.

In Practice:

Create entity relationship diagrams for database components
Use flowcharts for user journeys and processes
Implement simple ASCII diagrams for immediate clarity
Develop architectural diagrams showing system components
Complement visuals with simple written explanations
1.8. Document the "Why" Not Just the "What"
Always explain reasoning behind technical decisions to preserve the decision context for future reference.

In Practice:

Record alternatives that were considered
Document the specific constraints that influenced decisions
Explain both technical and business factors in decision-making
Note any assumptions made during the decision process
Create a decision log that captures context, not just outcomes
1.9. Address Errors as Learning Opportunities
When something doesn't work, provide detailed explanations of what went wrong and how to fix it, creating teaching moments.

In Practice:

Explain errors in simple terms without technical jargon
Break down troubleshooting into clear steps
Use errors to teach underlying concepts
Document common issues and their solutions
Build a knowledge base of lessons learned
1.10. Prioritize Working Software
Focus on getting functional implementations that can be iterated upon rather than seeking theoretical perfection.

In Practice:

Implement minimal viable solutions first
Test functionality early and often
Document areas for future refinement
Balance technical debt against delivery timeline
Celebrate progress over perfection
2. Session Workflow
2.1. Session Start
Upload the latest session transition document
Share any specific documentation relevant to the current tasks
Briefly review where we left off and today's objectives
Confirm the approach before diving into implementation
2.2. During Session
Work through tasks step-by-step, confirming completion of each
Document decisions and reasoning as they occur
Flag any UX-impacting decisions for explicit discussion
Update technical documentation as changes are implemented
Maintain a parking lot for ideas or questions that aren't immediately relevant
2.3. Session End
Create a session transition document covering:
What was accomplished
Decisions made and their rationale
Challenges encountered and solutions
Exact next steps for the following session
Update project status in visual map
Ensure all code and documentation changes are committed to GitHub
3. Documentation Structure
3.1. Core Documents
Project Guide (/docs/wwfm-project-guide.md)
Comprehensive overview of project vision and architecture
Current project status and roadmap
Key user flows and platform principles
Technical Reference (/docs/wwfm-technical-reference.md)
Detailed technical specifications and database schema
Configuration details for all services
Decision log and technical debt tracking
Collaboration Guide (/docs/wwfm-collaboration-guide.md)
Collaboration principles and practices
Session workflow guidelines
Documentation structure and standards
3.2. Session Transition Documents
Located in /docs/sessions/session-YYYY-MM-DD.md

Structure:

markdown
# WWFM Session Transition: YYYY-MM-DD

## Accomplishments
- [Specific task completed]
- [Feature implemented]

## Key Decisions
- [Decision made] - Rationale: [Brief explanation]

## Challenges & Solutions
- [Challenge encountered] - Solution: [How resolved or next steps]

## Next Tasks (Prioritized)
1. [Immediate next task with specific details]
2. [Follow-up task]

## Relevant Documentation
- [Link to relevant doc in GitHub]
- [Another link]

## Environment/Configuration Changes
- [Any changes to environment variables, dependencies, etc.]
4. Communication Guidelines
4.1. Technical Explanations
Start with the big picture before details
Use everyday analogies for complex concepts
Provide context for why something works a certain way
Include examples that illustrate the concept
Link to external resources for deeper understanding
4.2. Decision-Making Process
Clearly state the problem or decision needed
Present options with pros and cons
Highlight implications for user experience
Make recommendations with supporting rationale
Document the final decision and context
4.3. Technical Instruction Format
Begin with the purpose of the task
List prerequisites or dependencies
Provide step-by-step instructions
Include expected outcomes
Address common issues or pitfalls
5. Onboarding New Team Members
5.1. Essential Documents
Project Guide - For understanding the overall vision
Technical Reference - For technical implementation details
Collaboration Guide - For process and workflow information
Latest session transition document - For current status
5.2. First-Time Setup
Clone GitHub repository
Set up local environment variables
Install dependencies
Run local development server
Connect to Supabase project
5.3. Development Workflow
Pull latest changes from GitHub
Implement features or fixes
Update relevant documentation
Commit changes with descriptive messages
Push changes to GitHub (triggers automatic deployment)
Document Review Log
Date	Reviewer	Changes Made	Next Review
2025-05-18	jandy1990 & Claude	Initial creation of document	End of next session
