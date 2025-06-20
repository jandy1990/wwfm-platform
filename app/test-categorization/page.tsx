// app/test-categorization/page.tsx

import { AutoCategoryTest } from '@/components/solutions/AutoCategoryTest';
import { SimpleTest } from '@/components/solutions/SimpleTest';

export default function TestCategorizationPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Auto-Categorization Test</h1>
      <SimpleTest />
      <div className="mt-8">
        <AutoCategoryTest />
      </div>
    </div>
  );
}