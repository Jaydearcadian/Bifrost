export type ActorType = 'human' | 'agent';

export interface Intent {
  actorType: ActorType;
  protocol: string;
  action: string;
  inputAsset: string;
  outputAsset: string;
  amount: string;
}

export interface Quote {
  expectedOutput: string;
  minOutput: string;
  route: string[];
  expiresAt: number;
  raw: unknown;
}

export interface Policy {
  allowedProtocols: string[];
  allowedActions: string[];
  allowedAssets: string[];
  maxAmountPerSwap: string;
  maxDailyVolume: string;
  maxSlippageBps: number;
  requireCanary: boolean;
  requireHumanApproval: boolean;
  blockUnknownTokens: boolean;
}

export interface CheckedPolicy {
  protocolAllowed: boolean;
  actionAllowed: boolean;
  assetsAllowed: boolean;
  unknownTokenBlocked: boolean;
  amountWithinLimit: boolean;
  slippageWithinLimit: boolean;
  dailyVolumeWithinLimit: boolean;
  quoteFresh: boolean;
  warnings: string[];
}

export interface CanaryPlan {
  required: boolean;
  amount: string;
  status: 'NOT_SENT' | 'SENT' | 'PASSED' | 'FAILED';
}

export interface SandboxReport {
  id: string;
  status: 'PASSED' | 'FAILED' | 'WARNING';
  intent: Intent;
  quote: Quote | null;
  policy: CheckedPolicy;
  canary: CanaryPlan;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'BLOCKED';
  verdict: 'APPROVED' | 'REJECTED' | 'REQUIRES_CANARY';
}
