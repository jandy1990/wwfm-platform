import { testEnvDiagnostic } from '@/app/actions/test-env-diagnostic'

export default async function TestEnvPage() {
  const result = await testEnvDiagnostic()

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Environment Variable Diagnostic</h1>
      <div className="bg-gray-100 p-4 rounded">
        <p>Has URL: {result.hasUrl ? '✅' : '❌'}</p>
        <p>Has Service Key: {result.hasServiceKey ? '✅' : '❌'}</p>
        <p>Key Length: {result.keyLength ?? 'undefined'}</p>
      </div>
      <p className="mt-4 text-sm text-gray-600">Check server console for detailed logs</p>
    </div>
  )
}
