export type Network = 'ton-testnet' | 'ton-mainnet';
export type Asset = 'TON' | 'USDT';

export type RuleType = 'asset' | 'amount' | 'period_cap' | 'actor' | 'target' | 'schedule';

export interface PolicyRule {
  type: RuleType;
  network?: Network;
  asset?: Asset;
  maxAmount?: string;
  periodCap?: string;
  periodSeconds?: number;
  actorAllowlist?: string[];
  targetAllowlist?: string[];
  scheduleUTC?: {
    startHour?: number;
    endHour?: number;
    days?: number[];
  };
}

export interface PolicyEnvelope {
  id: string;
  version: string;
  network: Network;
  asset: Asset;
  rules: PolicyRule[];
  metadata?: Record<string, unknown>;
}

export interface PolicyRequest {
  id: string;
  envelopeId: string;
  actor: string;
  target: string;
  amount: string;
  requestedAt: number;
  payload?: Record<string, unknown>;
}

export interface PolicyEvaluation {
  requestId: string;
  envelopeId: string;
  allowed: boolean;
  denialReason?: string;
  evaluatedAt: number;
  evidence: {
    policyHash: string;
    requestHash: string;
    evaluationHash: string;
    approvalHash?: string;
    denialHash?: string;
  };
}
