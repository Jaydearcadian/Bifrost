import { canonicalize } from './canonical';

export async function sha256(message: string): Promise<string> {
  const data = new TextEncoder().encode(message);
  const hash = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hash)).map((b) => b.toString(16).padStart(2, '0')).join('');
}

export function policyHash(envelope: unknown): Promise<string> {
  return sha256(canonicalize(envelope));
}

export function requestHash(request: unknown): Promise<string> {
  return sha256(canonicalize(request));
}

export function evaluationHash(evaluation: unknown): Promise<string> {
  return sha256(canonicalize(evaluation));
}
