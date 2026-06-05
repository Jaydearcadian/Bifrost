import type { Proof } from './types';
import { canonicalize } from './canonical';
import { sha256 } from './hash';

export async function composeProof(payload: {
  lifecycle: Proof['lifecycle'];
  network: Proof['network'];
  asset: Proof['asset'];
  actor: string;
  target: string;
  amount: string;
  intentHash?: string;
  policyHash?: string;
  approvalHash?: string;
  fundingHash?: string;
  escrowHash?: string;
  settlementHash?: string;
  rejectionHash?: string;
  disputeHash?: string;
  receiptHash?: string;
  auditHash?: string;
  disputeReason?: string;
  denialReason?: string;
  metadata?: Record<string, unknown>;
}): Promise<Proof> {
  const base = {
    id: `proof_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`,
    network: payload.network,
    asset: payload.asset,
    actor: payload.actor,
    target: payload.target,
    amount: payload.amount,
    metadata: payload.metadata,
  };

  const intentHash = payload.intentHash ?? (await sha256(canonicalize({ ...base, lifecycle: 'intent' })));

  const life = payload.lifecycle;

  if (life === 'proposed') {
    return { ...base, lifecycle: 'proposed', intentHash } as any;
  }

  if (life === 'policy_approved') {
    const policyHash = payload.policyHash ?? (await sha256(canonicalize({ ...base, lifecycle: 'policy' })));
    const approvalHash = payload.approvalHash ?? (await sha256(canonicalize({ ...base, policyHash, lifecycle: 'approval' })));
    return { ...base, lifecycle: 'policy_approved', intentHash, policyHash, approvalHash } as any;
  }

  if (life === 'funded') {
    const policyHash = payload.policyHash ?? (await sha256(canonicalize({ ...base, lifecycle: 'policy' })));
    const approvalHash = payload.approvalHash ?? (await sha256(canonicalize({ ...base, policyHash, lifecycle: 'approval' })));
    const fundingHash = payload.fundingHash ?? (await sha256(canonicalize({ ...base, policyHash, approvalHash, lifecycle: 'funding' })));
    return { ...base, lifecycle: 'funded', intentHash, policyHash, approvalHash, fundingHash } as any;
  }

  if (life === 'escrowed') {
    const policyHash = payload.policyHash ?? (await sha256(canonicalize({ ...base, lifecycle: 'policy' })));
    const approvalHash = payload.approvalHash ?? (await sha256(canonicalize({ ...base, policyHash, lifecycle: 'approval' })));
    const fundingHash = payload.fundingHash ?? (await sha256(canonicalize({ ...base, policyHash, approvalHash, lifecycle: 'funding' })));
    const escrowHash = payload.escrowHash ?? (await sha256(canonicalize({ ...base, policyHash, approvalHash, fundingHash, lifecycle: 'escrow' })));
    return { ...base, lifecycle: 'escrowed', intentHash, policyHash, approvalHash, fundingHash, escrowHash } as any;
  }

  if (life === 'settled') {
    const policyHash = payload.policyHash ?? (await sha256(canonicalize({ ...base, lifecycle: 'policy' })));
    const approvalHash = payload.approvalHash ?? (await sha256(canonicalize({ ...base, policyHash, lifecycle: 'approval' })));
    const fundingHash = payload.fundingHash ?? (await sha256(canonicalize({ ...base, policyHash, approvalHash, lifecycle: 'funding' })));
    const escrowHash = payload.escrowHash ?? (await sha256(canonicalize({ ...base, policyHash, approvalHash, fundingHash, lifecycle: 'escrow' })));
    const settlementHash = payload.settlementHash ?? (await sha256(canonicalize({ ...base, policyHash, approvalHash, fundingHash, escrowHash, lifecycle: 'settlement' })));
    const receiptHash = payload.receiptHash ?? (await sha256(canonicalize({ ...base, policyHash, approvalHash, fundingHash, escrowHash, settlementHash, lifecycle: 'receipt' })));
    const auditHash = payload.auditHash ?? (await sha256(canonicalize({ ...base, policyHash, approvalHash, fundingHash, escrowHash, settlementHash, receiptHash, lifecycle: 'audit' })));
    return { ...base, lifecycle: 'settled', intentHash, policyHash, approvalHash, fundingHash, escrowHash, settlementHash, receiptHash, auditHash } as any;
  }

  if (life === 'rejected') {
    const rejectionHash = payload.rejectionHash ?? (await sha256(canonicalize({ ...base, lifecycle: 'rejection', denialReason: payload.denialReason })));
    return { ...base, lifecycle: 'rejected', intentHash, rejectionHash, denialReason: payload.denialReason } as any;
  }

  if (life === 'disputed') {
    const policyHash = payload.policyHash ?? (await sha256(canonicalize({ ...base, lifecycle: 'policy' })));
    const approvalHash = payload.approvalHash ?? (await sha256(canonicalize({ ...base, policyHash, lifecycle: 'approval' })));
    const fundingHash = payload.fundingHash ?? (await sha256(canonicalize({ ...base, policyHash, approvalHash, lifecycle: 'funding' })));
    const escrowHash = payload.escrowHash ?? (await sha256(canonicalize({ ...base, policyHash, approvalHash, fundingHash, lifecycle: 'escrow' })));
    const disputeHash = payload.disputeHash ?? (await sha256(canonicalize({ ...base, policyHash, approvalHash, fundingHash, escrowHash, lifecycle: 'dispute', disputeReason: payload.disputeReason })));
    return { ...base, lifecycle: 'disputed', intentHash, policyHash, approvalHash, fundingHash, escrowHash, disputeHash, disputeReason: payload.disputeReason } as any;
  }

  throw new Error(`Unsupported lifecycle: ${(life as string).toString()}`);
}
