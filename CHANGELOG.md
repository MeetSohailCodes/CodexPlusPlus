# Changelog

## 1.2.4 - 2026-06-08

- Added Zed remote project recording capability, supporting a recently used list of remote projects recognized by Codex++, and providing a more stable fallback strategy for opening remote workspaces.
- Fixed vendor sync only processing partial session metadata when multiple `session_meta` records exist.
- Fixed Windows single-instance startup protection by using a more robust lock and port fallback logic when the default port is abnormally occupied, reducing the likelihood of startup failure.
- Restricted Codex fast service tier to only apply to supported models, preventing incompatible models from receiving invalid configurations.
- Fixed macOS DMG packaging and bundle structure, restoring launcher/manager binary rename logic.
- Added documentation for the hybrid login relay mode.
- Updated version number to `1.2.4`, synchronized across Rust workspace, Tauri, frontend package, and backend display version.

## 1.1.8 - 2026-05-26

- Added upstream branch worktree support, allowing creation and selection of independent workspaces from upstream repositories/branches.
- Added interfaces and tests for upstream branch list retrieval, default value handling, remote resolution, and worktree creation.
- Optimized vendor sync logic by preserving rollout file mtime, reducing unnecessary session state changes after sync.
- Added a new "Tools & Plugins" page for unified management of Codex++ / Codex MCP, skills, and plugins, no longer tied to a single vendor.
- When switching vendors, currently enabled tool and plugin configurations are merged, while avoiding writing vendor-specific configurations into the general configuration.
- Tool and plugin lists now read enabled status in real-time from the current Codex configuration, supporting direct enable/disable and deletion of entries.
- Adjusted general configuration extraction logic to manual extraction, reducing automatic overwrites and configuration pollution.
- Fixed vendor switching isolation issues, preventing `model_catalog_json`, old `model_provider`, historical provider tables, and old `auth.json` from being carried over to the new vendor.
- Fixed the issue where `auth.json` did not have the API Key written in pure API mode, and fixed the vendor provider name to `CodexPlusPlus`.
- Optimized model catalog writing to support merging with the original model catalog, displaying the real path in the preview.
- Added configuration items to the vendor configuration page including model insertion method, model list, context size, compressed context size, and target capabilities.
- In official mode, hide the model list and model insertion method that are only used in mixed API Key scenarios.
- Moved Base URL, API Key, and upstream protocol before the model list; moved test model and context options into "More Options".
- Fixed duplicate writes of `model_reasoning_effort` and `plan_mode_reasoning_effort` causing TOML parsing failures.
- Fixed configuration file parsing failures caused by duplicate plugin tables, empty configuration bodies, and boolean value parsing.
- Optimized vendor detail page layout by keeping the top back button and notification area fixed, increasing the default window size, and reducing top gaps.
- Removed checksum blocking during script installation to prevent installation failures caused by inconsistent marketplace script checksums.
- Cleaned up login, current vendor, and configuration file path information from the About page and Status page that didn't need to be displayed.
- Adjusted prompt messages to be centered, preventing them from obscuring the restart button.
- Updated README instructions and macOS DMG packaging script.
