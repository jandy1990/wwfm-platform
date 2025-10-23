import { ActivityEvent } from '@/types/home';

interface ActivityFeedProps {
  events: ActivityEvent[];
}

interface ActivityCardProps {
  event: ActivityEvent;
}

function ActivityCard({ event }: ActivityCardProps) {
  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'rating':
        return '⭐';
      case 'discussion':
        return '💬';
      case 'new_solution':
        return '✨';
      default:
        return '📌';
    }
  };

  const getActivityText = () => {
    switch (event.activityType) {
      case 'rating':
        return (
          <span>
            Someone rated <span className="font-medium text-purple-600 dark:text-purple-400">{event.solutionTitle}</span> for{' '}
            <span className="font-medium">{event.goalTitle}</span>
            {event.rating && (
              <span className="ml-2 text-yellow-600 dark:text-yellow-400">
                {event.rating}★
              </span>
            )}
          </span>
        );
      case 'discussion':
        return (
          <div>
            <div className="mb-2">
              Someone shared insights about <span className="font-medium">{event.goalTitle}</span>
              {event.upvotes && event.upvotes > 1 && (
                <span className="ml-2 text-green-600 dark:text-green-400 text-sm">
                  +{event.upvotes} upvotes
                </span>
              )}
            </div>
            {event.contentExcerpt && (
              <div className="text-sm text-gray-600 dark:text-gray-400 italic border-l-2 border-gray-300 dark:border-gray-600 pl-3">
                "{event.contentExcerpt}"
              </div>
            )}
          </div>
        );
      case 'new_solution':
        return (
          <span>
            New solution added: <span className="font-medium text-purple-600 dark:text-purple-400">{event.solutionTitle}</span> for{' '}
            <span className="font-medium">{event.goalTitle}</span>
            {event.rating && (
              <span className="ml-2 text-yellow-600 dark:text-yellow-400">
                {event.rating}★ avg
              </span>
            )}
          </span>
        );
      default:
        return <span>Recent activity for {event.goalTitle}</span>;
    }
  };

  return (
    <div className="flex items-start space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
      <div className="flex-shrink-0 flex items-center space-x-2">
        <div className="text-lg">{event.goalEmoji}</div>
        <div className="text-sm">{getActivityIcon(event.activityType)}</div>
      </div>

      <div className="flex-1 min-w-0">
        <div className="text-sm text-gray-900 dark:text-white">
          {getActivityText()}
        </div>
        <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
          {formatTimeAgo(event.createdAt)}
        </div>
      </div>
    </div>
  );
}

export default function ActivityFeed({ events }: ActivityFeedProps) {
  if (events.length === 0) {
    return (
      <section className="py-20 px-4 bg-white dark:bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-gray-900 mb-6 text-center">
            Recent Activity
          </h2>
          <div className="text-center text-gray-600 dark:text-gray-400">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-8 border border-gray-200 dark:border-gray-700">
              <div className="text-4xl mb-4">🌱</div>
              <p className="text-lg mb-2">Getting started...</p>
              <p className="text-sm">Be the first to rate a solution or join a discussion!</p>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-20 px-4 bg-white dark:bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-3xl md:text-4xl font-black tracking-tight text-gray-900 dark:text-gray-900 mb-6">
          Recent Activity
        </h2>

        <div className="space-y-4">
          {events.map((event, idx) => (
            <ActivityCard key={`${event.activityType}-${event.createdAt.getTime()}-${idx}`} event={event} />
          ))}
        </div>
      </div>
    </section>
  );
}