'use client';

import { useState } from 'react';
import { promoteCustomSpecialty } from '@/app/actions/admin/promote-custom-specialty';
import { toast } from 'sonner';

interface CustomSpecialty {
  custom_specialty: string;
  usage_count: number;
  first_used_at: string;
  last_used_at: string;
}

interface CustomSpecialtyReviewProps {
  specialties: CustomSpecialty[];
}

export function CustomSpecialtyReview({ specialties }: CustomSpecialtyReviewProps) {
  const [promoting, setPromoting] = useState<string | null>(null);

  const handlePromote = async (customSpecialty: string) => {
    if (!confirm(`Promote "${customSpecialty}" to the main service type dropdown?`)) {
      return;
    }

    setPromoting(customSpecialty);

    try {
      const result = await promoteCustomSpecialty(customSpecialty);

      if (result.success) {
        toast.success('Service type promoted!', {
          description: `"${customSpecialty}" has been added to the dropdown. Refresh to see changes.`
        });
      } else {
        toast.error('Failed to promote', {
          description: result.error || 'Please try again.'
        });
      }
    } catch (error) {
      console.error('Error promoting specialty:', error);
      toast.error('An error occurred');
    } finally {
      setPromoting(null);
    }
  };

  if (!specialties || specialties.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500 dark:text-gray-400">
        No custom service types submitted yet.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {specialties.map((item) => {
        const canPromote = item.usage_count >= 10;
        const firstUsed = new Date(item.first_used_at).toLocaleDateString();
        const lastUsed = new Date(item.last_used_at).toLocaleDateString();

        return (
          <div
            key={item.custom_specialty}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 flex items-center justify-between"
          >
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {item.custom_specialty}
                </h3>
                <span className={`px-2 py-1 rounded text-xs font-medium ${
                  canPromote
                    ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                    : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}>
                  {item.usage_count} {item.usage_count === 1 ? 'use' : 'uses'}
                </span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                First used: {firstUsed} • Last used: {lastUsed}
              </p>
            </div>

            <button
              onClick={() => handlePromote(item.custom_specialty)}
              disabled={!canPromote || promoting === item.custom_specialty}
              className={`ml-4 px-4 py-2 rounded-lg font-medium transition-colors ${
                canPromote
                  ? 'bg-purple-600 hover:bg-purple-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              } ${promoting === item.custom_specialty ? 'opacity-50' : ''}`}
            >
              {promoting === item.custom_specialty ? 'Promoting...' : 'Promote to Dropdown'}
            </button>
          </div>
        );
      })}

      {specialties.filter(s => s.usage_count >= 10).length === 0 && (
        <div className="mt-4 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
          <p className="text-sm text-blue-800 dark:text-blue-200">
            💡 Custom service types with 10+ uses will be eligible for promotion to the main dropdown.
          </p>
        </div>
      )}
    </div>
  );
}
