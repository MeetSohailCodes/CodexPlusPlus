import { CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RelayContextManager } from "@/components/main/relay/RelayContextManager";
import { normalizeSettings } from "@/lib/relay";
import {
  type Actions,
  type BackendSettings,
  type CodexContextEntries,
  type RelayFilesResult,
} from "@/types";

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

export function ContextTab({
  form,
  liveContextEntries,
  relayFiles,
  onFormChange,
  actions,
}: {
  form: BackendSettings;
  liveContextEntries: CodexContextEntries | null;
  relayFiles: RelayFilesResult | null;
  onFormChange: (value: BackendSettings) => void;
  actions: Actions;
}) {
  return (
    <Panel fill>
      <CardHead
        title="Codex Tools & Plugins"
        detail="Independently manage Codex MCP, Skills, and Plugins; carried across provider switches."
      />
      <CardContent>
        <RelayContextManager
          form={normalizeSettings(form)}
          liveEntries={liveContextEntries}
          relayFiles={relayFiles}
          onFormChange={onFormChange}
          actions={actions}
        />
      </CardContent>
    </Panel>
  );
}
