import type { Proof } from './types';

export function canonicalize(value: unknown): string {
  return JSON.stringify(value, Object.keys(value as any).sort(), 0);
}

function basePayload(proof: Proof) {
  return {
    id: proof.id,
    lifecycle: proof.lifecycle,
    network: proof.network,
    asset: proof.asset,
    actor: proof.actor,
    target: proof.target,
    amount: proof.amount,
    intentHash: proof.intentHash,
    metadata: proof.metadata,
  };
}

export function proofToCanonical(proof: Proof): string {
  const base = basePayload(proof);

  if (proof.lifecycle === 'proposed') {
    return canonicalize(base);
  }

  if (proof.lifecycle === 'rejected') {
    return canonicalize({ ...base, rejectionHash: proof.rejectionHash, denialReason: proof.denialReason });
  }

  if (proof.lifecycle === 'disputed') {
    return canonicalize({
      ...base,
      policyHash: proof.policyHash,
      approvalHash: proof.approvalHash,
      fundingHash: proof.fundingHash,
      escrowHash: proof.escrowHash,
      disputeHash: proof.disputeHash,
      disputeReason: proof.disputeReason,
    });
  }

  if (proof.lifecycle === 'settled') {
    return canonicalize({
      ...base,
      policyHash: proof.policyHash,
      approvalHash: proof.approvalHash,
      fundingHash: proof.fundingHash,
      escrowHash: proof.escrowHash,
      settlementHash: proof.settlementHash,
      receiptHash: proof.receiptHash,
      auditHash: proof.auditHash,
    });
  }

  if (proof.lifecycle === 'escrowed') {
    return canonicalize({
      ...base,
      policyHash: proof.policyHash,
      approvalHash: proof.approvalHash,
      fundingHash: proof.fundingHash,
      escrowHash: proof.escrowHash,
    });
  }

  if (proof.lifecycle === 'funded') {
    return canonicalize({
      ...base,
      policyHash: proof.policyHash,
      approvalHash: proof.approvalHash,
      fundingHash: proof.fundingHash,
    });
  }

  if (proof.lifecycle === 'policy_approved') {
    return canonicalize({
      ...base,
      policyHash: proof.policyHash,
      approvalHash: proof.approvalHash,
    });
  }

  return canonicalize(base);
}
