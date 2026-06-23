# Aggregated API Provider Rotation Implementation Plan

> Generated at: 2026-05-27 16:07:51
> Workspace: `/Users/albertluo/workSpace/albertLuo/createSomethingNew/CodexPlusPlus`
> Role: Agent-4 (Verification & Delivery)
> Scope: Add "Auto Aggregated API Rotation" dialog for API providers; support four strategies; members selected from existing providers.
> Constraint: This document only prepares verification checklist and delivery plan, does not modify business code.

## 1. Sub-Agent Kickoff Template

- Objective: Prepare verification checklist and documentation for the aggregated API provider rotation feature.
- Input: API provider adds auto aggregated API rotation dialog, four strategies, members selected from existing providers.
- Output: `docs/plan/20260527160751519_aggregated-api-provider-rotation-implementation-plan.md`.
- Acceptance Criteria: Documentation finalized; list minimum recommended verification commands.
- Responsible Files: Only add `docs/plan/20260527160751519_aggregated-api-provider-rotation-implementation-plan.md`.
- Estimated Time: 5-10 minutes.
- Heartbeat Interval: 60 seconds.

## 2. Feature Verification Scope

### 2.1 Product Behavior

- Provide a creation entry for "Auto Aggregated API Rotation" on the "Provider Configuration" page.
- Members can be selected from the existing provider list in the dialog; members outside the existing list are not allowed.
- At least 2 members must be selected before allowing the aggregated provider to be saved.
- Support four rotation strategies, which must be persisted, reloaded, and editable after saving.
- Aggregated providers should appear in the provider list and be switchable as the current provider.
- When a member provider is deleted or modified, the aggregated provider must show a clear status: member missing, member unavailable, or needs re-selection.

### 2.2 Four Strategy Specifications

Implement verification for the four confirmed strategies:

1. Failover: Use the first member first; switch to the next member on failure, rate limiting, or upstream error.
2. Conversation Round Robin: Assign a member per new conversation; keep the same member within a conversation.
3. Request Round Robin: Switch members per request in order; suitable for provider pools with similar capabilities.
4. Weighted Round Robin: Distribute requests by member weight; higher weight handles more requests.

Field names are fixed as `failover`, `conversationRoundRobin`, `requestRoundRobin`, `weightedRoundRobin`, and must be consistent across UI, persistence configuration, and invocation paths.

## 3. Recommended Task Breakdown

### Task 1: Data Model & Persistence Check

Owner: Agent-2 / Agent-BE-Rust
Responsible Directories:

- `crates/codex-plus-core/src`
- `apps/codex-plus-manager/src-tauri/src`

Acceptance Criteria:

- Aggregated provider fields must not break deserialization of existing single-provider configurations.
- Old configurations missing aggregated fields must still load normally.
- After saving and reopening the application, aggregated provider members, strategy, sorting, and weights must remain intact.

### Task 2: Frontend Dialog & Member Selection

Owner: Agent-3 / Agent-FE-React
Responsible Files:

- `apps/codex-plus-manager/src/App.tsx`
- `apps/codex-plus-manager/src/styles.css`

Acceptance Criteria:

- Creation entry visible with clear copy.
- Dialog only displays existing providers as candidate members.
- The aggregated provider currently being edited must not be selectable as itself.
- Save button must be disabled or show a clear error message when fewer than 2 members, no strategy selected, or duplicate members exist.
- Text must not overflow and buttons must not be obscured on both mobile and desktop widths.

### Task 3: Rotation Selection Logic

Owner: Agent-2 / Agent-BE-Rust
Responsible Directories:

- `crates/codex-plus-core/src`

Acceptance Criteria:

- Deterministic unit tests for all four strategies: failover, conversation round robin, request round robin, and weighted round robin.
- When a single member is unavailable, other available members must continue to function unaffected.
- When all members are unavailable, return a clear error; do not silently fall back to an erroneous provider.
- Do not leak member provider API Keys into logs, error messages, or frontend notifications.

### Task 4: End-to-End Smoke Test

Owner: Agent-4
Scope:

- Frontend type check
- Rust unit / integration tests
- Tauri pre-build check
- Manual UI smoke checklist

Acceptance Criteria:

- Minimum verification commands pass, or failures are clearly documented with reasons and blockers.
- Manual path coverage: create aggregated provider, select four strategies, save, reload, switch, and verify prompts after deleting a member provider.

## 4. Available Commands Found via Read-Only Check

### 4.1 Frontend Management

`apps/codex-plus-manager/package.json` exposes the following commands:

```bash
cd apps/codex-plus-manager && npm run check
cd apps/codex-plus-manager && npm run vite:build
cd apps/codex-plus-manager && npm run build
cd apps/codex-plus-manager && npm run dev
```

Notes:

- `npm run check`: TypeScript static type check, suitable as the minimum frontend verification.
- `npm run vite:build`: Frontend build artifact, suitable for build verification after UI changes.
- `npm run build`: Includes `cargo build -p codex-plus-launcher --release && tauri build`, high cost, recommended before merge or release.
- `npm run dev`: Local Tauri development debugging.

### 4.2 Rust Workspace

The root directory contains a `Cargo.toml` workspace with the following members:

- `crates/codex-plus-core`
- `crates/codex-plus-data`
- `apps/codex-plus-launcher`
- `apps/codex-plus-manager/src-tauri`

Recommended commands:

```bash
cargo test -p codex-plus-core
cargo test -p codex-plus-data
cargo test -p codex-plus-manager
cargo test --workspace
cargo build --workspace
```

Notes:

- `cargo test -p codex-plus-core`: Prioritize coverage of provider configuration, protocol proxy, and rotation logic.
- `cargo test -p codex-plus-manager`: Prioritize coverage of the Tauri command layer and configuration read/write bridge.
- `cargo test --workspace`: Full Rust regression, higher time cost.
- `cargo build --workspace`: Pre-merge build safety net.

## 5. Minimum Verification Commands

It is recommended to execute the following minimum set after the Agent implementation is complete:

```bash
cd /Users/albertluo/workSpace/albertLuo/createSomethingNew/CodexPlusPlus
cargo test -p codex-plus-core
cargo test -p codex-plus-manager
cd apps/codex-plus-manager && npm run check
```

If styles, layout, or dialog interactions are involved, additionally:

```bash
cd /Users/albertluo/workSpace/albertLuo/createSomethingNew/CodexPlusPlus/apps/codex-plus-manager
npm run vite:build
```

If preparing for merge or release, additionally:

```bash
cd /Users/albertluo/workSpace/albertLuo/createSomethingNew/CodexPlusPlus
cargo test --workspace
cargo build --workspace
cd apps/codex-plus-manager && npm run build
```

## 6. Manual Smoke Checklist

- Open the provider configuration page and confirm the "Auto Aggregated API Rotation" entry exists.
- When there are 0 or 1 regular providers, creating an aggregated provider should prompt that members are insufficient.
- When there are 2 or more regular providers, members can be selected and the aggregated provider saved.
- Select each of the four strategies, save, and reopen details to verify the strategy is preserved.
- Adjust member order and save; under request round robin strategy, the new order should be reflected or take effect.
- Under weighted round robin strategy, empty, zero, non-numeric, or extremely large weights must all have clear validation.
- After deleting a regular provider referenced by an aggregated provider, the aggregated provider should display a member missing or unavailable status.
- After switching to an aggregated provider, the configuration preview must not display error members' API Keys.
- Error messages must not contain full API Keys; only masked prefixes or provider names are allowed.

## 7. Risks & Rollback

### 7.1 Key Risks

- Configuration compatibility risk: New aggregated fields may affect old configuration loading.
- Invocation path risk: If an aggregated provider is written to `config.toml` as a regular provider, the base URL or API Key may be empty.
- State consistency risk: After a member provider is deleted, renamed, or drag-reordered, the aggregated reference may become invalid.
- Security risk: Rotation failure logs may print member API Keys.
- UI risk: Both provider list and dialog are concentrated in `App.tsx`; changes may easily affect the existing provider add, edit, and switch flows.

### 7.2 Rollback Plan

- Frontend entry rollback: Hide or remove the "Auto Aggregated API Rotation" entry; preserve existing regular provider flow.
- Data compatibility rollback: Ignore aggregated provider fields when reading configuration; do not delete user's existing regular providers.
- Invocation path rollback: When switching providers, if the aggregated type is detected as unavailable, prevent writing to `config.toml` and prompt the user to select a regular provider.
- Test rollback: Retain unit test cases for old configuration compatibility; avoid introducing unreadable old configurations after rollback.

## 8. Delivery Template

- Result Summary: Completed the aggregated API provider rotation feature verification plan documentation; no business code modified.
- Changes: Added `docs/plan/20260527160751519_aggregated-api-provider-rotation-implementation-plan.md`.
- Verification: Read-only check of `apps/codex-plus-manager/package.json` and workspace `Cargo.toml`; compiled minimum verification commands.
- Risks & Rollback: See Section 7 of this document.
- Request Close: Agent-4 documentation and verification checklist task is complete; please have Agent-0 close and recycle.
