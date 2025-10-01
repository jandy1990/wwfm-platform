import { getHomePageData } from '@/app/actions/home';
import HeroSection from '@/components/home/HeroSection';
import TrendingGoals from '@/components/home/TrendingGoals';
import ActivityFeed from '@/components/home/ActivityFeed';
import FeaturedVerbatims from '@/components/home/FeaturedVerbatims';

export default async function HomePage() {
  const data = await getHomePageData();

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <HeroSection stats={data.platformStats} />
      <TrendingGoals goals={data.trendingGoals} />
      <ActivityFeed events={data.activityFeed} />
      <FeaturedVerbatims verbatims={data.featuredVerbatims} />
    </main>
  );
}
