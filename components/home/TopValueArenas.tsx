import Link from 'next/link';
import { TopValueArena } from '@/types/home';
import { Sparkles } from 'lucide-react';

interface TopValueArenasProps {
  arenas: TopValueArena[];
}

interface ArenaCardProps {
  arena: TopValueArena;
  rank: number;
}

function ArenaCard({ arena, rank }: ArenaCardProps) {
  // Calculate visual representation of value (out of 5 stars)
  const stars = Math.round(arena.avgLastingValue);
  const fullStars = '★'.repeat(stars);
  const emptyStars = '☆'.repeat(5 - stars);

  return (
    <Link
      href={`/arena/${arena.slug}`}
      className="block p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md hover:shadow-xl transition-all duration-200 border-2 border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-600 group relative"
    >
      {/* Rank Badge */}
      <div className="absolute -top-3 -left-3 w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg">
        {rank}
      </div>

      <div className="space-y-3">
        <h3 className="font-bold text-lg text-gray-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors pr-6">
          {arena.name}
        </h3>

        {arena.description && (
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {arena.description}
          </p>
        )}

        {/* Lasting Impact Score Display */}
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-gray-500 dark:text-gray-400 font-medium">
              Lasting Impact
            </span>
            <div className="flex items-center gap-1">
              <span className="text-xl text-yellow-500">
                {fullStars}
              </span>
              <span className="text-xl text-gray-300 dark:text-gray-600">
                {emptyStars}
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {arena.goalCount} goals
            </span>
            <span className="text-lg font-bold text-purple-600 dark:text-purple-400">
              {arena.avgLastingValue.toFixed(1)}
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function TopValueArenas({ arenas }: TopValueArenasProps) {
  if (arenas.length === 0) {
    return null;
  }

  return (
    <section className="py-12 px-4 bg-gradient-to-br from-purple-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3">
            <Sparkles className="w-6 h-6 text-purple-600 dark:text-purple-400" />
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Life Areas with Lasting Impact
            </h2>
          </div>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Ranked by long-term benefit 6+ months after goal achievement
          </p>
        </div>

        {/* Arena Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {arenas.map((arena, index) => (
            <ArenaCard key={arena.id} arena={arena} rank={index + 1} />
          ))}
        </div>

        {/* Info Footer */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Scores based on {arenas.reduce((sum, a) => sum + a.goalCount, 0)} goals.
            Reflects AI estimates of lasting impact 6+ months after goal achievement.
          </p>
        </div>
      </div>
    </section>
  );
}
