import { useState } from 'react'

import './App.css'
import { useGetExample } from './services/example.query'

function App() {
  const [limit, setLimit] = useState(5);

  const { data, isLoading, isError } = useGetExample(
    {
      _limit: limit},
    {
      staleTime: 60_000,
    }
  );

  if (isLoading) return <div>Loading...</div>;
  if (isError) return <div>Error occurred</div>;

  return (
    <div className="App">
      <div className="card">
        <h1>Welcome to DATH 17</h1>
        <p>React + Vite + TailwindCSS</p>
        <div className="flex items-center gap-4">
          <h2>Example Data - Current limit: {limit} </h2>
          <button className="h-10 w-40 bg-black text-white" onClick={() => setLimit((prev) => prev + 5)}>Load More</button>
        </div>
        <ul>
          {data && data.map((item: any) => (
            <li key={item.id}>{item.title}</li>
          ))}
        </ul>
      </div>
    </div>
  )
}

export default App
