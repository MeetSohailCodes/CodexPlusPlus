import { invoke } from "@tauri-apps/api/core";
import { open } from "@tauri-apps/plugin-dialog";
import { useMemo } from "react";
import type {
  Actions,
  AdsResult,
  BackendSettings,
  CcsProvidersResult,
  CommandResult,
  ContextEntriesResult,
  DeleteLocalSessionResult,
  EnvConflictsResult,
  ExtractRelayCommonConfigResult,
  LaunchMode,
  LiveContextEntriesResult,
  LocalSessionsResult,
  LogsResult,
  PluginMarketplaceRepairResult,
  PluginMarketplaceStatusResult,
  ProviderSyncPayload,
  ProviderSyncTargetsResult,
  RelayFilesResult,
  RelayProfile,
  RelayProfileModelsResult,
  RelayProfileTestResult,
  RelayResult,
  RelaySwitchResult,
  RemoveEnvConflictsResult,
  Route,
  ScriptMarketResult,
  SettingsBackfillResult,
  SettingsResult,
  Status,
  TaskProgress,
  UpdateResult,
  WatcherResult,
  ZedRemoteOpenResult,
  ZedRemoteProject,
  ZedRemoteProjectsResult,
} from "@/types";
import {
  isSuccessStatus,
  stringifyError,
} from "@/lib/utils";
import {
  activeRelayProfile,
  normalizeSettings,
  relayProfileModeSwitchedText,
  relayProfileSwitchCommand,
  relayProfileSwitchValidation,
  syncLegacyRelayFields,
} from "@/lib/relay";

type UseActionsParams = {
  route: Route;
  theme: "dark" | "light";
  setTheme: React.Dispatch<React.SetStateAction<"dark" | "light">>;
  setRoute: React.Dispatch<React.SetStateAction<Route>>;
  setNotice: (notice: { title: string; message: string; status?: Status } | null) => void;
  launchForm: { appPath: string; debugPort: string; helperPort: string };
  setLaunchForm: React.Dispatch<React.SetStateAction<{ appPath: string; debugPort: string; helperPort: string }>>;
  settingsForm: BackendSettings;
  setSettingsForm: React.Dispatch<React.SetStateAction<BackendSettings>>;
  setOverview: React.Dispatch<React.SetStateAction<import("@/types").OverviewResult | null>>;
  setSettings: React.Dispatch<React.SetStateAction<SettingsResult | null>>;
  setRelay: React.Dispatch<React.SetStateAction<RelayResult | null>>;
  setRelayFiles: React.Dispatch<React.SetStateAction<RelayFilesResult | null>>;
  setEnvConflicts: React.Dispatch<React.SetStateAction<EnvConflictsResult | null>>;
  setCcsProviders: React.Dispatch<React.SetStateAction<CcsProvidersResult | null>>;
  setLocalSessions: React.Dispatch<React.SetStateAction<LocalSessionsResult | null>>;
  setZedRemoteProjects: React.Dispatch<React.SetStateAction<ZedRemoteProjectsResult | null>>;
  setLiveContextEntries: React.Dispatch<React.SetStateAction<import("@/types").CodexContextEntries | null>>;
  setLogs: React.Dispatch<React.SetStateAction<LogsResult | null>>;
  setDiagnostics: React.Dispatch<React.SetStateAction<import("@/types").DiagnosticsResult | null>>;
  setWatcher: React.Dispatch<React.SetStateAction<WatcherResult | null>>;
  setUpdate: React.Dispatch<React.SetStateAction<UpdateResult | null>>;
  setAds: React.Dispatch<React.SetStateAction<AdsResult | null>>;
  setScriptMarket: React.Dispatch<React.SetStateAction<ScriptMarketResult | null>>;
  setProviderSyncProgress: React.Dispatch<React.SetStateAction<import("@/types").ProviderSyncProgress>>;
  setPluginMarketplaceProgress: React.Dispatch<React.SetStateAction<TaskProgress>>;
  setPluginMarketplacePrompt: React.Dispatch<React.SetStateAction<PluginMarketplaceStatusResult | null>>;
  setProviderSyncTargets: React.Dispatch<React.SetStateAction<ProviderSyncTargetsResult | null>>;
  setSelectedProviderSyncTarget: React.Dispatch<React.SetStateAction<string>>;
  setRemoveOwnedData: React.Dispatch<React.SetStateAction<boolean>>;
  setRelaySwitching: React.Dispatch<React.SetStateAction<boolean>>;
  settings: SettingsResult | null;
  removeOwnedData: boolean;
  relaySwitching: boolean;
  update: UpdateResult | null;
  logs: LogsResult | null;
  diagnostics: import("@/types").DiagnosticsResult | null;
  relayFiles: RelayFilesResult | null;
  localSessions: LocalSessionsResult | null;
  zedRemoteProjects: ZedRemoteProjectsResult | null;
  selectedProviderSyncTarget: string;
  envConflicts: EnvConflictsResult | null;
  ccsProviders: CcsProvidersResult | null;
  providerSyncProgress: import("@/types").ProviderSyncProgress;
  pluginMarketplaceProgress: TaskProgress;
  prevLaunchStatusRef: React.MutableRefObject<string | null>;
};

function providerSyncProgressMessage(result: CommandResult<ProviderSyncPayload>): string {
  const changed = result.changedSessionFiles ?? 0;
  const rows = result.sqliteRowsUpdated ?? 0;
  const target = result.targetProvider || "current provider";
  const skipped = result.skippedLockedRolloutFiles?.length ?? 0;
  const skippedText = skipped ? `, skipped ${skipped} locked files` : "";
  return `Synced to ${target}: repaired ${changed} session files, updated ${rows} index rows${skippedText}.`;
}

function syncMarketInstalledState(current: ScriptMarketResult | null, userScripts: import("@/types").UserScriptInventory): ScriptMarketResult | null {
  if (!current) return current;
  const installed = new Map(
    (userScripts.scripts ?? [])
      .filter((script) => script.market_id)
      .map((script) => [script.market_id || "", script.version || ""]),
  );
  return {
    ...current,
    user_scripts: userScripts,
    market: {
      ...current.market,
      scripts: current.market.scripts.map((script) => {
        const installedVersion = installed.get(script.id) || "";
        return {
          ...script,
          installed: Boolean(installedVersion),
          installedVersion,
          updateAvailable: Boolean(installedVersion) && installedVersion !== script.version,
        };
      }),
    },
  };
}

export function useActions(params: UseActionsParams): Actions {
  const {
    route,
    theme,
    setTheme,
    setRoute,
    setNotice,
    launchForm,
    setLaunchForm,
    settingsForm,
    setSettingsForm,
    setOverview,
    setSettings,
    setRelay,
    setRelayFiles,
    setEnvConflicts,
    setCcsProviders,
    setLocalSessions,
    setZedRemoteProjects,
    setLiveContextEntries,
    setLogs,
    setDiagnostics,
    setWatcher,
    setUpdate,
    setAds,
    setScriptMarket,
    setProviderSyncProgress,
    setPluginMarketplaceProgress,
    setPluginMarketplacePrompt,
    setProviderSyncTargets,
    setSelectedProviderSyncTarget,
    setRemoveOwnedData,
    setRelaySwitching,
    settings,
    removeOwnedData,
    relaySwitching,
    update,
    logs,
    diagnostics,
    relayFiles,
    localSessions,
    zedRemoteProjects,
    selectedProviderSyncTarget,
    envConflicts,
    ccsProviders,
    providerSyncProgress,
    pluginMarketplaceProgress,
    prevLaunchStatusRef,
  } = params;

  const call = <T,>(command: string, args?: Record<string, unknown>) => invoke<T>(command, args);

  const logDiagnostic = (event: string, detail: Record<string, unknown> = {}) => {
    void invoke("write_diagnostic_event", { event, detail }).catch(() => {});
  };

  const showNotice = (title: string, message: string, status?: Status) => {
    setNotice({ title, message, status });
  };

  const showResultNotice = (
    title: string,
    result: Pick<CommandResult<unknown>, "message" | "status">,
    options: { silentSuccess?: boolean } = {},
  ) => {
    if (options.silentSuccess && isSuccessStatus(result.status)) return;
    showNotice(title, result.message, result.status);
  };

  const run = async <T,>(task: () => Promise<T>): Promise<T | null> => {
    try {
      return await task();
    } catch (error) {
      showNotice("Call failed", stringifyError(error), "failed");
      return null;
    }
  };

  const refreshOverview = async (silent = false) => {
    const result = await run(() => call<import("@/types").OverviewResult>("load_overview"));
    if (result) {
      const prev = prevLaunchStatusRef.current;
      const current = result.latest_launch?.status;
      if (prev && prev === "running" && current && (current === "stopped" || current === "failed" || current === "crashed")) {
        showNotice("Codex stopped unexpectedly", `Process status: ${current}. Restart it?`, "failed");
      }
      prevLaunchStatusRef.current = current ?? null;
      setOverview(result);
      if (!silent) showResultNotice("Overview checked", result, { silentSuccess: true });
    }
  };

  const refreshSettings = async (silent = false) => {
    const result = await run(() => call<SettingsResult>("load_settings"));
    if (result) {
      setSettings(result);
      const normalized = normalizeSettings(result.settings);
      setSettingsForm(normalized);
      setLaunchForm((current) => ({
        ...current,
        appPath: current.appPath || result.settings.codexAppPath || "",
      }));
      if (!silent) showResultNotice("Settings loaded", result, { silentSuccess: true });
      return normalized;
    }
    return null;
  };

  const refreshScriptMarket = async (silent = false) => {
    const result = await run(() => call<ScriptMarketResult>("refresh_script_market"));
    if (result) {
      setScriptMarket(result);
      setSettings((current) => (current ? { ...current, user_scripts: result.user_scripts } : current));
      if (!silent || !isSuccessStatus(result.status)) showResultNotice("Script Market", result, { silentSuccess: true });
    }
  };

  const installMarketScript = async (id: string) => {
    const result = await run(() => call<ScriptMarketResult>("install_market_script", { id }));
    if (result) {
      setScriptMarket(result);
      setSettings((current) => (current ? { ...current, user_scripts: result.user_scripts } : current));
      showResultNotice("Script Market", result);
    }
  };

  const setUserScriptEnabled = async (key: string, enabled: boolean) => {
    const result = await run(() => call<SettingsResult>("set_user_script_enabled", { key, enabled }));
    if (result) {
      setSettings(result);
      setScriptMarket((current) => syncMarketInstalledState(current, result.user_scripts));
      showResultNotice("Local Scripts", result);
    }
  };

  const deleteUserScript = async (key: string) => {
    const script = settings?.user_scripts?.scripts?.find((item) => item.key === key);
    const name = script?.name || key;
    if (!window.confirm(`Delete script "${name}"? This will remove the local script file.`)) return;
    const result = await run(() => call<SettingsResult>("delete_user_script", { key }));
    if (result) {
      setSettings(result);
      setScriptMarket((current) => syncMarketInstalledState(current, result.user_scripts));
      showResultNotice("Local Scripts", result);
    }
  };

  const refreshRelay = async (silent = false) => {
    const result = await run(() => call<RelayResult>("relay_status"));
    if (result) {
      setRelay(result);
      if (!silent) showResultNotice("Login status", result, { silentSuccess: true });
    }
  };

  const refreshRelayFiles = async (silent = false) => {
    const result = await run(() => call<RelayFilesResult>("read_relay_files"));
    if (result) {
      setRelayFiles(result);
      if (!silent) showResultNotice("Config files", result, { silentSuccess: true });
    }
    return result;
  };

  const refreshEnvConflicts = async (silent = false) => {
    const result = await run(() => call<EnvConflictsResult>("check_env_conflicts"));
    if (result) {
      setEnvConflicts(result);
      if (!silent || !isSuccessStatus(result.status)) showResultNotice("Environment variable check", result, { silentSuccess: true });
    }
    return result;
  };

  const removeEnvConflicts = async (names: string[]) => {
    const uniqueNames = Array.from(new Set(names.map((name) => name.trim()).filter(Boolean)));
    if (!uniqueNames.length) return;
    if (!window.confirm(`Delete these environment variables?\n\n${uniqueNames.join("\n")}\n\nA backup will be written before deletion.`)) return;
    const result = await run(() => call<RemoveEnvConflictsResult>("remove_env_conflicts", { request: { names: uniqueNames } }));
    if (result) {
      setEnvConflicts({
        status: result.status,
        message: result.message,
        conflicts: result.remaining,
      });
      showNotice("Environment variable cleanup", result.message, result.status);
    }
  };

  const refreshCcsProviders = async (silent = false) => {
    const result = await run(() => call<CcsProvidersResult>("load_ccs_providers"));
    if (result) {
      setCcsProviders(result);
      if (!silent || !isSuccessStatus(result.status)) showResultNotice("cc-switch import", result, { silentSuccess: true });
    }
    return result;
  };

  const importCcsProviders = async () => {
    const result = await run(() => call<SettingsResult>("import_ccs_providers"));
    if (result) {
      setSettings(result);
      setSettingsForm(normalizeSettings(result.settings));
      showResultNotice("cc-switch import", result);
      await refreshCcsProviders(true);
    }
  };

  const refreshLocalSessions = async (silent = false) => {
    const result = await run(() => call<LocalSessionsResult>("list_local_sessions"));
    if (result) {
      setLocalSessions(result);
      if (!silent || !isSuccessStatus(result.status)) showResultNotice("Session Management", result, { silentSuccess: true });
    }
    return result;
  };

  const refreshZedRemoteProjects = async (silent = false) => {
    const result = await run(() => call<ZedRemoteProjectsResult>("list_zed_remote_projects"));
    if (result) {
      setZedRemoteProjects(result);
      if (!silent || !isSuccessStatus(result.status)) showResultNotice("Zed Remote Projects", result, { silentSuccess: true });
    }
    return result;
  };

  const openZedRemoteProject = async (
    project: ZedRemoteProject,
    strategy: import("@/types").ZedOpenStrategy = settingsForm.zedRemoteOpenStrategy || "addToFocusedWorkspace",
  ) => {
    const result = await run(() =>
      call<ZedRemoteOpenResult>("open_zed_remote", {
        payload: {
          ssh: project.ssh,
          hostId: project.hostId,
          path: project.path,
          strategy,
          remember: settingsForm.zedRemoteProjectRegistryEnabled !== false,
        },
      }),
    );
    if (result) {
      showResultNotice("Open Zed Remote", result);
      await refreshZedRemoteProjects(true);
    }
  };

  const forgetZedRemoteProject = async (project: ZedRemoteProject) => {
    const result = await run(() => call<ZedRemoteProjectsResult>("forget_zed_remote_project", { id: project.id }));
    if (result) {
      setZedRemoteProjects(result);
      showResultNotice("Zed Remote Projects", result);
    }
  };

  const deleteLocalSession = async (session: import("@/types").LocalSession) => {
    const title = session.title || session.id;
    if (!window.confirm(`Delete session "${title}"? This will delete the local database record and rollout file, and create a backup.`)) return;
    const result = await run(() =>
      call<DeleteLocalSessionResult>("delete_local_session", {
        request: { sessionId: session.id, title: session.title, dbPath: session.dbPath },
      }),
    );
    if (result) {
      showResultNotice("Session deletion", result);
      await refreshLocalSessions(true);
    }
  };

  const refreshLiveContextEntries = async (silent = false) => {
    const result = await run(() => call<LiveContextEntriesResult>("read_live_context_entries"));
    if (result) {
      setLiveContextEntries(result.entries);
      if (!silent || !isSuccessStatus(result.status)) showResultNotice("Tools & Plugins", result, { silentSuccess: true });
    }
    return result;
  };

  const syncLiveContextEntries = async (next: BackendSettings, silent = false) => {
    const result = await run(() => call<LiveContextEntriesResult>("sync_live_context_entries", { request: { settings: next } }));
    if (result) {
      setLiveContextEntries(result.entries);
      if (!silent || !isSuccessStatus(result.status)) showResultNotice("Tools & Plugins", result, { silentSuccess: true });
    }
    return result;
  };

  const refreshLogs = async (silent = false) => {
    const result = await run(() => call<LogsResult>("read_latest_logs", { request: { lines: 240 } }));
    if (result) {
      setLogs(result);
      if (!silent) showResultNotice("Logs refreshed", result, { silentSuccess: true });
    }
  };

  const refreshDiagnostics = async (silent = false) => {
    const result = await run(() => call<import("@/types").DiagnosticsResult>("copy_diagnostics"));
    if (result) {
      setDiagnostics(result);
      if (!silent) showResultNotice("Diagnostics generated", result, { silentSuccess: true });
    }
  };

  const refreshWatcher = async (silent = false) => {
    const result = await run(() => call<WatcherResult>("load_watcher_state"));
    if (result) {
      setWatcher(result);
      if (!silent) showResultNotice("Watcher status", result, { silentSuccess: true });
    }
  };

  const navigate = async (next: Route) => {
    setRoute(next);
    if (next === "overview") await refreshOverview(true);
    if (next === "relay") {
      await refreshSettings(true);
      await refreshRelay(true);
      await refreshRelayFiles(true);
      await refreshEnvConflicts(true);
      await refreshCcsProviders(true);
    }
    if (next === "sessions") {
      await refreshSettings(true);
      await refreshLocalSessions(true);
      await refreshProviderSyncTargets(true);
    }
    if (next === "zedRemote") {
      await refreshSettings(true);
      await refreshZedRemoteProjects(true);
    }
    if (next === "context") {
      await refreshSettings(true);
      await refreshRelayFiles(true);
      await refreshLiveContextEntries(true);
    }
    if (next === "settings") await refreshSettings(true);
    if (next === "userScripts") {
      await refreshSettings(true);
      await refreshScriptMarket(true);
    }
    if (next === "recommendations") await refreshAds(true);
    if (next === "about") {
      await refreshOverview(true);
      await refreshLogs(true);
      await refreshDiagnostics(true);
    }
    if (next === "maintenance") {
      await refreshOverview(true);
      await refreshWatcher(true);
    }
  };

  const launchCommand = async (command: "launch_codex_plus" | "restart_codex_plus") => {
    const result = await run(() =>
      call<CommandResult<Record<string, unknown>>>(command, {
        request: {
          appPath: launchForm.appPath,
          debugPort: Number(launchForm.debugPort) || 9229,
          helperPort: Number(launchForm.helperPort) || 57321,
        },
      }),
    );
    return result;
  };

  const launch = async () => {
    const result = await launchCommand("launch_codex_plus");
    if (result) {
      showNotice("Launch task", result.message, result.status);
      await refreshOverview(true);
    }
  };

  const restart = async () => {
    const result = await launchCommand("restart_codex_plus");
    if (result) {
      showNotice("Restart Codex++", result.message, result.status);
      await refreshOverview(true);
    }
  };

  const repairBackend = async () => {
    const result = await run(() => call<SettingsResult>("repair_backend"));
    if (result) {
      setSettings(result);
      setSettingsForm(normalizeSettings(result.settings));
      showNotice("Backend repair", result.message, result.status);
    }
  };

  const repairPluginMarketplace = async () => {
    if (pluginMarketplaceProgress.active) return;
    setPluginMarketplacePrompt(null);
    setPluginMarketplaceProgress({ active: true, percent: 8, message: "Checking local plugin market…" });
    const progressTimer = window.setInterval(() => {
      setPluginMarketplaceProgress((current) => {
        if (!current.active) return current;
        const nextPercent = Math.min(92, current.percent + 9);
        const message =
          nextPercent < 28
            ? "Connecting to openai/plugins…"
            : nextPercent < 62
              ? "Downloading plugin market snapshot…"
              : nextPercent < 84
                ? "Unpacking and verifying plugin files…"
                : "Writing Codex config…";
        return { ...current, percent: nextPercent, message };
      });
    }, 500);
    try {
      const result = await run(() => call<PluginMarketplaceRepairResult>("repair_plugin_marketplace"));
      if (result) {
        setPluginMarketplaceProgress({ active: false, percent: 100, message: result.message });
        showNotice("Plugin market repair", result.message, result.status);
      } else {
        setPluginMarketplaceProgress({ active: false, percent: 100, message: "Plugin market repair failed. Check the error message and try again." });
      }
    } finally {
      window.clearInterval(progressTimer);
    }
  };

  const checkPluginMarketplacePrompt = async () => {
    const result = await run(() => call<PluginMarketplaceStatusResult>("plugin_marketplace_status"));
    if (result?.needsRepair) setPluginMarketplacePrompt(result);
    return result;
  };

  const installEntrypoints = async () => {
    const result = await run(() => call<import("@/types").InstallResult>("install_entrypoints"));
    if (result) {
      showNotice("Entrypoint installation", result.message, result.status);
      await refreshOverview(true);
    }
  };

  const uninstallEntrypoints = async () => {
    const result = await run(() =>
      call<import("@/types").InstallResult>("uninstall_entrypoints", {
        options: { removeOwnedData },
      }),
    );
    if (result) {
      showNotice("Entrypoint uninstallation", result.message, result.status);
      await refreshOverview(true);
    }
  };

  const repairShortcuts = async () => {
    const result = await run(() => call<import("@/types").InstallResult>("repair_shortcuts"));
    if (result) {
      showNotice("Shortcut repair", result.message, result.status);
      await refreshOverview(true);
    }
  };

  const watcherAction = async (command: string) => {
    const result = await run(() => call<WatcherResult>(command));
    if (result) {
      setWatcher(result);
      showNotice("Watcher action", result.message, result.status);
    }
  };

  const checkUpdate = async (silent = false) => {
    const result = await run(() => call<UpdateResult>("check_update"));
    if (result) {
      setUpdate(result);
      if (!silent || result.updateAvailable) {
        showNotice("GitHub Release check", result.message, result.status);
      }
    }
  };

  const performUpdate = async () => {
    const release =
      update?.latestVersion && update.assetName && update.assetUrl
        ? {
            version: update.latestVersion,
            url: "",
            body: update.releaseSummary ?? "",
            asset_name: update.assetName,
            asset_url: update.assetUrl,
          }
        : null;
    const result = await run(() => call<UpdateResult>("perform_update", { release }));
    if (result) {
      setUpdate(result);
      showNotice("Update installation", result.message, result.status);
    }
  };

  const saveSettings = async () => {
    const next = normalizeSettings(settingsForm);
    const result = await run(() => call<SettingsResult>("save_settings", { settings: next }));
    if (result) {
      setSettings(result);
      setSettingsForm(normalizeSettings(result.settings));
      showNotice("Settings saved", result.message, result.status);
    }
  };

  const saveSettingsValue = async (next: BackendSettings, silent = true) => {
    const normalized = normalizeSettings(next);
    setSettingsForm(normalized);
    const result = await run(() => call<SettingsResult>("save_settings", { settings: normalized }));
    if (result) {
      setSettings(result);
      setSettingsForm(normalizeSettings(result.settings));
      if (!silent || !isSuccessStatus(result.status)) showNotice("Settings saved", result.message, result.status);
    }
  };

  const resetSettings = async () => {
    const result = await run(() => call<SettingsResult>("reset_settings"));
    if (result) {
      setSettings(result);
      setSettingsForm(normalizeSettings(result.settings));
      showNotice("Settings reset", result.message, result.status);
    }
  };

  const resetImageOverlaySettings = async () => {
    const result = await run(() => call<SettingsResult>("reset_image_overlay_settings"));
    if (result) {
      setSettings(result);
      setSettingsForm(normalizeSettings(result.settings));
      showNotice("Image overlay", result.message, result.status);
    }
  };

  const refreshAds = async (silent = false) => {
    const result = await run(() => call<AdsResult>("load_ads"));
    if (result) {
      setAds(result);
      if (!silent) showResultNotice("Recommendations", result, { silentSuccess: true });
    }
  };

  const refreshProviderSyncTargets = async (silent = false) => {
    const result = await run(() => call<ProviderSyncTargetsResult>("load_provider_sync_targets"));
    if (result) {
      setProviderSyncTargets(result);
      const targets = result.targets ?? [];
      const saved = settingsForm.providerSyncLastSelectedProvider;
      const preferred =
        targets.find((target) => target.id === saved)?.id ||
        targets.find((target) => target.isCurrentProvider)?.id ||
        targets[0]?.id ||
        "openai";
      setSelectedProviderSyncTarget((current) => (targets.some((target) => target.id === current) ? current : preferred));
      if (!silent && !isSuccessStatus(result.status)) showNotice("Provider sync target", result.message, result.status);
    }
    return result;
  };

  const syncProvidersNow = async () => {
    if (providerSyncProgress.active) return;
    setProviderSyncProgress({
      active: true,
      percent: 12,
      message: selectedProviderSyncTarget ? `Syncing to ${selectedProviderSyncTarget}…` : "Scanning historical sessions and indexes…",
      result: null,
    });
    const progressTimer = window.setInterval(() => {
      setProviderSyncProgress((current) => {
        if (!current.active) return current;
        return {
          ...current,
          percent: Math.min(88, current.percent + 8),
          message: current.percent < 40 ? "Checking session provider markers…" : "Writing repairs and backups…",
        };
      });
    }, 350);
    try {
      const targetProvider = selectedProviderSyncTarget || undefined;
      const result = await run(() =>
        call<CommandResult<ProviderSyncPayload>>("sync_providers_now", { targetProvider }),
      );
      if (result) {
        setProviderSyncProgress({
          active: false,
          percent: 100,
          message: providerSyncProgressMessage(result),
          result,
        });
        if (targetProvider) {
          const next = {
            ...settingsForm,
            providerSyncLastSelectedProvider: targetProvider,
            providerSyncSavedProviders: Array.from(
              new Set([...(settingsForm.providerSyncSavedProviders ?? []), targetProvider]),
            ).sort(),
          };
          setSettingsForm(next);
        }
        await refreshProviderSyncTargets(true);
        showNotice("Historical session repair", result.message, result.status);
      } else {
        setProviderSyncProgress({
          active: false,
          percent: 100,
          message: "Historical session repair failed. Check the error message and try again.",
          result: null,
        });
      }
    } finally {
      window.clearInterval(progressTimer);
    }
  };

  const applyRelayInjection = async (silent = false) => {
    const settingsResult = await run(() => call<SettingsResult>("save_settings", { settings: settingsForm }));
    if (settingsResult) {
      setSettings(settingsResult);
      setSettingsForm(normalizeSettings(settingsResult.settings));
      if (!isSuccessStatus(settingsResult.status)) {
        showNotice("Settings saved", settingsResult.message, settingsResult.status);
        return false;
      }
    } else {
      return false;
    }
    const result = await run(() => call<RelayResult>("apply_relay_injection"));
    if (result) {
      setRelay(result);
      await refreshRelayFiles(true);
      if (!silent || !isSuccessStatus(result.status)) showNotice("Official mixed API Key", result.message, result.status);
    }
    return !!result && isSuccessStatus(result.status) && result.configured;
  };

  const saveLaunchMode = async (launchMode: LaunchMode, silent = false, baseSettings: BackendSettings = settingsForm) => {
    const next = { ...baseSettings, launchMode };
    setSettingsForm(next);
    const result = await run(() => call<SettingsResult>("save_settings", { settings: next }));
    if (result) {
      setSettings(result);
      setSettingsForm(normalizeSettings(result.settings));
      if (!silent) showNotice("Page enhancement mode", result.message, result.status);
    }
    return result;
  };

  const applyPureApiInjection = async (silent = false) => {
    const settingsResult = await run(() => call<SettingsResult>("save_settings", { settings: settingsForm }));
    if (settingsResult) {
      setSettings(settingsResult);
      setSettingsForm(normalizeSettings(settingsResult.settings));
      if (!isSuccessStatus(settingsResult.status)) {
        showNotice("Settings saved", settingsResult.message, settingsResult.status);
        return false;
      }
    } else {
      return false;
    }
    const result = await run(() => call<RelayResult>("apply_pure_api_injection"));
    if (result) {
      setRelay(result);
      await refreshRelayFiles(true);
      if (!silent || !isSuccessStatus(result.status)) showNotice("Pure API mode", result.message, result.status);
    }
    return !!result && isSuccessStatus(result.status) && result.configured;
  };

  const clearRelayInjection = async (silent = false) => {
    const result = await run(() => call<RelayResult>("clear_relay_injection"));
    if (result) {
      setRelay(result);
      await refreshRelayFiles(true);
      if (!silent || !isSuccessStatus(result.status)) showNotice("Official login mode", result.message, result.status);
    }
    return !!result && isSuccessStatus(result.status) && !result.configured;
  };

  const saveRelayFile = async (kind: "config" | "auth", contents: string, silent = false) => {
    const result = await run(() => call<RelayFilesResult>("save_relay_file", { request: { kind, contents } }));
    if (result) {
      setRelayFiles(result);
      if (!silent || !isSuccessStatus(result.status)) {
        showNotice(kind === "config" ? "config.toml" : "auth.json", result.message, result.status);
      }
      await refreshRelay(true);
    }
  };

  const upsertContextEntry = async (next: BackendSettings, kind: import("@/types").ContextKind, id: string, tomlBody: string) => {
    const result = await run(() =>
      call<ContextEntriesResult>("upsert_context_entry", {
        request: { settings: next, kind, id, tomlBody },
      }),
    );
    if (!result) return null;
    let normalized = normalizeSettings(result.settings);
    const saveResult = await run(() => call<SettingsResult>("save_settings", { settings: normalized }));
    if (saveResult) {
      setSettings(saveResult);
      normalized = normalizeSettings(saveResult.settings);
    }
    setSettingsForm(normalized);
    if (!isSuccessStatus(result.status)) showResultNotice("Tools & Plugins", result);
    return normalized;
  };

  const deleteContextEntry = async (next: BackendSettings, kind: import("@/types").ContextKind, id: string) => {
    const result = await run(() =>
      call<ContextEntriesResult>("delete_context_entry", {
        request: { settings: next, kind, id },
      }),
    );
    if (!result) return null;
    let normalized = normalizeSettings(result.settings);
    const saveResult = await run(() => call<SettingsResult>("save_settings", { settings: normalized }));
    if (saveResult) {
      setSettings(saveResult);
      normalized = normalizeSettings(saveResult.settings);
    }
    setSettingsForm(normalized);
    if (!isSuccessStatus(result.status)) showResultNotice("Tools & Plugins", result);
    return normalized;
  };

  const extractRelayCommonConfig = async (configContents: string) => {
    const result = await run(() =>
      call<ExtractRelayCommonConfigResult>("extract_relay_common_config", {
        request: { configContents },
      }),
    );
    if (result) showResultNotice("Common config file", result);
    return result && isSuccessStatus(result.status) ? result : null;
  };

  const testRelayProfile = async (profile: RelayProfile) => {
    const result = await run(() => call<RelayProfileTestResult>("test_relay_profile", { profile }));
    if (result) showNotice("Provider test", result.message, result.status);
  };

  const fetchRelayProfileModels = async (profile: RelayProfile) => {
    const result = await run(() => call<RelayProfileModelsResult>("fetch_relay_profile_models", { profile }));
    if (result) showNotice("Model list", result.message, result.status);
    return result && isSuccessStatus(result.status) ? result.models : null;
  };

  const switchOfficialMode = async () => {
    const switched = await clearRelayInjection(true);
    if (!switched) return;
    const result = await saveLaunchMode("relay", true);
    if (result) showNotice("Official login mode", "Switched back to official login; page enhancements are set to compatibility mode.", result.status);
  };

  const switchPureApiMode = async () => {
    const switched = await applyPureApiInjection(true);
    if (!switched) return;
    const result = await saveLaunchMode("patch", true);
    if (result) showNotice("Pure API mode", "Switched to pure API; page enhancements are set to full enhancement.", result.status);
  };

  const snapshotActiveRelayFilesBeforeSwitch = async (
    next: BackendSettings,
    previousActiveRelayId: string,
  ): Promise<BackendSettings> => {
    const profileId = previousActiveRelayId.trim();
    if (!profileId) return next;
    const result = await run(() =>
      call<SettingsBackfillResult>("backfill_relay_profile_from_live", {
        request: { settings: next, profileId },
      }),
    );
    if (!result) return next;
    const normalized = normalizeSettings(result.settings);
    if (!isSuccessStatus(result.status)) {
      showNotice("Provider switch", result.message, result.status);
      return next;
    }
    return normalized;
  };

  const switchRelayProfile = async (next: BackendSettings, previousActiveRelayId = settingsForm.activeRelayId) => {
    if (relaySwitching) {
      showNotice("Provider switch in progress", "The previous switch has not finished yet. Try again later.", "failed");
      return;
    }
    let switchSettings = normalizeSettings(next);
    if (!switchSettings.relayProfilesEnabled) {
      showNotice("Provider config is disabled", "This will not write Codex config.toml / auth.json right now. Enable the main provider switch first.", "failed");
      return;
    }
    const targetBeforeSnapshot = activeRelayProfile(switchSettings);
    logDiagnostic("switchRelayProfile.start", {
      currentRelayId: settingsForm.activeRelayId,
      targetRelayId: switchSettings.activeRelayId,
      targetRelayName: targetBeforeSnapshot.name,
      targetRelayMode: targetBeforeSnapshot.relayMode,
    });
    const selectedBeforeSave = activeRelayProfile(switchSettings);
    const validationError = relayProfileSwitchValidation(selectedBeforeSave);
    if (validationError) {
      logDiagnostic("switchRelayProfile.validation_failed", {
        targetRelayId: selectedBeforeSave.id,
        targetRelayName: selectedBeforeSave.name,
        error: validationError,
      });
      showNotice("Provider config may be incorrect", validationError, "failed");
      return;
    }
    switchSettings = await snapshotActiveRelayFilesBeforeSwitch(switchSettings, previousActiveRelayId);
    const selectedAfterSave = activeRelayProfile(switchSettings);
    const command = relayProfileSwitchCommand(selectedAfterSave);

    logDiagnostic("switchRelayProfile.apply_start", {
      targetRelayId: selectedAfterSave.id,
      targetRelayName: selectedAfterSave.name,
      previousActiveRelayId,
      command,
    });
    setRelaySwitching(true);
    try {
      const result = await run(() =>
        call<RelaySwitchResult>("switch_relay_profile", {
          request: { settings: switchSettings, previousActiveRelayId },
        }),
      );
      if (!result) {
        logDiagnostic("switchRelayProfile.apply_no_result", {
          targetRelayId: selectedAfterSave.id,
        });
        return;
      }
      const selectedSettings = normalizeSettings(result.settings);
      setSettings({
        status: result.status,
        message: result.message,
        settings: selectedSettings,
        settings_path: result.settingsPath,
        user_scripts: result.user_scripts as import("@/types").UserScriptInventory,
      });
      setSettingsForm(selectedSettings);
      setRelay({
        status: result.status,
        message: result.message,
        ...result.relay,
      });
      await refreshRelayFiles(true);
      if (!isSuccessStatus(result.status)) {
        logDiagnostic("switchRelayProfile.apply_failed", {
          targetRelayId: selectedAfterSave.id,
          status: result.status,
          message: result.message,
          activeRelayId: selectedSettings.activeRelayId,
        });
        showNotice("Provider switch", result.message, result.status);
        return;
      }
      const currentSelected = activeRelayProfile(selectedSettings);
      logDiagnostic("switchRelayProfile.ok", {
        targetRelayId: currentSelected.id,
        launchMode: selectedSettings.launchMode,
        status: result.status,
      });
      showNotice("Provider switch", relayProfileModeSwitchedText(currentSelected), result.status);
    } finally {
      setRelaySwitching(false);
    }
  };

  const copyText = async (text: string, _message: string) => {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      showNotice("Copy failed", stringifyError(error), "failed");
    }
  };

  const openExternalUrl = async (url: string) => {
    const result = await run(() => call<CommandResult<Record<string, unknown>>>("open_external_url", { url }));
    if (result) {
      showResultNotice("Open link", result, { silentSuccess: true });
    }
  };

  const saveCodexAppPath = async (appPath: string) => {
    const next = { ...settingsForm, codexAppPath: appPath };
    const result = await run(() => call<SettingsResult>("save_settings", { settings: next }));
    if (result) {
      setSettings(result);
      const normalized = normalizeSettings(result.settings);
      setSettingsForm(normalized);
      setLaunchForm((current) => ({ ...current, appPath: normalized.codexAppPath }));
      await refreshOverview(true);
    }
    return result;
  };

  const actions = useMemo(
    () => ({
      refreshCurrent: () => navigate(route),
      navigate,
      launch,
      restart,
      repairBackend,
      repairPluginMarketplace,
      checkPluginMarketplacePrompt,
      installEntrypoints,
      uninstallEntrypoints,
      repairShortcuts,
      checkUpdate,
      performUpdate,
      saveSettings,
      saveSettingsValue,
      refreshSettings,
      refreshOverview,
      refreshRelay,
      refreshEnvConflicts,
      refreshProviderSyncTargets,
      resetSettings,
      resetImageOverlaySettings,
      chooseCodexAppPath: async (mode: "folder" | "file") => {
        let selected: unknown;
        try {
          selected = await open(
            mode === "folder"
              ? { directory: true, multiple: false, title: "Select Codex App Directory" }
              : {
                  directory: false,
                  multiple: false,
                  title: "Select Codex.exe or Codex.app",
                  filters: [{ name: "Codex App", extensions: ["exe", "app"] }],
                },
          );
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          showNotice("Codex App Path", `Failed to open file selector: ${message}`, "failed");
          return;
        }
        if (typeof selected === "string" && selected.trim()) {
          const result = await saveCodexAppPath(selected.trim());
          if (result) {
            showNotice("Codex App Path", "App path saved. It will be reused on future launches.", result.status);
          }
        }
      },
      clearCodexAppPath: async () => {
        const next = { ...settingsForm, codexAppPath: "" };
        const result = await run(() => call<SettingsResult>("save_settings", { settings: next }));
        if (result) {
          setSettings(result);
          setSettingsForm(normalizeSettings(result.settings));
          setLaunchForm((current) => ({ ...current, appPath: "" }));
          showNotice("Codex App Path", "Saved path cleared. Future launches will revert to auto-detection.", result.status);
          await refreshOverview(true);
        }
      },
      chooseImageOverlayPath: async () => {
        let selected: unknown;
        try {
          selected = await open({
            directory: false,
            multiple: false,
            title: "Select Overlay Image",
            filters: [{ name: "Images", extensions: ["png", "jpg", "jpeg", "webp", "gif", "bmp"] }],
          });
        } catch (error) {
          const message = error instanceof Error ? error.message : String(error);
          showNotice("Image Overlay", `Failed to open file selector: ${message}`, "failed");
          return;
        }
        if (typeof selected === "string" && selected.trim()) {
          setSettingsForm((current) => ({
            ...current,
            codexAppImageOverlayEnabled: true,
            codexAppImageOverlayPath: selected.trim(),
          }));
        }
      },
      saveManualCodexAppPath: async () => {
        const appPath = launchForm.appPath.trim();
        if (!appPath) {
          showNotice("Codex App Path", "Please enter or select an app path first.", "failed");
          return;
        }
        const result = await saveCodexAppPath(appPath);
        if (result) {
          showNotice("Codex App Path", "App path saved. It will be reused on future launches.", result.status);
        }
      },
      syncProvidersNow,
      setProviderSyncTarget: (provider: string) => {
        setSelectedProviderSyncTarget(provider);
        setSettingsForm((current) => ({ ...current, providerSyncLastSelectedProvider: provider }));
      },
      setLaunchMode: async (launchMode: LaunchMode) => {
        await saveLaunchMode(launchMode);
      },
      refreshRelayFiles,
      removeEnvConflicts,
      refreshCcsProviders,
      importCcsProviders,
      refreshLiveContextEntries,
      syncLiveContextEntries,
      refreshAds,
      refreshScriptMarket,
      installMarketScript,
      setUserScriptEnabled,
      deleteUserScript,
      refreshLocalSessions,
      deleteLocalSession,
      refreshZedRemoteProjects,
      openZedRemoteProject,
      forgetZedRemoteProject,
      openExternalUrl,
      applyRelayInjection,
      applyPureApiInjection,
      clearRelayInjection,
      saveRelayFile,
      upsertContextEntry,
      deleteContextEntry,
      extractRelayCommonConfig,
      testRelayProfile,
      fetchRelayProfileModels,
      switchRelayProfile,
      relaySwitching,
      switchOfficialMode,
      switchPureApiMode,
      refreshLogs,
      refreshDiagnostics,
      showMessage: async (title: string, message: string, status?: Status) => showNotice(title, message, status),
      copyLogs: () => copyText(logs?.text ?? "", "Logs copied."),
      copyDiagnostics: () => copyText(diagnostics?.report ?? "", "Diagnostics report copied."),
      goLogs: () => navigate("about"),
      checkHealth: async () => {
        await refreshOverview(true);
        await refreshRelay(true);
        await refreshWatcher(true);
        showNotice("Check Complete", "Refreshed Codex app, entrypoints, and Watcher status.", "ok");
      },
      installWatcher: () => watcherAction("install_watcher"),
      uninstallWatcher: () => watcherAction("uninstall_watcher"),
      enableWatcher: () => watcherAction("enable_watcher"),
      disableWatcher: () => watcherAction("disable_watcher"),
      toggleTheme: () => setTheme((current) => (current === "dark" ? "light" : "dark")),
    }),
    [route, launchForm, settingsForm, settings, removeOwnedData, update, logs, diagnostics, theme, relayFiles, localSessions, zedRemoteProjects, selectedProviderSyncTarget, envConflicts, ccsProviders],
  );

  return actions;
}
