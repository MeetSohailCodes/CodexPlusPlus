import { ShieldCheck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Field, Metric } from "@/components/main/ui/SharedComponents";
import {
  aggregateMemberCandidates,
  normalizeAggregateConfig,
  clampAggregateWeight,
  aggregateStrategyOptions,
  aggregateStrategyLabel,
  aggregateStrategyHelp,
  isAggregateRelayProfile,
  relayModeLabel,
  relayProtocolLabel,
  relayProfileConfigBrief,
} from "@/lib/relayHelpers";
import type { BackendSettings, RelayProfile, RelayAggregateConfig, RelayAggregateStrategy } from "@/types";

export function AggregateRelayProfileEditor({
  profile,
  form,
  isNew = false,
  onProfileChange,
}: {
  profile: RelayProfile;
  form: BackendSettings;
  isNew?: boolean;
  onProfileChange: (value: RelayProfile) => void;
}) {
  const candidates = aggregateMemberCandidates(form, profile.id);
  const aggregate = normalizeAggregateConfig(profile.aggregate, candidates);
  const memberIds = new Set(aggregate.members.map((member) => member.profileId));
  const updateAggregate = (nextAggregate: RelayAggregateConfig) => {
    onProfileChange(normalizeAggregateRelayProfile({ ...profile, aggregate: nextAggregate }, form));
  };
  const toggleMember = (profileId: string, checked: boolean) => {
    const members = checked
      ? [...aggregate.members, { profileId, weight: 1 }]
      : aggregate.members.filter((member) => member.profileId !== profileId);
    updateAggregate({ ...aggregate, members });
  };
  const updateWeight = (profileId: string, weight: number) => {
    updateAggregate({
      ...aggregate,
      members: aggregate.members.map((member) =>
        member.profileId === profileId ? { ...member, weight: clampAggregateWeight(weight) } : member,
      ),
    });
  };
  const totalWeight = aggregate.members.reduce((total, member) => total + clampAggregateWeight(member.weight), 0);

  return (
    <div className="relay-profile-editor aggregate-editor">
      <div className="relay-editor-head">
        <div>
          <strong>{profile.name || "Unnamed aggregate provider"}</strong>
          <span>{isNew ? "Select existing providers as members; saved to settings payload" : "Aggregate config references existing providers only; does not copy keys or config files"}</span>
        </div>
        <UiBadge variant="secondary">Aggregate</UiBadge>
      </div>
      <div className="relay-fields aggregate-fields">
        <Field className="relay-field-name" label="Name">
          <Input
            value={profile.name}
            onChange={(event) => onProfileChange({ ...profile, name: event.currentTarget.value })}
            placeholder="e.g. Main Aggregate Pool"
          />
        </Field>
        <Field className="relay-field-test-model" label="Test Model">
          <Input
            value={profile.testModel}
            onChange={(event) => onProfileChange({ ...profile, testModel: event.currentTarget.value })}
            placeholder={`Leave empty to use default: ${form.relayTestModel || "gpt-5.4-mini"}`}
          />
        </Field>
        <Field className="aggregate-strategy-field" label="AggregateStrategy">
          <select
            className="field-select"
            value={aggregate.strategy}
            onChange={(event) => updateAggregate({ ...aggregate, strategy: event.currentTarget.value as RelayAggregateStrategy })}
          >
            {aggregateStrategyOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>
      </div>
      <div className="aggregate-strategy-grid">
        {aggregateStrategyOptions.map((option) => (
          <button
            className={`mode-option aggregate-strategy-option ${aggregate.strategy === option.value ? "active" : ""}`}
            key={option.value}
            onClick={() => updateAggregate({ ...aggregate, strategy: option.value })}
            type="button"
          >
            <strong>{option.label}</strong>
            <span>{option.description}</span>
          </button>
        ))}
      </div>
      <div className="aggregate-members">
        <div className="aggregate-members-head">
          <div>
            <strong>Member Providers</strong>
            <span>Only API providers with Base URL / Key filled in can be selected; aggregate providers cannot be members.</span>
          </div>
          <UiBadge variant="outline">{aggregate.members.length} / {candidates.length}</UiBadge>
        </div>
        {candidates.length ? (
          <div className="aggregate-member-list">
            {candidates.map((candidate) => {
              const member = aggregate.members.find((item) => item.profileId === candidate.id);
              const checked = memberIds.has(candidate.id);
              return (
                <label className={`aggregate-member-row ${checked ? "selected" : ""}`} key={candidate.id}>
                  <input
                    checked={checked}
                    onChange={(event) => toggleMember(candidate.id, event.currentTarget.checked)}
                    type="checkbox"
                  />
                  <span className="aggregate-member-summary">
                    <strong>{candidate.name || "Unnamed provider"}</strong>
                    <small>{relayModeLabel(candidate.relayMode)} · {relayProtocolLabel(candidate.protocol)} · {relayProfileConfigBrief(candidate)}</small>
                  </span>
                  <span className="aggregate-weight-box">
                    <span>Weight</span>
                    <Input
                      disabled={!checked}
                      min={1}
                      onChange={(event) => updateWeight(candidate.id, Number.parseInt(event.currentTarget.value, 10))}
                      type="number"
                      value={String(member?.weight ?? 1)}
                    />
                  </span>
                </label>
              );
            })}
          </div>
        ) : (
          <div className="empty">Add at least 1 API provider with Base URL / Key filled in before creating an aggregate provider.</div>
        )}
      </div>
      <div className="relay-grid compact aggregate-preview">
        <Metric label="Strategy" value={aggregateStrategyLabel(aggregate.strategy)} />
        <Metric label="Member Count" value={`${aggregate.members.length}`} />
        <Metric label="Total Weight" value={`${totalWeight}`} />
        <Metric label="Serialized Fields" value="aggregate.strategy / aggregate.members" />
      </div>
      <div className="hint-line relay-protocol-hint">
        <ShieldCheck className="h-4 w-4" />
        <span>{aggregateStrategyHelp(aggregate.strategy)}</span>
      </div>
    </div>
  );
}

function normalizeAggregateRelayProfile(profile: RelayProfile, form: BackendSettings): RelayProfile {
  const candidates = aggregateMemberCandidates(form, profile.id);
  const aggregate = normalizeAggregateConfig(profile.aggregate, candidates);
  return {
    ...profile,
    baseUrl: "",
    upstreamBaseUrl: "",
    apiKey: "",
    protocol: "responses",
    relayMode: "aggregate",
    officialMixApiKey: false,
    configContents: "",
    authContents: "",
    aggregate,
  };
}
