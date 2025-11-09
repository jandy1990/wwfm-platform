import { getHomePageData } from '@/app/actions/home';
import HeroSection from '@/components/home/HeroSection';
import HowItWorksPreview from '@/components/home/HowItWorksPreview';
import TrendingGoals from '@/components/home/TrendingGoals';
import TopValueArenas from '@/components/home/TopValueArenas';
import ActivityFeed from '@/components/home/ActivityFeed';
import FeaturedVerbatims from '@/components/home/FeaturedVerbatims';

// Cache homepage for 5 minutes - balance freshness with performance
export const revalidate = 300

export default async function HomePage() {
  const data = await getHomePageData();

  return (
    <main className="min-h-screen bg-white dark:bg-gray-900">
      <HeroSection stats={data.platformStats} />
      <HowItWorksPreview />
      <TrendingGoals goals={data.trendingGoals} />
      <TopValueArenas arenas={data.topValueArenas} />
      <ActivityFeed events={data.activityFeed} />
      <FeaturedVerbatims verbatims={data.featuredVerbatims} />
    </main>
  );
}
