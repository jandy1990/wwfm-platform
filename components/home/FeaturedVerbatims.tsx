import { FeaturedVerbatim } from '@/types/home';

interface FeaturedVerbatimsProps {
  verbatims: FeaturedVerbatim[];
}

interface VerbatimCardProps {
  verbatim: FeaturedVerbatim;
}

function VerbatimCard({ verbatim }: VerbatimCardProps) {
  const getTimeBadgeColor = (timeBucket: string) => {
    switch (timeBucket) {
      case 'today':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'this week':
        return 'bg-blue-100 text-blue-800 dark:bg-purple-900 dark:text-purple-200';
      case 'this month':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border-2 border-gray-200 dark:border-gray-700 shadow-lg">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center space-x-2">
          <div className="text-lg">{verbatim.goalEmoji}</div>
          <div className="font-medium text-gray-900 dark:text-white text-sm">
            {verbatim.goalTitle}
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTimeBadgeColor(verbatim.timeBucket)}`}>
            {verbatim.timeBucket}
          </span>
          {verbatim.upvotes > 0 && (
            <div className="flex items-center space-x-1 text-green-600 dark:text-green-400">
              <span className="text-xs">👍</span>
              <span className="text-xs font-medium">{verbatim.upvotes}</span>
            </div>
          )}
        </div>
      </div>

      <blockquote className="text-gray-700 dark:text-gray-300 italic">
        "{verbatim.content}"
      </blockquote>
    </div>
  );
}

export default function FeaturedVerbatims({ verbatims }: FeaturedVerbatimsProps) {
  if (verbatims.length === 0) {
    return (
      <section className="bg-gray-900 dark:bg-black py-20 px-4">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-6 text-center">
            Community Insights
          </h2>
          <div className="text-center text-gray-400">
            <div className="bg-gray-800 rounded-lg p-8 border-2 border-gray-700">
              <div className="text-4xl mb-4">💭</div>
              <p className="text-lg mb-2 text-white">Building community...</p>
              <p className="text-sm text-gray-400">Join discussions and share your experiences!</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gray-900 dark:bg-black py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-white mb-2">
            Community Insights
          </h2>
          <p className="text-gray-300 dark:text-gray-400">
            Real experiences from our community members
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {verbatims.map((verbatim, idx) => (
            <VerbatimCard key={`${verbatim.goalTitle}-${verbatim.createdAt.getTime()}-${idx}`} verbatim={verbatim} />
          ))}
        </div>
      </div>
    </section>
  );
}