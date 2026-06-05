const BASE_URL = 'https://api.ston.fi';

export interface StonfiAsset {
  contract_address: string;
  symbol: string;
  decimals: number;
  display_name?: string;
}

export interface StonfiSimulateResponse {
  expected_output?: string;
  min_output?: string;
  route?: {
    routers?: Array<{ address?: string; version?: string; router_type?: string }>;
  };
  fees?: { total?: string };
}

export interface StonfiRouter {
  address: string;
  router_type?: string;
  major_version?: number;
  minor_version?: number;
}

export const TON_ADDRESS = 'EQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAM9c';
export const USDT_ADDRESS = 'EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs';

export async function fetchAssets(): Promise<StonfiAsset[]> {
  const res = await fetch(`${BASE_URL}/v1/assets`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error('Failed to fetch assets');
  const json = (await res.json()) as { asset_list?: StonfiAsset[] };
  return json.asset_list ?? [];
}

export async function fetchRouters(): Promise<StonfiRouter[]> {
  const res = await fetch(`${BASE_URL}/v1/routers`, { next: { revalidate: 60 } });
  if (!res.ok) throw new Error('Failed to fetch routers');
  const json = (await res.json()) as { router_list?: StonfiRouter[] };
  return json.router_list ?? [];
}

export async function simulateSwap(params: {
  offer_address: string;
  ask_address: string;
  offer_amount: string;
  slippage_tolerance?: number;
}): Promise<StonfiSimulateResponse> {
  const res = await fetch(`${BASE_URL}/v1/swap/simulate`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      offer_address: params.offer_address,
      ask_address: params.ask_address,
      offer_amount: params.offer_amount,
      slippage_tolerance: params.slippage_tolerance ?? 50,
    }),
    next: { revalidate: 0 },
  });
  if (!res.ok) throw new Error('Simulation failed');
  return (await res.json()) as StonfiSimulateResponse;
}
