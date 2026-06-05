# Bifrost — STON.fi Hackathon 2026

Bifrost is an upstream safety and policy layer for TON DeFi. It wraps STON.fi and Omniston swap flows so every intent is quoted, sandboxed, policy-checked, canaried, and proven — before value moves on-chain.

## Live demo
- https://jaydearcadian.github.io/Bifrost/app

## What it does
- Real STON.fi REST swap simulation
- Deterministic AgentVault-style policy enforcement
- Canary-first execution guardrails
- Proof-of-Payable lifecycle record for every intent
- TonConnect-ready wallet flow (client-only)

## Why it matters
TON DeFi today trusts the DEX. Bifrost adds an upstream verification and audit layer without custody, so users and agents get safer, seamless payments.

## Tech stack
- Next.js 14 App Router
- STON.fi REST API
- TonConnect SDK
- Deterministic policy engine + proof lifecycle
