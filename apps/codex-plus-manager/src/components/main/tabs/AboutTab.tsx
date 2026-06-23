import { ExternalLink, MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import {
  Panel,
  CardHead,
  Toolbar,
  Metric,
  LogsPanel,
  DiagnosticsPanel,
} from "@/components/main/ui/SharedComponents";
import type {
  OverviewResult,
  UpdateResult,
  LogsResult,
  DiagnosticsResult,
  Actions,
} from "@/types";

export function AboutTab({
  overview,
  update,
  logs,
  diagnostics,
  actions,
}: {
  overview: OverviewResult | null;
  update: UpdateResult | null;
  logs: LogsResult | null;
  diagnostics: DiagnosticsResult | null;
  actions: Actions;
}) {
  return (
    <>
      <Panel>
        <CardHead title="About Codex++" detail="Local Codex enhancement, management tools, and installer maintenance" />
        <CardContent>
          <div className="metric-list">
            <Metric label="Codex++ Version" value={overview?.current_version ?? update?.currentVersion ?? "-"} />
            <Metric label="Codex Version" value={overview?.codex_version ?? "Not detected"} />
            <Metric label="Project URL" value="github.com/BigPizzaV3/CodexPlusPlus" />
          </div>
          <Toolbar>
            <Button onClick={() => void actions.openExternalUrl("https://github.com/BigPizzaV3/CodexPlusPlus")} variant="secondary">
              <ExternalLink className="h-4 w-4" />
              Open Project Homepage
            </Button>
            <Button onClick={() => void actions.openExternalUrl("https://github.com/BigPizzaV3/CodexPlusPlus/issues")} variant="secondary">
              <ExternalLink className="h-4 w-4" />
              Report Issues
            </Button>
            <Button onClick={() => void actions.openExternalUrl("https://discord.gg/y96kX7A76v")} variant="secondary">
              <MessageCircle className="h-4 w-4" />
              Discord
            </Button>
            <Button onClick={() => void actions.openExternalUrl("https://t.me/CodexPlusPlus")} variant="secondary">
              <MessageCircle className="h-4 w-4" />
              Telegram
            </Button>
          </Toolbar>
        </CardContent>
      </Panel>
      <Panel>
        <CardHead title="GitHub Release Update" detail={`Current version: ${overview?.current_version ?? update?.currentVersion ?? "-"}`} />
        <CardContent>
          <div className="metric-list">
            <Metric label="Status" value={update?.status ?? "not_checked"} />
            <Metric label="Latest Version" value={update?.latestVersion ?? "Not checked"} />
            <Metric label="Asset" value={update?.assetName ?? "-"} />
            <Metric label="Progress" value={`${update?.progress ?? 0}%`} />
          </div>
          <Textarea className="log-view" readOnly value={update?.releaseSummary || update?.message || "GitHub Release not checked yet; update will download and run the installer."} />
          <Toolbar>
            <Button onClick={() => void actions.checkUpdate()}>Check for Updates</Button>
            <Button variant="secondary" onClick={() => void actions.performUpdate()}>Download and Run Installer</Button>
          </Toolbar>
        </CardContent>
      </Panel>
      <LogsPanel logs={logs} actions={actions} />
      <DiagnosticsPanel diagnostics={diagnostics} actions={actions} />
    </>
  );
}
