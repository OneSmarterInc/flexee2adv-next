// src/app/dashboard/faculty/simulations/[id]/firm-allocation/page.js
//
// Corporate Edition. Defensive against missing/malformed response shapes:
// every read off `data` is normalised through a single shaper, so a 200
// response from the wrong handler can't crash the page anymore. If the
// shape is wrong, the user sees an empty state plus a console warning
// rather than a runtime error.

"use client";

import { useState, useEffect, useCallback, useMemo, useRef, useLayoutEffect } from "react";
import { createPortal } from "react-dom";
import { useRouter, useParams } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";

// ─── THEME TOKENS — Corporate Edition ─────────────────────────────────────────
const LIGHT = {
  bgPage: "#F3F4F6", bgSurface: "#FFFFFF", bgElevated: "#F9FAFB",
  bgHover: "#F3F4F6", border: "#E5E7EB", borderStrong: "#D1D5DB",
  textPrimary: "#111827", textSec: "#374151", textMuted: "#6B7280",
  textDisabled: "#9CA3AF",
  accent: "#1D4ED8", accentHover: "#1E40AF",
  accentLight: "#EFF6FF", accentBorder: "#BFDBFE",
  green: "#065F46", greenBg: "#D1FAE5", greenBorder: "#6EE7B7",
  amber: "#92400E", amberBg: "#FEF3C7", amberBorder: "#FCD34D",
  red: "#991B1B", redBg: "#FEE2E2", redBorder: "#FECACA",
  shadowSm: "0 1px 3px rgba(0,0,0,0.08)",
  shadowMd: "0 4px 14px rgba(0,0,0,0.10)",
  shadowLg: "0 12px 32px rgba(0,0,0,0.18)",
};
const DARK = {
  bgPage: "#0D1117", bgSurface: "#161B22", bgElevated: "#1C2128",
  bgHover: "#21262D", border: "#30363D", borderStrong: "#444C56",
  textPrimary: "#E6EDF3", textSec: "#8D96A0", textMuted: "#545D68",
  textDisabled: "#3D444D",
  accent: "#4493F8", accentHover: "#68B3FB",
  accentLight: "#1A2332", accentBorder: "#1F3A5F",
  green: "#3FB950", greenBg: "rgba(63,185,80,0.10)",
  greenBorder: "rgba(63,185,80,0.30)",
  amber: "#D29922", amberBg: "rgba(210,153,34,0.10)",
  amberBorder: "rgba(210,153,34,0.30)",
  red: "#F85149", redBg: "rgba(248,81,73,0.10)",
  redBorder: "rgba(248,81,73,0.30)",
  shadowSm: "0 1px 3px rgba(0,0,0,0.40)",
  shadowMd: "0 4px 14px rgba(0,0,0,0.50)",
  shadowLg: "0 12px 32px rgba(0,0,0,0.65)",
};

// ─── RESPONSE NORMALISER ─────────────────────────────────────────────────────
// The expected shape from /simulations/:id/enrollments:
//   { totalEnrolled: number, unplaced: Enrollment[], firms: [{firm, memberCount, enrollments}] }
//
// If we get something else (e.g. a flat enrollment list from a legacy
// endpoint, or just `{ data: [...] }` from a generic wrapper), this function
// tries to coerce it. Anything it can't fix gets defaulted to empty.
function normaliseEnrollmentsResponse(raw) {
  if (!raw || typeof raw !== "object") {
    return { totalEnrolled: 0, unplaced: [], firms: [] };
  }

  // Already correct shape — just ensure arrays exist
  if (Array.isArray(raw.unplaced) && Array.isArray(raw.firms)) {
    return {
      totalEnrolled: typeof raw.totalEnrolled === "number"
        ? raw.totalEnrolled
        : raw.unplaced.length + raw.firms.reduce(
            (s, f) => s + (f?.memberCount ?? f?.enrollments?.length ?? 0),
            0,
          ),
      unplaced: raw.unplaced,
      firms: raw.firms.map((f) => ({
        firm: f.firm ?? {},
        memberCount: typeof f.memberCount === "number"
          ? f.memberCount
          : Array.isArray(f.enrollments) ? f.enrollments.length : 0,
        enrollments: Array.isArray(f.enrollments) ? f.enrollments : [],
      })),
    };
  }

  // Fallback A: response is a bare array of enrollments. We group them
  // ourselves so the page can still render.
  if (Array.isArray(raw)) {
    return groupEnrollments(raw);
  }
  if (Array.isArray(raw.enrollments)) {
    return groupEnrollments(raw.enrollments);
  }
  if (Array.isArray(raw.data)) {
    return groupEnrollments(raw.data);
  }

  // Couldn't figure it out — warn loudly so the dev sees this in console
  console.warn(
    "[FirmAllocation] Unexpected response shape from /enrollments:",
    raw,
  );
  return { totalEnrolled: 0, unplaced: [], firms: [] };
}

// Group a flat enrollment array by firm. Used when the backend returns
// raw enrollments without the grouped structure.
function groupEnrollments(list) {
  const byFirm = new Map();
  const unplaced = [];

  for (const e of list) {
    if (!e) continue;
    const firmObj = e.firm && typeof e.firm === "object" ? e.firm : null;
    if (!firmObj || !firmObj._id && !firmObj.id) {
      unplaced.push(shapeEnrollment(e));
      continue;
    }
    const key = (firmObj.id || firmObj._id || "").toString();
    const bucket = byFirm.get(key) ?? {
      firm: {
        id: key,
        name: firmObj.name,
        firmNumber: firmObj.firmNumber,
        color: firmObj.color,
      },
      enrollments: [],
    };
    bucket.enrollments.push(shapeEnrollment(e));
    byFirm.set(key, bucket);
  }

  const firms = Array.from(byFirm.values()).map((g) => ({
    firm: g.firm,
    memberCount: g.enrollments.length,
    enrollments: g.enrollments,
  }));

  return {
    totalEnrolled: list.length,
    unplaced,
    firms,
  };
}

function shapeEnrollment(e) {
  return {
    id: (e._id || e.id || "").toString(),
    user: {
      id: (e.user?._id || e.user?.id || "").toString(),
      email: e.user?.email ?? null,
      firstName: e.user?.firstName ?? null,
      lastName: e.user?.lastName ?? null,
    },
  };
}

export default function FirmAllocationPage() {
  const { isDark } = useTheme();
  const t = isDark ? DARK : LIGHT;
  const router = useRouter();
  const params = useParams();
  const simulationId = params.id;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busyId, setBusyId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [pickerOpenFor, setPickerOpenFor] = useState(null);
  const [search, setSearch] = useState("");

  const getToken = () => localStorage.getItem("access_token");

  const fetchEnrollments = useCallback(async () => {
    try {
      const res = await fetch(
        `${apiUrl}/simulations/${simulationId}/enrollments`,
        { headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" } },
      );
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || `HTTP ${res.status}`);
      }
      const json = await res.json();
      // Coerce into the shape the page expects. Crucially, this guarantees
      // `unplaced` and `firms` are always arrays after this point.
      setData(normaliseEnrollmentsResponse(json));
      setError("");
    } catch (e) {
      setError(e.message || "Could not load enrollments.");
    } finally {
      setLoading(false);
    }
  }, [apiUrl, simulationId]);

  useEffect(() => { fetchEnrollments(); }, [fetchEnrollments]);

  useEffect(() => {
    if (!pickerOpenFor) return;
    const onKey = (e) => { if (e.key === "Escape") setPickerOpenFor(null); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [pickerOpenFor]);

  const placeInFirm = async (enrollmentId, studentUserId, firmId) => {
    setBusyId(enrollmentId);
    setError(""); setPickerOpenFor(null);
    try {
      const res = await fetch(
        `${apiUrl}/simulations/${simulationId}/firms/enroll`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${getToken()}`,
            "Content-Type": "application/json",
            Accept: "*/*",
          },
          body: JSON.stringify({
            firmId,
            students: [{ studentId: studentUserId, role: "TEAM_MEMBER" }],
            canSubmitDecisions: true,
            canViewReports: true,
          }),
        },
      );
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || "Couldn't place student.");
      }
      setSuccess("Student placed.");
      setTimeout(() => setSuccess(""), 1800);
      await fetchEnrollments();
    } catch (e) {
      setError(e.message || "Place failed.");
    } finally {
      setBusyId(null);
    }
  };

  const unassign = async (enrollmentId) => {
    setBusyId(enrollmentId);
    setError(""); setPickerOpenFor(null);
    try {
      const res = await fetch(
        `${apiUrl}/simulations/${simulationId}/enrollments/${enrollmentId}/firm`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${getToken()}`, Accept: "*/*" },
        },
      );
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.message || "Couldn't unassign.");
      }
      setSuccess("Student returned to unplaced.");
      setTimeout(() => setSuccess(""), 1800);
      await fetchEnrollments();
    } catch (e) {
      setError(e.message || "Unassign failed.");
    } finally {
      setBusyId(null);
    }
  };

  // Safe accessors — never throw even if the shaper missed something
  const unplaced = data?.unplaced ?? [];
  const firms = data?.firms ?? [];
  const totalEnrolled = data?.totalEnrolled ?? 0;

  const autoDistribute = async () => {
    if (unplaced.length === 0 || firms.length === 0) return;
    if (!confirm(
      `Place all ${unplaced.length} unplaced students into firms using round-robin?`,
    )) return;

    setError("");
    const firmIds = firms.map(f => f.firm.id);
    const sizes = firms.map(f => f.memberCount);
    const assignments = [];
    for (const enrollment of unplaced) {
      const minIdx = sizes.indexOf(Math.min(...sizes));
      assignments.push({ enrollment, firmId: firmIds[minIdx] });
      sizes[minIdx]++;
    }

    setBusyId("__BULK__");
    let placed = 0;
    for (const a of assignments) {
      try {
        const res = await fetch(
          `${apiUrl}/simulations/${simulationId}/firms/enroll`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${getToken()}`,
              "Content-Type": "application/json",
              Accept: "*/*",
            },
            body: JSON.stringify({
              firmId: a.firmId,
              students: [{ studentId: a.enrollment.user.id, role: "TEAM_MEMBER" }],
              canSubmitDecisions: true,
              canViewReports: true,
            }),
          },
        );
        if (res.ok) placed++;
      } catch { }
    }
    setBusyId(null);
    setSuccess(`Placed ${placed} of ${assignments.length} students.`);
    setTimeout(() => setSuccess(""), 2500);
    await fetchEnrollments();
  };

  const filteredUnplaced = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return unplaced;
    return unplaced.filter(e => {
      const u = e.user || {};
      return (u.email || "").toLowerCase().includes(q)
          || (u.firstName || "").toLowerCase().includes(q)
          || (u.lastName || "").toLowerCase().includes(q);
    });
  }, [unplaced, search]);

  if (loading) {
    return (
      <div style={{ minHeight: "100vh", background: t.bgPage, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div className="spinner" style={{
          width: 36, height: 36, borderRadius: "50%",
          border: `3px solid ${t.border}`, borderTopColor: t.accent,
        }} />
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}.spinner{animation:spin .8s linear infinite}`}</style>
      </div>
    );
  }

  if (!data) {
    return (
      <div style={{ padding: 24, color: t.red }}>
        Couldn't load enrollment data. {error}
      </div>
    );
  }

  const totalPlaced = firms.reduce((sum, f) => sum + (f.memberCount ?? 0), 0);

  return (
    <div style={{
      minHeight: "100vh", background: t.bgPage, color: t.textPrimary,
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    }}>
      <div style={{ maxWidth: 1280, margin: "0 auto", padding: "32px 24px 60px" }}>

        {/* Header */}
        <div style={{ marginBottom: 24, display: "flex", justifyContent: "space-between", alignItems: "flex-end", flexWrap: "wrap", gap: 12 }}>
          <div>
            <button
              onClick={() => router.push(`/dashboard/faculty/simulations/${simulationId}`)}
              style={{
                background: "none", border: "none", padding: 0,
                color: t.textMuted, fontSize: 12, cursor: "pointer",
                marginBottom: 8, display: "inline-flex", alignItems: "center", gap: 4,
              }}
            >
              ← Back to simulation
            </button>
            <h1 style={{ fontSize: 26, fontWeight: 800, letterSpacing: "-0.02em", margin: 0 }}>
              Firm Allocation
            </h1>
            <p style={{ fontSize: 13, color: t.textMuted, marginTop: 6, lineHeight: 1.5 }}>
              Place students into firms. Students who accepted the invite but aren't yet on a team appear at the top.
            </p>
          </div>

          {unplaced.length > 0 && firms.length > 0 && (
            <button
              onClick={autoDistribute}
              disabled={busyId === "__BULK__"}
              style={{
                padding: "9px 16px", borderRadius: 8,
                border: `1px solid ${t.accentBorder}`,
                background: t.accentLight, color: t.accent,
                fontSize: 13, fontWeight: 700,
                cursor: busyId === "__BULK__" ? "wait" : "pointer",
                transition: "all 0.15s",
              }}
            >
              {busyId === "__BULK__" ? "Distributing…" : "Auto-distribute all"}
            </button>
          )}
        </div>

        {/* Stats */}
        <div style={{
          display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
          gap: 12, marginBottom: 24,
        }}>
          <StatCard label="Total Enrolled" value={totalEnrolled} t={t} />
          <StatCard label="Placed" value={totalPlaced} t={t} accent={t.green} />
          <StatCard label="Unplaced" value={unplaced.length} t={t} accent={unplaced.length > 0 ? t.amber : t.textMuted} />
          <StatCard label="Firms" value={firms.length} t={t} accent={t.accent} />
        </div>

        {error && <Banner tone="red" t={t} onDismiss={() => setError("")}>{error}</Banner>}
        {success && <Banner tone="green" t={t} onDismiss={() => setSuccess("")}>{success}</Banner>}

        {/* Awaiting placement */}
        <section style={{ marginBottom: 28 }}>
          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            marginBottom: 12, flexWrap: "wrap", gap: 8,
          }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: 0, letterSpacing: "-0.01em" }}>
                Awaiting placement
              </h2>
              <span style={{
                padding: "2px 9px", borderRadius: 999,
                background: unplaced.length > 0 ? t.amberBg : t.bgElevated,
                border: `1px solid ${unplaced.length > 0 ? t.amberBorder : t.border}`,
                fontSize: 11, fontWeight: 700,
                color: unplaced.length > 0 ? t.amber : t.textMuted,
              }}>
                {unplaced.length}
              </span>
            </div>
            {unplaced.length > 6 && (
              <input
                placeholder="Search by name or email…"
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{
                  padding: "7px 12px", borderRadius: 8,
                  border: `1px solid ${t.borderStrong}`,
                  background: t.bgSurface, color: t.textPrimary,
                  fontSize: 13, width: 240, outline: "none",
                  fontFamily: "inherit",
                }}
              />
            )}
          </div>

          {unplaced.length === 0 ? (
            <div style={{
              padding: "32px 24px",
              background: t.bgSurface, border: `1px solid ${t.border}`,
              borderRadius: 12, textAlign: "center",
            }}>
              <div style={{
                width: 44, height: 44, margin: "0 auto 10px", borderRadius: 10,
                background: t.greenBg, border: `1px solid ${t.greenBorder}`,
                display: "flex", alignItems: "center", justifyContent: "center",
                color: t.green,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <p style={{ fontSize: 14, fontWeight: 600, color: t.textPrimary, marginBottom: 4 }}>
                Everyone's placed.
              </p>
              <p style={{ fontSize: 12, color: t.textMuted }}>
                As more students accept invites, they'll show up here.
              </p>
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
              gap: 10,
            }}>
              {filteredUnplaced.map(e => (
                <StudentCard
                  key={e.id}
                  enrollment={e}
                  t={t}
                  busy={busyId === e.id}
                  pickerOpen={pickerOpenFor === e.id}
                  onTogglePicker={() => setPickerOpenFor(pickerOpenFor === e.id ? null : e.id)}
                  onClosePicker={() => setPickerOpenFor(null)}
                  firms={firms}
                  onPlaceInFirm={(firmId) => placeInFirm(e.id, e.user.id, firmId)}
                  variant="UNPLACED"
                />
              ))}
            </div>
          )}
        </section>

        {/* Firms */}
        <section>
          <h2 style={{ fontSize: 15, fontWeight: 700, margin: "0 0 12px", letterSpacing: "-0.01em" }}>
            Firms
          </h2>

          {firms.length === 0 ? (
            <div style={{
              padding: "32px 24px",
              background: t.bgSurface, border: `1px solid ${t.border}`,
              borderRadius: 12, textAlign: "center", color: t.textMuted, fontSize: 13,
            }}>
              No firms exist for this simulation yet.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              {firms.map(f => (
                <FirmCard
                  key={f.firm.id}
                  firm={f}
                  t={t}
                  busyId={busyId}
                  pickerOpenFor={pickerOpenFor}
                  setPickerOpenFor={setPickerOpenFor}
                  allFirms={firms}
                  onMoveToFirm={(enrollmentId, userId, targetFirmId) => placeInFirm(enrollmentId, userId, targetFirmId)}
                  onUnassign={unassign}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
        .spinner { animation: spin 0.8s linear infinite; }
        @keyframes popoverFadeIn {
          from { opacity: 0; transform: translateY(-2px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

// ─── StatCard ─────────────────────────────────────────────────────────────
function StatCard({ label, value, t, accent }) {
  return (
    <div style={{
      padding: "14px 16px", borderRadius: 10,
      background: t.bgSurface, border: `1px solid ${t.border}`,
      position: "relative", overflow: "hidden",
    }}>
      {accent && (
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: 3, background: accent }} />
      )}
      <div style={{ fontSize: 10, fontWeight: 700, color: t.textMuted, textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 800, color: t.textPrimary, letterSpacing: "-0.02em", lineHeight: 1 }}>
        {value}
      </div>
    </div>
  );
}

// ─── Banner ────────────────────────────────────────────────────────────────────
function Banner({ tone, t, children, onDismiss }) {
  const tint = tone === "red"   ? { bg: t.redBg,   border: t.redBorder,   color: t.red }
            : tone === "green" ? { bg: t.greenBg, border: t.greenBorder, color: t.green }
            : tone === "amber" ? { bg: t.amberBg, border: t.amberBorder, color: t.amber }
            : { bg: t.bgElevated, border: t.border, color: t.textMuted };
  return (
    <div style={{
      padding: "10px 14px", marginBottom: 16,
      background: tint.bg, border: `1px solid ${tint.border}`,
      borderRadius: 8, color: tint.color, fontSize: 13,
      display: "flex", justifyContent: "space-between", alignItems: "center",
    }}>
      <span>{children}</span>
      {onDismiss && (
        <button onClick={onDismiss} style={{
          background: "none", border: "none", color: tint.color,
          fontSize: 16, lineHeight: 1, cursor: "pointer", padding: "0 4px",
        }}>×</button>
      )}
    </div>
  );
}

// ─── StudentCard ─────────────────────────────────────────────────────────
function StudentCard({
  enrollment, t, busy, pickerOpen, onTogglePicker, onClosePicker,
  firms, onPlaceInFirm, variant, onUnassign, currentFirmId,
}) {
  const u = enrollment.user || {};
  const fullName = `${u.firstName || ""} ${u.lastName || ""}`.trim() || u.email || "Unknown";
  const initials = (u.firstName?.[0] || u.email?.[0] || "?").toUpperCase()
    + (u.lastName?.[0] || "").toUpperCase();
  const buttonRef = useRef(null);

  return (
    <div style={{
      padding: "12px 14px",
      background: t.bgSurface, border: `1px solid ${t.border}`,
      borderRadius: 10,
      opacity: busy ? 0.6 : 1,
      transition: "opacity 0.15s, border-color 0.15s",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <div style={{
          width: 36, height: 36, borderRadius: "50%", flexShrink: 0,
          background: t.accent, color: "#fff",
          display: "flex", alignItems: "center", justifyContent: "center",
          fontSize: 12, fontWeight: 700, letterSpacing: "0.02em",
        }}>
          {initials}
        </div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{
            fontSize: 13, fontWeight: 700, color: t.textPrimary,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
          }}>
            {fullName}
          </div>
          <div style={{
            fontSize: 11, color: t.textMuted, marginTop: 1,
            overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap",
            fontFamily: "'SF Mono','Consolas',monospace",
          }}>
            {u.email}
          </div>
        </div>
        <button
          ref={buttonRef}
          onClick={onTogglePicker}
          disabled={busy}
          style={{
            padding: "5px 11px", borderRadius: 6,
            border: `1px solid ${t.accentBorder}`,
            background: variant === "UNPLACED" ? t.accent : t.accentLight,
            color: variant === "UNPLACED" ? "#fff" : t.accent,
            fontSize: 11, fontWeight: 700,
            cursor: busy ? "wait" : "pointer", flexShrink: 0,
            transition: "all 0.15s",
          }}
        >
          {variant === "UNPLACED" ? "Place" : "Move"}
        </button>
      </div>

      {pickerOpen && (
        <FirmPickerPortal
          anchorRef={buttonRef}
          onClose={onClosePicker}
          firms={firms}
          t={t}
          excludeFirmId={currentFirmId}
          onPick={onPlaceInFirm}
          onUnassign={variant === "PLACED" ? () => onUnassign(enrollment.id) : null}
        />
      )}
    </div>
  );
}

// ─── FirmPickerPortal ──────────────────────────────────────────────────────
function FirmPickerPortal({ anchorRef, onClose, firms, t, excludeFirmId, onPick, onUnassign }) {
  const popRef = useRef(null);
  const [pos, setPos] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => { setMounted(true); }, []);

  const reposition = useCallback(() => {
    if (!anchorRef.current) return;
    const btn = anchorRef.current.getBoundingClientRect();
    const POPOVER_HEIGHT_ESTIMATE = Math.min(360, 44 + firms.length * 38 + (onUnassign ? 40 : 0));
    const POPOVER_WIDTH = 240;
    const GAP = 6;
    const MARGIN = 8;

    const spaceBelow = window.innerHeight - btn.bottom;
    const spaceAbove = btn.top;
    const flipUp = spaceBelow < POPOVER_HEIGHT_ESTIMATE + GAP && spaceAbove > spaceBelow;

    let left = btn.right - POPOVER_WIDTH;
    if (left < MARGIN) left = MARGIN;
    if (left + POPOVER_WIDTH > window.innerWidth - MARGIN) {
      left = window.innerWidth - POPOVER_WIDTH - MARGIN;
    }

    const top = flipUp
      ? Math.max(MARGIN, btn.top - POPOVER_HEIGHT_ESTIMATE - GAP)
      : btn.bottom + GAP;

    const maxHeight = flipUp
      ? btn.top - GAP - MARGIN
      : window.innerHeight - btn.bottom - GAP - MARGIN;

    setPos({ top, left, width: POPOVER_WIDTH, maxHeight, flipUp });
  }, [anchorRef, firms.length, onUnassign]);

  useLayoutEffect(() => { reposition(); }, [reposition]);

  useEffect(() => {
    const onDown = (e) => {
      if (!popRef.current || !anchorRef.current) return;
      if (popRef.current.contains(e.target)) return;
      if (anchorRef.current.contains(e.target)) return;
      onClose();
    };
    const onScrollOrResize = () => reposition();

    document.addEventListener("mousedown", onDown);
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);

    return () => {
      document.removeEventListener("mousedown", onDown);
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [reposition, anchorRef, onClose]);

  if (!mounted || !pos) return null;

  return createPortal(
    <div
      ref={popRef}
      style={{
        position: "fixed",
        top: pos.top, left: pos.left, width: pos.width,
        maxHeight: pos.maxHeight, overflowY: "auto",
        background: t.bgSurface,
        border: `1px solid ${t.borderStrong}`,
        borderRadius: 8,
        boxShadow: t.shadowLg,
        zIndex: 1000,
        animation: "popoverFadeIn 0.12s ease-out",
      }}
      role="menu"
    >
      <div style={{
        position: "sticky", top: 0,
        padding: "8px 12px",
        background: t.bgElevated, borderBottom: `1px solid ${t.border}`,
        fontSize: 10, fontWeight: 700, color: t.textMuted,
        textTransform: "uppercase", letterSpacing: "0.08em",
      }}>
        Choose firm
      </div>
      {firms.map(f => {
        const firm = f.firm;
        const disabled = firm.id === excludeFirmId;
        return (
          <button
            key={firm.id}
            onClick={() => !disabled && onPick(firm.id)}
            disabled={disabled}
            style={{
              display: "flex", alignItems: "center", gap: 10,
              width: "100%", padding: "9px 12px",
              border: "none", background: "none",
              cursor: disabled ? "not-allowed" : "pointer",
              opacity: disabled ? 0.4 : 1,
              fontSize: 13, color: t.textPrimary, textAlign: "left",
              transition: "background 0.12s",
            }}
            onMouseEnter={e => { if (!disabled) e.currentTarget.style.background = t.bgHover; }}
            onMouseLeave={e => { if (!disabled) e.currentTarget.style.background = "transparent"; }}
          >
            <span style={{
              width: 12, height: 12, borderRadius: 3,
              background: firm.color || t.accent, flexShrink: 0,
            }} />
            <span style={{ flex: 1, fontWeight: 600 }}>{firm.name}</span>
            <span style={{
              fontSize: 11, color: t.textMuted,
              padding: "1px 7px", borderRadius: 999,
              background: t.bgElevated, border: `1px solid ${t.border}`,
            }}>
              {f.memberCount}
            </span>
          </button>
        );
      })}
      {onUnassign && (
        <button
          onClick={onUnassign}
          style={{
            display: "flex", alignItems: "center", gap: 10,
            width: "100%", padding: "9px 12px",
            border: "none", borderTop: `1px solid ${t.border}`,
            background: "none", cursor: "pointer",
            fontSize: 13, color: t.red, textAlign: "left",
            fontWeight: 600,
            transition: "background 0.12s",
          }}
          onMouseEnter={e => e.currentTarget.style.background = t.redBg}
          onMouseLeave={e => e.currentTarget.style.background = "transparent"}
        >
          Return to unplaced
        </button>
      )}
    </div>,
    document.body,
  );
}

// ─── FirmCard ──────────────────────────────────────────────────────────────
function FirmCard({ firm, t, busyId, pickerOpenFor, setPickerOpenFor, allFirms, onMoveToFirm, onUnassign }) {
  const f = firm.firm;
  const enrollments = firm.enrollments ?? [];
  return (
    <div style={{
      background: t.bgSurface,
      border: `1px solid ${t.border}`,
      borderRadius: 12,
    }}>
      <div style={{
        padding: "14px 18px",
        borderTopLeftRadius: 12, borderTopRightRadius: 12,
        borderBottom: `1px solid ${t.border}`,
        background: t.bgElevated,
        display: "flex", alignItems: "center", justifyContent: "space-between",
        flexWrap: "wrap", gap: 10,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 32, height: 32, borderRadius: 8,
            background: f.color || t.accent, flexShrink: 0,
            display: "flex", alignItems: "center", justifyContent: "center",
            color: "#fff", fontSize: 12, fontWeight: 800,
          }}>
            {f.firmNumber}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: t.textPrimary, letterSpacing: "-0.01em" }}>
              {f.name}
            </div>
            <div style={{ fontSize: 11, color: t.textMuted, marginTop: 1 }}>
              Firm {f.firmNumber}
            </div>
          </div>
        </div>
        <span style={{
          padding: "3px 10px", borderRadius: 999,
          background: firm.memberCount > 0 ? t.greenBg : t.bgElevated,
          border: `1px solid ${firm.memberCount > 0 ? t.greenBorder : t.border}`,
          fontSize: 11, fontWeight: 700,
          color: firm.memberCount > 0 ? t.green : t.textMuted,
        }}>
          {firm.memberCount} {firm.memberCount === 1 ? "member" : "members"}
        </span>
      </div>

      {enrollments.length === 0 ? (
        <div style={{
          padding: "28px 24px", textAlign: "center", color: t.textMuted, fontSize: 12,
          borderBottomLeftRadius: 12, borderBottomRightRadius: 12,
        }}>
          No members yet. Place students from the unplaced pool above.
        </div>
      ) : (
        <div style={{
          padding: 12,
          display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 10,
          borderBottomLeftRadius: 12, borderBottomRightRadius: 12,
        }}>
          {enrollments.map(e => (
            <StudentCard
              key={e.id}
              enrollment={e}
              t={t}
              busy={busyId === e.id}
              pickerOpen={pickerOpenFor === e.id}
              onTogglePicker={() => setPickerOpenFor(pickerOpenFor === e.id ? null : e.id)}
              onClosePicker={() => setPickerOpenFor(null)}
              firms={allFirms}
              onPlaceInFirm={(firmId) => onMoveToFirm(e.id, e.user.id, firmId)}
              onUnassign={onUnassign}
              variant="PLACED"
              currentFirmId={f.id}
            />
          ))}
        </div>
      )}
    </div>
  );
}