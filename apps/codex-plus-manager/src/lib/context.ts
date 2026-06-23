import type { ContextKind } from "@/types";

const contextKindOptions: Array<{ kind: ContextKind; label: string; tableName: string }> = [
  { kind: "mcp", label: "MCP", tableName: "mcp_servers" },
  { kind: "skill", label: "Skills", tableName: "skills" },
  { kind: "plugin", label: "Plugins", tableName: "plugins" },
];

export function contextKindLabel(kind: ContextKind) {
  return contextKindOptions.find((option) => option.kind === kind)?.label ?? "Extension";
}

export {
  contextEntriesFromSettings,
  contextEntriesWithLiveEntries,
  contextEntriesForProfile,
  contextEntriesFromConfig,
  contextEntriesByKind,
  contextEntrySummary,
  contextEntryEnabled,
  setContextEntryEnabled,
  contextEntryToTomlSection,
  contextSelectionIds,
  setContextSelectionId,
  removeContextSelectionFromSettings,
  contextSelectionForAllEntries,
  dedupeContextEntryList,
  filterContextEntriesBySelection,
  mergeLiveContextEntries,
  withLiveEntryState,
  mergeContextEntries,
  mergeContextEntryList,
  parseContextEntries,
  contextKindOptions,
  allContextConfigToml,
} from "@/lib/toml";
