type Address = string;

export interface AssetMeta {
  contract_address: string;
  symbol?: string;
  decimals?: number;
}

export interface RouterMeta {
  address?: Address;
  version?: string;
  router_type?: string;
  major_version?: number;
  minor_version?: number;
}

export interface SimulateResponse {
  expected_output?: string;
  min_output?: string;
  route?: {
    routers?: RouterMeta[];
  };
  fees?: {
    total?: string;
  };
}

const TON_DECIMALS = 9;
const USDT_DECIMALS = 6;

export const TON_ADDRESS = 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c';
export const USDT_ADDRESS = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs';

export async function fetchAssets(): Promise<AssetMeta[]> {
  const res = await fetch(`https://api.ston.fi/v1/assets`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error('Failed to fetch assets');
  const data = (await res.json()) as { asset_list?: AssetMeta[] };
  return data.asset_list ?? [];
}

export async function fetchRouters(): Promise<RouterMeta[]> {
  const res = await fetch(`https://api.ston.fi/v1/routers`, {
    next: { revalidate: 60 },
  });
  if (!res.ok) throw new Error('Failed to fetch routers');
  const data = (await res.json()) as { router_list?: RouterMeta[] };
  return data.router_list ?? [];
}

export function toBaseUnits(value: number, decimals: number): string {
  const scaled = Number((value * 10 ** decimals).toFixed(0));
  return String(scaled);
}

export function fromBaseUnits(raw: string | number | undefined): string {
  if (raw == null) return '0';
  const s = typeof raw === 'number' ? String(raw) : String(raw);
  const v = s.trim();
  if (!v || v === '0') return '0';
  const signed = /^-/.test(v);
  const unsigned = signed ? v.slice(1) : v;
  if (!/^\d+$/.test(unsigned)) return v;
  const padded = unsigned.padStart(Math.max(unsigned.length, TON_DECIMALS + 1), '0');
  const int = padded.slice(0, -TON_DECIMALS) || '0';
  const frac = padded.slice(-TON_DECIMALS).replace(/0+$/, '');
  const formatted = frac ? `${int}.${frac}` : int;
  return signed ? `-${formatted}` : formatted;
}

export async function simulateSwap(params: {
  offer_address: string;
  ask_address: string;
  offer_amount: string | number;
  slippage_tolerance?: number;
}): Promise<SimulateResponse> {
  const offerAmount = typeof params.offer_amount === 'number' ? String(params.offer_amount) : params.offer_amount;
 const res = await fetch(`https://api.ston.fi/v1/swap/simulate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      offer_address: params.offer_address,
      ask_address: params.ask_address,
      offer_amount: toBaseUnits(Number(offerAmount), TON_DECIMALS),
      slippage_tolerance: params.slippage_tolerance ?? 50,
    }),
    next: { revalidate: 0 },
  });
  if (!res.ok) {
    const text = await res.text().catch(() => 'unknown');
    const trimmed = text.trim();
    if (trimmed) throw new Error(`Simulation failed: ${res.status} ${trimmed}`);
    throw new Error(`Simulation failed: ${res.status}`);
  }
  return (await res.json()) as SimulateResponse;
}
