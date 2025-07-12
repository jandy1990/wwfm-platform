import { PageLoadingSkeleton } from '@/components/atoms/SkeletonLoader'

export default function Loading() {
  return (
    <PageLoadingSkeleton 
      type="list"
      showHeader={true}
      showIcon={true}
    />
  )
}