---
title: "Incident Commander: An On-Call Agent That Proves Its Root Cause on FalkorDB"
author: "Nihesh Rachakonda"
date: "2026-10-18"
tags: ["falkordb", "graph-database", "ai-agents", "cypher", "sre", "hackathon"]
excerpt: "An AI on-call agent that doesn't guess. It finds the change that broke production by walking a FalkorDB graph, and shows its work as queries you can re-run or try to break."
---

It's 3 AM and your phone buzzes: requests are timing out on `exports-batch`. In the last two hours, dozens of services around it were deployed, reconfigured or had a feature flag flipped. One of those changes broke things. Which one?

That's the question I built **Incident Commander** to answer, for the WeMakeDevs × FalkorDB hackathon, "Graph Hacks: Context for AI Agents". It's an AI on-call agent, but with one rule: **it has to prove its answer.** You can [try it live](https://commander.niheshr.com) in your own private copy of a simulated company.

<aside class="callout">

**In short**

- The company lives in **FalkorDB** as a graph: services, who calls whom, every deploy, config change and flag.
- When something breaks, the agent rebuilds that graph **as it looked at alert time** and rules out suspects one by one.
- Every step is saved as a **Cypher query you can re-run**. Tamper with the graph and the broken proofs light up as **FALSIFIED**.
- Same AI model, three ways to look at the data: with the graph it was right **100%** of the time on a 50-outage benchmark, versus **52%** reading everything as text and **8%** with vector search.

</aside>

![A live investigation: the funnel narrows the suspects, the verdict names the root-cause change with its absence certificate, then the rollback is rehearsed and the result written back to the graph](/images/incident-commander-falkordb/live-investigation.gif)

*A live run on commander.niheshr.com: the agent narrows the suspects, names the change and proves it.*

## Why AI answers aren't enough here

Most AI tools for incidents give you a ranked list and a confident paragraph. Then you have a choice: trust it, or redo the whole investigation yourself. They rarely tell you what they ruled out, and you can't replay their reasoning.

I wanted the opposite. "This deploy caused it" should come with "and here's why each of the other changes didn't", in a form anyone can check.

## Why a graph

An outage spreads along connections. A bad deploy on one service hurts the services that call it, then the ones that call those. So the real questions are about paths: what can this change reach? Did things fail in the right order? Who's on call for the service that broke first?

Those are graph questions, and they're awkward to answer from a wall of text. Two things make it worse:

- **Hidden dependencies.** Some services call each other without anyone writing it down. Failures still travel along those calls.
- **Time.** A dependency added after the alert, or a deploy logged late, shouldn't count.

The demo company has 400 services across 3 regions, about 5,700 changes and 28,000 connections, all in one FalkorDB graph.

![Data model: Person ON_CALL Team, Team OWNS Service, Incident HAS Symptom ON Service, Change or Expiry CHANGES or EXPIRES_ON Service, Service DEPENDS_ON and OBSERVED_CALL Service, and a derived IMPACTS edge from callee to caller in snapshots](/images/incident-commander-falkordb/data-model.svg)

*The core of the graph. Every fact also records when it was true and when the system learned about it.*

## How it works

![Architecture: the alert triggers as-of snapshots built with GRAPH.COPY; the triage agent registers hypotheses and runs Cypher into a hash-chained ledger graph; a DIAGNOSED verdict goes to the remediation agent, which rehearses the rollback on a clone before acting; a judge can tamper with the session world graph and Verify re-runs every proof](/images/incident-commander-falkordb/architecture.svg)

*Green outlines are graphs in FalkorDB. Every visitor gets their own copy, so nothing you break affects anyone else.*

### 1. Rewind the graph to alert time

The agent first needs the world as it was when the alert fired. FalkorDB makes this cheap: `GRAPH.COPY` clones the whole graph, and a few `DELETE` queries remove anything that wasn't true yet:

```cypher
// on a fresh GRAPH.COPY of the world: drop what didn't exist at time $t
MATCH (c:Change) WHERE c.valid_from > $t DETACH DELETE c
MATCH ()-[e:DEPENDS_ON]->()
WHERE NOT (coalesce(e.valid_from, $ninf) <= $t AND $t < coalesce(e.valid_to, $pinf))
DELETE e
```

It builds two of these snapshots, "what was true" and "what we knew", in about a quarter of a second. From then on, every question is a plain graph query with no time logic tangled into it.

### 2. Explain every symptom, not just the alert

My first idea was "the cause is a change upstream of the alert". It failed straight away, because every planted fault comes with decoy changes that are upstream too.

What worked was asking a stricter question. A change is the cause only if it explains **every** symptom:

1. it happened **before** anything broke;
2. its own service was among the **first** to fail;
3. it can **reach** every failing service;
4. services failed **in order** of distance from it;
5. it's the **kind** of change that causes these symptoms (a config push doesn't cause TLS errors).

All five checks are a single Cypher query per suspect. Because it reads the live graph rather than a saved answer, running it again on an edited graph gives a fresh verdict. That's what makes the next part possible.

### 3. Save proofs, not paragraphs

The agent never writes free-form Cypher. It picks a tool and states a hypothesis, like "this change qualifies" or "nothing else does". The hypothesis is written down **before** the query runs, and the result is stored with the exact query, chained to the previous proof so the history can't be quietly edited. All of the agent's reads go through `GRAPH.RO_QUERY`, so it can't change the graph it's judging.

A verdict needs every proof to hold. The UI shows the funnel of suspects being cut, an **absence certificate** listing why each rival failed, and a **Verify** button that re-runs everything.

![A finished live run: the causal path on the graph, the elimination funnel, the verdict, the absence certificate with clause bars and the hypothesis chain](/images/incident-commander-falkordb/verdict.webp)

*One deploy passes all five checks. The certificate shows the first check each rival fails.*

### 4. Rehearse, act, remember

A second agent handles the fix. Before touching anything, it rehearses the rollback on another `GRAPH.COPY` clone and refuses if anything else could still explain the symptoms. Then it opens a rollback PR and pages the on-call engineer. On the public demo, the PR and page are simulated.

Finally, it writes what it learned back into the graph, such as a hidden dependency it discovered. On the next similar incident, the agent checks that first and needs **5 tool calls instead of 9**. If later incidents contradict what it learned, its confidence in that lesson drops until the lesson stops being used.

## Try to break it

The obvious objection to a demo like this: "you planted the answer". So there's a **Judge mode**.

You pick which service to break. The app publishes only a hash of your choice, and the agent investigates blind. When it's done, you reveal and check the match.

<p><img src="/images/incident-commander-falkordb/judge-reveal.webp" width="560" alt="Judge mode reveal: the committed fault beside the agent's blind verdict, marked MATCH, with the recomputed hash equal to the published commitment"></p>

*The blind verdict matches the hidden fault.*

Then you can mess with the graph: add a fake deploy, delete a dependency, move a timestamp. Press **Verify** and every stored proof runs again. Any proof that no longer holds turns **FALSIFIED**, with the responsible node circled. To make this quick, "Try these" suggests edits that would flip the verdict, each tested on its own throwaway copy in about 130 to 150 ms.

![Judge mode: a suggested edit removes a dependency on the causal path, and Verify flips the first proof to FALSIFIED](/images/incident-commander-falkordb/judge-tamper.gif)

*Remove one dependency on the causal path, verify, and the proof flips to FALSIFIED.*

## Does the graph actually help?

To find out, I planted 50 outages blind and gave **the same AI model** three different ways to look at the company:

<figure class="bar-chart">
<figcaption><strong>Exact root cause found, on a 50-outage benchmark.</strong> Same model behind every approach.</figcaption>
<div class="bar-row is-primary"><span class="bar-label">With the graph</span><span class="bar-track"><span class="bar-fill" style="width: 100%"></span></span><span class="bar-value">100%</span></div>
<div class="bar-row"><span class="bar-label">Everything as text</span><span class="bar-track"><span class="bar-fill" style="width: 52%"></span></span><span class="bar-value">52%</span></div>
<div class="bar-row"><span class="bar-label">Vector search</span><span class="bar-track"><span class="bar-fill" style="width: 8%"></span></span><span class="bar-value">8%</span></div>
</figure>

Twenty of the 50 outages were types the agent had never been prompted about, and it got all of them. It doesn't need a big model either: a small `qwen3:8b` running locally on my laptop also got every one right. Reading the whole catalog as text, even a much stronger model kept blaming changes that couldn't have caused the symptoms, like a config push for a latency spike.

![The Live LLM runs table on the benchmark page: accuracy, held-out accuracy, tokens per case and fallback counts for each model and approach](/images/incident-commander-falkordb/benchmark.webp)

*The benchmark page on the live site lists every run.*

**The honest caveat:** the company is simulated, and every planted fault is checked against the same five rules the agent uses. So 100% shows the agent reliably finds and proves the one change that fits, among convincing decoys. It doesn't prove those rules capture every real-world outage. I'd rather say that here than oversell it.

## What I learned about FalkorDB

**`GRAPH.COPY` changed the whole design.** Copying the graph is fast enough (about 67 ms for 20k nodes and 100k edges in my tests) that I copy it per visitor, per investigation, per rollback rehearsal and per tamper suggestion. "The world at 3:04 AM" became a graph I can simply query.

**Filters on long paths run after the traversal.** A time filter inside a variable-length match walks every path first and throws most away. FalkorDB's own query plan showed it, which is exactly why I build snapshots instead.

![Query X-ray: on the left, the plan for a valid-time filter inside a variable-length match, with the Filter above the traverse; on the right, a live profile of the real query on the snapshot](/images/incident-commander-falkordb/xray.webp)

*Query X-ray in the app shows FalkorDB's plan for any proof. Left: the naive query, with the filter above the traversal. Right: the real query on a snapshot.*

**Graph algorithms in the same engine are a gift.** `algo.BFS` for blast radius, `algo.WCC` to group a storm of 300+ alerts into 2 incidents, betweenness to find chokepoints. Pin the sampling seed on betweenness, though, or the scores wobble between runs.

## The same graph as a company brain

Because the graph also holds teams, on-call rotations, past incidents and decisions, it can answer everyday questions too. **Ask the graph** takes plain English, like "who's on call for payments?" or "why did you blame that deploy?", and every answer shows the nodes and queries it used.

<p><img src="/images/incident-commander-falkordb/ask.webp" width="460" alt="Ask the graph: a chat panel answering why a change was blamed and who is on call, with source chips and the queries behind each answer"></p>

## What I'm taking away

- **Tools beat model size.** The same model went from about half right to always right just by getting graph tools.
- **Make reasoning re-runnable.** Saving the query behind each claim made debugging easy and made "try to break it" almost free to build.
- **Say what the numbers don't show.** A perfect score on synthetic data deserves its caveat right next to it.

Next, I'd like to point it at real topology from tracing data instead of a simulated company.

## How it was built

I designed and directed Incident Commander and built it with Claude Code, using Claude models for planning, implementation and review. I chose the idea, the stack (Python, FastAPI, Next.js and a self-hosted FalkorDB) and the benchmark, and reviewed every piece before it went in. This post was drafted with the same tools and edited by me.

## Try it

- **Live demo:** [commander.niheshr.com](https://commander.niheshr.com). Press **Start an incident** and watch a live investigation.
- **Break it:** [Judge mode](https://commander.niheshr.com/judge). Hide a fault, then tamper with the graph.
- **Numbers:** the [benchmark page](https://commander.niheshr.com/benchmark).
- **Code:** [github.com/rnihesh/incident-commander](https://github.com/rnihesh/incident-commander).
