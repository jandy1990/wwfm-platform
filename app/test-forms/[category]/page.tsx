import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/database/server';
import { TestFormRenderer } from './TestFormRenderer';

interface PageProps {
  params: Promise<{ category: string }>;
  searchParams: Promise<{ goalId?: string; testMode?: string }>;
}

// Category to Form mapping
const CATEGORY_TO_FORM: Record<string, string> = {
  'apps_software': 'AppForm',
  'medications': 'DosageForm',
  'supplements_vitamins': 'DosageForm',
  'natural_remedies': 'DosageForm',
  'beauty_skincare': 'DosageForm',
  'therapists_counselors': 'SessionForm',
  'doctors_specialists': 'SessionForm',
  'coaches_mentors': 'SessionForm',
  'alternative_practitioners': 'SessionForm',
  'professional_services': 'SessionForm',
  'crisis_resources': 'SessionForm',
  'meditation_mindfulness': 'PracticeForm',
  'exercise_movement': 'PracticeForm',
  'habits_routines': 'PracticeForm',
  'hobbies_activities': 'HobbyForm',
  'diet_nutrition': 'LifestyleForm',
  'sleep': 'LifestyleForm',
  'support_groups': 'CommunityForm',
  'groups_communities': 'CommunityForm',
  'financial_products': 'FinancialForm',
  'products_devices': 'PurchaseForm',
  'books_courses': 'PurchaseForm',
  'online_services': 'PurchaseForm',
};

export default async function TestFormCategoryPage({ params, searchParams }: PageProps) {
  const resolvedParams = await params;
  const resolvedSearchParams = await searchParams;
  const category = resolvedParams.category;
  const goalId = resolvedSearchParams.goalId || '';
  const testMode = resolvedSearchParams.testMode === 'true';

  // Create Supabase client
  const supabase = await createServerSupabaseClient();

  // Check authentication
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    redirect(`/auth/signin?redirectTo=/test-forms/${category}?goalId=${goalId}&testMode=true`);
  }

  // Validate goal
  if (!goalId) {
    redirect('/test-forms');
  }

  const { data: goal, error: goalError } = await supabase
    .from('goals')
    .select('id, title')
    .eq('id', goalId)
    .single();

  if (goalError || !goal) {
    redirect('/test-forms');
  }

  const formType = CATEGORY_TO_FORM[category];
  if (!formType) {
    redirect('/test-forms');
  }

  const solutionName = `Test ${category.replace(/_/g, ' ')} solution`;

  return (
    <TestFormRenderer
      category={category}
      formType={formType}
      goalId={goal.id}
      goalTitle={goal.title}
      userId={user.id}
      solutionName={solutionName}
      testMode={testMode}
    />
  );
}
