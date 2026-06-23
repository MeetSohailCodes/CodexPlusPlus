import { Bell, CheckCircle2, ExternalLink, Network, RefreshCw, Rocket, Wrench } from "lucide-react";
import {
  Badge,
  Button,
  CardContent,
  healthItems,
  LatestLaunch,
  Panel,
  CardHead,
  TaskProgressBox,
  Toolbar,
} from "@/components/main/ui/SharedComponents";
import {
  type Actions,
  type AdItem,
  type BackendSettings,
  type OverviewResult,
  type TaskProgress,
} from "@/types";

export interface OverviewTabProps {
  overview: OverviewResult | null;
  pluginMarketplaceProgress: TaskProgress;
  ads: AdItem[];
  actions: Actions;
  launchForm: BackendSettings;
}

export function OverviewTab({
  overview,
  pluginMarketplaceProgress,
  ads: _ads,
  actions,
  launchForm: _launchForm,
}: OverviewTabProps) {
  const health = healthItems(overview);
  return (
    <>
      <Panel className="jojocode-overview">
        <CardContent>
          <div className="jojocode-overview-layout">
            <div className="jojocode-overview-main">
              <div className="jojocode-overview-mark">
                <Network className="h-5 w-5" />
              </div>
              <div>
                <span className="eyebrow">Official Relay</span>
                <h2>JOJO Code</h2>
                <p>
                  Codex++ Official Relay, focused on stable connectivity and competitive pricing.
                  Supports GPT-5.5, GPT-5.4, Claude Opus 4.8, Claude Opus 4.7, gpt-image-2 models
                  and image capabilities.
                </p>
              </div>
            </div>
            <div className="jojocode-overview-side">
              <div className="jojocode-model-tags">
                <span>GPT-5.5</span>
                <span>GPT-5.4</span>
                <span>Opus 4.8</span>
                <span>Opus 4.7</span>
                <span>gpt-image-2</span>
              </div>
              <Button onClick={() => void actions.openExternalUrl("https://jojocode.com/")}>
                <ExternalLink className="h-4 w-4" />
                Open JOJO Code
              </Button>
            </div>
          </div>
        </CardContent>
      </Panel>
      <Panel>
        <CardHead
          title="Health Check"
          detail="Overview shows only critical issues; detailed configuration is on the respective pages"
        />
        <CardContent>
          <div className="health-grid">
            <div className={`health-item ${overview?.codex_version ? "ok" : "needs-fix"}`}>
              {overview?.codex_version ? (
                <CheckCircle2 className="h-4 w-4" />
              ) : (
                <Bell className="h-4 w-4" />
              )}
              <div>
                <strong>Codex Version</strong>
                <span>{overview?.codex_version ?? "Codex app version not detected."}</span>
              </div>
              <Badge status={overview?.codex_version ? "ok" : "not_checked"} />
            </div>
            {health.map((item) => (
              <div className={`health-item ${item.ok ? "ok" : "needs-fix"}`} key={item.title}>
                {item.ok ? <CheckCircle2 className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
                <div>
                  <strong>{item.title}</strong>
                  <span>{item.detail}</span>
                </div>
                <Badge status={item.status} />
              </div>
            ))}
          </div>
          <Toolbar>
            <Button onClick={() => void actions.checkHealth()}>
              <RefreshCw className="h-4 w-4" />
              Check
            </Button>
            <Button variant="secondary" onClick={() => void actions.repairShortcuts()}>
              <Wrench className="h-4 w-4" />
              Repair Entrypoints
            </Button>
            <Button variant="secondary" onClick={() => void actions.repairBackend()}>
              Repair Backend
            </Button>
            <Button
              disabled={pluginMarketplaceProgress.active}
              variant="secondary"
              onClick={() => void actions.repairPluginMarketplace()}
            >
              {pluginMarketplaceProgress.active ? "Repairing..." : "Repair Plugin Market"}
            </Button>
          </Toolbar>
          <TaskProgressBox progress={pluginMarketplaceProgress} title="Plugin Market Repair Progress" />
        </CardContent>
      </Panel>
      <Panel>
        <CardHead title="Latest Launch" detail={overview?.logs_path ?? "No status file available"} />
        <CardContent>
          <LatestLaunch status={overview?.latest_launch ?? null} />
          <Toolbar>
            <Button onClick={() => void actions.launch()}>
              <Rocket className="h-4 w-4" />
              Launch Codex++
            </Button>
            <Button variant="secondary" onClick={() => void actions.goLogs()}>
              Open About
            </Button>
          </Toolbar>
        </CardContent>
      </Panel>
    </>
  );
}
