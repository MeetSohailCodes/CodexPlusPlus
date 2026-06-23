import { Info, ShieldCheck, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Panel, CardHead, FeatureToggle, TaskProgressBox, Toolbar, Field } from "@/components/main/ui/SharedComponents";
import type { BackendSettings, LaunchMode, TaskProgress, Actions, ZedOpenStrategy } from "@/types";

function ModeSelector({ launchMode, actions }: { launchMode: LaunchMode; actions: Actions }) {
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

export function EnhanceTab({
  form,
  pluginMarketplaceProgress,
  onFormChange,
  actions,
}: {
  form: BackendSettings;
  pluginMarketplaceProgress: TaskProgress;
  onFormChange: (value: BackendSettings) => void;
  actions: Actions;
}) {
  const setEnhanceFlag = (key: keyof BackendSettings, value: boolean) => onFormChange({ ...form, [key]: value });
  const masterEnabled = form.enhancementsEnabled;
  const patchMode = form.launchMode === "patch";
  return (
    <>
      <Panel>
        <CardHead title="Page Feature Enhancements" detail="Session deletion, export, project move, Timeline, and user script capabilities" />
        <div className="panel-body">
          <label className="switch-row">
            <input
              checked={form.enhancementsEnabled}
              onChange={(event) => onFormChange({ ...form, enhancementsEnabled: event.currentTarget.checked })}
              type="checkbox"
            />
            <span>
              <strong>Enable Codex++ Page Enhancements</strong>
              <small>Disabling will turn off deletion, export, project move, Timeline, plugin-related, and menu placement enhancements.</small>
            </span>
          </label>
          <label className="switch-row">
            <input
              checked={form.computerUseGuardEnabled}
              onChange={(event) => onFormChange({ ...form, computerUseGuardEnabled: event.currentTarget.checked })}
              type="checkbox"
            />
            <span>
              <strong>Enable Windows Computer Use Guard</strong>
              <small>Disabled by default; when enabled, launching Codex will automatically preserve config.toml, bundled plugins, and notify configuration required by the official Computer Use plugin.</small>
            </span>
          </label>
          <ModeSelector launchMode={form.launchMode} actions={actions} />
          {form.launchMode === "relay" ? (
            <div className="hint-line">
              <ShieldCheck className="h-4 w-4" />
              <span>Currently in compatible enhancement mode; plugin market unlock, forced entry unlock, and forced plugin installation are disabled; other page features remain available.</span>
            </div>
          ) : null}
          <div className="feature-switch-grid">
            <FeatureToggle title="Plugin Market Unlock" detail="Extends plugin market requests in API Key mode to display the full plugin list; typically not needed for official/mixed modes." checked={form.codexAppPluginMarketplaceUnlock} disabled={!masterEnabled || !patchMode} onChange={(value) => setEnhanceFlag("codexAppPluginMarketplaceUnlock", value)} />
            <FeatureToggle title="Force Unlock Entry" detail="Restores the 1.1.9 entry unlock method, forcing the plugin entry to be displayed and enabled." checked={form.codexAppPluginEntryUnlock} disabled={!masterEnabled || !patchMode} onChange={(value) => setEnhanceFlag("codexAppPluginEntryUnlock", value)} />
            <FeatureToggle title="Force Install Special Plugins" detail="Removes the frontend install restriction caused by App unavailable / application unavailable." checked={form.codexAppForcePluginInstall} disabled={!masterEnabled || !patchMode} onChange={(value) => setEnhanceFlag("codexAppForcePluginInstall", value)} />
            <FeatureToggle title="Model Whitelist Unlock" detail="Pulls models from environment variables and config.toml /v1/models endpoint and adds them to the model list." checked={form.codexAppModelWhitelistUnlock} disabled={!masterEnabled} onChange={(value) => setEnhanceFlag("codexAppModelWhitelistUnlock", value)} />
            <FeatureToggle title="Fast Button" detail="Shows the service mode toggle button; Fast only supports gpt-5.4 / gpt-5.5, other models are sent as Standard." checked={form.codexAppServiceTierControls} disabled={!masterEnabled} onChange={(value) => setEnhanceFlag("codexAppServiceTierControls", value)} />
            <FeatureToggle title="Session deletion" detail="Shows a delete button on hover in the session list, with undo support." checked={form.codexAppSessionDelete} disabled={!masterEnabled} onChange={(value) => setEnhanceFlag("codexAppSessionDelete", value)} />
            <FeatureToggle title="Markdown Export" detail="Shows an export button in the session list, exporting timestamped Markdown files." checked={form.codexAppMarkdownExport} disabled={!masterEnabled} onChange={(value) => setEnhanceFlag("codexAppMarkdownExport", value)} />
            <FeatureToggle title="Paste Fix" detail="When pasting from Word and other rich text into Codex composer, retains only plain text to avoid being detected as image/file attachments. Requires Codex restart." checked={form.codexAppPasteFix} disabled={!masterEnabled} onChange={(value) => setEnhanceFlag("codexAppPasteFix", value)} />
            <FeatureToggle title="Session Project Move" detail="Moves sessions to a regular conversation or other local projects." checked={form.codexAppProjectMove} disabled={!masterEnabled} onChange={(value) => setEnhanceFlag("codexAppProjectMove", value)} />
            <FeatureToggle title="Conversation Timeline" detail="Displays user question timeline on the right side of the conversation, with summary and navigation." checked={form.codexAppConversationTimeline} disabled={!masterEnabled} onChange={(value) => setEnhanceFlag("codexAppConversationTimeline", value)} />
            <FeatureToggle title="Session ID Badge" detail="Displays a short ID and UUIDv7 creation time before the session title in the sidebar for easy history lookup." checked={form.codexAppThreadIdBadge} disabled={!masterEnabled} onChange={(value) => setEnhanceFlag("codexAppThreadIdBadge", value)} />
            <FeatureToggle title="Conversation Centered Width" detail="Limits the main conversation and input to a fixed maximum width, suitable for large screen reading." checked={form.codexAppConversationView} disabled={!masterEnabled} onChange={(value) => setEnhanceFlag("codexAppConversationView", value)} />
            <FeatureToggle title="Preserve Position on Thread Switch" detail="Restores the last browsing position when switching threads." checked={form.codexAppThreadScrollRestore} disabled={!masterEnabled} onChange={(value) => setEnhanceFlag("codexAppThreadScrollRestore", value)} />
            <FeatureToggle title="Zed Remote Open" detail="Remote SSH file references can be opened directly with Zed Remote Development." checked={form.codexAppZedRemoteOpen} disabled={!masterEnabled} onChange={(value) => setEnhanceFlag("codexAppZedRemoteOpen", value)} />
            <FeatureToggle title="Zed Project Registry" detail="Maintains Codex++ own recent remote project list." checked={form.zedRemoteProjectRegistryEnabled} disabled={!masterEnabled} onChange={(value) => setEnhanceFlag("zedRemoteProjectRegistryEnabled", value)} />
            <FeatureToggle title="Sync Zed Settings" detail="Advanced option, disabled by default; the current implementation does not actively modify Zed settings." checked={form.zedRemoteSyncToZedSettings} disabled={!masterEnabled} onChange={(value) => setEnhanceFlag("zedRemoteSyncToZedSettings", value)} />
            <FeatureToggle title="Upstream Worktree" detail="Creates a Git worktree from the latest upstream branch." checked={form.codexAppUpstreamWorktreeCreate} disabled={!masterEnabled} onChange={(value) => setEnhanceFlag("codexAppUpstreamWorktreeCreate", value)} />
            <FeatureToggle title="Native Menu Bar Placement" detail="Inserts the Codex++ menu into Codex top native menu bar." checked={form.codexAppNativeMenuPlacement} disabled={!masterEnabled} onChange={(value) => setEnhanceFlag("codexAppNativeMenuPlacement", value)} />
          </div>
          <div className="hint-line">
            <Wrench className="h-4 w-4" />
            <span>When there is no local plugin market on a new machine, initialize from openai/plugins to the current CODEX_HOME.</span>
            <Button disabled={pluginMarketplaceProgress.active} variant="secondary" onClick={() => void actions.repairPluginMarketplace()}>
              {pluginMarketplaceProgress.active ? "Repairing..." : "Repair Plugin Market"}
            </Button>
          </div>
          <TaskProgressBox progress={pluginMarketplaceProgress} title="Plugin Market Repair Progress" />
          <div className="zed-remote-settings">
            <Field label="Zed Default Open Strategy">
              <select
                className="select-input"
                disabled={!masterEnabled}
                onChange={(event) => onFormChange({ ...form, zedRemoteOpenStrategy: event.currentTarget.value as ZedOpenStrategy })}
                value={form.zedRemoteOpenStrategy}
              >
                <option value="addToFocusedWorkspace">Add to Current Workspace</option>
                <option value="reuseWindow">Reuse Window</option>
                <option value="newWindow">New Window</option>
                <option value="default">Zed Default</option>
              </select>
            </Field>
          </div>
          <div className="hint-line">
            <Info className="h-4 w-4" />
            <span>If using official mode or official mixed API mode, plugin market unlock, forced entry unlock, and forced plugin installation are typically not needed.</span>
          </div>
          <Toolbar>
            <Button onClick={() => void actions.saveSettings()}>Save Enhancement Settings</Button>
          </Toolbar>
        </div>
      </Panel>
    </>
  );
}
