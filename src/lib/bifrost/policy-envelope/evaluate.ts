import type { PolicyEnvelope, PolicyRequest, PolicyEvaluation, PolicyRule, RuleType } from './types';
import { canonicalize } from './canonical';

export function evaluate(envelope: PolicyEnvelope, request: PolicyRequest): PolicyEvaluation {
  const denials: string[] = [];

  for (const rule of envelope.rules) {
    if (rule.type === 'asset') {
      if (rule.network && rule.network !== envelope.network) {
        denials.push('network_mismatch');
      }
      if (rule.asset && rule.asset !== envelope.asset) {
        denials.push('asset_mismatch');
      }
    }

    if (rule.type === 'amount') {
      const amt = Number(request.amount);
      if (!Number.isFinite(amt) || amt <= 0) {
        denials.push('invalid_amount');
      }
      if (rule.maxAmount != null && amt > Number(rule.maxAmount)) {
        denials.push('amount_exceeds_max');
      }
    }

    if (rule.type === 'period_cap') {
      if (rule.periodCap != null && Number(request.amount) > Number(rule.periodCap)) {
        denials.push('period_cap_exceeded');
      }
    }

    if (rule.type === 'actor') {
      if (rule.actorAllowlist && rule.actorAllowlist.length > 0 && !rule.actorAllowlist.includes(request.actor)) {
        denials.push('actor_not_allowed');
      }
    }

    if (rule.type === 'target') {
      if (rule.targetAllowlist && rule.targetAllowlist.length > 0 && !rule.targetAllowlist.includes(request.target)) {
        denials.push('target_not_allowed');
      }
    }

    if (rule.type === 'schedule') {
      if (rule.scheduleUTC) {
        const date = new Date(request.requestedAt * 1000);
        const utcHour = date.getUTCHours();
        const utcDay = date.getUTCDay();
        const { startHour, endHour, days } = rule.scheduleUTC;
        if (startHour != null && utcHour < startHour) {
          denials.push('before_window');
        }
        if (endHour != null && utcHour >= endHour) {
          denials.push('after_window');
        }
        if (days && days.length > 0 && !days.includes(utcDay)) {
          denials.push('day_not_allowed');
        }
      }
    }
  }

  const allowed = denials.length === 0;

  return {
    requestId: request.id,
    envelopeId: envelope.id,
    allowed,
    denialReason: allowed ? undefined : denials[denials.length - 1],
    evaluatedAt: Date.now(),
    evidence: {
      policyHash: '',
      requestHash: '',
      evaluationHash: '',
    },
  };
}

export function buildEvidenceHashes(envelope: PolicyEnvelope, request: PolicyRequest, evaluation: PolicyEvaluation, requestHashStr: string, evaluationHashStr: string) {
  return {
    policyHash: '',
    requestHash: requestHashStr,
    evaluationHash: evaluationHashStr,
    approvalHash: evaluation.allowed ? 'approval_pending' : undefined,
    denialHash: evaluation.allowed ? undefined : 'rejection_pending',
  };
}
