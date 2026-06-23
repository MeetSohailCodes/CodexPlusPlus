import { Download, ExternalLink, Power, PowerOff, RefreshCw, Trash2 } from "lucide-react";
import { Badge as UiBadge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { SCRIPT_MARKET_REPOSITORY_URL } from "@/constants";
import {
  type Actions,
  type ScriptMarketItem,
  type ScriptMarketResult,
  type SettingsResult,
  type UserScriptInventory,
} from "@/types";
import { CardHead, Panel, Toolbar } from "@/components/main/ui/SharedComponents";

function MarketScriptCard({ script, actions }: { script: ScriptMarketItem; actions: Actions }) {
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
        {script.tags.map((tag) => (
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

function ScriptRow({ script, actions }: { script: NonNullable<UserScriptInventory["scripts"]>[number]; actions: Actions }) {
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

export function UserScriptsTab({ settings, market, actions }: { settings: SettingsResult | null; market: ScriptMarketResult | null; actions: Actions }) {
  const inventory = settings?.user_scripts;
  const scripts = inventory?.scripts ?? [];
  const marketScripts = market?.market.scripts ?? [];
  const installedCount = marketScripts.filter((script) => script.installed).length;
  return (
    <>
      <Panel>
        <CardHead title="Script Market" detail={`${marketScripts.length}  market scripts,  ${installedCount}  scripts, local overall  ${inventory?.enabled === false ? "Disabled" : "enabled"}`} />
        <CardContent>
          <div className="metric-list">
            <Metric label="Market Status" value={market?.market.message ?? "Not yet refreshed"} />
            <Metric label="Remote Scripts" value={ `${marketScripts.length}`} />
            <Metric label="Installed" value={`${installedCount}`} />
            <Metric label="Local Overall" value={inventory?.enabled === false ? "Disabled" : "enabled"} />
          </div>
          <Toolbar>
            <Button onClick={() => void actions.refreshScriptMarket()}>
              <RefreshCw className="h-4 w-4" />
              Refresh Market
            </Button>
            <Button onClick={() => void actions.openExternalUrl(SCRIPT_MARKET_REPOSITORY_URL)} variant="secondary">
              <ExternalLink className="h-4 w-4" />
              Submit
            </Button>
            <Button onClick={() => void actions.refreshCurrent()} variant="secondary">
              <RefreshCw className="h-4 w-4" />
              Refresh Local
            </Button>
          </Toolbar>
        </CardContent>
      </Panel>
      <Panel>
        <CardHead title="Market Scripts" detail={market?.market.updatedAt ? `Last updated: ${market.market.updatedAt}` : "Loaded from GitHub static manifest"} />
        <CardContent>
          {marketScripts.length ? (
            <div className="script-market-grid">
              {marketScripts.map((script) => (
                <MarketScriptCard key={script.id} script={script} actions={actions} />
              ))}
            </div>
          ) : (
            <div className="empty">{market?.status === "failed" ? market.message : "Click Refresh Market to load remote scripts."}</div>
          )}
        </CardContent>
      </Panel>
      <Panel>
        <CardHead title="Local Scripts" detail="Built-in, manual, and market-installed scripts; enable, disable, or delete user scripts here" />
        <CardContent>
          <div className="table">
            {scripts.length ? scripts.map((script) => <ScriptRow key={script.key} script={script} actions={actions} />) : <div className="empty">No user scripts found.</div>}
          </div>
        </CardContent>
      </Panel>
    </>
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
