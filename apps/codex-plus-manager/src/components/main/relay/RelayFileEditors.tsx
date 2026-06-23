import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SyncedTextarea } from "@/components/main/ui/SharedComponents";
import {
  effectiveRelayConfigPreview,
  stripCommonConfigTextFallback,
  relayCombinedCommonConfig,
  splitContextConfigText,
  syncLegacyRelayFields,
  deriveRelayProfileFromFiles,
} from "@/lib/relayHelpers";
import { contextEntriesForProfile } from "@/lib/context";
import { joinTomlSectionsRootFirst, ensureTrailingNewline } from "@/lib/toml";
import type { BackendSettings, RelayProfile, CodexContextEntries, Actions } from "@/types";

function stripContextEntriesFromConfig(configContents: string, entries: CodexContextEntries): string {
  const knownIds = {
    mcp: new Set(entries.mcpServers.map((e) => e.id)),
    skill: new Set(entries.skills.map((e) => e.id)),
    plugin: new Set(entries.plugins.map((e) => e.id)),
  };
  const lines = configContents.split(/\r?\n/);
  const kept: string[] = [];
  let skipping = false;

  for (const line of lines) {
    const trimmed = line.trim();
    if (/^\s*\[([^\]]+)\]\s*$/.test(trimmed)) {
      const path = trimmed.match(/^\[([^\]]+)\]$/)?.[1]?.split(".").map((s) => s.trim());
      if (path && path.length === 2) {
        const kind = path[0] === "mcp_servers" ? "mcp" : path[0] === "skills" ? "skill" : path[0] === "plugins" ? "plugin" : null;
        if (kind && knownIds[kind as keyof typeof knownIds]?.has(path[1])) {
          skipping = true;
          continue;
        }
      }
      skipping = false;
    }
    if (!skipping) kept.push(line);
  }

  return ensureTrailingNewline(kept.join("\n").trimEnd());
}

export function RelayFileEditors({
  contextProfile,
  profile,
  form,
  isActive,
  profileId,
  onFormChange,
  onProfileChange,
  actions,
}: {
  contextProfile: RelayProfile;
  profile: RelayProfile;
  form: BackendSettings;
  isActive: boolean;
  profileId: string;
  onFormChange: (value: BackendSettings) => void;
  onProfileChange: (value: RelayProfile) => void;
  actions: Actions;
}) {
  const configPreview = effectiveRelayConfigPreview(profile, form, contextProfile);
  const entries = contextEntriesForProfile(form, contextProfile);
  return (
    <div className="relay-file-grid">
      <div className="relay-file-panel">
        <div className="relay-file-head">
          <div>
            <strong>config.toml Preview</strong>
            <span>{isActive ? "Preview written after switching to this provider; context toggle changes are reflected immediately" : "Preview written when switching to this provider; context toggle changes are reflected immediately"}</span>
          </div>
        </div>
        <SyncedTextarea
          className="relay-file-textarea"
          value={configPreview}
          onValueChange={(value) => {
            const withoutCommon = stripCommonConfigTextFallback(
              value,
              relayCombinedCommonConfig(form),
            );
            const configContents = stripContextEntriesFromConfig(withoutCommon, entries);
            onProfileChange(deriveRelayProfileFromFiles({
              ...profile,
              configContents,
            }));
          }}
        />
      </div>
      <div className="relay-file-panel">
        <div className="relay-file-head">
          <div>
            <strong>Common Config File</strong>
            <span>Retains only non-MCP, Skills, Plugins cross-provider config; tools and plugins are managed on a separate page.</span>
          </div>
          <Button
            onClick={async () => {
              const extracted = await actions.extractRelayCommonConfig(profile.configContents || "");
              if (!extracted) return;
              const split = splitContextConfigText(extracted.commonConfigContents || "");
              if (!split.common.trim() && !split.context.trim()) {
                await actions.showMessage("Common Config File", "No extractable common config found in the current provider config.toml.", "failed");
                return;
              }
              const promotedProfile = {
                ...profile,
                configContents: extracted.profileConfigContents,
              };
              const next = syncLegacyRelayFields({
                ...form,
                relayCommonConfigContents: split.common,
                relayContextConfigContents: joinTomlSectionsRootFirst([form.relayContextConfigContents || "", split.context]),
                relayProfiles: form.relayProfiles.map((item) => (item.id === profileId ? promotedProfile : item)),
              });
              onFormChange(next);
              onProfileChange(promotedProfile);
              await actions.saveSettingsValue(next, false);
            }}
            size="sm"
            type="button"
            variant="secondary"
          >
            <Download className="h-4 w-4" />
            Extract Current Provider Config
          </Button>
        </div>
        <SyncedTextarea
          className="relay-file-textarea"
          value={form.relayCommonConfigContents}
          onValueChange={(value) => onFormChange({ ...form, relayCommonConfigContents: value })}
        />
      </div>
      <div className="relay-file-panel">
        <div className="relay-file-head">
          <div>
            <strong>auth.json</strong>
            <span>{isActive ? "Currently in use: backfilled from ~/.codex/auth.json on open; saved as this provider auth archive" : "Written to ~/.codex/auth.json when switching to this provider"}</span>
          </div>
        </div>
        <SyncedTextarea
          className="relay-file-textarea"
          value={profile.authContents}
          onValueChange={(value) => onProfileChange(deriveRelayProfileFromFiles({ ...profile, authContents: value }))}
        />
      </div>
    </div>
  );
}
