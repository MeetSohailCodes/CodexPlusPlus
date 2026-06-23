import { Info, RefreshCw, Trash2 } from "lucide-react";
import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/main/ui/SharedComponents";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  type Actions,
  type BackendSettings,
  type LocalSessionsResult,
  type ProviderSyncProgress,
  type ProviderSyncTargetsResult,
  type ProviderSyncTargetOption,
  type SettingsResult,
} from "@/types";

function formatTime(value: number) {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-US");
}

function providerSyncTargetLabel(target: ProviderSyncTargetOption): string {
  const labels = target.sources
    .map((source) => providerSyncSourceLabels[source])
    .filter(Boolean);
  const current = target.isCurrentProvider ? ["Current"] : [];
  return [...labels, ...current].join(" / ") || "Detected";
}

const providerSyncSourceLabels: Record<string, string> = {
  config: "Config",
  rollout: "Rollout",
  sqlite: "SQLite",
  manual: "Manual",
};

function Panel({
  children,
  fill = false,
  className = "",
}: {
  children: React.ReactNode;
  fill?: boolean;
  className?: string;
}) {
  return (
    <div className={`panel ${fill ? "fill" : ""} ${className}`}>{children}</div>
  );
}

function CardHead({ title, detail }: { title: string; detail: string }) {
  return (
    <div className="panel-head">
      <CardTitle>{title}</CardTitle>
      <CardDescription>{detail}</CardDescription>
    </div>
  );
}

function Toolbar({ children }: { children: React.ReactNode }) {
  return <div className="toolbar">{children}</div>;
}

function Field({
  label,
  children,
  className = "",
}: {
  label: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Label className={`field ${className}`}>
      <span>{label}</span>
      {children}
    </Label>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="metric">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function SessionsTab({
  settings,
  form,
  sessions,
  providerSyncProgress,
  providerSyncTargets,
  selectedProviderSyncTarget,
  onFormChange,
  actions,
}: {
  settings: SettingsResult | null;
  form: BackendSettings;
  sessions: LocalSessionsResult | null;
  providerSyncProgress: ProviderSyncProgress;
  providerSyncTargets: ProviderSyncTargetsResult | null;
  selectedProviderSyncTarget: string;
  onFormChange: (value: BackendSettings) => void;
  actions: Actions;
}) {
  const items = sessions?.sessions ?? [];
  const activeCount = items.filter((item) => !item.archived).length;
  const archivedCount = items.length - activeCount;
  return (
    <>
      <Panel>
        <CardHead
          title="Session Management"
          detail="Reads Codex local SQLite session database; deletion removes database records and corresponding rollout files"
        />
        <CardContent>
          <div className="metric-list">
            <Metric label="Total Sessions" value={`${items.length}`} />
            <Metric label="Active" value={`${activeCount}`} />
            <Metric label="Archived" value={`${archivedCount}`} />
            <Metric
              label="Database"
              value={sessions?.dbPath ?? "~/.codex/sqlite/*.db"}
            />
          </div>
          <div className="form-row">
            <Field label="Sync Target">
              <select
                className="select-input"
                disabled={
                  providerSyncProgress.active ||
                  !(providerSyncTargets?.targets ?? []).length
                }
                value={selectedProviderSyncTarget}
                onChange={(event) =>
                  actions.setProviderSyncTarget(event.currentTarget.value)
                }
              >
                {(providerSyncTargets?.targets ?? []).map((target) => (
                  <option key={target.id} value={target.id}>
                    {target.id} ({providerSyncTargetLabel(target)})
                  </option>
                ))}
                {!(providerSyncTargets?.targets ?? []).length ? (
                  <option value="">Current configured provider</option>
                ) : null}
              </select>
            </Field>
          </div>
          <Toolbar>
            <Button onClick={() => void actions.refreshLocalSessions()}>
              <RefreshCw className="h-4 w-4" />
              Refresh Sessions
            </Button>
            <Button
              disabled={providerSyncProgress.active}
              onClick={() => void actions.syncProvidersNow()}
              variant="outline"
            >
              <RefreshCw className="h-4 w-4" />
              {providerSyncProgress.active
                ? "Repairing..."
                : "Repair Historical Sessions Now"}
            </Button>
          </Toolbar>
          <div
            className="provider-sync-progress"
            data-active={providerSyncProgress.active}
          >
            <div className="provider-sync-progress-head">
              <strong>
                {providerSyncProgress.active
                  ? "Repairing historical sessions"
                  : "Historical Session Repair Progress"}
              </strong>
              <span>{providerSyncProgress.percent}%</span>
            </div>
            <div
              aria-valuemax={100}
              aria-valuemin={0}
              aria-valuenow={providerSyncProgress.percent}
              className="provider-sync-progress-bar"
              role="progressbar"
            >
              <div
                className="provider-sync-progress-fill"
                style={{ width: `${providerSyncProgress.percent}%` }}
              />
            </div>
            <small>{providerSyncProgress.message}</small>
          </div>
          <div className="hint-line">
            <Info className="h-4 w-4" />
            <span>
              Deletion creates a local backup; if the Codex App is currently
              using the session, close the session window before proceeding.
            </span>
          </div>
          <label className="switch-row">
            <input
              checked={form.providerSyncEnabled}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  providerSyncEnabled: event.currentTarget.checked,
                })
              }
              type="checkbox"
            />
            <span>
              <strong>
                Auto-repair Historical Sessions Before Launch
              </strong>
              <small>
                When enabled, automatically organizes old conversation
                attribution markers before launching Codex via Codex++.
              </small>
            </span>
          </label>
          <Toolbar>
            <Button onClick={() => void actions.saveSettings()}>
              Save Auto-repair Settings
            </Button>
          </Toolbar>
        </CardContent>
      </Panel>
      <Panel>
        <CardHead
          title="Local Sessions"
          detail={
            items.length
              ? "Sorted by last updated"
              : "Click Refresh Sessions to read local database"
          }
        />
        <CardContent>
          {items.length ? (
            <div className="session-list">
              {items.map((session) => (
                <div className="session-row" key={session.id}>
                  <div className="session-main">
                    <strong>{session.title || "Unnamed session"}</strong>
                    <span>{session.id}</span>
                    <small>
                      {session.cwd || "No project path recorded"}
                    </small>
                  </div>
                  <div className="session-meta">
                    <Badge status={session.archived ? "archived" : "ok"} />
                    <span>
                      {session.modelProvider || "provider not recorded"}
                    </span>
                    <span>{formatTime(session.updatedAtMs ?? 0)}</span>
                  </div>
                  <Button
                    variant="outline"
                    onClick={() => void actions.deleteLocalSession(session)}
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty">
              No local sessions found, or the current SQLite session database
              does not exist.
            </div>
          )}
        </CardContent>
      </Panel>
    </>
  );
}
