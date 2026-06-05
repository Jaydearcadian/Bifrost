export type ProofLifecycle =
  | 'proposed'
  | 'policy_approved'
  | 'funded'
  | 'escrowed'
  | 'settled'
  | 'rejected'
  | 'disputed';

export type NetworkRef = 'ton-testnet' | 'ton-mainnet';
export type AssetRef = 'TON' | 'USDT';

export interface ProofBase {
  id: string;
  lifecycle: ProofLifecycle;
  network: NetworkRef;
  asset: AssetRef;
  actor: string;
  target: string;
  amount: string;
  intentHash: string;
  policyHash?: string;
  approvalHash?: string;
  fundingHash?: string;
  escrowHash?: string;
  settlementHash?: string;
  rejectionHash?: string;
  disputeHash?: string;
  receiptHash?: string;
  auditHash?: string;
  metadata?: Record<string, unknown>;
}

export type Proof =
  | ProofProposed
  | ProofPolicyApproved
  | ProofFunded
  | ProofEscrowed
  | ProofSettled
  | ProofRejected
  | ProofDisputed;

export interface ProofProposed {
  lifecycle: 'proposed';
  id: string;
  network: NetworkRef;
  asset: AssetRef;
  actor: string;
  target: string;
  amount: string;
  intentHash: string;
  metadata?: Record<string, unknown>;
}

export interface ProofPolicyApproved {
  lifecycle: 'policy_approved';
  id: string;
  network: NetworkRef;
  asset: AssetRef;
  actor: string;
  target: string;
  amount: string;
  intentHash: string;
  policyHash: string;
  approvalHash: string;
  metadata?: Record<string, unknown>;
}

export interface ProofFunded {
  lifecycle: 'funded';
  id: string;
  network: NetworkRef;
  asset: AssetRef;
  actor: string;
  target: string;
  amount: string;
  intentHash: string;
  policyHash: string;
  approvalHash: string;
  fundingHash: string;
  metadata?: Record<string, unknown>;
}

export interface ProofEscrowed {
  lifecycle: 'escrowed';
  id: string;
  network: NetworkRef;
  asset: AssetRef;
  actor: string;
  target: string;
  amount: string;
  intentHash: string;
  policyHash: string;
  approvalHash: string;
  fundingHash: string;
  escrowHash: string;
  metadata?: Record<string, unknown>;
}

export interface ProofSettled {
  lifecycle: 'settled';
  id: string;
  network: NetworkRef;
  asset: AssetRef;
  actor: string;
  target: string;
  amount: string;
  intentHash: string;
  policyHash: string;
  approvalHash: string;
  fundingHash: string;
  escrowHash: string;
  settlementHash: string;
  receiptHash: string;
  auditHash: string;
  metadata?: Record<string, unknown>;
}

export interface ProofRejected {
  lifecycle: 'rejected';
  id: string;
  network: NetworkRef;
  asset: AssetRef;
  actor: string;
  target: string;
  amount: string;
  intentHash: string;
  rejectionHash: string;
  denialReason?: string;
  metadata?: Record<string, unknown>;
}

export interface ProofDisputed {
  lifecycle: 'disputed';
  id: string;
  network: NetworkRef;
  asset: AssetRef;
  actor: string;
  target: string;
  amount: string;
  intentHash: string;
  policyHash: string;
  approvalHash: string;
  fundingHash: string;
  escrowHash: string;
  disputeHash: string;
  disputeReason: string;
  metadata?: Record<string, unknown>;
}

export interface FinanceabilityResult {
  eligible: boolean;
  trust: 'self_asserted';
  reason: string;
}
