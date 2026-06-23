export type Status = "ok" | "failed" | "not_implemented" | "not_checked" | string;

export type CommandResult<T> = T & {
  status: Status;
  message: string;
};

export type PathState = {
  status: string;
  path: string | null;
};

export type LaunchStatus = {
  status: string;
  message: string;
  started_at_ms: number;
  debug_port: number | null;
  helper_port: number | null;
  codex_app: string | null;
};

export type OverviewResult = CommandResult<{
  codex_app: PathState;
  codex_version: string | null;
  silent_shortcut: PathState;
  management_shortcut: PathState;
  latest_launch: LaunchStatus | null;
  current_version: string;
  update_status: string;
  settings_path: string;
  logs_path: string;
}>;

export type PluginMarketplaceRepairResult = CommandResult<{
  codexHome: string;
  marketplaceRoot?: string | null;
  initialized: boolean;
  configured: boolean;
  needsRepair: boolean;
}>;

export type PluginMarketplaceStatusResult = CommandResult<{
  codexHome: string;
  marketplaceRoot?: string | null;
  configRegistered: boolean;
  needsRepair: boolean;
}>;

export type ZedOpenStrategy = "addToFocusedWorkspace" | "reuseWindow" | "newWindow" | "default";
export type LaunchMode = "patch" | "relay";

export type RelayProtocol = "responses" | "chatCompletions";
export type RelayMode = "official" | "mixedApi" | "pureApi" | "aggregate";

export type RelayProfile = {
  id: string;
  name: string;
  model: string;
  baseUrl: string;
  upstreamBaseUrl: string;
  apiKey: string;
  protocol: RelayProtocol;
  relayMode: RelayMode;
  officialMixApiKey: boolean;
  testModel: string;
  configContents: string;
  authContents: string;
  useCommonConfig: boolean;
  contextSelection: RelayContextSelection;
  contextSelectionInitialized: boolean;
  contextWindow: string;
  autoCompactLimit: string;
  modelList: string;
  userAgent: string;
  aggregate?: RelayAggregateConfig | null;
};

export type RelayAggregateStrategy = "failover" | "conversationRoundRobin" | "requestRoundRobin" | "weightedRoundRobin";

export type RelayAggregateMember = {
  profileId: string;
  weight: number;
};

export type RelayAggregateConfig = {
  strategy: RelayAggregateStrategy;
  members: RelayAggregateMember[];
};

export type AggregateRelayMember = {
  relayId: string;
  weight: number;
};

export type AggregateRelayProfile = {
  id: string;
  name: string;
  strategy: RelayAggregateStrategy;
  members: AggregateRelayMember[];
};

export type RelayContextSelection = {
  mcpServers: string[];
  skills: string[];
  plugins: string[];
};

export type ContextKind = "mcp" | "skill" | "plugin";

export type CodexContextEntry = {
  id: string;
  kind: ContextKind;
  title: string;
  summary: string;
  tomlBody: string;
  enabled: boolean;
};

export type CodexContextEntries = {
  mcpServers: CodexContextEntry[];
  skills: CodexContextEntry[];
  plugins: CodexContextEntry[];
};

export type BackendSettings = {
  codexAppPath: string;
  codexExtraArgs: string[];
  providerSyncEnabled: boolean;
  providerSyncSavedProviders: string[];
  providerSyncManualProviders: string[];
  providerSyncLastSelectedProvider: string;
  relayProfilesEnabled: boolean;
  enhancementsEnabled: boolean;
  computerUseGuardEnabled: boolean;
  codexAppPluginEntryUnlock: boolean;
  codexAppPluginMarketplaceUnlock: boolean;
  codexAppForcePluginInstall: boolean;
  codexAppModelWhitelistUnlock: boolean;
  codexAppSessionDelete: boolean;
  codexAppMarkdownExport: boolean;
  codexAppPasteFix: boolean;
  codexAppProjectMove: boolean;
  codexAppConversationTimeline: boolean;
  codexAppThreadIdBadge: boolean;
  codexAppConversationView: boolean;
  codexAppThreadScrollRestore: boolean;
  codexAppZedRemoteOpen: boolean;
  zedRemoteOpenStrategy: ZedOpenStrategy;
  zedRemoteProjectRegistryEnabled: boolean;
  zedRemoteSyncToZedSettings: boolean;
  codexAppUpstreamWorktreeCreate: boolean;
  codexAppNativeMenuPlacement: boolean;
  codexAppServiceTierControls: boolean;
  codexAppImageOverlayEnabled: boolean;
  codexAppImageOverlayPath: string;
  codexAppImageOverlayOpacity: number;
  codexGoalsEnabled: boolean;
  mobileControlEnabled: boolean;
  mobileControlRelayUrl: string;
  mobileControlRoom: string;
  mobileControlKey: string;
  launchMode: LaunchMode;
  relayBaseUrl: string;
  relayApiKey: string;
  relayProfiles: RelayProfile[];
  aggregateRelayProfiles: AggregateRelayProfile[];
  activeAggregateRelayId: string;
  relayCommonConfigContents: string;
  relayContextConfigContents: string;
  activeRelayId: string;
  relayTestModel: string;
  cliWrapperEnabled: boolean;
  cliWrapperBaseUrl: string;
  cliWrapperApiKey: string;
  cliWrapperApiKeyEnv: string;
};

export type UserScriptInventory = {
  enabled?: boolean;
  scripts?: Array<{
    key: string;
    name: string;
    source: string;
    enabled: boolean;
    status: string;
    error: string;
    market_id?: string;
    version?: string;
    installed?: boolean;
    source_url?: string;
    homepage?: string;
  }>;
};

export type SettingsResult = CommandResult<{
  settings: BackendSettings;
  settings_path: string;
  user_scripts: UserScriptInventory;
}>;

export type RelayResult = CommandResult<{
  authenticated: boolean;
  authSource: string;
  accountLabel: string | null;
  configPath: string;
  configured: boolean;
  requiresOpenaiAuth: boolean;
  hasBearerToken: boolean;
  backupPath: string | null;
}>;

export type RelayPayload = Omit<RelayResult, "status" | "message">;

export type RelayFilesResult = CommandResult<{
  configPath: string;
  authPath: string;
  configContents: string;
  authContents: string;
}>;

export type LocalSession = {
  id: string;
  title: string;
  cwd: string;
  modelProvider: string;
  archived: boolean;
  updatedAtMs: number | null;
  rolloutPath: string;
  dbPath: string;
};

export type LocalSessionsResult = CommandResult<{
  dbPath: string;
  dbPaths: string[];
  sessions: LocalSession[];
}>;

export type ZedRemoteProject = {
  id: string;
  label: string;
  hostId: string;
  ssh: {
    user: string;
    host: string;
    port: number | null;
  };
  path: string;
  url: string;
  source: "currentThread" | "codexRemoteProject" | "threadWorkspaceHint" | "sqliteThreadCwd" | "recent" | string;
  lastOpenedAtMs: number | null;
  isCurrent: boolean;
};

export type ZedRemoteProjectsResult = CommandResult<{
  projects: ZedRemoteProject[];
}>;

export type ZedRemoteOpenResult = CommandResult<{
  url: string;
  strategy: ZedOpenStrategy;
}>;

export type DeleteLocalSessionResult = CommandResult<{
  status: string;
  session_id: string;
  message: string;
  undo_token: string | null;
  backup_path: string | null;
}>;

export type ContextEntriesResult = CommandResult<{
  settings: BackendSettings;
  entries: CodexContextEntries;
}>;

export type LiveContextEntriesResult = CommandResult<{
  entries: CodexContextEntries;
}>;

export type ExtractRelayCommonConfigResult = CommandResult<{
  commonConfigContents: string;
  profileConfigContents: string;
}>;

export type RelaySwitchResult = CommandResult<{
  settings: BackendSettings;
  settingsPath: string;
  user_scripts: unknown;
  relay: RelayPayload;
}>;

export type SettingsBackfillResult = CommandResult<{
  settings: BackendSettings;
}>;

export type RelayProfileTestResult = CommandResult<{
  httpStatus: number;
  endpoint: string;
  responsePreview: string;
}>;

export type RelayProfileModelsResult = CommandResult<{
  models: string[];
  endpoint: string;
}>;

export type CcsProviderImport = {
  sourceId: string;
  name: string;
  baseUrl: string;
  apiKey: string;
  protocol: RelayProtocol;
  configContents: string;
  authContents: string;
};

export type CcsProvidersResult = CommandResult<{
  dbPath: string;
  providers: CcsProviderImport[];
}>;

export type EnvConflict = {
  name: string;
  source: "process" | "user" | string;
  valuePresent: boolean;
};

export type EnvConflictsResult = CommandResult<{
  conflicts: EnvConflict[];
}>;

export type RemoveEnvConflictsResult = CommandResult<{
  removed: Array<{
    name: string;
    removedProcess: boolean;
    removedUser: boolean;
  }>;
  backupPath: string | null;
  remaining: EnvConflict[];
}>;

export type ProviderSyncPayload = {
  syncStatus?: string;
  targetProvider?: string;
  changedSessionFiles?: number;
  skippedLockedRolloutFiles?: string[];
  sqliteRowsUpdated?: number;
  sqliteProviderRowsUpdated?: number;
  sqliteUserEventRowsUpdated?: number;
  sqliteCwdRowsUpdated?: number;
  updatedWorkspaceRoots?: number;
  encryptedContentWarning?: string | null;
};

export type ProviderSyncTargetSource = "config" | "rollout" | "sqlite" | "manual";

export type ProviderSyncTargetOption = {
  id: string;
  sources: ProviderSyncTargetSource[];
  isCurrentProvider: boolean;
  isManual: boolean;
  isSaved: boolean;
};

export type ProviderSyncTargetsPayload = {
  currentProvider: string;
  targets: ProviderSyncTargetOption[];
};

export type ProviderSyncTargetsResult = CommandResult<ProviderSyncTargetsPayload>;

export type ProviderSyncProgress = {
  active: boolean;
  percent: number;
  message: string;
  result: CommandResult<ProviderSyncPayload> | null;
};

export type TaskProgress = {
  active: boolean;
  percent: number;
  message: string;
};

export type LogsResult = CommandResult<{
  path: string;
  text: string;
  lines: number;
}>;

export type DiagnosticsResult = CommandResult<{
  report: string;
}>;

export type WatcherResult = CommandResult<{
  enabled: boolean;
  disabled_flag: string;
}>;

export type InstallResult = CommandResult<{
  silent_shortcut: { installed: boolean; path: string | null };
  management_shortcut: { installed: boolean; path: string | null };
}>;

export type UpdateResult = CommandResult<{
  currentVersion: string;
  latestVersion?: string | null;
  releaseSummary?: string;
  assetName?: string | null;
  assetUrl?: string | null;
  updateAvailable?: boolean;
  installedPath?: string;
  progress?: number;
}>;

export type AdItem = {
  id?: string;
  type: "sponsor" | "normal" | string;
  title: string;
  description: string;
  url: string;
  highlights?: string[];
  expires_at?: string;
};

export type AdsResult = CommandResult<{
  version: number;
  ads: AdItem[];
}>;

export type ScriptMarketItem = {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  tags: string[];
  homepage: string;
  script_url: string;
  sha256: string;
  installed: boolean;
  installedVersion: string;
  updateAvailable: boolean;
};

export type ScriptMarketResult = CommandResult<{
  market: {
    status: string;
    message: string;
    indexUrl: string;
    updatedAt: string;
    scripts: ScriptMarketItem[];
  };
  user_scripts: UserScriptInventory;
}>;

export type StartupResult = CommandResult<{
  showUpdate: boolean;
}>;

export type Route = "overview" | "relay" | "mobileControl" | "sessions" | "context" | "enhance" | "zedRemote" | "userScripts" | "recommendations" | "maintenance" | "about" | "settings";

export type Theme = "dark" | "light";

export type Actions = {
  refreshCurrent: () => Promise<void>;
  navigate: (route: Route) => Promise<void>;
  launch: () => Promise<void>;
  restart: () => Promise<void>;
  repairBackend: () => Promise<void>;
  repairPluginMarketplace: () => Promise<void>;
  checkPluginMarketplacePrompt: () => Promise<PluginMarketplaceStatusResult | null>;
  installEntrypoints: () => Promise<void>;
  uninstallEntrypoints: () => Promise<void>;
  repairShortcuts: () => Promise<void>;
  checkUpdate: (silent?: boolean) => Promise<void>;
  performUpdate: () => Promise<void>;
  saveSettings: () => Promise<void>;
  saveSettingsValue: (settings: BackendSettings, silent?: boolean) => Promise<void>;
  refreshSettings: (silent?: boolean) => Promise<BackendSettings | null>;
  refreshOverview: (silent?: boolean) => Promise<void>;
  refreshRelay: (silent?: boolean) => Promise<void>;
  refreshEnvConflicts: (silent?: boolean) => Promise<EnvConflictsResult | null>;
  refreshProviderSyncTargets: (silent?: boolean) => Promise<ProviderSyncTargetsResult | null>;
  resetSettings: () => Promise<void>;
  resetImageOverlaySettings: () => Promise<void>;
  chooseCodexAppPath: (mode: "folder" | "file") => Promise<void>;
  clearCodexAppPath: () => Promise<void>;
  chooseImageOverlayPath: () => Promise<void>;
  saveManualCodexAppPath: () => Promise<void>;
  syncProvidersNow: () => Promise<void>;
  setProviderSyncTarget: (provider: string) => void;
  setLaunchMode: (launchMode: LaunchMode) => Promise<void>;
  refreshRelayFiles: () => Promise<RelayFilesResult | null>;
  removeEnvConflicts: (names: string[]) => Promise<void>;
  refreshCcsProviders: (silent?: boolean) => Promise<CcsProvidersResult | null>;
  importCcsProviders: () => Promise<void>;
  refreshLiveContextEntries: () => Promise<LiveContextEntriesResult | null>;
  syncLiveContextEntries: (settings: BackendSettings, silent?: boolean) => Promise<LiveContextEntriesResult | null>;
  refreshAds: (silent?: boolean) => Promise<void>;
  refreshScriptMarket: (silent?: boolean) => Promise<void>;
  installMarketScript: (id: string) => Promise<void>;
  setUserScriptEnabled: (key: string, enabled: boolean) => Promise<void>;
  deleteUserScript: (key: string) => Promise<void>;
  refreshLocalSessions: () => Promise<LocalSessionsResult | null>;
  deleteLocalSession: (session: LocalSession) => Promise<void>;
  refreshZedRemoteProjects: () => Promise<ZedRemoteProjectsResult | null>;
  openZedRemoteProject: (project: ZedRemoteProject, strategy?: ZedOpenStrategy) => Promise<void>;
  forgetZedRemoteProject: (project: ZedRemoteProject) => Promise<void>;
  openExternalUrl: (url: string) => Promise<void>;
  applyRelayInjection: () => Promise<boolean>;
  applyPureApiInjection: () => Promise<boolean>;
  clearRelayInjection: () => Promise<boolean>;
  saveRelayFile: (kind: "config" | "auth", contents: string, silent?: boolean) => Promise<void>;
  upsertContextEntry: (
    settings: BackendSettings,
    kind: ContextKind,
    id: string,
    tomlBody: string,
  ) => Promise<BackendSettings | null>;
  deleteContextEntry: (settings: BackendSettings, kind: ContextKind, id: string) => Promise<BackendSettings | null>;
  extractRelayCommonConfig: (configContents: string) => Promise<ExtractRelayCommonConfigResult | null>;
  testRelayProfile: (profile: RelayProfile) => Promise<void>;
  fetchRelayProfileModels: (profile: RelayProfile) => Promise<string[] | null>;
  switchRelayProfile: (settings: BackendSettings, previousActiveRelayId?: string) => Promise<void>;
  relaySwitching: boolean;
  switchOfficialMode: () => Promise<void>;
  switchPureApiMode: () => Promise<void>;
  refreshLogs: (silent?: boolean) => Promise<void>;
  refreshDiagnostics: (silent?: boolean) => Promise<void>;
  showMessage: (title: string, message: string, status?: Status) => Promise<void>;
  copyLogs: () => Promise<void>;
  copyDiagnostics: () => Promise<void>;
  goLogs: () => Promise<void>;
  installWatcher: () => Promise<void>;
  uninstallWatcher: () => Promise<void>;
  enableWatcher: () => Promise<void>;
  disableWatcher: () => Promise<void>;
  toggleTheme: () => void;
  checkHealth: () => Promise<void>;
};

export type MobileRelayRoomStatus = {
  room: string;
  hostOnline: boolean;
  clientOnline: boolean;
  connections: number;
  ageSeconds: number;
  forwardedMessages: number;
  forwardedBytes: number;
};

export type MobileRelayStatus = {
  status: string;
  service: string;
  version: string;
  uptimeSeconds: number;
  rooms: number;
  activeConnections: number;
  totalConnections: number;
  forwardedMessages: number;
  forwardedBytes: number;
  roomDetails: MobileRelayRoomStatus[];
};
