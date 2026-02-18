---
title: "Claude Code Permissions Best Practices by Use Case"
author: "Nihesh Rachakonda"
date: "2026-02-18"
tags: ["claude-code", "ai-coding", "security", "permissions", "fullstack", "data-analytics"]
excerpt: "Practical permission profiles for Claude Code across full-stack engineering, data analytics, and operations-heavy workflows."
---

Claude Code can move very quickly, which means permission setup is one of the most important safety controls in your workflow. The right approach is to grant only the access needed for the task, then elevate temporarily for specific actions.

This guide gives practical permission patterns you can apply across different domains.

## Core Principle: Start Narrow, Expand Intentionally

Use least privilege by default:

- Limit writable paths to the current repository when possible
- Keep network access restricted unless the task requires external APIs or package registries
- Require confirmation for destructive commands (deletes, schema migrations, production operations)
- Separate read-only investigation from write-enabled implementation

A useful model is to treat permissions like environment tiers:

1. **Inspect mode**: read-only analysis and planning
2. **Develop mode**: repo write access, limited shell/network
3. **Elevated mode**: temporary access for releases, infrastructure, or data operations

## Claude Code JSON Files You Can Use

Claude Code accepts these JSON configuration files for permissions:

- `.claude/settings.json` (shared project settings)
- `.claude/settings.local.json` (local-only overrides)
- `managed-settings.json` (organization-managed policies)

Base project file:

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [
      "Bash(npm run lint)",
      "Bash(npm run test *)"
    ],
    "ask": [
      "Bash(git push *)"
    ],
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)"
    ]
  }
}
```

## Advanced Rules for Web, Explore, Bash `ls`, and MCP Tools

If your team uses web research, subagents, and MCP servers, add explicit rules for them instead of falling back to broad `Bash` permissions.

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "allow": [
      "Bash(ls *)",
      "WebFetch(domain:docs.anthropic.com)",
      "WebFetch(domain:code.claude.com)",
      "Task(Explore)",
      "mcp__puppeteer__*",
      "mcp__chromedevtools__*"
    ],
    "ask": [
      "WebFetch",
      "Task(Plan)"
    ],
    "deny": [
      "Bash(curl *)",
      "Read(./.env)",
      "Read(./secrets/**)"
    ]
  }
}
```

Notes:

- `Bash(ls *)` allows listing paths while avoiding a blanket `Bash` allow.
- `WebFetch(domain:...)` allows targeted web fetches; `WebFetch` in `ask` prompts for other domains.
- `Task(Explore)` explicitly allows the Explore subagent for codebase discovery.
- MCP permissions use server/tool patterns like:
  - `mcp__puppeteer__*`
  - `mcp__chromedevtools__*` (example for a Chrome DevTools-style server name)

## Use Case 1: Full-Stack E-commerce Platform

For a full-stack team shipping a storefront, admin panel, and backend APIs, set permissions by workflow phase.

> **Tech stack note:** Next.js (frontend), Node.js/Express (API), PostgreSQL (database), Redis (cache), Terraform (infrastructure).

### Recommended baseline

- Read and write access only to the app repository
- Shell access for local lint, tests, and build
- Network access limited to package installation and internal docs
- Explicit approval required for:
  - Database migration commands
  - Deployment scripts
  - Editing infrastructure files outside the service scope

### Example `.claude/settings.json` for this use case

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "defaultMode": "default",
    "allow": [
      "Bash(npm run lint)",
      "Bash(npm run test *)",
      "Bash(npm run build)"
    ],
    "ask": [
      "Bash(npm run db:migrate *)",
      "Bash(git push *)",
      "Bash(terraform *)"
    ],
    "deny": [
      "Read(./.env)",
      "Read(./.env.*)",
      "Read(./secrets/**)"
    ]
  }
}
```

### Why this works

Most feature work (React UI updates, API handlers, validation fixes, unit tests) stays inside the repository. Restricting wider system access reduces risk while preserving speed for day-to-day delivery.

## Use Case 2: Data Analytics in Healthcare Operations

In analytics-heavy healthcare workflows, data sensitivity is high and accidental exposure is costly. Permissions should reflect that.

> **Tech stack note:** Python (Pandas), dbt (transformations), BigQuery/Snowflake (warehouse), Looker/Metabase (dashboards), Airflow (orchestration).

### Recommended baseline

- Read/write access to analytics code, SQL models, and dashboards repository
- No direct access to raw PHI datasets by default
- Access only to de-identified or sampled data in development
- Approval gate for:
  - Querying production data warehouses
  - Exporting query results
  - Modifying ETL jobs tied to compliance reporting

### Example `.claude/settings.json` for this use case

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "defaultMode": "default",
    "allow": [
      "Bash(python -m pytest *)",
      "Bash(dbt test *)",
      "Read(./models/**)",
      "Read(./dashboards/**)"
    ],
    "ask": [
      "Bash(dbt run --target prod *)",
      "Bash(bq query *)",
      "Bash(snowflake *)"
    ],
    "deny": [
      "Read(./data/raw/**)",
      "Read(./exports/**)",
      "Read(./.env)",
      "Read(./secrets/**)"
    ]
  }
}
```

### Why this works

Analysts and engineers still get fast iteration on transformations, chart logic, and quality checks without opening broad access to regulated data.

## Use Case 3: Data Engineering for Fintech Risk Pipelines

Risk scoring pipelines often combine strict audit requirements with frequent model or rule updates.

> **Tech stack note:** Python (feature engineering), Spark (batch pipelines), Kafka (streaming), S3 (data lake), AWS KMS (key management), Terraform (IaC).

### Recommended baseline

- Repository-scoped write access for pipeline code and tests
- Shell access for reproducible local runs only
- Network allowlist for required artifact storage and package registries
- Mandatory human approval for:
  - Backfills against production partitions
  - Changes to retention or encryption settings
  - Secrets management and key rotation scripts

### Example `.claude/settings.json` for this use case

```json
{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "permissions": {
    "defaultMode": "default",
    "allow": [
      "Bash(python -m pytest *)",
      "Bash(make test *)",
      "Read(./pipelines/**)"
    ],
    "ask": [
      "Bash(python scripts/backfill.py *)",
      "Bash(aws kms *)",
      "Bash(terraform apply *)"
    ],
    "deny": [
      "Read(./.env)",
      "Read(./keys/**)",
      "Read(./secrets/**)"
    ]
  }
}
```

### Why this works

You preserve a strong audit trail and reduce blast radius for high-impact operations while still enabling fast iteration on scoring logic.

## Practical Permission Checklist

Before each task, define:

- **Data scope**: What data can be read, and at what sensitivity level?
- **Write scope**: Which directories or services can be changed?
- **Execution scope**: Which commands can run without approval?
- **Network scope**: Which external systems are necessary?
- **Escalation path**: Who approves temporary elevated actions?

When possible, keep elevated access short-lived and tied to a clear task ID or ticket.

## Team Policy Template

You can standardize this with a lightweight policy:

- Default all sessions to read-only inspection mode
- Move to develop mode only for approved implementation tasks
- Use elevated mode only with explicit reviewer confirmation
- Log all elevated operations in PRs or change tickets
- Rotate credentials and revalidate permission profiles quarterly

## Final Thoughts

Claude Code is most effective when paired with intentional permission boundaries. Different domains need different controls, but the same rule applies everywhere: grant the minimum required access, then escalate only when there is a clear operational reason.

That balance lets teams move quickly without compromising security or compliance.
