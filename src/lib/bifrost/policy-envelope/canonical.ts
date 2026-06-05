export function canonicalize(value: unknown): string {
  return JSON.stringify(value, Object.keys(value as any).sort(), 0);
}
