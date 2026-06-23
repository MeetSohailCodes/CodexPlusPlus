import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  type Actions,
  type BackendSettings,
  type SettingsResult,
  type Theme,
} from "@/types";
import { Panel, CardHead, Toolbar, Field } from "@/components/main/ui/SharedComponents";

function clampNumber(value: number, min: number, max: number): number {
  if (!Number.isFinite(value)) return min;
  return Math.min(max, Math.max(min, Math.round(value)));
}

function codexExtraArgsToInput(args: string[] | undefined) {
  return (args ?? []).join("\n");
}

function inputToCodexExtraArgs(value: string) {
  return value === "" ? [] : value.split(/\r?\n/);
}

export function SettingsTab({
  settings,
  theme,
  form,
  onFormChange,
  actions,
}: {
  settings: SettingsResult | null;
  theme: Theme;
  form: BackendSettings;
  onFormChange: (value: BackendSettings) => void;
  actions: Actions;
}) {
  return (
    <>
      <Panel>
        <CardHead title="Basic Settings" detail={settings?.settings_path ?? ""} />
        <CardContent>
          <div className="theme-row">
            <div>
              <strong>Interface Theme</strong>
              <span>Currently in {theme === "dark" ? "dark" : "light"} mode.</span>
            </div>
            <Button variant="secondary" onClick={actions.toggleTheme}>Switch Theme</Button>
          </div>
          <Field label="Provider Test Model">
            <Input
              value={form.relayTestModel}
              onChange={(event) => onFormChange({ ...form, relayTestModel: event.currentTarget.value })}
              placeholder="e.g. gpt-5.4-mini"
            />
          </Field>
          <label className="check-row">
            <input
              checked={form.cliWrapperEnabled}
              onChange={(event) => onFormChange({ ...form, cliWrapperEnabled: event.currentTarget.checked })}
              type="checkbox"
            />
            <span>Enable Codex Command Wrapper</span>
          </label>
          <div className="form-row">
            <Field label="Wrapper Base URL">
              <Input
                value={form.cliWrapperBaseUrl}
                onChange={(event) => onFormChange({ ...form, cliWrapperBaseUrl: event.currentTarget.value })}
              />
            </Field>
            <Field label="API Key Environment variable">
              <Input
                value={form.cliWrapperApiKeyEnv}
                onChange={(event) => onFormChange({ ...form, cliWrapperApiKeyEnv: event.currentTarget.value })}
              />
            </Field>
          </div>
          <Field label="API Key">
            <Input
              type="password"
              value={form.cliWrapperApiKey}
              onChange={(event) => onFormChange({ ...form, cliWrapperApiKey: event.currentTarget.value })}
            />
          </Field>
          <div className="settings-block">
            <label className="check-row">
              <input
                checked={form.codexAppImageOverlayEnabled}
                onChange={(event) =>
                  onFormChange({ ...form, codexAppImageOverlayEnabled: event.currentTarget.checked })
                }
                type="checkbox"
              />
              <span>Enable Codex Image Overlay</span>
            </label>
            <div className="form-row">
              <Field label="Overlay Image">
                <Input
                  value={form.codexAppImageOverlayPath}
                  onChange={(event) => onFormChange({ ...form, codexAppImageOverlayPath: event.currentTarget.value })}
                  placeholder="Select png / jpg / webp / gif / bmp"
                />
              </Field>
              <Toolbar>
                <Button variant="secondary" onClick={() => void actions.chooseImageOverlayPath()}>
                  Select Image
                </Button>
              </Toolbar>
            </div>
            <Field label={`Opacity ${form.codexAppImageOverlayOpacity}%`}>
              <Input
                min={1}
                max={100}
                type="range"
                value={form.codexAppImageOverlayOpacity}
                onChange={(event) =>
                  onFormChange({
                    ...form,
                    codexAppImageOverlayOpacity: clampNumber(Number(event.currentTarget.value), 1, 100),
                  })
                }
              />
            </Field>
          </div>
          <Toolbar>
            <Button onClick={() => void actions.saveSettings()}>Save Settings</Button>
            <Button variant="secondary" onClick={() => void actions.resetImageOverlaySettings()}>
              Reset Background
            </Button>
          </Toolbar>
        </CardContent>
      </Panel>
      <Panel>
        <CardHead title="Codex Launch Arguments" detail="Appended after default CDP arguments when launching Codex App. Leave empty to keep default launch behavior." />
        <CardContent>
          <Field label="Extra Arguments">
            <Textarea
              className="launch-args-input"
              placeholder="--force_high_performance_gpu"
              spellCheck={false}
              value={codexExtraArgsToInput(form.codexExtraArgs)}
              onChange={(event) =>
                onFormChange({
                  ...form,
                  codexExtraArgs: inputToCodexExtraArgs(event.currentTarget.value),
                })
              }
            />
          </Field>
          <p className="field-hint">One argument per line, e.g. --force_high_performance_gpu. No need to include open or --args.</p>
          <Toolbar>
            <Button onClick={() => void actions.saveSettings()}>Save Settings</Button>
          </Toolbar>
        </CardContent>
      </Panel>
    </>
  );
}
