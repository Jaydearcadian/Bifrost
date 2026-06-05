'use client';

import { useEffect, useState } from 'react';
import { TonConnectUIProvider, useTonConnectUI } from '@tonconnect/ui-react';

function WalletInner() {
  const [tonConnectUi] = useTonConnectUI();
  const [address, setAddress] = useState<string | null>(null);

  useEffect(() => {
    const update = () => {
      try {
        const raw = tonConnectUi.account?.address;
        setAddress(raw ?? null);
      } catch {
        setAddress(null);
      }
    };
    update();
    const sub = tonConnectUi.onStatusChange(update);
    return () => {
      sub();
    };
  }, [tonConnectUi]);

  return (
    <div className="space-y-2">
      <p className="text-xs text-slate-300">
        Wallet: <span className="text-slate-200">{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : 'disconnected'}</span>
      </p>
      <button
        type="button"
        onClick={() => tonConnectUi.connectWallet()}
        className="rounded-lg border border-bifrost-border px-3 py-2 text-xs hover:border-bifrost-ice"
      >
        Connect TON Wallet
      </button>
    </div>
  );
}

export default function TonConnectWallet() {
  const [manifestUrl, setManifestUrl] = useState<string | null>(null);

  useEffect(() => {
    try {
      const base = 'https://jaydearcadian.github.io/Bifrost';
      setManifestUrl(`${base}/tonconnect-manifest.json`);
    } catch {
      setManifestUrl('/tonconnect-manifest.json');
    }
  }, []);

  if (!manifestUrl) return null;

  return (
    <TonConnectUIProvider manifestUrl={manifestUrl}>
      <WalletInner />
    </TonConnectUIProvider>
  );
}
