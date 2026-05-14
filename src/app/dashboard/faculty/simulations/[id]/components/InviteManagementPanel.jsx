// src/app/dashboard/faculty/simulations/[id]/components/InviteManagementPanel.jsx
//
// Full invite management surface — stats cards, send-invite form, invite list.
// Aligned to the deployed /onboarding controller (singular):
//
//   GET   /onboarding/simulation/:simulationId/invites   — list all invites
//   POST  /onboarding/resend/:inviteId                   — resend pending invite
//   (No DELETE endpoint exists — revoke action removed)

"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { useTheme } from "@/context/ThemeContext";
import InviteForm from "../../../components/InviteForm";

// ─── THEME TOKENS — Corporate Edition (blue accent) ──────────────────────────
const LIGHT = {
  bgPage:       "#F3F4F6",
  bgSurface:    "#FFFFFF",
  bgElevated:   "#F9FAFB",
  bgHover:      "#F3F4F6",
  border:       "#E5E7EB",
  borderStrong: "#D1D5DB",
  textPrimary:  "#111827",
  textSec:      "#374151",
  textMuted:    "#6B7280",
  textDisabled: "#9CA3AF",
  accent:       "#1D4ED8",
  accentHover:  "#1E40AF",
  accentLight:  "#EFF6FF",
  accentBorder: "#BFDBFE",
  green:        "#065F46",
  greenBg:      "#D1FAE5",
  greenBorder:  "#6EE7B7",
  amber:        "#92400E",
  amberBg:      "#FEF3C7",
  amberBorder:  "#FCD34D",
  red:          "#991B1B",
  redBg:        "#FEE2E2",
  redBorder:    "#FECACA",
  rowAlt:       "#FAFAFA",
};

const DARK = {
  bgPage:       "#0D1117",
  bgSurface:    "#161B22",
  bgElevated:   "#1C2128",
  bgHover:      "#21262D",
  border:       "#30363D",
  borderStrong: "#444C56",
  textPrimary:  "#E6EDF3",
  textSec:      "#8D96A0",
  textMuted:    "#545D68",
  textDisabled: "#3D444D",
  accent:       "#4493F8",
  accentHover:  "#58A6FF",
  accentLight:  "#1A2332",
  accentBorder: "#1F3A5F",
  green:        "#3FB950",
  greenBg:      "rgba(63,185,80,0.10)",
  greenBorder:  "rgba(63,185,80,0.30)",
  amber:        "#D29922",
  amberBg:      "rgba(210,153,34,0.10)",
  amberBorder:  "rgba(210,153,34,0.30)",
  red:          "#F85149",
  redBg:        "rgba(248,81,73,0.10)",
  redBorder:    "rgba(248,81,73,0.30)",
  rowAlt:       "#191E25",
};

const buildStatusConfig = (t) => ({
  PENDING:  { label: "Pending",  color: t.amber,     bg: t.amberBg,    border: t.amberBorder, dot: t.amber },
  ACCEPTED: { label: "Accepted", color: t.green,     bg: t.greenBg,    border: t.greenBorder, dot: t.green },
  REJECTED: { label: "Rejected", color: t.red,       bg: t.redBg,      border: t.redBorder,   dot: t.red },
  EXPIRED:  { label: "Expired",  color: t.textMuted, bg: t.bgElevated, border: t.border,      dot: t.textMuted },
});

function formatRelativeTime(dateInput) {
  if (!dateInput) return "—";
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return "—";
  const diffDay = Math.floor((Date.now() - date.getTime()) / 86400000);
  if (diffDay < 0)   return `in ${-diffDay}d`;
  if (diffDay === 0) return "today";
  if (diffDay === 1) return "1d ago";
  if (diffDay < 30)  return `${diffDay}d ago`;
  const mo = Math.floor(diffDay / 30);
  if (mo < 12) return `${mo}mo ago`;
  return `${Math.floor(diffDay / 365)}y ago`;
}

function formatExpiry(dateInput) {
  if (!dateInput) return { label: "—", urgent: false };
  const date = new Date(dateInput);
  if (isNaN(date.getTime())) return { label: "—", urgent: false };
  const diffDay = Math.ceil((date.getTime() - Date.now()) / 86400000);
  if (diffDay < 0)   return { label: `Expired ${-diffDay}d ago`, urgent: true };
  if (diffDay === 0) return { label: "Expires today", urgent: true };
  if (diffDay <= 3)  return { label: `Expires in ${diffDay}d`, urgent: true };
  return { label: `Expires in ${diffDay}d`, urgent: false };
}

const IconMail = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="5" width="18" height="14" rx="2" />
    <path d="m3 7 9 6 9-6" />
  </svg>
);
const IconInbox = ({ size = 22 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
    <path d="M5.45 5.11 2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11Z" />
  </svg>
);
const IconCopy = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" />
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
  </svg>
);
const IconCheck = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const IconRefresh = ({ size = 12 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
    <path d="M21 3v5h-5" />
    <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
    <path d="M8 16H3v5" />
  </svg>
);

// Mongoose returns _id, but some serializers transform to id — tolerate both
const idOf = (inv) => inv?._id || inv?.id;

export default function InviteManagementPanel({
  simulationId,
  theme: themeProp,
  isDark: isDarkProp,
}) {
  const ctx = useTheme?.() || {};
  const isDark = typeof isDarkProp === "boolean" ? isDarkProp : !!ctx.isDark;

  const t = useMemo(() => {
    const looksValid = themeProp && typeof themeProp === "object"
      && themeProp.bgSurface && themeProp.accent && themeProp.amber;
    if (looksValid) return themeProp;
    return isDark ? DARK : LIGHT;
  }, [themeProp, isDark]);

  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const getToken = () => localStorage.getItem("access_token");

  const [invites, setInvites]         = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState("");
  const [resendingId, setResendingId] = useState(null);
  const [copiedId, setCopiedId]       = useState(null);
  const [filter, setFilter]           = useState("all");
  const [hoveredRow, setHoveredRow]   = useState(null);

  // ─── Fetch — GET /onboarding/simulation/:simulationId/invites ─────────────
  const fetchInvites = useCallback(async () => {
    try {
      const res = await fetch(
        `${apiUrl}/onboarding/simulation/${simulationId}/invites`,
        { headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" } },
      );
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || "Failed to load invites.");
      }
      const data = await res.json();
      // Service may return either a bare array or { invites: [...] }
      const list = Array.isArray(data) ? data : (data.invites || data.data || []);
      setInvites(list);
      setError("");
    } catch (e) {
      setError(e.message || "Could not load invites.");
    } finally {
      setLoading(false);
    }
  }, [apiUrl, simulationId]);

  useEffect(() => {
    if (!simulationId) return;
    fetchInvites();
  }, [simulationId, fetchInvites]);

  // ─── Resend — POST /onboarding/resend/:inviteId ───────────────────────────
  const handleResend = async (inviteId) => {
    setResendingId(inviteId);
    setError("");
    try {
      const res = await fetch(`${apiUrl}/onboarding/resend/${inviteId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" },
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || "Resend failed.");
      }
      await fetchInvites();
    } catch (e) {
      setError(e.message || "Could not resend invite.");
    } finally {
      setResendingId(null);
    }
  };

  // ─── Copy invite link ─────────────────────────────────────────────────────
  const handleCopy = async (invite) => {
    try {
      const token = invite.inviteToken;
      if (!token) throw new Error("No token available for this invite.");
      const link = `${window.location.origin}/onboarding/accept?token=${token}`;
      await navigator.clipboard.writeText(link);
      setCopiedId(idOf(invite));
      setTimeout(() => setCopiedId(null), 1800);
    } catch (e) {
      setError(e.message || "Could not copy link to clipboard.");
    }
  };

  const stats = {
    total:    invites.length,
    pending:  invites.filter((i) => i.status === "PENDING").length,
    accepted: invites.filter((i) => i.status === "ACCEPTED").length,
    expired:  invites.filter((i) => i.status === "EXPIRED" ||
                                    (i.status === "PENDING" && new Date(i.expiresAt) < new Date())).length,
  };

  const filtered = invites.filter((i) => filter === "all" || i.status === filter);
  const statusCfg = buildStatusConfig(t);

  const GRID_COLS = "minmax(220px, 2.6fr) 110px 100px 130px 150px";

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>

      {/* Stats summary */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
        gap: 12,
      }}>
        {[
          { label: "Total Invites", value: stats.total,    color: t.accent },
          { label: "Pending",       value: stats.pending,  color: t.amber },
          { label: "Accepted",      value: stats.accepted, color: t.green },
          { label: "Expired",       value: stats.expired,  color: t.textMuted },
        ].map((s, i) => (
          <div key={i} style={{
            padding: "16px 18px",
            borderRadius: 10,
            background: t.bgSurface,
            border: `1px solid ${t.border}`,
            position: "relative",
            overflow: "hidden",
          }}>
            <div style={{
              position: "absolute",
              left: 0, top: 0, bottom: 0,
              width: 3,
              background: s.color,
            }} />
            <div style={{
              fontSize: 10, fontWeight: 700, color: t.textMuted,
              textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 8,
            }}>
              {s.label}
            </div>
            <div style={{
              fontSize: 26, fontWeight: 800, color: t.textPrimary,
              letterSpacing: "-0.02em", lineHeight: 1,
            }}>
              {s.value}
            </div>
          </div>
        ))}
      </div>

      {/* Send invite form */}
      <div style={{
        background: t.bgSurface,
        border: `1px solid ${t.border}`,
        borderRadius: 12,
        padding: 22,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
          <div style={{
            width: 36, height: 36, borderRadius: 9,
            background: t.accentLight,
            border: `1px solid ${t.accentBorder}`,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: t.accent,
            flexShrink: 0,
          }}>
            <IconMail size={16} />
          </div>
          <div style={{ minWidth: 0 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: t.textPrimary, margin: 0, letterSpacing: "-0.01em" }}>
              Send New Invites
            </h3>
            <p style={{ fontSize: 12, color: t.textMuted, margin: "2px 0 0" }}>
              Invite students individually, in bulk, or via Excel import
            </p>
          </div>
        </div>
        <InviteForm
          simulationId={simulationId}
          theme={t}
          isDark={isDark}
          onSuccess={fetchInvites}
        />
      </div>

      {/* Invite list */}
      <div style={{
        background: t.bgSurface,
        border: `1px solid ${t.border}`,
        borderRadius: 12,
        overflow: "hidden",
      }}>
        {/* Toolbar */}
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          padding: "14px 18px", gap: 12, flexWrap: "wrap",
          borderBottom: `1px solid ${t.border}`,
          background: t.bgElevated,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 14, fontWeight: 700, color: t.textPrimary, letterSpacing: "-0.01em" }}>
              All Invitations
            </span>
            <span style={{
              padding: "2px 9px", borderRadius: 999,
              background: t.accentLight, border: `1px solid ${t.accentBorder}`,
              fontSize: 11, fontWeight: 700, color: t.accent,
              minWidth: 22, textAlign: "center",
            }}>
              {filtered.length}
            </span>
          </div>
          <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
            {[
              { id: "all",      label: "All" },
              { id: "PENDING",  label: "Pending" },
              { id: "ACCEPTED", label: "Accepted" },
              { id: "REJECTED", label: "Rejected" },
              { id: "EXPIRED",  label: "Expired" },
            ].map(({ id, label }) => {
              const active = filter === id;
              return (
                <button
                  key={id}
                  onClick={() => setFilter(id)}
                  style={{
                    padding: "6px 12px",
                    borderRadius: 7,
                    border: `1px solid ${active ? t.accentBorder : t.border}`,
                    background: active ? t.accentLight : t.bgSurface,
                    color: active ? t.accent : (t.textSec || t.textPrimary),
                    fontSize: 12, fontWeight: 600,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onMouseEnter={(e) => {
                    if (!active) e.currentTarget.style.background = t.bgElevated;
                  }}
                  onMouseLeave={(e) => {
                    if (!active) e.currentTarget.style.background = t.bgSurface;
                  }}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Error banner */}
        {error && (
          <div style={{
            padding: "10px 18px",
            background: t.redBg,
            borderBottom: `1px solid ${t.redBorder || t.red}`,
            color: t.red, fontSize: 13,
            display: "flex", justifyContent: "space-between", alignItems: "center",
          }}>
            <span>{error}</span>
            <button
              onClick={() => setError("")}
              style={{
                background: "none", border: "none", color: t.red,
                cursor: "pointer", fontSize: 18, lineHeight: 1, padding: "0 4px",
              }}
              aria-label="Dismiss error"
            >
              ×
            </button>
          </div>
        )}

        {/* Loading / empty / table */}
        {loading ? (
          <div style={{ padding: "48px 24px", textAlign: "center", color: t.textMuted, fontSize: 13 }}>
            Loading invites…
          </div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: "56px 24px", textAlign: "center" }}>
            <div style={{
              width: 52, height: 52, margin: "0 auto 14px",
              borderRadius: 12,
              background: t.bgElevated,
              border: `1px solid ${t.border}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: t.textMuted,
            }}>
              <IconInbox size={22} />
            </div>
            <p style={{ fontSize: 14, fontWeight: 700, color: t.textPrimary, margin: "0 0 6px" }}>
              {filter === "all" ? "No invitations yet" : `No ${filter.toLowerCase()} invitations`}
            </p>
            <p style={{ fontSize: 12, color: t.textMuted, lineHeight: 1.5, margin: 0 }}>
              {filter === "all"
                ? "Send your first invite using the form above."
                : "Try a different filter or send new invites."}
            </p>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            {/* Header row */}
            <div style={{
              display: "grid",
              gridTemplateColumns: GRID_COLS,
              padding: "11px 18px",
              background: t.bgElevated,
              borderBottom: `1px solid ${t.border}`,
              minWidth: 720,
            }}>
              {["Email", "Status", "Sent", "Expiry", "Actions"].map((h, i) => (
                <div key={i} style={{
                  fontSize: 11, fontWeight: 700, color: t.textMuted,
                  textTransform: "uppercase", letterSpacing: "0.08em",
                  textAlign: i === 4 ? "right" : "left",
                }}>
                  {h}
                </div>
              ))}
            </div>

            {/* Rows */}
            {filtered.map((inv, idx) => {
              const invId = idOf(inv);
              const cfg = statusCfg[inv.status] || statusCfg.PENDING;
              const exp = formatExpiry(inv.expiresAt);
              const isPending = inv.status === "PENDING";
              const isExpiredPending = isPending && new Date(inv.expiresAt) < new Date();
              const isAccepted = inv.status === "ACCEPTED";
              const isHovered = hoveredRow === invId;

              return (
                <div
                  key={invId || idx}
                  onMouseEnter={() => setHoveredRow(invId)}
                  onMouseLeave={() => setHoveredRow(null)}
                  style={{
                    display: "grid",
                    gridTemplateColumns: GRID_COLS,
                    padding: "13px 18px",
                    borderBottom: idx < filtered.length - 1 ? `1px solid ${t.border}` : "none",
                    alignItems: "center",
                    background: isHovered ? t.bgElevated : t.bgSurface,
                    transition: "background 0.12s ease",
                    minWidth: 720,
                  }}
                >
                  {/* Email */}
                  <div style={{
                    fontSize: 13, fontWeight: 600, color: t.textPrimary,
                    fontFamily: "'SF Mono','Consolas',monospace",
                    overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
                    paddingRight: 12,
                  }} title={inv.email}>
                    {inv.email}
                  </div>

                  {/* Status pill */}
                  <div>
                    <span style={{
                      display: "inline-flex", alignItems: "center", gap: 5,
                      padding: "3px 9px", borderRadius: 999,
                      fontSize: 11, fontWeight: 600,
                      color: cfg.color, background: cfg.bg,
                      border: `1px solid ${cfg.border}`,
                    }}>
                      <span style={{
                        width: 6, height: 6, borderRadius: "50%",
                        background: cfg.dot, flexShrink: 0,
                      }} />
                      {cfg.label}
                    </span>
                  </div>

                  {/* Sent */}
                  <div style={{ fontSize: 12, color: t.textMuted, fontFamily: "'SF Mono','Consolas',monospace" }}>
                    {formatRelativeTime(inv.createdAt)}
                  </div>

                  {/* Expiry */}
                  <div style={{
                    fontSize: 12,
                    color: exp.urgent ? t.red : t.textMuted,
                    fontWeight: exp.urgent ? 600 : 500,
                    fontFamily: "'SF Mono','Consolas',monospace",
                  }}>
                    {isAccepted ? "—" : exp.label}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", justifyContent: "flex-end", gap: 6 }}>
                    {isPending && (
                      <>
                        <button
                          onClick={() => handleCopy(inv)}
                          title="Copy invite link"
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            padding: "5px 10px",
                            borderRadius: 6,
                            border: `1px solid ${copiedId === invId ? t.greenBorder : t.border}`,
                            background: copiedId === invId ? t.greenBg : t.bgSurface,
                            color: copiedId === invId ? t.green : t.textMuted,
                            fontSize: 11, fontWeight: 600,
                            cursor: "pointer",
                            transition: "all 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (copiedId !== invId) {
                              e.currentTarget.style.background = t.bgElevated;
                              e.currentTarget.style.color = t.textPrimary;
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (copiedId !== invId) {
                              e.currentTarget.style.background = t.bgSurface;
                              e.currentTarget.style.color = t.textMuted;
                            }
                          }}
                        >
                          {copiedId === invId ? <IconCheck /> : <IconCopy />}
                          {copiedId === invId ? "Copied" : "Copy"}
                        </button>
                        <button
                          onClick={() => handleResend(invId)}
                          disabled={resendingId === invId}
                          title={isExpiredPending ? "Resend (window expired)" : "Resend invite"}
                          style={{
                            display: "inline-flex", alignItems: "center", gap: 4,
                            padding: "5px 10px",
                            borderRadius: 6,
                            border: `1px solid ${t.accentBorder}`,
                            background: t.accentLight,
                            color: t.accent,
                            fontSize: 11, fontWeight: 600,
                            cursor: resendingId === invId ? "wait" : "pointer",
                            opacity: resendingId === invId ? 0.6 : 1,
                            transition: "all 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            if (resendingId !== invId) {
                              e.currentTarget.style.background = t.accent;
                              e.currentTarget.style.color = "#fff";
                            }
                          }}
                          onMouseLeave={(e) => {
                            if (resendingId !== invId) {
                              e.currentTarget.style.background = t.accentLight;
                              e.currentTarget.style.color = t.accent;
                            }
                          }}
                        >
                          {resendingId === invId ? "Sending…" : (
                            <>
                              <IconRefresh />
                              Resend
                            </>
                          )}
                        </button>
                      </>
                    )}

                    {isAccepted && (
                      <span style={{
                        display: "inline-flex", alignItems: "center", gap: 4,
                        padding: "5px 10px",
                        fontSize: 11, fontWeight: 500,
                        color: t.green,
                        fontStyle: "italic",
                      }}>
                        <IconCheck size={11} />
                        Joined
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
