import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import SearchBar from "./components/SearchBar";


function App() {
  const [results, setResults] = useState<null | { sql: string; columns: string[]; rows: any[][] }> (null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleQuery = async (query: string) => {
    setLoading(true);
    setError("");
    setResults(null);

    try {
      const res = await fetch("http://localhost:8000/query", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query }),
      });

      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setResults(data);
      }
    } catch (err) {
      setError("Failed to connect to backend.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-black text-white min-h-screen px-4 py-10">
      <h1 className="text-4xl font-bold text-center">🛍️ Online Retail Explorer</h1>
      <p className="text-center text-gray-400 mt-2">Ask natural language questions about your dataset.</p>

      <SearchBar onSubmit={handleQuery} />

      {loading && <p className="text-center mt-6 text-yellow-400">Running query...</p>}
      {error && <p className="text-center mt-6 text-red-500">{error}</p>}

      {results && (
        <div className="mt-10 overflow-x-auto max-w-4xl mx-auto">
          <p className="text-sm text-gray-400 mb-2">Generated SQL: <code className="text-green-400">{results.sql}</code></p>
          <table className="w-full border border-gray-700 text-sm">
            <thead>
              <tr>
                {results.columns.map((col) => (
                  <th key={col} className="border border-gray-700 px-2 py-1 text-left bg-gray-800">{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {results.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell: any, j: number) => (
                    <td key={j} className="border border-gray-700 px-2 py-1">{String(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default App;