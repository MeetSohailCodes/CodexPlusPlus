import { useEffect, useState } from "react";
import {
  CheckCircle2,
  Copy,
  KeyRound,
  Network,
  RefreshCw,
  Rocket,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Panel, CardHead, Toolbar, Badge } from "@/components/main/ui/SharedComponents";
import { mobileRelayServers } from "@/constants";
import type { BackendSettings, Status } from "@/types";

type MobileRelayRoomStatus = {
  room: string;
  hostOnline: boolean;
  clientOnline: boolean;
  connections: number;
  ageSeconds: number;
  forwardedMessages: number;
  forwardedBytes: number;
};

type MobileRelayStatus = {
  status: string;
  service: string;
  version: string;
  uptimeSeconds: number;
  rooms: number;
  activeConnections: number;
  totalConnections: number;
  forwardedMessages: number;
  forwardedBytes: number;
  roomDetails: MobileRelayRoomStatus[];
};

type Actions = {
  saveSettingsValue: (settings: BackendSettings, silent?: boolean) => Promise<void>;
  launch: () => Promise<void>;
  showMessage: (title: string, message: string, status?: Status) => Promise<void>;
};

function randomToken(byteLength = 24) {
  const bytes = new Uint8Array(byteLength);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function mobileRelayHttpUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return "";
  const withScheme = /^[a-z]+:\/\//i.test(trimmed) ? trimmed : `ws://${trimmed}`;
  try {
    const url = new URL(withScheme);
    url.protocol = url.protocol === "wss:" || url.protocol === "https:" ? "https:" : "http:";
    url.pathname = "";
    url.search = "";
    url.hash = "";
    return url.toString().replace(/\/$/, "");
  } catch {
    return "";
  }
}

function mobileRelayShareUrl(settings: Pick<BackendSettings, "mobileControlRelayUrl" | "mobileControlRoom" | "mobileControlKey">) {
  const base = mobileRelayHttpUrl(settings.mobileControlRelayUrl);
  const room = settings.mobileControlRoom.trim();
  const key = settings.mobileControlKey.trim();
  if (!base || !room || !key) return "";
  const url = new URL(`${base}/mobile`);
  url.searchParams.set("room", room);
  url.searchParams.set("key", key);
  url.searchParams.set("auto", "1");
  return url.toString();
}

function formatBytes(bytes: number) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB"];
  let value = bytes;
  let index = 0;
  while (value >= 1024 && index < units.length - 1) {
    value /= 1024;
    index += 1;
  }
  return `${value >= 10 || index === 0 ? value.toFixed(0) : value.toFixed(1)} ${units[index]}`;
}

function stringifyError(error: unknown) {
  if (error instanceof Error) return error.message;
  return String(error);
}

export function MobileControlTab({
  form,
  onFormChange,
  actions,
}: {
  form: BackendSettings;
  onFormChange: (value: BackendSettings) => void;
  actions: Actions;
}) {
  const [serverStatuses, setServerStatuses] = useState<Record<string, MobileRelayStatus | null>>({});
  const [statusMessage, setStatusMessage] = useState("Not yet refreshed");
  const [loadingStatus, setLoadingStatus] = useState(false);
  const mobileUrl = mobileRelayShareUrl(form);
  const selectedServerId =
    mobileRelayServers.find((server) => server.url === form.mobileControlRelayUrl)?.id || mobileRelayServers[0].id;
  const selectedServer = mobileRelayServers.find((server) => server.id === selectedServerId) ?? mobileRelayServers[0];
  const selectedStatus = serverStatuses[selectedServer.id] ?? null;
  const serverCapacity = selectedServer?.capacity ?? 100;
  const serverLoad = selectedStatus?.activeConnections ?? 0;
  const saveMobileSettings = async (next: BackendSettings, silent = true) => {
    onFormChange(next);
    await actions.saveSettingsValue(next, silent);
  };
  const selectRelayServer = (serverId: string) => {
    const server = mobileRelayServers.find((item) => item.id === serverId);
    if (!server) return;
    onFormChange({ ...form, mobileControlRelayUrl: server.url });
  };
  const startAndCopyMobileLink = async () => {
    const room = form.mobileControlRoom.trim() || randomToken(8);
    const key = form.mobileControlKey.trim() || randomToken(32);
    const relayUrl = selectedServer.url;
    const next = {
      ...form,
      mobileControlEnabled: true,
      mobileControlRelayUrl: relayUrl,
      mobileControlRoom: room,
      mobileControlKey: key,
    };
    await saveMobileSettings(next, true);
    const link = mobileRelayShareUrl(next);
    if (!link) {
      await actions.showMessage("Mobile Control", "Invalid server address, cannot generate mobile link.", "failed");
      return;
    }
    await actions.launch();
    try {
      await navigator.clipboard?.writeText(link);
      await actions.showMessage("Mobile Control", "Started and mobile link copied.");
    } catch (error) {
      await actions.showMessage("Mobile Control", `Started, but failed to copy link: ${stringifyError(error)}`, "failed");
    }
  };
  const refreshRelayStatus = async () => {
    setLoadingStatus(true);
    const entries = await Promise.all(mobileRelayServers.map(async (server) => {
      const httpUrl = mobileRelayHttpUrl(server.url);
      try {
        const response = await fetch(`${httpUrl}/status`, { cache: "no-store" });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return [server.id, (await response.json()) as MobileRelayStatus, ""] as const;
      } catch (error) {
        return [server.id, null, `${server.label}: ${error instanceof Error ? error.message : "Refresh failed"}`] as const;
      }
    }));
    setServerStatuses(Object.fromEntries(entries.map(([id, data]) => [id, data])));
    const failed = entries.map(([, , error]) => error).filter(Boolean);
    setStatusMessage(failed.length ? failed.join("; ") : "Status refreshed");
    setLoadingStatus(false);
  };
  useEffect(() => {
    void refreshRelayStatus();
  }, []);
  useEffect(() => {
    if (!mobileRelayServers.some((server) => server.url === form.mobileControlRelayUrl)) {
      onFormChange({ ...form, mobileControlRelayUrl: mobileRelayServers[0].url });
    }
  }, [form.mobileControlRelayUrl]);
  return (
    <>
      <Panel>
        <CardHead title="Mobile Control" detail="Select a relay server and start; a random room and key will be generated, and a link for mobile access will be copied." />
        <CardContent>
          <div className="mobile-server-grid">
            {mobileRelayServers.map((server) => {
              const isActive = selectedServerId === server.id;
              const itemStatus = serverStatuses[server.id] ?? null;
              const load = itemStatus?.activeConnections ?? 0;
              return (
                <button
                  className={`mobile-server-card ${isActive ? "active" : ""}`}
                  key={server.id}
                  onClick={() => selectRelayServer(server.id)}
                  type="button"
                >
                  <span>
                    <strong>{server.label}</strong>
                    <small>{server.url}</small>
                    <small>{itemStatus ? `Online · ${itemStatus.rooms} rooms · ${formatBytes(itemStatus.forwardedBytes)}` : "Not connected or not refreshed"}</small>
                  </span>
                  <em>{load}/{server.capacity}</em>
                </button>
              );
            })}
          </div>
          <div className="form-row">
              <Label className="field">
                <span>Current Server</span>
              <Input readOnly value={selectedServer.url} />
            </Label>
              <Label className="field">
                <span>Capacity</span>
              <Input
                readOnly
                value={`${serverLoad}/${serverCapacity}`}
              />
            </Label>
          </div>
          <Toolbar>
            <Button onClick={() => void startAndCopyMobileLink()} type="button">
              <Rocket className="h-4 w-4" />
              Start and Copy Mobile Link
            </Button>
            <Button
              onClick={() => void saveMobileSettings({
                ...form,
                mobileControlEnabled: true,
                mobileControlRoom: randomToken(8),
                mobileControlKey: randomToken(32),
              }, false)}
              type="button"
              variant="secondary"
            >
              <KeyRound className="h-4 w-4" />
              Regenerate Token
            </Button>
            <Button onClick={() => void refreshRelayStatus()} type="button" variant="secondary">
              <RefreshCw className="h-4 w-4" />
              {loadingStatus ? "Refreshing..." : "Refresh Server Status"}
            </Button>
          </Toolbar>
        </CardContent>
      </Panel>
      <Panel>
        <CardHead title="Mobile Entry" detail="The copied link contains a random room and key; the relay server only sees room, connection count, and traffic stats." />
        <CardContent>
          <div className="relay-file-panel">
            <div className="relay-file-head">
              <div>
                <strong>{mobileUrl || "Mobile entry not generated"}</strong>
                <span>{mobileUrl ? "Opening on mobile will auto-fill the room and key and attempt to connect." : "Select a server and start to generate the mobile entry."}</span>
              </div>
              {mobileUrl ? (
                <Button
                  onClick={() => {
                    void navigator.clipboard?.writeText(mobileUrl);
                    void actions.showMessage("Mobile Entry", "Mobile entry address copied.");
                  }}
                  size="sm"
                  type="button"
                  variant="secondary"
                >
                  <Copy className="h-4 w-4" />
                  Copy
                </Button>
              ) : null}
            </div>
          </div>
        </CardContent>
      </Panel>
      <Panel>
        <CardHead title="Server Status" detail={statusMessage} />
        <CardContent>
          {selectedStatus ? (
            <>
              <div className="health-grid">
                <div className="health-item ok">
                  <CheckCircle2 className="h-4 w-4" />
                  <div>
                    <strong>Active Connections</strong>
                    <span>{selectedStatus.activeConnections} active connections, {selectedStatus.totalConnections} total.</span>
                  </div>
                  <Badge status="ok" />
                </div>
                <div className="health-item ok">
                  <Network className="h-4 w-4" />
                  <div>
                    <strong>Room Count</strong>
                    <span>{selectedStatus.rooms} rooms, {selectedStatus.forwardedMessages} messages forwarded.</span>
                  </div>
                  <Badge status="ok" />
                </div>
              </div>
              <div className="relay-file-grid">
                {selectedStatus.roomDetails.map((room) => (
                  <div className="relay-file-panel" key={room.room}>
                    <div className="relay-file-head">
                      <div>
                        <strong>{room.room}</strong>
                        <span>
                          host {room.hostOnline ? "Online" : "Offline"} / client {room.clientOnline ? "Online" : "Offline"},
                          {room.connections} connections, {formatBytes(room.forwardedBytes)}
                        </span>
                      </div>
                      <Badge status={room.hostOnline && room.clientOnline ? "ok" : "not_checked"} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <p className="field-hint">Click "Refresh Server Status" to view relay load, online users, and room connections.</p>
          )}
        </CardContent>
      </Panel>
    </>
  );
}
