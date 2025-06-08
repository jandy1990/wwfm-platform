import { PageLoadingSkeleton } from '@/components/ui/SkeletonLoader'

export default function Loading() {
  return (
    <PageLoadingSkeleton 
      type="grid"
      showHeader={true}
      showSearch={true}
    />
  )
}