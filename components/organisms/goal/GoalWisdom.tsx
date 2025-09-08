import { GoalWisdomScore } from '@/types/retrospectives'

interface Props {
  wisdom: GoalWisdomScore | null
  minResponses?: number // Minimum responses before showing
}

export default function GoalWisdom({ wisdom, minResponses = 5 }: Props) {
  // Don't show until we have enough data
  if (!wisdom || wisdom.total_retrospectives < minResponses) {
    return null
  }

  const lastingValue = wisdom.lasting_value_score || 0
  const worthIt = wisdom.worth_pursuing_percentage || 0

  // Determine sentiment
  const getSentiment = (value: number) => {
    if (value >= 4) return { text: 'Very High', color: 'text-green-600', bg: 'bg-green-50' }
    if (value >= 3) return { text: 'Moderate', color: 'text-blue-600', bg: 'bg-blue-50' }
    if (value >= 2) return { text: 'Low', color: 'text-orange-600', bg: 'bg-orange-50' }
    return { text: 'Minimal', color: 'text-red-600', bg: 'bg-red-50' }
  }

  const sentiment = getSentiment(lastingValue)

  return (
    <div className="bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl p-6 mb-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">💭</span>
          <h3 className="text-lg font-semibold">Long-term Perspective</h3>
        </div>
        <span className="text-sm text-gray-600">
          Based on {wisdom.total_retrospectives} reflection{wisdom.total_retrospectives !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-600">Lasting Value</span>
            <span className={`text-xs px-2 py-1 rounded-full ${sentiment.bg} ${sentiment.color}`}>
              {sentiment.text}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">💎 {lastingValue.toFixed(1)}</span>
            <span className="text-gray-500">/5</span>
          </div>
        </div>

        <div className="bg-white rounded-lg p-4">
          <div className="text-sm text-gray-600 mb-2">Worth Pursuing?</div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold">
              {worthIt >= 70 ? '✅' : worthIt >= 40 ? '🤔' : '⚠️'} {worthIt.toFixed(0)}%
            </span>
          </div>
          <div className="text-xs text-gray-500 mt-1">
            say yes
          </div>
        </div>
      </div>

      {/* Interpretation */}
      <div className="text-sm text-gray-700 space-y-1">
        {lastingValue >= 4 && (
          <p>✨ Achievers report this goal created fundamental positive change in their lives.</p>
        )}
        {lastingValue >= 3 && lastingValue < 4 && (
          <p>💫 This goal typically leads to noticeable improvements, though not life-changing.</p>
        )}
        {lastingValue < 3 && (
          <p>⚡ Consider if this goal aligns with your deeper values - impact tends to be limited.</p>
        )}
      </div>

      {/* Common Benefits if available */}
      {wisdom.common_benefits && wisdom.common_benefits.length > 0 && (
        <div className="mt-4 pt-4 border-t border-purple-100">
          <h4 className="font-medium text-sm mb-2 text-gray-700">Unexpected benefits reported:</h4>
          <ul className="space-y-1">
            {wisdom.common_benefits.slice(0, 3).map((benefit, i) => (
              <li key={i} className="flex items-start gap-2 text-sm">
                <span className="text-green-500 mt-0.5">•</span>
                <span className="text-gray-600">{benefit}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}