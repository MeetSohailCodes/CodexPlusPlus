import { useEffect, useState } from "react";
import { Download, Plus, RefreshCw, ShieldAlert, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel, CardHead, CardContent } from "@/components/main/ui/SharedComponents";
import { RelayProfileDetail } from "@/components/main/relay/RelayProfileDetail";
import { RelayProfileList } from "@/components/main/relay/RelayProfileList";
import {
  normalizeSettings,
  createRelayProfile,
  createAggregateRelayProfile,
  normalizeAggregateConfig,
  aggregateMemberCandidates,
  ccsProviderSummary,
} from "@/lib/relayHelpers";
import type { BackendSettings, SettingsResult, RelayFilesResult, EnvConflictsResult, CcsProvidersResult, Actions } from "@/types";

export function RelayTab({
  settings: _settings,
  relayFiles,
  envConflicts,
  ccsProviders,
  form,
  onFormChange,
  actions,
}: {
  settings: SettingsResult | null;
  relayFiles: RelayFilesResult | null;
  envConflicts: EnvConflictsResult | null;
  ccsProviders: CcsProvidersResult | null;
  form: BackendSettings;
  onFormChange: (value: BackendSettings) => void;
  actions: Actions;
}) {
  const normalized = normalizeSettings(form);
  const [detailProfileId, setDetailProfileId] = useState<string | null>(null);
  const [newProfileDraft, setNewProfileDraft] = useState<import("@/types").RelayProfile | null>(null);
  const [thirdPartyImportOpen, setThirdPartyImportOpen] = useState(false);
  const detailProfile = newProfileDraft || (detailProfileId
    ? normalized.relayProfiles.find((profile) => profile.id === detailProfileId) || null
    : null);
  const isNewProfile = !!newProfileDraft;
  const saveRelaySettings = async (next: BackendSettings) => {
    onFormChange(next);
    await actions.saveSettingsValue(next, true);
  };
  const createNewAggregateProfile = () => {
    const draft = createAggregateRelayProfile(normalized);
    setDetailProfileId(null);
    setNewProfileDraft(draft);
    if (!normalizeAggregateConfig(draft.aggregate, aggregateMemberCandidates(normalized, draft.id)).members.length) {
      void actions.showMessage(
        "Add Aggregate Provider",
        "Opened aggregate provider details; please add or complete at least 1 API provider Base URL / Key before selecting as a member.",
        "failed",
      );
    }
  };
  const editRelayProfile = async (profileId: string) => {
    setNewProfileDraft(null);
    setDetailProfileId(
      normalized.relayProfiles.some((item) => item.id === profileId) ? profileId : null,
    );
  };
  useEffect(() => {
    if (!newProfileDraft && detailProfileId && !normalized.relayProfiles.some((profile) => profile.id === detailProfileId)) {
      setDetailProfileId(null);
    }
  }, [detailProfileId, newProfileDraft, normalized.relayProfiles]);
  useEffect(() => {
    if (!newProfileDraft && detailProfileId === normalized.activeRelayId) {
      void actions.refreshRelayFiles();
    }
  }, [detailProfileId, newProfileDraft, normalized.activeRelayId]);
  const openThirdPartyImport = () => {
    setThirdPartyImportOpen((open) => !open);
    if (!ccsProviders) void actions.refreshCcsProviders(true);
  };

  if (detailProfile) {
    return (
      <RelayProfileDetail
        profile={detailProfile}
        relayFiles={!isNewProfile && detailProfile.id === normalized.activeRelayId ? relayFiles : null}
        form={normalized}
        isNew={isNewProfile}
        onBack={() => {
          setNewProfileDraft(null);
          setDetailProfileId(null);
        }}
        onFormChange={saveRelaySettings}
        onSaved={() => {
          setNewProfileDraft(null);
          setDetailProfileId(null);
        }}
        actions={actions}
      />
    );
  }

  return (
    <>
      <Panel>
        <CardHead title="Provider List" detail={`${normalized.relayProfiles.length} provider configurations; drag to reorder, click edit to view details`} />
        <CardContent>
          <EnvConflictNotice envConflicts={envConflicts} actions={actions} />
          <label className="switch-row relay-master-switch">
            <input
              checked={normalized.relayProfilesEnabled}
              onChange={(event) => {
                const next = { ...normalized, relayProfilesEnabled: event.currentTarget.checked };
                void saveRelaySettings(next);
              }}
              type="checkbox"
            />
            <span>
              <strong>Enable Provider Config Switching</strong>
              <small>When disabled, this tool will not write to Codex config.toml / auth.json during manual switching; launching Codex will never automatically modify these files.</small>
            </span>
          </label>
          <div className="relay-add-row">
            <Button
              variant="secondary"
              onClick={() => {
                setNewProfileDraft(createRelayProfile(normalized));
                setDetailProfileId(null);
              }}
            >
              <Plus className="h-4 w-4" />
              Add Provider
            </Button>
            <Button
              variant="secondary"
              onClick={createNewAggregateProfile}
            >
              <Plus className="h-4 w-4" />
              Add Aggregate Provider
            </Button>
            <div className="third-party-import">
              <Button
                onClick={openThirdPartyImport}
                variant="secondary"
              >
                <Download className="h-4 w-4" />
                Import from Third Party
              </Button>
              {thirdPartyImportOpen ? (
                <div className="third-party-import-menu">
                  <button
                    disabled={!ccsProviders?.providers.length}
                    onClick={() => {
                      setThirdPartyImportOpen(false);
                      void actions.importCcsProviders();
                    }}
                    type="button"
                  >
                    <strong>ccswitch</strong>
                    <span>{ccsProviderSummary(ccsProviders)}</span>
                  </button>
                  <button
                    onClick={() => void actions.refreshCcsProviders()}
                    type="button"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Refresh List
                  </button>
                </div>
              ) : null}
            </div>
          </div>
          <RelayProfileList
            form={normalized}
            onEdit={(profileId) => void editRelayProfile(profileId)}
            onFormChange={saveRelaySettings}
            disabled={!normalized.relayProfilesEnabled || actions.relaySwitching}
            actions={actions}
          />
        </CardContent>
      </Panel>
    </>
  );
}

function EnvConflictNotice({
  envConflicts,
  actions,
}: {
  envConflicts: EnvConflictsResult | null;
  actions: Actions;
}) {
  const conflicts = envConflicts?.conflicts ?? [];
  if (!conflicts.length) return null;
  const names = Array.from(new Set(conflicts.map((conflict) => conflict.name))).sort();
  return (
    <div className="env-conflict-notice">
      <div className="env-conflict-icon">
        <ShieldAlert className="h-4 w-4" />
      </div>
      <div className="env-conflict-body">
        <strong>OPENAI Environment Variable Detected</strong>
        <p>These variables may override the current provider config.toml / auth.json; CODEX_HOME will not be cleaned.</p>
        <div className="env-conflict-tags">
          {conflicts.map((conflict) => (
            <span key={`${conflict.source}-${conflict.name}`}>
              {conflict.name}
              <small>{envConflictSourceLabel(conflict.source)}</small>
            </span>
          ))}
        </div>
      </div>
      <div className="env-conflict-actions">
        <Button onClick={() => void actions.removeEnvConflicts(names)} size="sm">
          <Trash2 className="h-4 w-4" />
          Delete
        </Button>
        <Button onClick={() => void actions.refreshEnvConflicts(false)} size="sm" variant="secondary">
          <RefreshCw className="h-4 w-4" />
          Detect
        </Button>
      </div>
    </div>
  );
}

function envConflictSourceLabel(source: string): string {
  if (source === "process") return "Current process";
  if (source === "user") return "User environment";
  return source || "Environment variable";
}
