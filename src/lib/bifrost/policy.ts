import type { Intent, Policy, CheckedPolicy } from './types';

export function checkPolicy(intent: Intent, policy: Policy, quoteExpectedSlippageBps: number | null, quoteFresh: boolean, currentDailyVolume: string): CheckedPolicy {
  const warnings: string[] = [];

  const protocolAllowed = policy.allowedProtocols.includes(intent.protocol);
  if (!protocolAllowed) {
    warnings.push(`Protocol not allowed: ${intent.protocol}`);
  }

  const actionAllowed = policy.allowedActions.includes(intent.action);
  if (!actionAllowed) {
    warnings.push(`Action not allowed: ${intent.action}`);
  }

  const assetsAllowed = policy.allowedAssets.includes(intent.inputAsset) && policy.allowedAssets.includes(intent.outputAsset);
  const unknownTokenBlocked = !assetsAllowed && policy.blockUnknownTokens;
  if (!assetsAllowed) {
    warnings.push('Input or output asset is not allowed by policy');
  }

  const amountNum = Number(intent.amount);
  const amountWithinLimit = Number.isFinite(amountNum) && amountNum <= Number(policy.maxAmountPerSwap);
  if (!amountWithinLimit) {
    warnings.push('Amount exceeds per-swap limit');
  }

  const slippageWithinLimit = quoteExpectedSlippageBps !== null && quoteExpectedSlippageBps <= policy.maxSlippageBps;
  if (!slippageWithinLimit) {
    warnings.push('Slippage exceeds policy limit');
  }

  const dailyVolumeWithinLimit = Number(currentDailyVolume) + amountNum <= Number(policy.maxDailyVolume);
  if (!dailyVolumeWithinLimit) {
    warnings.push('Proposed amount would exceed daily volume limit');
  }

  const quoteFreshCheck = quoteFresh;
  if (!quoteFreshCheck) {
    warnings.push('Quote is stale or not available');
  }

  return {
    protocolAllowed,
    actionAllowed,
    assetsAllowed,
    unknownTokenBlocked,
    amountWithinLimit,
    slippageWithinLimit,
    dailyVolumeWithinLimit,
    quoteFresh: quoteFreshCheck,
    warnings,
  };
}
