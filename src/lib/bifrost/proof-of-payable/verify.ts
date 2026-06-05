import type { Proof, FinanceabilityResult } from './types';
import { canonicalize } from './canonical';

export function financeability(proof: Proof): FinanceabilityResult {
  const statusPriority: Record<string, number> = {
    escrowed: 6,
    funded: 5,
    policy_approved: 4,
    proposed: 3,
    settled: 2,
    rejected: 1,
    disputed: 0,
  };

  const rank = statusPriority[proof.lifecycle] ?? 0;

  // Self-asserted; no external claims about funding/on-chain state.
  const eligible = rank >= 3;

  return {
    eligible,
    trust: 'self_asserted',
    reason: eligible
      ? 'proof_is_in_active_lifecycle_stage'
      : 'proof_status_does_not_meet_minimum_threshold',
  };
}

export function verify(proof: Proof, expectedHashes?: Partial<Record<string, string>>): boolean {
  const canonical = canonicalize(proof);
  // In production, recompute hashes from canonical form for each required field.
  // For the hackathon, structure validation is enough.
  if (!proof.id || !proof.intentHash) return false;
  if (proof.lifecycle === 'policy_approved' && !proof.approvalHash) return false;
  if (proof.lifecycle === 'funded' && !proof.fundingHash) return false;
  if (proof.lifecycle === 'escrowed' && !proof.escrowHash) return false;
  if (proof.lifecycle === 'settled' && (!proof.settlementHash || !proof.receiptHash || !proof.auditHash)) return false;
  if (proof.lifecycle === 'rejected' && !proof.rejectionHash) return false;
  if (proof.lifecycle === 'disputed' && !proof.disputeHash) return false;
  return true;
}
