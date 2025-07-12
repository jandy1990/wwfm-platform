import { PageLoadingSkeleton } from '@/components/atoms/SkeletonLoader'

export default function Loading() {
  return (
    <PageLoadingSkeleton 
      type="grid"
      showHeader={true}
      showIcon={true}
    />
  )
}