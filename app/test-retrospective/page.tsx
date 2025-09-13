// Test page to preview retrospective questions
import RetrospectiveForm from '@/components/organisms/retrospective/RetrospectiveForm'

export default function TestRetrospectivePage() {
  // Mock data for preview
  const mockSchedule = {
    id: 'test-schedule-id',
    goal_title: 'Reduce anxiety and worry',
    solution_title: 'Daily meditation using Headspace app',
    achievement_date: '2025-03-08T10:30:00Z',
    schedule_type: '6_month' as const
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              📋 Test: Retrospective Questions Preview
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              This is a test page to preview the retrospective questions. 
              The form below shows exactly what users will see.
            </p>
          </div>
          
          <RetrospectiveForm 
            scheduleId={mockSchedule.id}
            goalTitle={mockSchedule.goal_title}
            goalDescription="Feeling overwhelmed by daily stress and anxiety"
            solutionTitle={mockSchedule.solution_title}
            achievementDate={mockSchedule.achievement_date}
          />
        </div>
      </div>
    </div>
  )
}