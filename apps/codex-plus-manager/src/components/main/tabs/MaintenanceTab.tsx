import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Panel, CardHead, Toolbar, Field, StatusRow } from "@/components/main/ui/SharedComponents";
import type { OverviewResult, WatcherResult, SettingsResult, Actions } from "@/types";

export function MaintenanceTab({
  overview,
  watcher,
  settings,
  launchForm,
  onLaunchFormChange,
  removeOwnedData,
  onRemoveOwnedDataChange,
  actions,
}: {
  overview: OverviewResult | null;
  watcher: WatcherResult | null;
  settings: SettingsResult | null;
  launchForm: { appPath: string; debugPort: string; helperPort: string };
  onLaunchFormChange: (next: { appPath: string; debugPort: string; helperPort: string }) => void;
  removeOwnedData: boolean;
  onRemoveOwnedDataChange: (value: boolean) => void;
  actions: Actions;
}) {
  const savedCodexAppPath = settings?.settings.codexAppPath ?? "";
  return (
    <>
      <Panel>
        <CardHead title="Check & Repair" detail="Check entrypoints, Codex app, and Watcher status" />
        <CardContent>
          <div className="status-table">
            <StatusRow title="Codex App" status={overview?.codex_app.status} path={overview?.codex_app.path} />
            <StatusRow title="Silent Launch Entry" status={overview?.silent_shortcut.status} path={overview?.silent_shortcut.path} />
            <StatusRow title="Management Console Entry" status={overview?.management_shortcut.status} path={overview?.management_shortcut.path} />
            <StatusRow title="Watcher Auto-takeover" status={watcher?.enabled ? "ok" : "Disabled"} path={watcher?.disabled_flag} />
          </div>
          <Toolbar>
            <Button onClick={() => void actions.checkHealth()}>Check</Button>
            <Button variant="secondary" onClick={() => void actions.repairShortcuts()}>Repair Shortcuts</Button>
            <Button variant="secondary" onClick={() => void actions.repairBackend()}>Repair Backend</Button>
          </Toolbar>
        </CardContent>
      </Panel>
      <Panel>
        <CardHead title="Entrypoint Management" detail="Shortcuts are written to the actual system desktop location, not hardcoded paths" />
        <CardContent>
          <label className="check-row">
            <input checked={removeOwnedData} onChange={(event) => onRemoveOwnedDataChange(event.currentTarget.checked)} type="checkbox" />
            <span>Remove Codex++ managed data on uninstall</span>
          </label>
          <Toolbar>
            <Button onClick={() => void actions.installEntrypoints()}>Install Entrypoints</Button>
            <Button variant="secondary" onClick={() => void actions.uninstallEntrypoints()}>Uninstall Entrypoints</Button>
            <Button variant="secondary" onClick={() => void actions.repairShortcuts()}>Repair Entrypoints</Button>
          </Toolbar>
        </CardContent>
      </Panel>
      <Panel>
        <CardHead title="Auto Takeover" detail="Watcher maintains the Codex++ takeover state" />
        <CardContent>
          <Toolbar>
            <Button variant="secondary" onClick={() => void actions.installWatcher()}>Install Watcher</Button>
            <Button variant="secondary" onClick={() => void actions.uninstallWatcher()}>Remove Watcher</Button>
            <Button variant="secondary" onClick={() => void actions.enableWatcher()}>Enable</Button>
            <Button variant="secondary" onClick={() => void actions.disableWatcher()}>Disable</Button>
          </Toolbar>
        </CardContent>
      </Panel>
      <Panel>
        <CardHead title="Codex App Path" detail="For portable or extracted versions, select once and silent launch will reuse it automatically" />
        <CardContent>
          <div className="status-table">
            <StatusRow title="Saved Path" status={savedCodexAppPath ? "ok" : "not_checked"} path={savedCodexAppPath || null} />
            <StatusRow title="Currently Detected" status={overview?.codex_app.status} path={overview?.codex_app.path} />
          </div>
          <Field label="Saved App Path">
            <Input
              value={settings?.settings.codexAppPath ?? ""}
              placeholder="Select Codex.exe, Codex.app, app directory, or extracted directory"
              readOnly
            />
          </Field>
          <Toolbar>
            <Button onClick={() => void actions.chooseCodexAppPath("folder")}>Select App Directory</Button>
            <Button variant="secondary" onClick={() => void actions.chooseCodexAppPath("file")}>Select Codex.exe</Button>
            <Button variant="secondary" onClick={() => void actions.clearCodexAppPath()}>Clear Saved Path</Button>
          </Toolbar>
        </CardContent>
      </Panel>
      <Panel>
        <CardHead title="Manual Launch" detail="Empty app path uses saved path; if no saved path, uses auto-detection" />
        <CardContent>
          <Field label="App Path Override">
            <Input
              value={launchForm.appPath}
              onChange={(event) => onLaunchFormChange({ ...launchForm, appPath: event.currentTarget.value })}
              placeholder={savedCodexAppPath || "e.g. C:\\Program Files\\WindowsApps\\OpenAI.Codex...\\app"}
            />
          </Field>
          <div className="form-row">
            <Field label="Debug Port">
              <Input
                value={launchForm.debugPort}
                onChange={(event) => onLaunchFormChange({ ...launchForm, debugPort: event.currentTarget.value })}
              />
            </Field>
            <Field label="Helper Port">
              <Input
                value={launchForm.helperPort}
                onChange={(event) => onLaunchFormChange({ ...launchForm, helperPort: event.currentTarget.value })}
              />
            </Field>
          </div>
          <Toolbar>
            <Button onClick={() => void actions.launch()}>Launch Codex++</Button>
            <Button variant="secondary" onClick={() => void actions.saveManualCodexAppPath()}>
              Save as Default Path
            </Button>
          </Toolbar>
        </CardContent>
      </Panel>
    </>
  );
}
