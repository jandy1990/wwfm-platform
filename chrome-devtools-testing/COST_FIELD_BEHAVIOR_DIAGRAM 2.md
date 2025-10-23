# DosageForm Cost Field Behavior - Visual Guide

## Cost Field Location

```
┌─────────────────────────────────────────────────────────────┐
│                    DosageForm Flow                           │
└─────────────────────────────────────────────────────────────┘

Step 1: Dosage + Effectiveness
├── Dose amount: 500
├── Dose unit: mg
├── Frequency: twice daily
├── Length of use: 3-6 months
├── Effectiveness: ⭐⭐⭐⭐
└── Time to results: 1-2 weeks
         │
         ├──> Continue
         ▼
Step 2: Side Effects
├── ☑ None
├── ☐ Nausea
├── ☐ Headache
└── ☐ Dizziness
         │
         ├──> Continue
         ▼
Step 3: Failed Solutions (Optional)
└── (Can skip)
         │
         ├──> Submit
         ▼
┌─────────────────────────────────────────────────────────────┐
│              SUCCESS SCREEN                                  │
│         ⬇️ COST FIELD APPEARS HERE ⬇️                        │
└─────────────────────────────────────────────────────────────┘
│
├── Brand (optional)
├── Form (optional)
├── Notes (optional)
└── **COST FIELD** ⬅️ Different behavior per category!
```

---

## Cost Field Behavior by Category

### 1️⃣ medications

```
┌────────────────────────────────────────┐
│  💊 Medications                        │
├────────────────────────────────────────┤
│                                        │
│  Cost? *                               │
│  ┌──────────────────────────────────┐ │
│  │ Select cost range...          ▼ │ │
│  └──────────────────────────────────┘ │
│                                        │
│  Options:                              │
│  • Free                                │
│  • I don't remember                    │
│  • $10-25        ⬅️ ONE-TIME ONLY      │
│  • $25-50                              │
│  • $50-100                             │
│  • $100-200                            │
│  • $200-500                            │
│  • Over $500                           │
│                                        │
└────────────────────────────────────────┘

❌ NO Monthly/One-time toggle
✅ Only one-time cost options shown
```

### 2️⃣ supplements_vitamins

```
┌────────────────────────────────────────┐
│  💊 Supplements & Vitamins             │
├────────────────────────────────────────┤
│                                        │
│  ┌─────────────┬─────────────┐        │
│  │  Monthly    │  One-time   │ ⬅️     │
│  └─────────────┴─────────────┘  TOGGLE│
│                                        │
│  Cost? *                               │
│  ┌──────────────────────────────────┐ │
│  │ Select cost range...          ▼ │ │
│  └──────────────────────────────────┘ │
│                                        │
│  When "Monthly" selected:              │
│  • Under $10/month                     │
│  • $10-25/month                        │
│  • $25-50/month                        │
│  • $50-100/month                       │
│                                        │
│  When "One-time" selected:             │
│  • $10-25                              │
│  • $25-50                              │
│  • $50-100                             │
│  • $100-200                            │
│                                        │
└────────────────────────────────────────┘

✅ Monthly/One-time toggle visible
✅ Both cost option types available
```

### 3️⃣ natural_remedies

```
┌────────────────────────────────────────┐
│  🌿 Natural Remedies                   │
├────────────────────────────────────────┤
│                                        │
│  Same behavior as supplements_vitamins │
│                                        │
│  ✅ Toggle visible                     │
│  ✅ Both monthly/one-time options      │
│                                        │
└────────────────────────────────────────┘
```

### 4️⃣ beauty_skincare

```
┌────────────────────────────────────────┐
│  💄 Beauty & Skincare                  │
├────────────────────────────────────────┤
│                                        │
│  Same behavior as supplements_vitamins │
│                                        │
│  ✅ Toggle visible                     │
│  ✅ Both monthly/one-time options      │
│                                        │
└────────────────────────────────────────┘
```

---

## Code Implementation

### State Initialization

```typescript
// Line 109-111
const [costType, setCostType] = useState<'monthly' | 'one_time' | ''>(
  category === 'medications' ? 'one_time' : ''
  //          ⬆️                   ⬆️          ⬆️
  //      If meds?            Lock to      Others:
  //                          one-time     user picks
);
```

### Toggle Rendering

```typescript
// Line 1054-1076
{category !== 'medications' && (
  //     ⬆️ Hide toggle for medications
  <div className="flex gap-2 mb-2">
    <button onClick={() => setCostType('monthly')}>
      Monthly
    </button>
    <button onClick={() => setCostType('one_time')}>
      One-time
    </button>
  </div>
)}
```

### Dropdown Options

```typescript
// Line 1088-1115
{costType === 'monthly' ? (
  // Monthly options
  <>
    <option value="Under $10/month">Under $10/month</option>
    <option value="$10-25/month">$10-25/month</option>
    ...
  </>
) : (
  // One-time options
  <>
    <option value="$10-25">$10-25</option>
    <option value="$25-50">$25-50</option>
    ...
  </>
)}
```

---

## Data Flow

```
┌─────────────────┐
│  User fills     │
│  DosageForm     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Submit (Step 3)                │
│  • Creates solution record      │
│  • Creates rating record        │
│  • Creates implementation link  │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Success Screen                 │
│  • Shows cost field             │
│  • Behavior based on category   │
└────────┬────────────────────────┘
         │
         ▼
┌─────────────────────────────────┐
│  Update Solution Fields         │
│  • cost: "$10-25" or            │
│          "$10-25/month"         │
│  • dosage_cost_type:            │
│          "monthly" or           │
│          "one_time"             │
│  • cost_type (legacy):          │
│          "recurring" or         │
│          "one_time"             │
└─────────────────────────────────┘
```

---

## Expected Database Values

### medications

```json
{
  "cost": "$10-25",
  "dosage_cost_type": "one_time",
  "cost_type": "one_time"
}
```

### supplements_vitamins (if user selects Monthly)

```json
{
  "cost": "$10-25/month",
  "dosage_cost_type": "monthly",
  "cost_type": "recurring"
}
```

### supplements_vitamins (if user selects One-time)

```json
{
  "cost": "$10-25",
  "dosage_cost_type": "one_time",
  "cost_type": "one_time"
}
```

---

## Testing Checklist

### ✅ medications
- [ ] Cost toggle NOT visible on success screen
- [ ] Cost dropdown shows only one-time options ($10-25, $25-50, etc.)
- [ ] Backend receives `dosage_cost_type: "one_time"`
- [ ] Can submit successfully

### ✅ supplements_vitamins
- [ ] Cost toggle IS visible on success screen
- [ ] Can switch between Monthly and One-time
- [ ] Monthly: Shows monthly options ($10-25/month, etc.)
- [ ] One-time: Shows one-time options ($10-25, etc.)
- [ ] Backend receives correct `dosage_cost_type` based on selection
- [ ] Can submit successfully with both types

### ✅ natural_remedies
- [ ] Same as supplements_vitamins

### ✅ beauty_skincare
- [ ] Same as supplements_vitamins
