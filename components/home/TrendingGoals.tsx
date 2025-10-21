import Link from 'next/link';
import { TrendingGoal } from '@/types/home';

interface TrendingGoalsProps {
  goals: TrendingGoal[];
}

interface TrendingGoalCardProps {
  goal: TrendingGoal;
}

function TrendingGoalCard({ goal }: TrendingGoalCardProps) {
  const getTrendIcon = (status: string) => {
    switch (status) {
      case 'hot':
        return '🔥';
      case 'rising':
        return '📈';
      default:
        return '💡';
    }
  };

  const getTrendColor = (status: string) => {
    switch (status) {
      case 'hot':
        return 'text-red-500';
      case 'rising':
        return 'text-orange-500';
      default:
        return 'text-blue-500';
    }
  };

  return (
    <Link
      href={`/goal/${goal.id}`}
      className="block p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-200 border border-gray-200 dark:border-gray-700 group"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="text-2xl">{goal.emoji}</div>
        <div className={`text-sm font-medium ${getTrendColor(goal.trendStatus)}`}>
          {getTrendIcon(goal.trendStatus)}
        </div>
      </div>

      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
        {goal.title}
      </h3>

      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
        <div className="flex justify-between">
          <span>Solutions:</span>
          <span className="font-medium">{goal.solutionCount}</span>
        </div>

        <div className="flex justify-between">
          <span>Avg Rating:</span>
          <span className="font-medium text-yellow-600 dark:text-yellow-400">
            {goal.avgEffectiveness}★
          </span>
        </div>

        {goal.recentRatings > 0 && (
          <div className="flex justify-between">
            <span>Recent activity:</span>
            <span className="font-medium text-green-600 dark:text-green-400">
              {goal.recentRatings} ratings
            </span>
          </div>
        )}
      </div>
    </Link>
  );
}

export default function TrendingGoals({ goals }: TrendingGoalsProps) {
  if (goals.length === 0) {
    return (
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-6 text-center">
            Goals Trending This Week
          </h2>
          <div className="text-center text-gray-600 dark:text-gray-400">
            <p>Check back soon for trending goals!</p>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Goals Trending This Week
          </h2>
          <Link
            href="/browse"
            className="text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 font-medium text-sm"
          >
            View All →
          </Link>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {goals.map((goal) => (
            <TrendingGoalCard key={goal.id} goal={goal} />
          ))}
        </div>

        {/* Show activity stats if we have trending data */}
        {goals.some(g => g.recentRatings > 0) && (
          <div className="mt-8 text-center">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {goals.reduce((sum, g) => sum + g.recentRatings, 0)} new ratings this week across trending goals
            </p>
          </div>
        )}
      </div>
    </section>
  );
}