import { useEffect, useState } from "react";
import { ArrowLeft, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Toolbar } from "@/components/main/ui/SharedComponents";
import { RelayProfileEditor } from "@/components/main/relay/RelayProfileEditor";
import { RelayFileEditors } from "@/components/main/relay/RelayFileEditors";
import {
  isAggregateRelayProfile,
  normalizeAggregateRelayProfile,
  deriveRelayProfileFromFiles,
  relayProfileUsesLiveFiles,
  addRelayProfile,
  updateRelayProfile,
  effectiveRelayConfigPreview,
  syncLegacyRelayFields,
  normalizeAggregateConfig,
} from "@/lib/relayHelpers";
import type { BackendSettings, RelayProfile, RelayFilesResult, Actions } from "@/types";

function aggregateRelayProfileValidation(profile: RelayProfile): string | null {
  const aggregate = normalizeAggregateConfig(profile.aggregate, []);
  return aggregate.members.length >= 1 ? null : "Aggregate provider needs at least 1 API provider with Base URL / Key filled in.";
}

export function RelayProfileDetail({
  profile,
  relayFiles,
  form,
  isNew = false,
  onBack,
  onFormChange,
  onSaved,
  actions,
}: {
  profile: RelayProfile;
  relayFiles: RelayFilesResult | null;
  form: BackendSettings;
  isNew?: boolean;
  onBack: () => void;
  onFormChange: (value: BackendSettings) => void | Promise<void>;
  onSaved?: () => void;
  actions: Actions;
}) {
  const [draft, setDraft] = useState<RelayProfile>(profile);
  const isActive = !isNew && profile.id === form.activeRelayId;
  const profileUsesLiveFiles = relayProfileUsesLiveFiles(profile);
  useEffect(() => {
    setDraft(
      isAggregateRelayProfile(profile)
        ? normalizeAggregateRelayProfile(profile, form)
        : deriveRelayProfileFromFiles(
            isActive && profileUsesLiveFiles && relayFiles
              ? {
                ...profile,
                configContents: relayFiles.configContents,
                authContents: relayFiles.authContents,
              }
              : profile,
          ),
    );
  }, [profile.id, profileUsesLiveFiles, isActive, isNew, relayFiles?.configContents, relayFiles?.authContents]);
  const validationError = isAggregateRelayProfile(draft) ? aggregateRelayProfileValidation(draft) : null;
  const saveDraft = async () => {
    if (validationError) return;
    const normalizedDraft = isAggregateRelayProfile(draft) ? normalizeAggregateRelayProfile(draft, form) : deriveRelayProfileFromFiles(draft);
    const next = isNew
      ? addRelayProfile(form, normalizedDraft)
      : updateRelayProfile(form, profile.id, normalizedDraft);
    await onFormChange(next);
    if (isActive && relayProfileUsesLiveFiles(normalizedDraft)) {
      await actions.saveRelayFile(
        "config",
        effectiveRelayConfigPreview(normalizedDraft, form, normalizedDraft),
        true,
      );
      await actions.saveRelayFile("auth", normalizedDraft.authContents, true);
    }
    onSaved?.();
  };
  const switchDraft = () => {
    if (isNew || !form.relayProfilesEnabled) return;
    const normalizedDraft = isAggregateRelayProfile(draft) ? normalizeAggregateRelayProfile(draft, form) : deriveRelayProfileFromFiles(draft);
    const previousActiveRelayId = form.activeRelayId;
    const next = syncLegacyRelayFields({
      ...form,
      relayProfiles: form.relayProfiles.map((item) => (item.id === profile.id ? normalizedDraft : item)),
      activeRelayId: profile.id,
    });
    void actions.switchRelayProfile(next, previousActiveRelayId);
  };
  return (
    <div className="relay-detail-page" key={profile.id}>
      <div className="relay-detail-sticky">
        <Toolbar>
          <Button onClick={onBack} variant="secondary">
            <ArrowLeft className="h-4 w-4" />
            Back to List
          </Button>
          <Button disabled={!!validationError} onClick={() => void saveDraft()} title={validationError || "Save"}>
            <Save className="h-4 w-4" />
            Save
          </Button>
        </Toolbar>
      </div>
        <RelayProfileEditor profile={draft} form={form} isNew={isNew} onProfileChange={setDraft} onSwitch={switchDraft} actions={actions} />
      {isAggregateRelayProfile(draft) ? null : (
      <RelayFileEditors
        contextProfile={profile}
        profile={draft}
        form={form}
        isActive={isActive}
        profileId={profile.id}
        onFormChange={onFormChange}
        onProfileChange={setDraft}
        actions={actions}
      />
      )}
    </div>
  );
}
