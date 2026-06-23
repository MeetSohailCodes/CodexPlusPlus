import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge as UiBadge } from "@/components/ui/badge";
import {
  Bell,
  CheckCircle2,
  Download,
  ExternalLink,
  Power,
  PowerOff,
  RefreshCw,
  ShieldAlert,
  Trash2,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";
import type {
  Actions,
  BackendSettings,
  EnvConflictsResult,
  LaunchMode,
  LaunchStatus,
  LogsResult,
  OverviewResult,
  PluginMarketplaceStatusResult,
  ScriptMarketItem,
  Status,
  TaskProgress,
  UserScriptInventory,
} from "@/types";

function statusLabel(status: string) {
  const labels: Record<string, string> = {
    found: "Found",
    missing: "Missing",
    installed: "Installed",
    ok: "OK",
    running: "Running",
    failed: "Failed",
    archived: "Archived",
    accepted: "Accepted",
    not_checked: "Not checked",
    not_implemented: "Not implemented",
    disabled: "Disabled",
    unknown: "Unknown",
  };
  return labels[status] ?? status;
}

function statusClass(status: string) {
  if (["found", "installed", "ok", "running"].includes(status)) return "good";
  if (["failed", "missing"].includes(status)) return "bad";
  return "warn";
}

export function isSuccessStatus(status?: Status) {
  return status === "ok" || status === "accepted";
}

export function Badge({ status }: { status: string }) {
  return (
    <UiBadge className={statusClass(status)} variant="secondary">
      {statusLabel(status)}
    </UiBadge>
  );
}

export function Panel({ children, fill = false, className = "" }: { children: React.ReactNode; fill?: boolean; className?: string }) {
  return (
    <Card className={`panel ${fill ? "fill" : ""} ${className}`}>{children}</Card>
  );
}

export function CardHead({ title, detail }: { title: string; detail: string }) {
  return (
    <CardHeader className="panel-head">
      <CardTitle>{title}</CardTitle>
      <CardDescription>{detail}</CardDescription>
    </CardHeader>
  );
}

export function Toolbar({ children }: { children: React.ReactNode }) {
  return <div className="toolbar">{children}</div>;
}

export function Field({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <Label className={`field ${className}`}>
      <span>{label}</span>
      {children}
    </Label>
  );
}

export function StatusRow({ title, status = "unknown", path }: { title: string; status?: string; path?: string | null }) {
  return (
    <div className="status-row">
      <span>{title}</span>
      <Badge status={status} />
      <code>{path || "No path recorded"}</code>
    </div>
  );
}

export function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function LatestLaunch({ status }: { status: LaunchStatus | null }) {
  if (!status) return <div className="empty">No launch status available.</div>;
  return (
    <div className="metric-list">
      <Metric label="Status" value={status.status} />
      <Metric label="Message" value={status.message} />
      <Metric label="Debug" value={String(status.debug_port ?? "-")} />
      <Metric label="Helper" value={String(status.helper_port ?? "-")} />
      <Metric label="Time" value={formatTime(status.started_at_ms)} />
    </div>
  );
}

export function healthItems(overview: OverviewResult | null) {
  return [
    {
      title: "Codex App",
      status: overview?.codex_app.status ?? "not_checked",
      ok: overview?.codex_app.status === "found",
      detail: overview?.codex_app.path || "Codex app path not yet checked.",
    },
    {
      title: "Silent Launch Entry",
      status: overview?.silent_shortcut.status ?? "not_checked",
      ok: overview?.silent_shortcut.status === "installed",
      detail: overview?.silent_shortcut.path || "Silent launch shortcut missing; can be repaired on the Installation & Maintenance page.",
    },
    {
      title: "Management Tool Entry",
      status: overview?.management_shortcut.status ?? "not_checked",
      ok: overview?.management_shortcut.status === "installed",
      detail: overview?.management_shortcut.path || "Management tool shortcut missing; can be repaired on the Installation & Maintenance page.",
    },
  ];
}

export function FeatureItem({ title, detail, enabled }: { title: string; detail: string; enabled: boolean }) {
  return (
    <div className="feature-item">
      <div>
        <strong>{title}</strong>
        <span>{detail}</span>
      </div>
      <Badge status={enabled ? "ok" : "Disabled"} />
    </div>
  );
}

export function FeatureToggle({
  title,
  detail,
  checked,
  disabled = false,
  onChange,
}: {
  title: string;
  detail: string;
  checked: boolean;
  disabled?: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className={`feature-toggle ${disabled ? "Disabled" : ""}`}>
      <input
        checked={checked}
        disabled={disabled}
        onChange={(event) => onChange(event.currentTarget.checked)}
        type="checkbox"
      />
      <span>
        <strong>{title}</strong>
        <small>{detail}</small>
      </span>
      <Badge status={!disabled && checked ? "ok" : "Disabled"} />
    </label>
  );
}

export function TaskProgressBox({ progress, title }: { progress: TaskProgress; title: string }) {
  if (!progress.active && progress.percent <= 0) return null;
  return (
    <div className="provider-sync-progress task-progress" data-active={progress.active}>
      <div className="provider-sync-progress-head">
        <strong>{progress.active ? title : "Last repair result"}</strong>
        <span>{progress.percent}%</span>
      </div>
      <div
        aria-valuemax={100}
        aria-valuemin={0}
        aria-valuenow={progress.percent}
        className="provider-sync-progress-bar"
        role="progressbar"
      >
        <div className="provider-sync-progress-fill" style={{ width: `${progress.percent}%` }} />
      </div>
      <small>{progress.message}</small>
    </div>
  );
}

export function GuideList({ items }: { items: string[] }) {
  return (
    <div className="guide-list">
      {items.map((item, index) => (
        <div className="guide-step" key={item}>
          <span>{index + 1}</span>
          <p>{item}</p>
        </div>
      ))}
    </div>
  );
}

export function NoticeDialog({
  notice,
  onClose,
}: {
  notice: { title: string; message: string; status?: Status };
  onClose: () => void;
}) {
  useEffect(() => {
    const timer = window.setTimeout(onClose, 4200);
    return () => window.clearTimeout(timer);
  }, []);

  return (
    <div className="toast-wrap" role="status" aria-live="polite">
      <div className={`toast-card ${notice.status === "failed" ? "failed" : ""}`}>
        <div className="toast-progress" />
        <div className="toast-icon">
          {notice.status === "failed" ? <Bell className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
        </div>
        <div className="toast-body">
          <h2>{notice.title}</h2>
          <p>{notice.message}</p>
        </div>
        <button className="toast-close" onClick={onClose} type="button">×</button>
      </div>
    </div>
  );
}

export function PluginMarketplacePromptDialog({
  status,
  progress,
  onRepair,
  onClose,
}: {
  status: PluginMarketplaceStatusResult;
  progress: TaskProgress;
  onRepair: () => void;
  onClose: () => void;
}) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card plugin-marketplace-modal">
        <div className="modal-head">
          <div>
            <h2>Plugin Market Needs Repair</h2>
            <p>No complete plugin market found in current CODEX_HOME; plugins may be unavailable after installation in API Key mode.</p>
          </div>
          <button className="toast-close" onClick={onClose} type="button">×</button>
        </div>
        <div className="metric-list">
          <Metric label="CODEX_HOME" value={status.codexHome} />
          <Metric label="Local Plugin Market" value={status.marketplaceRoot ?? "Not found"} />
          <Metric label="Config Status" value={status.configRegistered ? "Registered" : "Not registered"} />
        </div>
        <TaskProgressBox progress={progress} title="Repair Progress" />
        <Toolbar>
          <Button disabled={progress.active} onClick={onRepair}>
            <Download className="h-4 w-4" />
            {progress.active ? "Repairing..." : "One-Click Repair"}
          </Button>
          <Button disabled={progress.active} onClick={onClose} variant="secondary">Later</Button>
        </Toolbar>
      </div>
    </div>
  );
}

export function ScriptRow({ script, actions }: { script: NonNullable<UserScriptInventory["scripts"]>[number]; actions: Actions }) {
  const source = script.market_id ? `Market · ${script.version || "Unknown version"}` : script.source === "builtin" ? "Built-in" : "User";
  const canDelete = script.source === "user";
  return (
    <div className="table-row">
      <span>{script.name}</span>
      <span>{source}</span>
      <span>{script.enabled ? "Enable" : "Disabled"}</span>
      <span>{script.status}</span>
      <div className="script-row-actions">
        <Button onClick={() => void actions.setUserScriptEnabled(script.key, !script.enabled)} size="sm" variant="secondary">
          {script.enabled ? <PowerOff className="h-4 w-4" /> : <Power className="h-4 w-4" />}
          {script.enabled ? "Disable" : "Enable"}
        </Button>
        {canDelete ? (
          <Button onClick={() => void actions.deleteUserScript(script.key)} size="sm" variant="outline">
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function MarketScriptCard({ script, actions }: { script: ScriptMarketItem; actions: Actions }) {
  const status = script.updateAvailable ? "Update available" : script.installed ? `Installed ${script.installedVersion}` : "Not installed";
  return (
    <div className="script-market-card">
      <div className="script-market-title">
        <div>
          <strong>{script.name}</strong>
          <span>{script.author || "Unknown author"}</span>
        </div>
        <UiBadge variant={script.updateAvailable ? "default" : script.installed ? "secondary" : "outline"}>{status}</UiBadge>
      </div>
      <p className="script-market-description">{script.description || "No description available."}</p>
      <div className="script-market-tags">
        <span className="script-market-tag">v{script.version}</span>
        {script.tags.map((tag: string) => (
          <span className="script-market-tag" key={tag}>{tag}</span>
        ))}
      </div>
      <div className="script-market-actions">
        <Button onClick={() => void actions.installMarketScript(script.id)} size="sm">
          <Download className="h-4 w-4" />
          {script.updateAvailable ? "Update" : script.installed ? "Reinstall" : "Install"}
        </Button>
        {script.homepage ? (
          <Button onClick={() => void actions.openExternalUrl(script.homepage)} size="sm" variant="secondary">
            <ExternalLink className="h-4 w-4" />
            Homepage
          </Button>
        ) : null}
      </div>
    </div>
  );
}

export function AdGrid({ ads, empty, actions }: { ads: Array<{ id?: string; type: string; title: string; description: string; url: string; highlights?: string[] }>; empty: string; actions: Actions }) {
  if (!ads.length) return <div className="empty">{empty}</div>;
  return (
    <div className="ad-grid">
      {ads.map((ad) => (
        <button className="ad-card" key={ad.id || `${ad.type}-${ad.title}`} onClick={() => void actions.openExternalUrl(ad.url)} type="button">
          <div>
            <strong>{ad.title}</strong>
            <p>{ad.description}</p>
          </div>
          {ad.highlights?.length ? (
            <div className="ad-tags">
              {ad.highlights.map((item) => (
                <span key={item}>{item}</span>
              ))}
            </div>
          ) : null}
          <span className="ad-link">
            Open
            <ExternalLink className="h-4 w-4" />
          </span>
        </button>
      ))}
    </div>
  );
}

export function ModeSelector({ launchMode, actions }: { launchMode: LaunchMode; actions: Actions }) {
  return (
    <div className="mode-grid">
      <button
        className={`mode-option ${launchMode === "relay" ? "active" : ""}`}
        onClick={() => void actions.setLaunchMode("relay")}
        type="button"
      >
        <strong>Compatible Enhancement</strong>
        <span>Suitable for Official Login or official mixed API Key; retains session deletion, export, project move, Timeline, and user scripts; disables plugin entry enhancements.</span>
      </button>
      <button
        className={`mode-option ${launchMode === "patch" ? "active" : ""}`}
        onClick={() => void actions.setLaunchMode("patch")}
        type="button"
      >
        <strong>Full Enhancement</strong>
        <span>Suitable for Pure API; enables plugin entry, forced install, session deletion/export, project move, and all other page features.</span>
      </button>
    </div>
  );
}

export function LogsPanel({ logs, actions }: { logs: LogsResult | null; actions: Actions }) {
  const lines = splitLogLines(logs?.text ?? "");
  return (
    <Panel>
      <CardHead title="Recent Logs" detail={logs?.path ?? ""} />
      <CardContent>
        <div className="log-lines">
          {lines.length ? (
            lines.map((line, index) => (
              <div className="log-line" key={`${index}-${line.slice(0, 12)}`}>
                <span>{index + 1}</span>
                <code>{line || " "}</code>
              </div>
            ))
          ) : (
            <div className="empty">No logs available.</div>
          )}
        </div>
        <Toolbar>
          <Button onClick={() => void actions.refreshLogs()}>Refresh</Button>
          <Button variant="secondary" onClick={() => void actions.copyLogs()}>
            Copy
          </Button>
        </Toolbar>
      </CardContent>
    </Panel>
  );
}

export function DiagnosticsPanel({ diagnostics, actions }: { diagnostics: { report?: string } | null; actions: Actions }) {
  return (
    <Panel>
      <CardHead title="Diagnostics Report" detail="Contains version, path, settings, and platform information" />
      <CardContent>
        <Textarea className="log-view tall" readOnly value={diagnostics?.report ?? "Diagnostics report not yet generated."} />
        <Toolbar>
          <Button onClick={() => void actions.refreshDiagnostics()}>Regenerate</Button>
          <Button variant="secondary" onClick={() => void actions.copyDiagnostics()}>
            Copy Report
          </Button>
        </Toolbar>
      </CardContent>
    </Panel>
  );
}

export function SyncedTextarea({
  value,
  onValueChange,
  className,
}: {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}) {
  const [localValue, setLocalValue] = useState(value);
  const isFocusedRef = useRef(false);
  const latestExternalValueRef = useRef(value);

  useEffect(() => {
    latestExternalValueRef.current = value;
    if (!isFocusedRef.current) {
      setLocalValue(value);
    }
  }, [value]);

  return (
    <Textarea
      className={className}
      value={localValue}
      onBlur={() => {
        isFocusedRef.current = false;
        setLocalValue(latestExternalValueRef.current);
      }}
      onChange={(event) => {
        const next = event.currentTarget.value;
        setLocalValue(next);
        onValueChange(next);
      }}
      onFocus={() => {
        isFocusedRef.current = true;
      }}
      spellCheck={false}
    />
  );
}

export function EnvConflictNotice({
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

export function randomToken(byteLength = 24) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

export function mobileRelayHttpUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const withScheme = /^[a-z]+:\/\//i.test(trimmed) ? trimmed : `ws://${trimmed}`;
  try {
    const url = new URL(withScheme);
    url.protocol = url.protocol === "wss:" || url.protocol === "https:" ? "https:" : "http:";
    url.pathname = "";
    url.search = "";
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return "";
  }
}

export function mobileRelayShareUrl(settings: Pick<BackendSettings, "mobileControlRelayUrl" | "mobileControlRoom" | "mobileControlKey">) {
  const base = mobileRelayHttpUrl(settings.mobileControlRelayUrl);
  const room = settings.mobileControlRoom.trim();
  const key = settings.mobileControlKey.trim();
  if (!base || !room || !key) return "";
  const url = new URL(`${base}/mobile`);
  url.searchParams.set("room", room);
  url.searchParams.set("key", key);
  url.searchParams.set("auto", "1");
  return url.toString();
}

export function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`;
}

function splitLogLines(text: string) {
  return text.trimEnd().split(/\r?\n/).filter((line, index, lines) => line.length > 0 || index < lines.length - 1);
}

function formatTime(value: number) {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-US");
}

export { Button, CardContent, CardDescription, CardHeader, CardTitle };
