# New Goals for WWFM Database

## Status Update – 26 Oct 2025

- ✅ Inserted 29 of 30 new goals (all except **Manage stress**, which already existed in the database under id `f2e6ab47-3be6-4d7d-ab43-80908502b702`)
- ✅ Applied all 14 goal renames in production (titles + descriptions updated in place)
- 📎 See `scripts/database/apply-goal-updates.ts` for the repeatable script that performs these inserts/renames (supports `--apply` vs dry run)
- 📋 New goal ids for reference:
  - `01c3a3eb-dc71-46bd-aafb-e70d662b4342` – Live with social anxiety
  - `2748d9d8-4de2-4035-aef0-1251ab186942` – Find life purpose
  - `6ba7a7c6-c3db-46ed-a5b7-6efe4b3742d1` – Improve memory
  - `b1fc0a6c-42c5-401a-8fb5-8f6cc5dfcdbb` – Get in shape
  - `09ceeb4e-3fc0-457c-af5d-59b76d0fe5f1` – Manage diabetes
  - `5224840f-ad0f-403a-ac38-0939e69f50a1` – Manage bipolar disorder
  - `89455fb7-e0d6-4633-96f4-f88592adb8ab` – Reduce inflammation
  - `62b6c8d0-27c8-43f5-a501-7c11d1297b89` – Reduce bloating
  - `a07df0bd-841d-4bf4-885e-65675c5beba3` – Reduce headaches
  - `a94f2f16-1da8-48ee-bcdc-92ca68cb20a7` – Improve immune system
  - `b03be23e-f0b6-409d-b988-0aaaff6ba68f` – Stop hair loss
  - `c004a80e-facf-4d54-a4bc-f02c8603576b` – Improve skin texture
  - `431c1900-1cb2-4fb2-a4ec-d72b8fe83cc3` – Stop teeth grinding
  - `7a498deb-f738-4002-9b37-a23904e1fa61` – Reduce brain fog
  - `e51fd32f-18f7-47e9-bbc2-1e42abed92db` – Improve productivity
  - `37f86c02-ebc7-4128-b3da-aef50f86da5f` – Minimize distractions
  - `ecae2b05-c2ea-4f23-8f4a4dda85d` – Improve public speaking
  - `cf135170-0a08-4764-98c9-6575c54eb7a8` – Improve credit score
  - `ac42f78d-6e4f-4f0e-ab7b-4575c8e747ed` – Negotiate salary
  - `4a4dc5ce-f169-420b-a8bd-a963bf277316` – Improve communication skills
  - `83b2fd9c-d746-4ba0-b27a-a9d05f60df93` – Overcome perfectionism
  - `8aad160d-bcbd-4bbf-a136-229a93434071` – Improve endurance
  - `e1291660-5f98-4b87-aa74-2baa7880b26c` – Reduce sugar intake
  - `90eead43-734f-42b3-9000-559d1bf840da` – Wake up earlier
  - `a89ab8e3-495d-4862-ac8b-f2107265e3fd` – Quit caffeine
  - `25f47514-202c-4b26-9c67-66c352dbac47` – Quit energy drinks
  - `10fe576c-55f7-49e9-bf87-ecf1bd0c774e` – Quit junk food
  - `3e81c864-623e-4627-85d8-95ebc5898cdc` – Reduce screen time
  - `19ab1cdc-0838-4dea-ba45-1c5ed3510175` – Do digital detox

## 30 Goals to Add + 14 Goals to Rename

---

## PART 1: NEW GOALS TO ADD (30 total)

### Semantic Additions (4 goals)
These are semantically different from existing goals and fill important gaps:

1. **Live with social anxiety**
   - Different from general "Reduce anxiety"
   - Needs specific social anxiety solutions
   - Arena: Mind (Mental Health)

2. **Find life purpose**
   - Different from "Find causes I care about" (broader existential)
   - Arena: Self (Personal Growth)

3. **Improve memory**
   - Different from "Remember names and faces" (general vs specific)
   - Arena: Mind (Cognitive)

4. **Get in shape**
   - Different from "Get toned body" (broader fitness)
   - Arena: Body (Fitness)

---

### Health & Medical Conditions (11 goals)

5. **Manage stress**
   - Arena: Mind (Mental Health)
   - Solutions: Apps, supplements, meditation, therapy, exercise

6. **Manage diabetes**
   - Arena: Body (Health)
   - Solutions: Medications, doctors, apps, CGMs, diet plans

7. **Manage bipolar disorder**
   - Arena: Mind (Mental Health)
   - Solutions: Medications, psychiatrists, DBT/CBT, mood tracking apps

8. **Reduce inflammation**
   - Arena: Body (Health)
   - Solutions: Supplements, diet, exercise, natural remedies

9. **Reduce bloating**
   - Arena: Body (Digestion)
   - Solutions: Digestive enzymes, probiotics, low-FODMAP diet

10. **Reduce headaches**
    - Arena: Body (Health)
    - Solutions: Medications, supplements, hydration, doctors

11. **Improve immune system**
    - Arena: Body (Health)
    - Solutions: Vitamin D, zinc, diet, exercise, sleep optimization

12. **Stop hair loss**
    - Arena: Appearance (Hair)
    - Solutions: Finasteride, minoxidil, biotin, dermatologists, laser caps

13. **Improve skin texture**
    - Arena: Appearance (Skincare)
    - Solutions: Retinoids, microneedling, serums, procedures

14. **Stop teeth grinding**
    - Arena: Body (Health)
    - Solutions: Night guards, dentists, stress management

15. **Reduce brain fog**
    - Arena: Mind (Cognitive)
    - Solutions: B-vitamins, omega-3, sleep optimization, diet

---

### Productivity & Career Skills (7 goals)

16. **Improve productivity**
    - Arena: Self (Personal Development)
    - Solutions: Apps (Todoist, Notion), books, Pomodoro technique

17. **Minimize distractions**
    - Arena: Self (Personal Development)
    - Solutions: Apps (Freedom), noise-canceling headphones, habits

18. **Improve public speaking**
    - Arena: Career (Professional Skills)
    - Solutions: Toastmasters, courses, books, practice apps

19. **Improve credit score**
    - Arena: Money (Financial)
    - Solutions: Secured credit cards, Credit Karma, payment strategies

20. **Negotiate salary**
    - Arena: Career (Professional Skills)
    - Solutions: Books (Never Split the Difference), courses, coaches

21. **Improve communication skills**
    - Arena: Relationships (Communication) or Self (Personal Development)
    - Solutions: Books (Crucial Conversations), courses, groups

22. **Overcome perfectionism**
    - Arena: Mind (Mental Health)
    - Solutions: CBT therapy, books (Gifts of Imperfection), apps

---

### Fitness & Physical (1 goal)

23. **Improve endurance**
    - Arena: Body (Fitness)
    - Solutions: Couch to 5K, training apps, heart rate monitors

---

### Habits & Lifestyle (8 goals)

24. **Reduce sugar intake**
    - Arena: Body (Diet/Nutrition)
    - Solutions: Tracking apps, chromium supplements, substitution strategies

25. **Wake up earlier**
    - Arena: Self (Habits/Routines)
    - Solutions: Sunrise alarm clocks, Sleep Cycle app, routines

26. **Quit caffeine**
    - Arena: Mind (Addictions)
    - Solutions: Tapering protocols, supplements, alternatives

27. **Quit energy drinks**
    - Arena: Mind (Addictions)
    - Solutions: Caffeine-free alternatives, tapering, supplements

28. **Quit junk food**
    - Arena: Body (Diet/Nutrition)
    - Solutions: Meal plans, tracking apps, food addiction books

29. **Reduce screen time**
    - Arena: Tech (Digital Wellness)
    - Solutions: Screen Time apps, Freedom, digital minimalism

30. **Do digital detox**
    - Arena: Tech (Digital Wellness)
    - Solutions: Detox protocols, retreats, books

---

## PART 2: GOALS TO RENAME (14 updates)

These are existing goals with better wording:

1. **"Quiet racing mind"** → **"Stop overthinking"**
2. **"Have a flatter stomach"** → **"Lose belly fat"**
3. **"Stop insomnia"** → **"Overcome insomnia"**
4. **"Manage depression symptoms"** → **"Live with depression"**
5. **"Control OCD behaviors"** → **"Live with OCD"**
6. **"Manage ADHD symptoms"** → **"Live with ADHD"**
7. **"Control my temper"** → **"Manage anger/temper"**
8. **"Develop social ease"** → **"Improve social skills"**
9. **"Stop procrastinating"** → **"Overcome procrastination"**
10. **"Maintain deep focus"** → **"Improve focus"**
11. **"Save money consistently"** → **"Save money"**
12. **"Build muscle mass"** → **"Build muscle"**
13. **"Start exercising regularly"** → **"Start exercising"**
14. **"Get stronger"** → **"Build strength"**

---

## EXCLUDED GOALS (Too Vague for WWFM)

These were in the top 50 but don't have concrete solutions:

❌ make new friends (no rateable solutions)
❌ find compatible partner (life outcome, not process)
❌ overcome fear of rejection (too psychological)
❌ improve self-esteem (too abstract)
❌ build resilience (too vague)
❌ stop self-sabotage (too internal)
❌ get promoted (outcome not skill)
❌ increase income (too broad - how?)
❌ build wealth (which strategy?)
❌ achieve financial independence (way too broad)
❌ overcome fear of failure (too abstract)
❌ improve self-awareness (too vague)
❌ strengthen marriage (duplicate of improve communication with partner)
❌ reduce burnout (duplicate of manage stress)
❌ manage time better (duplicate of improve productivity)
❌ boost metabolism (pseudoscience concerns)

---

## DATABASE ACTIONS REQUIRED

### Action 1: INSERT 30 New Goals

```sql
-- Example structure (you'll need to fill in arena_id and other fields):

INSERT INTO goals (title, arena_id, created_at, updated_at)
VALUES
  ('Live with social anxiety', [arena_id], NOW(), NOW()),
  ('Find life purpose', [arena_id], NOW(), NOW()),
  ('Improve memory', [arena_id], NOW(), NOW()),
  ('Get in shape', [arena_id], NOW(), NOW()),
  ('Manage stress', [arena_id], NOW(), NOW()),
  ('Manage diabetes', [arena_id], NOW(), NOW()),
  -- ... (continue for all 30)
;
```

### Action 2: UPDATE 14 Renamed Goals

```sql
-- Example updates:

UPDATE goals SET title = 'Stop overthinking' WHERE title = 'Quiet racing mind';
UPDATE goals SET title = 'Lose belly fat' WHERE title = 'Have a flatter stomach';
UPDATE goals SET title = 'Overcome insomnia' WHERE title = 'Stop insomnia';
UPDATE goals SET title = 'Live with depression' WHERE title = 'Manage depression symptoms';
UPDATE goals SET title = 'Live with OCD' WHERE title = 'Control OCD behaviors';
UPDATE goals SET title = 'Live with ADHD' WHERE title = 'Manage ADHD symptoms';
UPDATE goals SET title = 'Manage anger/temper' WHERE title = 'Control my temper';
UPDATE goals SET title = 'Improve social skills' WHERE title = 'Develop social ease';
UPDATE goals SET title = 'Overcome procrastination' WHERE title = 'Stop procrastinating';
UPDATE goals SET title = 'Improve focus' WHERE title = 'Maintain deep focus';
UPDATE goals SET title = 'Save money' WHERE title = 'Save money consistently';
UPDATE goals SET title = 'Build muscle' WHERE title = 'Build muscle mass';
UPDATE goals SET title = 'Start exercising' WHERE title = 'Start exercising regularly';
UPDATE goals SET title = 'Build strength' WHERE title = 'Get stronger';
```

---

## PRIORITY ORDER FOR SOLUTION GENERATION

### Phase 1: Highest Impact (Do First)
1. Manage stress
2. Improve productivity
3. Improve credit score
4. Stop hair loss
5. Improve endurance
6. Negotiate salary
7. Minimize distractions

### Phase 2: High Value
8-19. All health/medical conditions
20-22. Communication/skills goals

### Phase 3: Habits & Lifestyle
23-30. Habit change goals

---

## ARENA MAPPING SUGGESTIONS

- **Mind:** Mental health goals (stress, anxiety, depression, OCD, ADHD, bipolar, perfectionism)
- **Body:** Physical health (diabetes, inflammation, bloating, headaches, immune system, teeth grinding, endurance)
- **Appearance:** Hair loss, skin texture
- **Self:** Personal development (productivity, distractions, communication skills, memory)
- **Career:** Public speaking, negotiate salary
- **Money:** Credit score
- **Habits:** Wake earlier, reduce sugar, quit caffeine/energy drinks/junk food
- **Tech:** Screen time, digital detox

---

## NEXT STEPS

1. Map each goal to correct arena_id
2. Run INSERT statements for 30 new goals
3. Run UPDATE statements for 14 renamed goals
4. Begin AI solution generation for new goals
5. Test that renamed goals still link to existing solutions correctly

Total Database Impact:
- 30 new goal records
- 14 updated goal titles
- **From 228 → 258 total goals** (13% increase)
