import { Copy, ExternalLink, RefreshCw, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  type Actions,
  type BackendSettings,
  type ZedOpenStrategy,
  type ZedRemoteProject,
  type ZedRemoteProjectsResult,
} from "@/types";

function formatTime(value: number) {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-US");
}

function zedStrategyLabel(strategy: ZedOpenStrategy) {
  if (strategy === "reuseWindow") return "Reuse Window";
  if (strategy === "newWindow") return "New Window";
  if (strategy === "default") return "Zed Default";
  return "Add to Current Workspace";
}

function zedRemoteHostLabel(project: ZedRemoteProject) {
  const user = project.ssh.user ? `${project.ssh.user}@` : "";
  const port = project.ssh.port ? `:${project.ssh.port}` : "";
  return `${user}${project.ssh.host}${port}`;
}

function zedRemoteSourceLabel(source: string) {
  if (source === "currentThread") return "Current session";
  if (source === "codexRemoteProject") return "Codex remote project";
  if (source === "threadWorkspaceHint") return "Thread workspace hint";
  if (source === "sqliteThreadCwd") return "SQLite cwd";
  if (source === "recent") return "Recently opened";
  return source || "Unknown source";
}

function stringifyError(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

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

function ZedRemoteProjectSection({
  title,
  projects,
  actions,
  onCopyUrl,
}: {
  title: string;
  projects: ZedRemoteProject[];
  actions: Actions;
  onCopyUrl: (project: ZedRemoteProject) => Promise<void>;
}) {
  return (
    <Panel>
      <CardHead title={title} detail={`${projects.length}  projects`} />
      <CardContent>
        {projects.length ? (
          <div className="zed-remote-project-list">
            {projects.map((project) => (
              <div className="zed-remote-project-row" key={project.id}>
                <div className="zed-remote-project-main">
                  <div>
                    <strong>{project.label}</strong>
                    <span>{zedRemoteHostLabel(project)}</span>
                  </div>
                  <code>{project.path}</code>
                  <small>
                    {zedRemoteSourceLabel(project.source)}
                    {project.lastOpenedAtMs
                      ? ` · ${formatTime(project.lastOpenedAtMs)}`
                      : ""}
                  </small>
                </div>
                <div className="zed-remote-project-actions">
                  <Button
                    onClick={() =>
                      void actions.openZedRemoteProject(
                        project,
                        "addToFocusedWorkspace"
                      )
                    }
                    size="sm"
                  >
                    <ExternalLink className="h-4 w-4" />
                    Add to Current Workspace
                  </Button>
                  <Button
                    onClick={() =>
                      void actions.openZedRemoteProject(
                        project,
                        "reuseWindow"
                      )
                    }
                    size="sm"
                    variant="outline"
                  >
                    Reuse Window
                  </Button>
                  <Button
                    onClick={() =>
                      void actions.openZedRemoteProject(project, "newWindow")
                    }
                    size="sm"
                    variant="outline"
                  >
                    New Window
                  </Button>
                  <Button
                    onClick={() => void onCopyUrl(project)}
                    size="icon"
                    title="Copy ssh:// URL"
                    variant="ghost"
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                  {project.source === "recent" ? (
                    <Button
                      onClick={() =>
                        void actions.forgetZedRemoteProject(project)
                      }
                      size="icon"
                      title="Remove from recent records"
                      variant="ghost"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty">No projects available.</div>
        )}
      </CardContent>
    </Panel>
  );
}

export function ZedRemoteTab({
  zedRemoteProjects,
  form,
  onFormChange,
  actions,
}: {
  zedRemoteProjects: ZedRemoteProjectsResult | null;
  form: BackendSettings;
  onFormChange: (value: BackendSettings) => void;
  actions: Actions;
}) {
  const allProjects = zedRemoteProjects?.projects ?? [];
  const currentProjects = allProjects.filter((project) => project.isCurrent);
  const currentIds = new Set(currentProjects.map((project) => project.id));
  const recentProjects = allProjects.filter(
    (project) =>
      !currentIds.has(project.id) &&
      (project.source === "recent" || project.lastOpenedAtMs)
  );
  const recentIds = new Set(recentProjects.map((project) => project.id));
  const discoveredProjects = allProjects.filter(
    (project) => !currentIds.has(project.id) && !recentIds.has(project.id)
  );
  const copyUrl = async (project: ZedRemoteProject) => {
    try {
      await navigator.clipboard.writeText(project.url);
      await actions.showMessage(
        "Zed Remote URL",
        "ssh:// URL copied.",
        "ok"
      );
    } catch (error) {
      await actions.showMessage(
        "Copy failed",
        stringifyError(error),
        "failed"
      );
    }
  };
  return (
    <>
      <Panel>
        <CardHead
          title="Zed Remote Projects"
          detail={`${allProjects.length} Codex++ recognized projects, default strategy: ${zedStrategyLabel(form.zedRemoteOpenStrategy)}`}
        />
        <CardContent>
          <div className="metric-list">
            <Metric label="Current" value={String(currentProjects.length)} />
            <Metric label="Recent" value={String(recentProjects.length)} />
            <Metric
              label="Discovered"
              value={String(discoveredProjects.length)}
            />
          </div>
          <div className="zed-remote-settings">
            <Field label="Default Open Strategy">
              <select
                className="select-input"
                onChange={(event) =>
                  onFormChange({
                    ...form,
                    zedRemoteOpenStrategy: event.currentTarget
                      .value as ZedOpenStrategy,
                  })
                }
                value={form.zedRemoteOpenStrategy}
              >
                <option value="addToFocusedWorkspace">
                  Add to Current Workspace
                </option>
                <option value="reuseWindow">Reuse Window</option>
                <option value="newWindow">New Window</option>
                <option value="default">Zed Default</option>
              </select>
            </Field>
            <label className="switch-row compact">
              <input
                checked={form.zedRemoteProjectRegistryEnabled}
                onChange={(event) =>
                  onFormChange({
                    ...form,
                    zedRemoteProjectRegistryEnabled:
                      event.currentTarget.checked,
                  })
                }
                type="checkbox"
              />
              <span>
                <strong>Record Recent Opens</strong>
                <small>
                  Saved to Codex++ state, does not modify Zed settings.
                </small>
              </span>
            </label>
          </div>
          <Toolbar>
            <Button onClick={() => void actions.refreshZedRemoteProjects()}>
              <RefreshCw className="h-4 w-4" />
              Refresh Projects
            </Button>
            <Button
              variant="secondary"
              onClick={() => void actions.saveSettingsValue(form, false)}
            >
              <Save className="h-4 w-4" />
              Save Strategy
            </Button>
          </Toolbar>
        </CardContent>
      </Panel>
      <ZedRemoteProjectSection
        title="Current"
        projects={currentProjects}
        actions={actions}
        onCopyUrl={copyUrl}
      />
      <ZedRemoteProjectSection
        title="Recent"
        projects={recentProjects}
        actions={actions}
        onCopyUrl={copyUrl}
      />
      <ZedRemoteProjectSection
        title="Discovered from Codex"
        projects={discoveredProjects}
        actions={actions}
        onCopyUrl={copyUrl}
      />
    </>
  );
}
