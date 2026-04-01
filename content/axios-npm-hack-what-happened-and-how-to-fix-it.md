---
title: "Axios npm Hack: What Happened and How to Fix It"
author: "Nihesh Rachakonda"
date: "2026-04-01"
tags: ["axios", "npm", "supply-chain-security", "javascript", "incident-response", "hack"]
excerpt: "Axios npm package compromise explained in detail: what happened, who was affected, full attack flow, IOCs, incident response, and prevention steps for teams."
---

On March 31, 2026, the npm package **axios** was compromised in a high-impact supply chain attack.

This post is the full breakdown in one place:

- what happened
- why it happened
- who was involved (based on public reporting)
- how the attack flow worked end-to-end
- how it affected developers, CI pipelines, and organizations
- what to do now and how to prevent this class of incident

## Quick Summary

| Item | Details |
| --- | --- |
| Compromised versions | `axios@1.14.1`, `axios@0.30.4` |
| Safe versions | `axios@1.14.0`, `axios@0.30.3` |
| Malicious dependency | `plain-crypto-js@4.2.1` |
| Trigger | npm lifecycle script: `postinstall` |
| Primary risk | Remote access trojan (RAT) delivery on macOS, Windows, Linux |

If your environment installed the compromised versions, assume compromise until proven otherwise.

## What Happened

This incident was **not** an axios code bug. It was a package publishing trust breach.

Public analysis across multiple sources indicates this flow:

1. An attacker gained access to an axios maintainer npm publishing path.
2. A package called `plain-crypto-js` was staged in advance.
3. Malicious `plain-crypto-js@4.2.1` was published with a `postinstall` dropper.
4. Two axios versions were published with this dependency added:
   - `axios@1.14.1`
   - `axios@0.30.4`
5. On `npm install`, `setup.js` in the malicious dependency executed automatically.
6. The dropper contacted C2 and pulled platform-specific stage-2 payloads.
7. The package attempted anti-forensics cleanup to hide malicious traces.

This was fast, coordinated, and designed for scale.

## Why It Happened

The root cause appears to be **release pipeline trust failure**, not application logic failure.

The major enabling factors were:

- A trusted maintainer publishing path was abused.
- A long-lived token/manual publish path appears to have been available.
- The malicious release looked like a normal semver update.
- npm lifecycle scripts (`postinstall`) execute code during install by design.
- Many projects accepted the poisoned versions via normal dependency resolution.

In short: attackers abused package trust and install-time code execution.

## Who Did It

Based on public reporting:

- The compromised publishes were associated with the maintainer account path linked to `jasonsaayman`.
- Attacker-related emails reported in public analysis included `ifstap@proton.me` and `nrwise@proton.me`.
- The malicious dependency package was associated with `plain-crypto-js`.

Attribution to a specific threat group is still a separate intelligence question.

Some researchers have discussed possible overlap with DPRK-linked tradecraft, but this should be treated as **investigative context**, not final attribution, unless formally confirmed by authoritative sources.

## Full Attack Flow (End-to-End)

### Stage 0: Pre-staging

Attackers first published a clean-looking package version (`plain-crypto-js@4.2.0`) to establish package history and lower suspicion.

### Stage 1: Weaponization

They then published `plain-crypto-js@4.2.1` containing:

```json
"scripts": {
  "postinstall": "node setup.js"
}
```

This is critical because `postinstall` runs automatically when npm installs the package.

### Stage 2: Distribution through trusted package

Compromised axios releases added `plain-crypto-js@^4.2.1` as a dependency.

Any environment resolving those versions pulled and executed the malicious dependency.

### Stage 3: Execution

`setup.js` (obfuscated JavaScript) decoded runtime strings and executed platform-specific commands.

Reported behavior:

- platform detection
- C2 communication
- payload retrieval/launch for macOS, Windows, Linux

### Stage 4: Anti-forensics

The installer attempted to erase or reduce obvious evidence:

- delete dropper artifacts
- replace manifest files with cleaner versions

This made post-install inspection harder and increased chance of false confidence.

## Timeline (UTC, Consolidated)

Public sources align on this sequence:

- `plain-crypto-js@4.2.0` published as clean decoy
- `plain-crypto-js@4.2.1` published with malicious `postinstall`
- `axios@1.14.1` published with malicious dependency
- `axios@0.30.4` published shortly after (about 39 minutes)
- Community detection and maintainer/security response
- npm removed compromised versions after a short exposure window

Even a short exposure window was enough because CI runners and developer systems perform installs continuously.

## How It Affected Real Systems

### Developer machines

Any developer who ran `npm install` during exposure could have executed malware without direct interaction.

### CI/CD pipelines

This is the highest-risk path because CI often has:

- cloud credentials
- deployment keys
- package publish tokens
- signing keys

Compromise in CI can become production compromise quickly.

### Transitive dependency consumers

Teams did not need to explicitly depend on axios to be exposed. Transitive resolution was enough.

### Observed impact

Security vendors publicly reported substantial real-world endpoint impact during this incident.

## Detection and Triage

Start simple, then escalate.

### 1) Version and dependency checks

```bash
npm ls axios plain-crypto-js
npm ls -g axios
```

### 2) Lockfile checks

```bash
grep -R --line-number -E "axios@1\.14\.1|axios@0\.30\.4|plain-crypto-js" package-lock.json npm-shrinkwrap.json yarn.lock pnpm-lock.yaml 2>/dev/null
```

### 3) Git history checks

```bash
git log -p -- package-lock.json | grep -E "plain-crypto-js|axios@1\.14\.1|axios@0\.30\.4"
```

### 4) Host artifact checks

```bash
# macOS
ls -la /Library/Caches/com.apple.act.mond 2>/dev/null

# Linux
ls -la /tmp/ld.py 2>/dev/null
```

```powershell
# Windows PowerShell
Test-Path "$env:PROGRAMDATA\wt.exe"
```

### 5) Network IOC checks

```bash
netstat -an | grep "142.11.206.73"
```

Also query EDR, DNS, proxy, and firewall logs for historical beaconing patterns.

## Indicators of Compromise (IOCs)

| Type | Value |
| --- | --- |
| Domain | `sfrclak.com` |
| IP | `142.11.206.73` |
| Port | `8000` |
| Path | `/6202033` |
| Malicious dependency | `plain-crypto-js@4.2.1` |
| Bad axios versions | `1.14.1`, `0.30.4` |

Likely host artifacts:

- macOS: `/Library/Caches/com.apple.act.mond`
- Windows: `%PROGRAMDATA%\wt.exe`
- Linux: `/tmp/ld.py`

IOCs are not exhaustive. Absence of one IOC does not prove safety.

## What To Do If You Were Exposed

If compromised versions were installed, treat the host as potentially compromised.

### Immediate response

1. Isolate affected endpoints/runners.
2. Block known IOC infrastructure.
3. Pause risky deployments from suspect pipelines.

### Credential and secret response

Rotate:

- npm tokens
- cloud/API keys
- SSH keys
- DB credentials
- CI secrets and signing material

### Investigation and recovery

1. Audit build and deploy history in exposure window.
2. Review unusual commits, releases, and registry actions.
3. Rebuild affected systems from clean images where possible.
4. Preserve evidence for internal review and postmortem.

Do not rely on "remove package and continue" as a response strategy.

## How To Prevent This Next Time

Layer controls instead of relying on one fix.

### 1) Lockfile discipline

- commit lockfiles
- use `npm ci` in CI
- block unexpected lockfile drift

### 2) Safer version policies

```ini
# .npmrc
save-exact=true
```

### 3) Lifecycle hardening

```ini
# .npmrc
ignore-scripts=true
```

Only use globally after validating compatibility. Some packages rely on install scripts.

### 4) Delay brand-new publishes

```bash
npm config set min-release-age 3
```

This helps reduce zero-day package ingestion risk.

### 5) Monitor dependency anomalies

Alert on:

- new transitive dependencies in critical packages
- unexpected publisher metadata changes
- publish path anomalies (trusted CI vs manual CLI)
- suspicious install scripts

### 6) Restrict CI egress

Runners should not have broad outbound internet by default.

If malware cannot reach C2, impact is significantly reduced.

## Final Takeaway

This incident proved that **dependency installation is an execution surface** and must be treated like production attack surface.

Secure coding is necessary, but not sufficient.

Secure dependency intake, secure publishing trust, and fast incident response are now equally important.

## References

- https://github.com/theNetworkChuck/axios-attack-guide
- https://socket.dev/blog/axios-npm-package-compromised
- https://www.stepsecurity.io/blog/axios-compromised-on-npm-malicious-versions-drop-remote-access-trojan
- https://github.com/axios/axios/issues/10604
- https://www.huntress.com/blog/supply-chain-compromise-axios-npm-package
- https://www.elastic.co/security-labs/axios-one-rat-to-rule-them-all
