import { QueryClient, QueryClientProvider, useQuery } from '@tanstack/react-query';
import { Activity, Radio } from 'lucide-react';
import { BrowserRouter, Route, Routes } from 'react-router';

const queryClient = new QueryClient();

interface TestApi {
  message: string;
}

function HomePage() {
  const { data, isLoading, isError } = useQuery<TestApi>({
    queryKey: ['test'],
    queryFn: async () => {
      const res = await fetch('/api/test');
      return res.json()
    }
  })

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-slate-950 text-slate-100">
      <h1>DATA: {data?.message} </h1>
    </main>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<HomePage />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
