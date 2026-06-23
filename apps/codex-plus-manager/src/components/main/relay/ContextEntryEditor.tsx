import { useState } from "react";
import { Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field, Toolbar } from "@/components/main/ui/SharedComponents";
import { contextKindOptions } from "@/lib/context";
import type { ContextKind, CodexContextEntry } from "@/types";

export function ContextEntryEditor({
  kind,
  entry,
  onCancel,
  onSave,
}: {
  kind: ContextKind;
  entry?: CodexContextEntry;
  onCancel: () => void;
  onSave: (kind: ContextKind, id: string, tomlBody: string) => void;
}) {
  const [draftKind, setDraftKind] = useState<ContextKind>(entry?.kind ?? kind);
  const [id, setId] = useState(entry?.id ?? "");
  const [tomlBody, setTomlBody] = useState(entry?.tomlBody ?? "");
  const canSave = id.trim().length > 0;

  return (
    <div className="context-editor">
      <div className="context-editor-fields">
        <Field label="Type">
          <select
            className="field-select"
            disabled={!!entry}
            value={draftKind}
            onChange={(event) => setDraftKind(event.currentTarget.value as ContextKind)}
          >
            {contextKindOptions.map((option) => (
              <option key={option.kind} value={option.kind}>{option.label}</option>
            ))}
          </select>
        </Field>
        <Field label="ID">
          <Input
            disabled={!!entry}
            value={id}
            onChange={(event) => setId(event.currentTarget.value.trim())}
            placeholder="e.g. context7"
          />
        </Field>
      </div>
      <Field label="TOML Config Body">
        <Textarea
          className="context-editor-textarea"
          value={tomlBody}
          onChange={(event) => setTomlBody(event.currentTarget.value)}
          placeholder={'Fill in content below the table header, e.g.:\ncommand = "npx"\nargs = ["-y", "@upstash/context7-mcp"]'}
          spellCheck={false}
        />
      </Field>
      <Toolbar>
        <Button disabled={!canSave} onClick={() => onSave(draftKind, id.trim(), tomlBody)} size="sm">
          <Save className="h-4 w-4" />
          Save Extension
        </Button>
        <Button onClick={onCancel} size="sm" variant="secondary">Cancel</Button>
      </Toolbar>
    </div>
  );
}
