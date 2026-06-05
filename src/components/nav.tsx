import Link from 'next/link';

const nav = [
  { href: '/', label: 'Home' },
  { href: '/app', label: 'Safe Swap' },
  { href: '/agent', label: 'Agent' },
  { href: '/vault', label: 'Vault' },
  { href: '/history', label: 'History' }
];

export default function Header() {
  return (
    <header className="flex items-center justify-between border-b border-bifrost-border px-1 py-3">
      <Link href="/" className="text-lg font-semibold text-bifrost-ice">
        Bifrost
      </Link>
      <nav className="flex gap-4 text-sm">
        {nav.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="text-slate-300 transition hover:text-bifrost-ice"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  );
}
