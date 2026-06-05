import { redirect } from 'next/navigation';

export default function Home() {
  // Placeholder landing shell.
  // Content can be expanded later.
  return (
    <main className="space-y-8">
      <section className="space-y-3">
        <h1 className="text-2xl font-semibold text-slate-50">
          Simulate. Probe. Then execute.
        </h1>
        <p className="text-sm text-slate-400">
          Bifrost is a pre-execution safety layer for TON swaps. Next, this page will
          explain the staged flow and highlight Omniston integration.
        </p>
      </section>
    </main>
  );
}
