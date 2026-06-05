const CANARY_BPS = 0.001;
const MIN_CANARY = 0.001;
const MAX_CANARY = 0.05;

export function calculateCanaryAmount(fullAmount: number): number {
  const bpsAmount = fullAmount * CANARY_BPS;
  return Math.min(Math.max(bpsAmount, MIN_CANARY), MAX_CANARY);
}
