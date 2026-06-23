import type { LucideIcon } from "lucide-react";
import {
  ExternalLink,
  FileCode2,
  Hammer,
  Info,
  KeyRound,
  LayoutDashboard,
  MessageCircle,
  Network,
  Settings,
  Wrench,
} from "lucide-react";
import type {
  BackendSettings,
  ContextKind,
  RelayAggregateStrategy,
  RelayContextSelection,
  Route,
} from "@/types";

export const PROTOCOL_PROXY_BASE_URL = "http://127.0.0.1:57321/v1";
export const CHAT_UPSTREAM_BASE_URL_KEY = "codex_plus_chat_base_url";
export const SCRIPT_MARKET_REPOSITORY_URL = "https://github.com/BigPizzaV3/CodexPlusPlusScriptMarket";
export const LOCAL_MOBILE_RELAY_URL = "ws://127.0.0.1:57323";
export const PUBLIC_MOBILE_RELAY_URL = "ws://154.201.90.76:57323";

export const mobileRelayServers = [
  { id: "local", label: "Local Test", url: LOCAL_MOBILE_RELAY_URL, capacity: 100 },
  { id: "public-154", label: "Public Server 1", url: PUBLIC_MOBILE_RELAY_URL, capacity: 100 },
];

export const emptyContextSelection = (): RelayContextSelection => ({
  mcpServers: [],
  skills: [],
  plugins: [],
});

export const routes: Array<{ id: Route; label: string; icon: LucideIcon; badge?: string }> = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "relay", label: "Provider Config", icon: KeyRound },
  { id: "mobileControl", label: "Mobile Control", icon: MessageCircle, badge: "Beta" },
  { id: "sessions", label: "Session Management", icon: MessageCircle },
  { id: "context", label: "Tools & Plugins", icon: Network },
  { id: "enhance", label: "Page Enhancements", icon: Hammer },
  { id: "zedRemote", label: "Zed Remote Projects", icon: ExternalLink },
  { id: "userScripts", label: "Script Market", icon: FileCode2 },
  { id: "recommendations", label: "Recommendations", icon: ExternalLink },
  { id: "maintenance", label: "Installation & Maintenance", icon: Wrench },
  { id: "about", label: "About", icon: Info },
  { id: "settings", label: "Settings", icon: Settings },
];

export const defaultSettings: BackendSettings = {
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
  mobileControlRelayUrl: LOCAL_MOBILE_RELAY_URL,
  mobileControlRoom: "",
  mobileControlKey: "",
  launchMode: "patch",
  relayBaseUrl: "",
  relayApiKey: "",
  relayProfiles: [
    {
      id: "default",
      name: "Default Relay",
      model: "",
      baseUrl: "",
      upstreamBaseUrl: "",
      apiKey: "",
      protocol: "responses",
      relayMode: "official",
      officialMixApiKey: false,
      testModel: "",
      configContents: "",
      authContents: "",
      useCommonConfig: true,
      contextSelection: emptyContextSelection(),
      contextSelectionInitialized: true,
      contextWindow: "",
      autoCompactLimit: "",
      modelList: "",
      userAgent: "",
    },
  ],
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

export const contextKindOptions: Array<{ kind: ContextKind; label: string; tableName: string }> = [
  { kind: "mcp", label: "MCP", tableName: "mcp_servers" },
  { kind: "skill", label: "Skills", tableName: "skills" },
  { kind: "plugin", label: "Plugins", tableName: "plugins" },
];

export const aggregateStrategyOptions: Array<{ value: RelayAggregateStrategy; label: string; description: string }> = [
  {
    value: "failover",
    label: "Failover",
    description: "Requests in member order, switches to next provider on failure.",
  },
  {
    value: "conversationRoundRobin",
    label: "Conversation Round-Robin",
    description: "Same conversation stays with one member, different conversations are assigned sequentially.",
  },
  {
    value: "requestRoundRobin",
    label: "Request Round-Robin",
    description: "Switches member in order on each request, suitable for evenly distributing load.",
  },
  {
    value: "weightedRoundRobin",
    label: "Weighted Round-Robin",
    description: "Distributes requests by member weight; higher weight handles more.",
  },
];
