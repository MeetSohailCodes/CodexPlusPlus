import { useEffect, useRef, useState } from "react";
import { Sun, Moon, RefreshCw, Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/Sidebar";
import { OverviewTab } from "@/components/main/tabs/OverviewTab";
import { RelayTab } from "@/components/main/tabs/RelayTab";
import { MobileControlTab } from "@/components/main/tabs/MobileControlTab";
import { SessionsTab } from "@/components/main/tabs/SessionsTab";
import { ContextTab } from "@/components/main/tabs/ContextTab";
import { EnhanceTab } from "@/components/main/tabs/EnhanceTab";
import { ZedRemoteTab } from "@/components/main/tabs/ZedRemoteTab";
import { UserScriptsTab } from "@/components/main/tabs/UserScriptsTab";
import { RecommendationsTab } from "@/components/main/tabs/RecommendationsTab";
import { MaintenanceTab } from "@/components/main/tabs/MaintenanceTab";
import { AboutTab } from "@/components/main/tabs/AboutTab";
import { SettingsTab } from "@/components/main/tabs/SettingsTab";
import { NoticeDialog, PluginMarketplacePromptDialog } from "@/components/main/ui/SharedComponents";
import { useActions } from "@/hooks/useActions";
import type {
  AdsResult,
  BackendSettings,
  CcsProvidersResult,
  CodexContextEntries,
  DiagnosticsResult,
  EnvConflictsResult,
  LogsResult,
  OverviewResult,
  PluginMarketplaceStatusResult,
  ProviderSyncProgress,
  ProviderSyncTargetsResult,
  RelayFilesResult,
  RelayResult,
  Route,
  ScriptMarketResult,
  SettingsResult,
  Status,
  TaskProgress,
  Theme,
  UpdateResult,
  WatcherResult,
  ZedRemoteProjectsResult,
  LocalSessionsResult,
} from "@/types";
import { routes } from "@/constants";

function loadInitialTheme(): Theme {
  if (typeof window === "undefined") return "dark";
  return window.localStorage.getItem("codex-plus-theme") === "light" ? "light" : "dark";
}

function loadInitialRoute(): Route {
  if (typeof window === "undefined") return "overview";
  const hash = window.location.hash.replace("#", "");
  if (routes.some((item) => item.id === hash)) return hash as Route;
  return "overview";
}

const defaultSettings: BackendSettings = {
  codexAppPath: "",
  codexExtraArgs: [],
  providerSyncEnabled: false,
  providerSyncSavedProviders: [],
  providerSyncManualProviders: [],
  providerSyncLastSelectedProvider: "",
  relayProfilesEnabled: true,
  enhancementsEnabled: true,
  computerUseGuardEnabled: false,
  codexAppPluginEntryUnlock: true,
  codexAppPluginMarketplaceUnlock: true,
  codexAppForcePluginInstall: true,
  codexAppModelWhitelistUnlock: true,
  codexAppSessionDelete: true,
  codexAppMarkdownExport: true,
  codexAppPasteFix: false,
  codexAppProjectMove: true,
  codexAppConversationTimeline: true,
  codexAppThreadIdBadge: false,
  codexAppConversationView: false,
  codexAppThreadScrollRestore: true,
  codexAppZedRemoteOpen: true,
  zedRemoteOpenStrategy: "addToFocusedWorkspace",
  zedRemoteProjectRegistryEnabled: true,
  zedRemoteSyncToZedSettings: false,
  codexAppUpstreamWorktreeCreate: true,
  codexAppNativeMenuPlacement: true,
  codexAppServiceTierControls: false,
  codexAppImageOverlayEnabled: false,
  codexAppImageOverlayPath: "",
  codexAppImageOverlayOpacity: 35,
  codexGoalsEnabled: false,
  mobileControlEnabled: false,
  mobileControlRelayUrl: "ws://127.0.0.1:57323",
  mobileControlRoom: "",
  mobileControlKey: "",
  launchMode: "patch",
  relayBaseUrl: "",
  relayApiKey: "",
  relayProfiles: [],
  relayCommonConfigContents: "",
  relayContextConfigContents: "",
  activeRelayId: "default",
  aggregateRelayProfiles: [],
  activeAggregateRelayId: "",
  relayTestModel: "gpt-5.4-mini",
  cliWrapperEnabled: false,
  cliWrapperBaseUrl: "",
  cliWrapperApiKey: "",
  cliWrapperApiKeyEnv: "CUSTOM_OPENAI_API_KEY",
};

export function App() {
  const [theme, setTheme] = useState<Theme>(() => loadInitialTheme());
  const [route, setRoute] = useState<Route>(() => loadInitialRoute());
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    let unlisten: (() => void) | undefined;
    void (async () => {
      try {
        const { getCurrentWindow } = await import("@tauri-apps/api/window");
        const appWindow = getCurrentWindow();
        setIsMaximized(await appWindow.isMaximized());
        
        unlisten = await appWindow.onResized(async () => {
          setIsMaximized(await appWindow.isMaximized());
        });
      } catch (err) {
        console.warn("Tauri window API is not available or failed to load:", err);
      }
    })();
    return () => {
      if (unlisten) unlisten();
    };
  }, []);

  const handleMinimize = async () => {
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      await getCurrentWindow().minimize();
    } catch (err) {
      console.error("Failed to minimize window:", err);
    }
  };

  const handleMaximize = async () => {
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      const appWindow = getCurrentWindow();
      if (await appWindow.isMaximized()) {
        await appWindow.unmaximize();
      } else {
        await appWindow.maximize();
      }
    } catch (err) {
      console.error("Failed to maximize/restore window:", err);
    }
  };

  const handleClose = async () => {
    try {
      const { getCurrentWindow } = await import("@tauri-apps/api/window");
      await getCurrentWindow().close();
    } catch (err) {
      console.error("Failed to close window:", err);
    }
  };

  const [notice, setNotice] = useState<{ title: string; message: string; status?: Status } | null>(null);
  const [overview, setOverview] = useState<OverviewResult | null>(null);
  const [settings, setSettings] = useState<SettingsResult | null>(null);
  const [relay, setRelay] = useState<RelayResult | null>(null);
  const [relayFiles, setRelayFiles] = useState<RelayFilesResult | null>(null);
  const [envConflicts, setEnvConflicts] = useState<EnvConflictsResult | null>(null);
  const [ccsProviders, setCcsProviders] = useState<CcsProvidersResult | null>(null);
  const [localSessions, setLocalSessions] = useState<LocalSessionsResult | null>(null);
  const [zedRemoteProjects, setZedRemoteProjects] = useState<ZedRemoteProjectsResult | null>(null);
  const [liveContextEntries, setLiveContextEntries] = useState<CodexContextEntries | null>(null);
  const [logs, setLogs] = useState<LogsResult | null>(null);
  const [diagnostics, setDiagnostics] = useState<DiagnosticsResult | null>(null);
  const [watcher, setWatcher] = useState<WatcherResult | null>(null);
  const [update, setUpdate] = useState<UpdateResult | null>(null);
  const [ads, setAds] = useState<AdsResult | null>(null);
  const [scriptMarket, setScriptMarket] = useState<ScriptMarketResult | null>(null);
  const [launchForm, setLaunchForm] = useState({ appPath: "", debugPort: "9229", helperPort: "57321" });
  const prevLaunchStatusRef = useRef<string | null>(null);
  const [settingsForm, setSettingsForm] = useState<BackendSettings>({ ...defaultSettings });
  const [providerSyncProgress, setProviderSyncProgress] = useState<ProviderSyncProgress>({
    active: false,
    percent: 0,
    message: "Historical session repair has not run yet.",
    result: null,
  });
  const [pluginMarketplaceProgress, setPluginMarketplaceProgress] = useState<TaskProgress>({
    active: false,
    percent: 0,
    message: "Plugin market repair has not run yet.",
  });
  const [pluginMarketplacePrompt, setPluginMarketplacePrompt] = useState<PluginMarketplaceStatusResult | null>(null);
  const [providerSyncTargets, setProviderSyncTargets] = useState<ProviderSyncTargetsResult | null>(null);
  const [selectedProviderSyncTarget, setSelectedProviderSyncTarget] = useState("");
  const [removeOwnedData, setRemoveOwnedData] = useState(false);
  const [relaySwitching, setRelaySwitching] = useState(false);

  const actions = useActions({
    route, theme, setTheme, setRoute, setNotice,
    launchForm, setLaunchForm, settingsForm, setSettingsForm,
    setOverview, setSettings, setRelay, setRelayFiles,
    setEnvConflicts, setCcsProviders, setLocalSessions,
    setZedRemoteProjects, setLiveContextEntries, setLogs,
    setDiagnostics, setWatcher, setUpdate, setAds, setScriptMarket,
    setProviderSyncProgress, setPluginMarketplaceProgress,
    setPluginMarketplacePrompt, setProviderSyncTargets,
    setSelectedProviderSyncTarget, setRemoveOwnedData, setRelaySwitching,
    settings, removeOwnedData, relaySwitching, update, logs, diagnostics,
    relayFiles, localSessions, zedRemoteProjects,
    selectedProviderSyncTarget, envConflicts, ccsProviders,
    providerSyncProgress, pluginMarketplaceProgress, prevLaunchStatusRef,
  });

  const hasUpdate = update?.updateAvailable === true;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    document.documentElement.classList.toggle("light", theme === "light");
    window.localStorage.setItem("codex-plus-theme", theme);
  }, [theme]);

  useEffect(() => {
    void (async () => {
      const { invoke } = await import("@tauri-apps/api/core");
      const startup = await invoke<{ showUpdate: boolean }>("startup_options").catch(() => null);
      if (startup?.showUpdate) {
        setRoute("about");
        void actions.checkUpdate(false);
      } else {
        void actions.checkUpdate(true);
      }
      void actions.refreshOverview(true);
      void actions.refreshSettings(true);
      void actions.refreshRelay(true);
      void actions.refreshEnvConflicts(true);
      void actions.refreshProviderSyncTargets(true);
      void actions.checkPluginMarketplacePrompt();
    })();
  }, []);

  return (
    <div className={`shell ${theme}`}>
      <div className="window-titlebar" data-tauri-drag-region>
        <div className="window-titlebar-brand" data-tauri-drag-region>
          <span className="window-titlebar-logo" data-tauri-drag-region>C++</span>
          <span className="window-titlebar-title" data-tauri-drag-region>Codex++ Manager</span>
        </div>
        <div className="window-controls">
          <button className="window-control-btn" onClick={handleMinimize} title="Minimize">
            <svg width="12" height="12" viewBox="0 0 12 12"><rect fill="currentColor" x="1.5" y="5.5" width="9" height="1" rx="0.5" /></svg>
          </button>
          <button className="window-control-btn" onClick={handleMaximize} title={isMaximized ? "Restore" : "Maximize"}>
            {isMaximized ? (
              <svg width="12" height="12" viewBox="0 0 12 12"><path fill="none" stroke="currentColor" strokeWidth="1.2" d="M1.5 4.5h6v6h-6z M4.5 1.5h6v6h-1.5" /></svg>
            ) : (
              <svg width="12" height="12" viewBox="0 0 12 12"><rect fill="none" stroke="currentColor" strokeWidth="1.2" x="2.5" y="2.5" width="7" height="7" rx="1" /></svg>
            )}
          </button>
          <button className="window-control-btn close" onClick={handleClose} title="Close">
            <svg width="12" height="12" viewBox="0 0 12 12"><path fill="none" stroke="currentColor" strokeWidth="1.2" d="M2.5 2.5l7 7M9.5 2.5l-7 7" /></svg>
          </button>
        </div>
      </div>
      <div className="app-body">
        <Sidebar
          currentRoute={route}
          onNavigate={(r) => void actions.navigate(r)}
          hasUpdate={hasUpdate}
          latestVersion={update?.latestVersion ?? undefined}
          theme={theme}
          onToggleTheme={actions.toggleTheme}
          onRestart={() => void actions.restart()}
        />
        <main className="workspace">
          <header className="topbar" key={`topbar-${route}`}>
            <div>
              <h1>{routeTitle(route)}</h1>
              <p>{routeSubtitle(route)}</p>
            </div>
            <div className="topbar-actions">
              <Button onClick={actions.toggleTheme} size="icon" title={theme === "dark" ? "Switch to light" : "Switch to dark"} variant="outline">
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </Button>
              <Button onClick={() => void actions.restart()} title="Restart Codex++" variant="outline">
                <Rocket className="h-4 w-4" />
                Restart Codex++
              </Button>
              <Button onClick={() => void actions.refreshCurrent()} size="icon" title="Refresh current page" variant="outline">
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
          </header>
          <section className="screen" key={route}>
            {route === "overview" && <OverviewTab overview={overview} pluginMarketplaceProgress={pluginMarketplaceProgress} ads={ads?.ads ?? []} actions={actions} launchForm={settingsForm} />}
            {route === "relay" && <RelayTab settings={settings} relayFiles={relayFiles} envConflicts={envConflicts} ccsProviders={ccsProviders} form={settingsForm} onFormChange={setSettingsForm} actions={actions} />}
            {route === "mobileControl" && <MobileControlTab form={settingsForm} onFormChange={setSettingsForm} actions={actions} />}
            {route === "sessions" && <SessionsTab settings={settings} form={settingsForm} sessions={localSessions} providerSyncProgress={providerSyncProgress} providerSyncTargets={providerSyncTargets} selectedProviderSyncTarget={selectedProviderSyncTarget} onFormChange={setSettingsForm} actions={actions} />}
            {route === "context" && <ContextTab form={settingsForm} liveContextEntries={liveContextEntries} relayFiles={relayFiles} onFormChange={setSettingsForm} actions={actions} />}
            {route === "enhance" && <EnhanceTab form={settingsForm} pluginMarketplaceProgress={pluginMarketplaceProgress} onFormChange={setSettingsForm} actions={actions} />}
            {route === "zedRemote" && <ZedRemoteTab zedRemoteProjects={zedRemoteProjects} form={settingsForm} onFormChange={setSettingsForm} actions={actions} />}
            {route === "userScripts" && <UserScriptsTab settings={settings} market={scriptMarket} actions={actions} />}
            {route === "recommendations" && <RecommendationsTab ads={ads} actions={actions} />}
            {route === "maintenance" && <MaintenanceTab overview={overview} watcher={watcher} settings={settings} launchForm={launchForm} onLaunchFormChange={setLaunchForm} removeOwnedData={removeOwnedData} onRemoveOwnedDataChange={setRemoveOwnedData} actions={actions} />}
            {route === "about" && <AboutTab overview={overview} update={update} logs={logs} diagnostics={diagnostics} actions={actions} />}
            {route === "settings" && <SettingsTab settings={settings} theme={theme} form={settingsForm} onFormChange={setSettingsForm} actions={actions} />}
          </section>
        </main>
      </div>
      {notice && (
        <NoticeDialog
          key={`${notice.title}-${notice.message}-${notice.status ?? ""}`}
          notice={notice}
          onClose={() => setNotice(null)}
        />
      )}
      {pluginMarketplacePrompt && (
        <PluginMarketplacePromptDialog
          progress={pluginMarketplaceProgress}
          status={pluginMarketplacePrompt}
          onClose={() => setPluginMarketplacePrompt(null)}
          onRepair={() => void actions.repairPluginMarketplace()}
        />
      )}
    </div>
  );
}

function routeTitle(route: Route) {
  return routes.find((item) => item.id === route)?.label ?? "Overview";
}

function routeSubtitle(route: Route) {
  const subtitles: Record<Route, string> = {
    overview: "Check issues, launch, and quick repair",
    relay: "Manage API providers, protocols, keys, and config files",
    mobileControl: "Configure mobile control relay, room key, and server status",
    sessions: "View, delete, and repair Codex local sessions",
    context: "Independently manage MCP, Skills, Plugins",
    enhance: "Session deletion, export, project move, and script capabilities",
    zedRemote: "Manage Codex SSH projects and add to Zed workspace",
    userScripts: "Built-in and user custom script inventory",
    recommendations: "Sponsor and normal recommendations",
    maintenance: "Entrypoint install, repair, Watcher, and manual launch",
    about: "Version info, project links, GitHub Release updates, logs, and diagnostics",
    settings: "Theme, command wrapper, and launch arguments",
  };
  return subtitles[route];
}
