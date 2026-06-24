# Codex++ Repository Overview

## Project Purpose

Codex++ is an external enhancement launcher and manager for the Codex App (an AI coding assistant). It does not modify Codex installation files. Instead, it starts Codex externally through a launcher and injects enhancement scripts using the Chromium DevTools Protocol (CDP).

## Architecture

The project is a Rust workspace with 5 member crates/apps:

```
apps/
  codex-plus-launcher/       # Silent launcher (Rust binary)
  codex-plus-manager/        # Tauri + React manager UI
  codex-plus-mobile-relay/   # Mobile relay WebSocket server (Rust binary)
crates/
  codex-plus-core/           # Core library - launch, CDP injection, relay config, settings, bridge
  codex-plus-data/           # Data layer - SQLite storage, backup, markdown export, provider sync
assets/
  inject/renderer-inject.js  # ~400KB injection script for Codex renderer
  codex-models.json          # Model definitions
scripts/
  installer/                 # Windows NSIS + macOS DMG packaging
docs/                        # Documentation, images, plans
```

## Key Technologies

- **Rust** (edition 2024, workspace resolver 2)
- **Tauri v2** for desktop manager UI
- **React + TypeScript + Vite** for frontend
- **Chromium DevTools Protocol (CDP)** for browser automation / script injection
- **SQLite (rusqlite)** for Codex session data
- **WebSocket (tokio-tungstenite)** for CDP communication and mobile relay
- **AES-256-GCM** encryption for mobile relay
- **TOML parsing (toml_edit)** for Codex config manipulation

## Version

Current version: 1.2.18

## Data Locations

- Codex config: `~/.codex/config.toml`
- Codex auth state: `~/.codex/auth.json`
- Codex local database: `~/.codex/sqlite/*.db`
- Codex++ settings: `~/.codex-session-delete/settings.json`
- Codex++ logs: `~/.codex-session-delete/logs/`
- Provider Sync backups: `~/.codex/backups_state/provider-sync`

## Core System Flow

1. **Launcher** (`codex-plus-launcher`) acquires a single-instance port guard
2. **Settings** are loaded from `~/.codex-session-delete/settings.json`
3. **Relay injection** applies relay profile config to `~/.codex/config.toml`
4. **Codex process** is launched with `--remote-debugging-port=<port>`
5. **Helper server** starts on a loopback port (default 57321) for bridge communication
6. **CDP injection** connects to Codex's DevTools WebSocket and injects `renderer-inject.js`
7. **Bridge watchdog** monitors the CDP connection and re-injects if necessary
8. **Manager UI** communicates with the helper server via HTTP and with the backend via Tauri commands