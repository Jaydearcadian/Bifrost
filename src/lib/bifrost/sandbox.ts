import type { Intent, Quote, CanaryPlan, CheckedPolicy, SandboxReport } from './types';
import { checkPolicy } from './policy';

export function buildSandboxReport(args: {
  intent: Intent;
  quote: Quote | null;
  policyReturn: CheckedPolicy;
  canary: CanaryPlan;
}): SandboxReport {
  const { policyReturn } = args;

  const riskLevel = deriveRisk(policyReturn);
  const status = policyReturn.warnings.length === 0 ? 'PASSED' : 'WARNING';
  const verdict = deriveVerdict(policyReturn, args.canary);

  return {
    id: `rpt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    status,
    intent: args.intent,
    quote: args.quote,
    policy: policyReturn,
    canary: args.canary,
    riskLevel,
    verdict,
  };
}

export function deriveRisk(policyReturn: CheckedPolicy): SandboxReport['riskLevel'] {
  if (
    !policyReturn.protocolAllowed ||
    !policyReturn.actionAllowed ||
    policyReturn.unknownTokenBlocked ||
    !policyReturn.dailyVolumeWithinLimit
  ) {
    return 'BLOCKED';
  }
  if (!policyReturn.quoteFresh || !policyReturn.amountWithinLimit || !policyReturn.slippageWithinLimit) {
    return 'HIGH';
  }
  if (!policyReturn.assetsAllowed) {
    return 'MEDIUM';
  }
  return 'LOW';
}

export function deriveVerdict(policyReturn: CheckedPolicy, canary: CanaryPlan): SandboxReport['verdict'] {
  const hardBlock =
    !policyReturn.protocolAllowed ||
    !policyReturn.actionAllowed ||
    policyReturn.unknownTokenBlocked ||
    !policyReturn.amountWithinLimit ||
    !policyReturn.dailyVolumeWithinLimit;

  if (hardBlock) return 'REJECTED';

  const quoteOk = policyReturn.quoteFresh && policyReturn.slippageWithinLimit;
  if (!quoteOk) return 'REQUIRES_CANARY';

  if (!policyReturn.assetsAllowed) return 'REQUIRES_CANARY';

  if (canary.required && canary.status !== 'PASSED') return 'REQUIRES_CANARY';

  return 'APPROVED';
}
