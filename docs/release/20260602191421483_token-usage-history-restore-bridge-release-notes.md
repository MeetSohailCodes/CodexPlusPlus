# Token Usage History Restore Bridge Release Notes

Generated: 2026-06-02 19:14

## Summary of Changes

This update adds host-side history recovery capability for the `Codex Token Usage` plugin, resolving the issue where the plugin cannot restore per-turn call statistics from historical conversations when there is no local cache after a program restart.

## Major Changes

1. Added `thread_usage_history` route capability in `BridgeDataService`.
2. Integrated local thread history reading in `LauncherDataService`.
3. Added `codex_thread_usage_history` in `SQLiteStorageAdapter`:
   - Read local `rollout-*.jsonl` by thread `rollout_path`
   - Parse `turn_context.turn_id`
   - Parse `event_msg.token_count.info.last_token_usage`
   - Also retain `total_token_usage.total_tokens` as `contextUsed`
4. Added bridge route tests and rollout history parsing tests.

## Effects

- The plugin can still request current session historical call records from the host even without `sessionStorage` or in-memory page ledger.
- History recovery results are isolated by:
  - Different sessions within the same project
  - Different turns within the same session
  - Displaying only the latest turn of the current session

## Verification Results

Passed:

- `cargo test -p codex-plus-core bridge_routes --manifest-path Cargo.toml`
- `cargo test -p codex-plus-data storage_adapter --manifest-path Cargo.toml`

## Notes

This capability is the companion host support for `Codex Token Usage 0.1.6`. If only the script marketplace repository is updated without updating `CodexPlusPlus`, the "restore statistics from history after restart" feature will not fully take effect.
