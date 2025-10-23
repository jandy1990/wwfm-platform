'use client';

import { useState } from 'react';
import { supabase } from '@/lib/database/client';
import { searchAllSolutions } from '@/lib/solutions/failed-solutions';

export default function TestRPC() {
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<any>(null);
  const [error, setError] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testSearch = async () => {
    setLoading(true);
    setError(null);
    setResults(null);
    
    try {
      console.log('Testing search with term:', searchTerm);
      
      // Test direct RPC call
      console.log('1. Testing direct RPC call...');
      const { data: rpcData, error: rpcError } = await supabase.rpc('search_all_solutions', {
        search_term: searchTerm.toLowerCase().trim()
      });
      console.log('Direct RPC Response:', { data: rpcData, error: rpcError });
      
      // Test searchAllSolutions function
      console.log('2. Testing searchAllSolutions function...');
      const functionData = await searchAllSolutions(searchTerm);
      console.log('Function Response:', functionData);
      
      if (rpcError) {
        setError(rpcError);
        setResults({ rpcError, functionData });
      } else {
        setResults({ rpcData, functionData });
      }
    } catch (err) {
      console.error('Caught error:', err);
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-8">Test RPC Function</h1>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Search Term</label>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 border rounded-lg"
            placeholder="e.g., vitamin, therapy, meditation"
          />
        </div>
        
        <button
          onClick={testSearch}
          disabled={loading || searchTerm.length < 3}
          className="px-4 py-2 bg-purple-600 text-white rounded-lg disabled:bg-gray-400"
        >
          {loading ? 'Searching...' : 'Test RPC'}
        </button>
        
        {searchTerm.length < 3 && searchTerm.length > 0 && (
          <p className="text-sm text-gray-500">Need at least 3 characters</p>
        )}
        
        {error && (
          <div className="p-4 bg-red-50 rounded-lg">
            <h3 className="font-semibold text-red-700">Error:</h3>
            <pre className="text-sm mt-2">{JSON.stringify(error, null, 2)}</pre>
          </div>
        )}
        
        {results && (
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-700">Results ({results.length} found):</h3>
            <pre className="text-sm mt-2 overflow-auto max-h-96">
              {JSON.stringify(results, null, 2)}
            </pre>
          </div>
        )}
      </div>
    </div>
  );
}