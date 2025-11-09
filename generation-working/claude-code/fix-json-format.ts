import fs from 'fs';
import path from 'path';

const inputPath = path.join(__dirname, '../final-output.json');
const data = JSON.parse(fs.readFileSync(inputPath, 'utf-8'));

const fixed = {
  goal_id: data.goal_id,
  goal_title: data.goal_title,
  target_count: data.target_count,
  actual_count: data.actual_count,
  solutions: data.solutions.map((sol: any, idx: number) => {
    const result: any = {
      index: idx + 1,
      title: sol.solution_title,
      solution_category: sol.category,
      effectiveness: sol.effectiveness
    };

    // Copy all fields from sol.fields to top level
    if (sol.fields) {
      Object.assign(result, sol.fields);
    }

    return result;
  })
};

fs.writeFileSync(inputPath, JSON.stringify(fixed, null, 2));
console.log('✓ Fixed JSON format');
console.log(`  Solutions: ${fixed.solutions.length}`);
console.log(`  First solution: ${fixed.solutions[0].title}`);
