import { redirect } from 'next/navigation';
import { createServerSupabaseClient } from '@/lib/database/server';
import { CustomSpecialtyReview } from '@/components/admin/CustomSpecialtyReview';

export default async function AdminDashboard() {
  const supabase = await createServerSupabaseClient();

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login');
  }

  // Check if user is admin
  const { data: adminUser } = await supabase
    .from('admin_users')
    .select('user_id')
    .eq('user_id', user.id)
    .single();

  if (!adminUser) {
    redirect('/');
  }

  // Fetch custom specialty data
  const { data: customSpecialties } = await supabase.rpc('get_custom_specialty_counts');

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Admin Dashboard
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Manage WWFM platform content and moderate user submissions
          </p>
        </div>

        <div className="grid gap-6">
          {/* Custom Specialty Review Section */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Custom Professional Service Types
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Review user-submitted custom service types. Promote popular entries (10+ uses) to the main dropdown.
            </p>
            <CustomSpecialtyReview specialties={customSpecialties || []} />
          </div>

          {/* Placeholder for future admin features */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
              Coming Soon
            </h2>
            <ul className="space-y-2 text-gray-600 dark:text-gray-400">
              <li>• Solution moderation queue</li>
              <li>• User management</li>
              <li>• Analytics and reporting</li>
              <li>• Content flags review</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
