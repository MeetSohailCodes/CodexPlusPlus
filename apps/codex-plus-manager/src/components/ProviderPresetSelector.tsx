import { useState, useMemo } from "react";
import type { ProviderPreset, RelayProtocol } from "../presets";
import { PRESETS } from "../presets";

export type RelayProfile = {
  id: string;
  name: string;
  model: string;
  baseUrl: string;
  upstreamBaseUrl: string;
  apiKey: string;
  protocol: RelayProtocol;
  relayMode: string;
  officialMixApiKey: boolean;
  testModel: string;
  configContents: string;
  authContents: string;
  useCommonConfig: boolean;
  contextWindow: string;
  autoCompactLimit: string;
  modelInsertMode: string;
  modelList: string;
  userAgent: string;
};

export type PresetPatch = Partial<RelayProfile>;

const categoryLabels: Record<string, string> = {
  official: "Official",
  cn_official: "China Official",
  aggregator: "Aggregator / Relay",
  third_party: "Third Party",
};

const initialFor = (name: string): string => {
  return name.charAt(0).toUpperCase();
};

export function createPresetPatch(preset: ProviderPreset): PresetPatch {
  return {
    name: preset.name,
    baseUrl: preset.baseUrl,
    upstreamBaseUrl: preset.baseUrl,
    protocol: preset.protocol,
    model: preset.model,
    testModel: preset.model,
    modelList: preset.modelList?.join("\n") ?? "",
    relayMode: preset.category === "official" ? "official" : "pureApi",
    officialMixApiKey: false,
  };
}

export function ProviderPresetSelector({
  onSelect,
}: {
  onSelect: (patch: PresetPatch) => void;
}) {
  const [collapsed, setCollapsed] = useState(true);
  const [query, setQuery] = useState("");

  const categories = useMemo(() => [...new Set(PRESETS.map((p) => p.category))], []);

  const filtered = useMemo(() => {
    if (!query.trim()) return PRESETS;
    const q = query.toLowerCase().trim();
    return PRESETS.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.model.toLowerCase().includes(q) ||
        p.baseUrl.toLowerCase().includes(q)
    );
  }, [query]);

  const handleSelect = (preset: ProviderPreset) => {
    onSelect(createPresetPatch(preset));
    setCollapsed(true);
    setQuery("");
  };

  return (
    <div className="preset-selector">
      <button
        className="preset-toggle"
        aria-expanded={!collapsed}
        onClick={() => setCollapsed((c) => !c)}
        type="button"
      >
        <span className="preset-toggle-label">
          Create from a preset template
          <span className="preset-toggle-count">
            {collapsed ? `${PRESETS.length} providers` : ""}
          </span>
        </span>
        <span className="preset-toggle-arrow">{collapsed ? "▾" : "▴"}</span>
      </button>

      {!collapsed && (
        <div className="preset-grid" role="region" aria-label="Provider preset list">
          <div className="preset-search">
            <span className="preset-search-icon">⌕</span>
            <input
              className="preset-search-input"
              placeholder="Search providers…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
            />
          </div>

          {filtered.length === 0 && (
            <div className="preset-empty">No providers match "{query}"</div>
          )}

          {query.trim()
            ? // Search mode: show all matches in one group
              filtered.map((preset) => (
                <PresetButton
                  key={preset.id}
                  preset={preset}
                  onSelect={handleSelect}
                />
              ))
            : // Browse mode: group by category
              categories.map((cat) => {
                const items = PRESETS.filter((p) => p.category === cat);
                if (items.length === 0) return null;
                return (
                  <div className="preset-category" key={cat}>
                    <h3 className="preset-category-label">
                      {categoryLabels[cat] || cat}
                    </h3>
                    <div className="preset-category-items">
                      {items.map((preset) => (
                        <PresetButton
                          key={preset.id}
                          preset={preset}
                          onSelect={handleSelect}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
        </div>
      )}
    </div>
  );
}

function PresetButton({
  preset,
  onSelect,
}: {
  preset: ProviderPreset;
  onSelect: (preset: ProviderPreset) => void;
}) {
  return (
    <button
      className="preset-btn"
      onClick={() => onSelect(preset)}
      title={`${preset.websiteUrl ?? ""}\n${preset.baseUrl}`}
      type="button"
    >
      <span className="preset-btn-icon">{initialFor(preset.name)}</span>
      <span className="preset-btn-name">{preset.name}</span>
      <span className="preset-btn-model">{preset.model}</span>
    </button>
  );
}
