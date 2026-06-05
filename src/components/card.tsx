'use client';

type CardProps = {
  title: string;
  children: React.ReactNode;
};

export function Card({ title, children }: CardProps) {
  return (
    <section className="rounded-xl border border-bifrost-border bg-bifrost-panel p-6 shadow-sm">
      <h2 className="text-base font-medium text-bifrost-ice">{title}</h2>
      <div className="mt-3 text-sm text-slate-300">{children}</div>
    </section>
  );
}

export function RiskBadge({ level }: { level: 'LOW' | 'MEDIUM' | 'HIGH' | 'BLOCKED' }) {
  const color =
    level === 'LOW'
      ? 'text-bifrost-ok'
      : level === 'MEDIUM'
      ? 'text-bifrost-warn'
      : level === 'HIGH'
      ? 'text-bifrost-danger'
      : 'text-red-300';

  return <span className={`text-xs font-semibold ${color}`}>{level}</span>;
}
