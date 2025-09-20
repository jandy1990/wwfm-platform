'use client';
import { useState } from 'react';
import { supabase } from '@/lib/database/client';

export function SimpleTest() {
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  
  const testSupabase = async () => {
    setLoading(true);
    try {
      console.log('Testing Supabase connection...');
      const { data, error } = await supabase
        .from('category_keywords')
        .select('category')
        .limit(1);
      console.log('Supabase response:', { data, error });
      setResult({ data, error });
    } catch (e) {
      console.error('Supabase test failed:', e);
      setResult({ error: String(e) });
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="p-4 border rounded">
      <h3 className="font-bold mb-2">Supabase Connection Test</h3>
      <button 
        onClick={testSupabase}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {loading ? 'Testing...' : 'Test Supabase Connection'}
      </button>
      {result && (
        <pre className="mt-4 p-2 bg-gray-100 rounded text-sm overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}