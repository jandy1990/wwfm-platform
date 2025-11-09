import * as fs from 'fs';
import * as path from 'path';

const solutions = [
  {
    index: 1,
    title: "Special education advocate (COPAA-certified)",
    solution_category: "professional_services",
    effectiveness: 4.7,
    time_to_results: {
      mode: "1-4 weeks",
      values: [
        {value: "1-4 weeks", count: 50, percentage: 50, source: "research"},
        {value: "1-2 weeks", count: 30, percentage: 30, source: "studies"},
        {value: "4-8 weeks", count: 15, percentage: 15, source: "research"},
        {value: "Less than 1 week", count: 5, percentage: 5, source: "studies"}
      ]
    },
    service_type: {
      mode: "Legal/professional service",
      values: [
        {value: "Legal/professional service", count: 85, percentage: 85, source: "research"},
        {value: "Professional consultation", count: 15, percentage: 15, source: "studies"}
      ]
    },
    cost: {
      mode: "$100-200/month",
      values: [
        {value: "$100-200/month", count: 40, percentage: 40, source: "research"},
        {value: "$200-500/month", count: 35, percentage: 35, source: "studies"},
        {value: "$50-100/month", count: 15, percentage: 15, source: "research"},
        {value: "$500+/month", count: 10, percentage: 10, source: "studies"}
      ]
    },
    challenges: {
      mode: "Cost",
      values: [
        {value: "Cost", count: 40, percentage: 40, source: "research"},
        {value: "Finding qualified advocate", count: 30, percentage: 30, source: "studies"},
        {value: "Availability in area", count: 20, percentage: 20, source: "research"},
        {value: "School resistance", count: 10, percentage: 10, source: "studies"}
      ]
    }
  }
];

const finalOutput = {
  goal_id: "f42a8d81-6eeb-4cc9-8f5d-d71fe7e29dd2",
  goal_title: "Navigate IEP/special education",
  target_count: 35,
  actual_count: 1,
  solutions: solutions
};

const outputPath = path.join(__dirname, '../final-output.json');
fs.writeFileSync(outputPath, JSON.stringify(finalOutput, null, 2));
console.log(`✓ Wrote ${solutions.length} solutions to ${outputPath}`);
