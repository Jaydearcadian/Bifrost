'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { Card, RiskBadge } from '@/components/card';
import { checkPolicy } from '@/lib/bifrost/policy';
import { calculateCanaryAmount } from '@/lib/bifrost/canary';
import { buildSandboxReport, deriveRisk, deriveVerdict } from '@/lib/bifrost/sandbox';
import type { Quote, SandboxReport } from '@/lib/bifrost/types';
import { fetchAssets, fetchRouters, simulateSwap, TON_ADDRESS, USDT_ADDRESS } from '@/lib/bifrost/stonfi';
import type { Policy } from '@/lib/bifrost/types';
import { composeProof } from '@/lib/bifrost/proof-of-payable';
import type { Proof } from '@/lib/bifrost/proof-of-payable';

const TonConnectWallet = dynamic(() => import('@/components/tonconnect-wallet'), { ssr: false });

const defaultPolicy: Policy = {
  allowedProtocols: ['Omniston', 'STON.fi'],
  allowedActions: ['swap'],
  allowedAssets: [TON_ADDRESS, USDT_ADDRESS],
  maxAmountPerSwap: '5',
  maxDailyVolume: '20',
  maxSlippageBps: 100,
  requireCanary: true,
  requireHumanApproval: true,
  blockUnknownTokens: true,
};

export default function AppPage() {
  const [inputAddress, setInputAddress] = useState(TON_ADDRESS);
  const [outputAddress, setOutputAddress] = useState(USDT_ADDRESS);
  const [amount, setAmount] = useState('3');
  const [canaryStatus, setCanaryStatus] = useState<'NOT_SENT' | 'SENT' | 'PASSED' | 'FAILED'>('NOT_SENT');
  const [report, setReport] = useState<SandboxReport | null>(null);
  const [proof, setProof] = useState<Proof | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [symbolMap, setSymbolMap] = useState<Record<string, string>>({});
  const [assetsLoaded, setAssetsLoaded] = useState(false);
  const [routers, setRouters] = useState<any[]>([]);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const [a, r] = await Promise.all([fetchAssets(), fetchRouters()]);
        if (!cancelled) {
          const next: Record<string, string> = {};
          a.forEach((item) => {
            if (item.contract_address) next[item.contract_address] = item.symbol ?? item.contract_address;
          });
          next[TON_ADDRESS] = 'TON';
          next[USDT_ADDRESS] = 'USD₮';
          setSymbolMap(next);
          setRouters(Array.isArray((r as any).router_list) ? (r as any).router_list : []);
          setAssetsLoaded(true);
        }
      } catch {
        setAssetsLoaded(true);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const displaySymbol = (address: string) => {
    if (address === inputAddress && address === outputAddress) return symbolMap[address] ?? address;
    if (address === outputAddress) return symbolMap[address] ?? 'USD₮';
    return symbolMap[address] ?? 'TON';
  };

  const policyText = `{
  "allowedProtocols": ${JSON.stringify(defaultPolicy.allowedProtocols)},
  "allowedActions": ${JSON.stringify(defaultPolicy.allowedActions)},
  "allowedAssets": ${JSON.stringify([symbolMap[TON_ADDRESS] ?? 'TON', symbolMap[USDT_ADDRESS] ?? 'USDT'])},
  "maxAmountPerSwap": "${defaultPolicy.maxAmountPerSwap}",
  "maxDailyVolume": "${defaultPolicy.maxDailyVolume}",
  "maxSlippageBps": ${defaultPolicy.maxSlippageBps},
  "requireCanary": ${defaultPolicy.requireCanary},
  "requireHumanApproval": ${defaultPolicy.requireHumanApproval},
  "blockUnknownTokens": ${defaultPolicy.blockUnknownTokens}
}`;

  const runSwap = async () => {
    setLoading(true);
    setError(null);
    setReport(null);
    setProof(null);
    try {
      const res = await simulateSwap({
        offer_address: inputAddress,
        ask_address: outputAddress,
        offer_amount: Number(amount),
        slippage_tolerance: 50,
      });

      const expectedOutput = toDecimal(res.expected_output ?? '0');
      const minOutput = toDecimal(res.min_output ?? String(Math.max(0, Number(expectedOutput) * 0.998)));
      const route = (res.route?.routers ?? []).map((item: any) => item?.address ?? 'STON.fi');

      const newQuote: Quote = {
        expectedOutput,
        minOutput,
        route,
        expiresAt: Date.now() + 1000 * 60,
        raw: res,
      };

      const policyReturn = checkPolicy(
        {
          actorType: 'human',
          protocol: route[0] ?? 'Omniston',
          action: 'swap',
          inputAsset: inputAddress,
          outputAsset: outputAddress,
          amount,
        },
        defaultPolicy,
        70,
        true,
        '0',
      );

      const canaryAmt = calculateCanaryAmount(Number(amount));

      const canaryRequired =
        defaultPolicy.requireCanary && policyReturn.protocolAllowed && policyReturn.actionAllowed && !policyReturn.unknownTokenBlocked;
      const canary = {
        required: canaryRequired,
        amount: String(canaryAmt),
        status: canaryStatus,
      };

      const nextReport = buildSandboxReport({
        intent: {
          actorType: 'human',
          protocol: route[0] ?? 'Omniston',
          action: 'swap',
          inputAsset: inputAddress,
          outputAsset: outputAddress,
          amount,
        },
        quote: newQuote,
        policyReturn,
        canary,
      });

      const allowed = policyReturn.protocolAllowed && policyReturn.actionAllowed && !policyReturn.unknownTokenBlocked;
      const lifecycle: Proof['lifecycle'] = allowed ? 'policy_approved' : 'rejected';
      const proofAsset: Proof['asset'] = outputAddress === USDT_ADDRESS ? 'USDT' : 'TON';
      const composed = await composeProof({
        lifecycle,
        network: 'ton-testnet',
        asset: proofAsset,
        actor: 'human',
        target: inputAddress,
        amount,
        intentHash: `intent_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
        policyHash: `policy_${defaultPolicy.allowedProtocols.join('_')}`,
        approvalHash: allowed ? `approval_${Date.now()}` : undefined,
        rejectionHash: allowed ? undefined : `rejection_${Date.now()}`,
        denialReason: allowed ? undefined : (policyReturn.warnings[0] ?? 'policy_denied'),
      });

      setProof(composed);
      setReport(nextReport);
      if (canaryRequired) setCanaryStatus('SENT');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Swap simulation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="space-y-6">
      <section className="space-y-2">
        <h1 className="text-xl font-semibold text-slate-100">Safe Swap</h1>
        <p className="text-sm text-slate-400">
          Real STON.fi REST integration + Bifrost policy/canary + wallet connect + proof lifecycle.
        </p>
        <TonConnectWallet />
      </section>

      <div className="grid gap-4 md:grid-cols-2">
        <section className="rounded-xl border border-bifrost-border bg-bifrost-panel p-4 shadow-sm">
          <h2 className="text-sm font-medium text-bifrost-ice">Swap Intent</h2>
          <div className="mt-3 space-y-3">
            <div>
              <label className="text-xs text-slate-400">Input</label>
              <select value={inputAddress} onChange={(e) => setInputAddress(e.target.value)} className="mt-1 w-full rounded-lg border border-bifrost-border bg-bifrost-bg p-2 text-sm">
                <option value={TON_ADDRESS}>TON</option>
                <option value={USDT_ADDRESS}>USD₮</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400">Output</label>
              <select value={outputAddress} onChange={(e) => setOutputAddress(e.target.value)} className="mt-1 w-full rounded-lg border border-bifrost-border bg-bifrost-bg p-2 text-sm">
                <option value={TON_ADDRESS}>TON</option>
                <option value={USDT_ADDRESS}>USD₮</option>
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-400">Amount</label>
              <input value={amount} onChange={(e) => setAmount(e.target.value)} className="mt-1 w-full rounded-lg border border-bifrost-border bg-bifrost-bg p-2 text-sm" />
            </div>
            <button type="button" onClick={runSwap} disabled={loading} className="rounded-lg border border-bifrost-border px-3 py-2 text-xs hover:border-bifrost-ice disabled:opacity-60">
              {loading ? 'Simulating...' : 'Simulate Swap'}
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-bifrost-border bg-bifrost-panel p-4 shadow-sm">
          <h2 className="text-sm font-medium text-bifrost-ice">AgentVault Policy</h2>
          <pre className="mt-3 h-64 overflow-auto rounded-lg border border-bifrost-border bg-bifrost-bg p-3 text-xs font-mono text-slate-200">{policyText}</pre>
        </section>
      </div>

      {report && (
        <section className="space-y-4 rounded-xl border border-bifrost-border bg-bifrost-panel p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-bifrost-ice">Sandbox Report</h2>
            <RiskBadge level={deriveRisk(report.policy)} />
          </div>
          <div className="space-y-1 text-xs text-slate-300">
            <p>Expected output: {report.quote?.expectedOutput ?? '—'}</p>
            <p>Min output: {report.quote?.minOutput ?? '—'}</p>
            <p>Route: {(report.quote?.route ?? []).join(' -> ') || '—'}</p>
          </div>
          <ul className="space-y-1 text-xs text-slate-300">
            {report.policy.warnings.map((warning) => (
              <li key={warning} className="text-bifrost-warn">{warning}</li>
            ))}
          </ul>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="text-xs text-slate-300">
              Canary required: {String(report.canary.required)} | Amount: {report.canary.amount}
            </div>
            <div className="text-xs text-slate-300">Verdict: {report.verdict}</div>
          </div>
        </section>
      )}

      {proof && (
        <section className="space-y-3 rounded-xl border border-bifrost-border bg-bifrost-panel p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium text-bifrost-ice">Proof of Payable</h2>
            <span className="text-xs text-slate-300">lifecycle: {proof.lifecycle}</span>
          </div>
          <pre className="h-56 overflow-auto rounded-lg border border-bifrost-border bg-bifrost-bg p-3 text-xs font-mono text-slate-200">{JSON.stringify(proof, null, 2)}</pre>
        </section>
      )}

      {error && <p className="text-xs text-bifrost-danger">{error}</p>}
    </main>
  );
}

function toDecimal(raw: string | number | undefined) {
  if (raw == null) return '0';
  const s = typeof raw === 'number' ? String(raw) : raw;
  if (!s || s === '0') return '0';
  const fromRaw = (v: string) => {
    try {
      const bn = BigInt(v);
      const normalized = bn.toString().padStart(1, '0');
      if (normalized.length <= 9) return normalized;
      const whole = normalized.slice(0, -9);
      const frac = normalized.slice(-9).padEnd(9, '0').replace(/0+$/, '');
      return frac ? `${whole}.${frac}` : whole;
    } catch {
      return s;
    }
  };
  return fromRaw(s);
}
