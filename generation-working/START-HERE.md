# Start Here

Generate solutions through a **3-phase batched process**.

---

## Process

1. **PHASE-ZERO.md** - Read orientation and quality standards
2. **PHASE-ONE.md** - Generate complete solution list (run once)
3. **PHASE-TWO.md** - Generate distributions for ONE BATCH of 5-10 solutions (repeat for each batch)
4. **PHASE-THREE.md** - Merge batches, validate, finalize (run once)

---

## Workflow Example

For "Reduce anxiety" (45 solutions):

1. **Phase Zero**: Read orientation
2. **Phase One**: Generate list of 45 solution titles → Output: `solution-list.json`
3. **Phase Two - Batch 1**: Generate distributions for solutions 1-10 → Output: `batch-1.json`
4. **Phase Two - Batch 2**: Generate distributions for solutions 11-20 → Output: `batch-2.json`
5. **Phase Two - Batch 3**: Generate distributions for solutions 21-30 → Output: `batch-3.json`
6. **Phase Two - Batch 4**: Generate distributions for solutions 31-40 → Output: `batch-4.json`
7. **Phase Two - Batch 5**: Generate distributions for solutions 41-45 → Output: `batch-5.json`
8. **Phase Three**: Merge all batches, validate → Output: `final-output.json`

**Total executions**: 7 (1 + 5 + 1)
**User saves**: 7 JSON outputs

---

## Key Features

✅ **Batched**: Work on 5-10 solutions at a time (manageable token limits)
✅ **Stateless**: Each execution is independent
✅ **Resumable**: If crash, just re-run that batch
✅ **Parallelizable**: Multiple instances can work on different batches simultaneously
✅ **Quality-focused**: Smaller batches = better attention to detail

---

## Begin

Open **PHASE-ZERO.md** and follow the instructions.

Each phase has clear inputs and outputs. Execute them in order.
