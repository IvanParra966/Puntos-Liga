import AppNavbar from '../shared/components/AppNavbar';
import AppRouter from './router';

export default function App() {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <AppNavbar />
      <main className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        <AppRouter />
      </main>
    </div>
  );
}