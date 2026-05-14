// src/app/dashboard/admin/components/InviteStudentsModal.jsx
// Quick-action modal triggered from the simulations table row.
// Wraps InviteForm in a focused modal for fast single invites without leaving
// the dashboard. Footer links to the full invite management on the simulation
// detail page for bulk imports, resending, and revoking.
//
// Props:
//   show          — boolean, controls visibility
//   onClose       — () => void
//   simulation    — { _id, name, courseCode } from the table row
//   theme (t)     — token map (LIGHT or DARK) from the admin dashboard
//   isDark        — boolean
//   onInviteSent  — optional callback after a successful send

"use client";

import { useEffect } from "react";
import Link from "next/link";
import InviteForm from "./InviteForm";

export default function InviteStudentsModal({
  show,
  onClose,
  simulation,
  theme,
  isDark,
  onInviteSent,
}) {
  const t = theme;

  // Lock body scroll while open + close on Escape
  useEffect(() => {
    if (!show) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => e.key === "Escape" && onClose?.();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = orig;
      window.removeEventListener("keydown", onKey);
    };
  }, [show, onClose]);

  if (!show || !simulation) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      style={{
        position: "fixed", inset: 0, zIndex: 60,
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        WebkitBackdropFilter: "blur(4px)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: t.bgSurface, border: `1px solid ${t.border}`,
          borderRadius: 12,
          maxWidth: 520, width: "100%",
          maxHeight: "calc(100vh - 32px)",
          display: "flex", flexDirection: "column",
          boxShadow: isDark
            ? "0 24px 48px -12px rgba(0,0,0,0.7)"
            : "0 20px 25px -5px rgba(0,0,0,0.2)",
          overflow: "hidden",
        }}
      >
        {/* Header */}
        <div style={{
          padding: "18px 22px",
          borderBottom: `1px solid ${t.border}`,
          display: "flex", alignItems: "flex-start", justifyContent: "space-between",
          gap: 12,
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <div style={{
              width: 38, height: 38, borderRadius: 8, flexShrink: 0,
              background: t.accentLight, border: `1px solid ${t.accentBorder}`,
              display: "flex", alignItems: "center", justifyContent: "center",
              color: t.accent,
            }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none"
                   stroke="currentColor" strokeWidth="2"
                   strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
            </div>
            <div style={{ minWidth: 0 }}>
              <h3 style={{
                fontSize: 16, fontWeight: 700, color: t.textPrimary,
                margin: 0, letterSpacing: "-0.01em",
              }}>
                Invite Student
              </h3>
              <p style={{
                fontSize: 12, color: t.textMuted, margin: "3px 0 0",
                whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis",
                maxWidth: 360,
              }}>
                to <strong style={{ color: t.textSec || t.textPrimary, fontWeight: 600 }}>{simulation.name}</strong>
                {simulation.courseCode && (
                  <span style={{ marginLeft: 6, color: t.textMuted, fontFamily: "'SF Mono','Consolas',monospace", fontSize: 11 }}>
                    · {simulation.courseCode}
                  </span>
                )}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            aria-label="Close"
            style={{
              background: "none", border: `1px solid ${t.border}`,
              borderRadius: 6, width: 30, height: 30,
              cursor: "pointer", color: t.textMuted,
              display: "flex", alignItems: "center", justifyContent: "center",
              flexShrink: 0,
              transition: "border-color 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = t.red;
              e.currentTarget.style.color = t.red;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = t.border;
              e.currentTarget.style.color = t.textMuted;
            }}
          >
            <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Body */}
        <div style={{ padding: "20px 22px", overflowY: "auto", flex: 1 }}>
          <InviteForm
            simulationId={simulation._id}
            theme={t}
            isDark={isDark}
            onSuccess={onInviteSent}
            compact
          />
        </div>

        {/* Footer — link to full management */}
        <div style={{
          padding: "12px 22px",
          borderTop: `1px solid ${t.border}`,
          background: t.bgElevated,
          display: "flex", alignItems: "center", justifyContent: "space-between",
          gap: 12,
        }}>
          <p style={{
            fontSize: 12, color: t.textMuted, margin: 0, lineHeight: 1.4,
          }}>
            Need bulk invites or to resend?
          </p>
          <Link href={`/dashboard/admin/simulations/${simulation._id}`} style={{ textDecoration: "none" }}>
            <button
              onClick={onClose}
              style={{
                padding: "6px 12px", borderRadius: 6,
                background: t.accentLight, border: `1px solid ${t.accentBorder}`,
                color: t.accent, fontSize: 11, fontWeight: 700,
                cursor: "pointer",
                display: "flex", alignItems: "center", gap: 4,
                transition: "background-color 0.15s, border-color 0.15s, color 0.15s",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = t.accent;
                e.currentTarget.style.color = "#fff";
                e.currentTarget.style.borderColor = t.accent;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = t.accentLight;
                e.currentTarget.style.color = t.accent;
                e.currentTarget.style.borderColor = t.accentBorder;
              }}
            >
              Full management
              <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}