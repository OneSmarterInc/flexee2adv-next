// src/app/dashboard/admin/components/InviteForm.jsx
// Shared invite form used by both the quick-action modal and the
// simulation detail management panel. Three tabs:
//   1. Single   — POST /onboarding/invite
//   2. Bulk     — POST /onboarding/bulk-invite (comma/newline-separated emails)
//   3. Excel    — POST /onboarding/import-excel (file upload)
//
// All paths use SINGULAR /onboarding to match the deployed controller.
//
// Props:
//   simulationId  — required, scope of the invites
//   theme (t)     — token map (LIGHT or DARK)
//   isDark        — boolean
//   onSuccess     — () => void, called after a successful send
//   compact       — boolean, true inside modal

"use client";

import { useState, useRef } from "react";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function parseEmails(text) {
  const seen = new Set();
  const valid = [];
  const invalid = [];
  text
    .split(/[\s,;]+/)
    .map((e) => e.trim().toLowerCase())
    .filter(Boolean)
    .forEach((e) => {
      if (seen.has(e)) return;
      seen.add(e);
      (EMAIL_RE.test(e) ? valid : invalid).push(e);
    });
  return { valid, invalid };
}

export default function InviteForm({
  simulationId,
  theme,
  isDark,
  onSuccess,
  compact = false,
}) {
  const t = theme;
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  const getToken = () => localStorage.getItem("access_token");

  const [tab, setTab] = useState("single");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resultDetails, setResultDetails] = useState(null);

  const [singleEmail, setSingleEmail] = useState("");
  const [bulkText, setBulkText] = useState("");
  const [excelFile, setExcelFile] = useState(null);
  const [inviteMessage, setInviteMessage] = useState("");
  const fileInputRef = useRef(null);

  const bulkParsed = tab === "bulk" ? parseEmails(bulkText) : { valid: [], invalid: [] };

  const reset = () => {
    setSingleEmail("");
    setBulkText("");
    setExcelFile(null);
    setInviteMessage("");
    if (fileInputRef.current) fileInputRef.current.value = "";
    setError("");
    setSuccess("");
    setResultDetails(null);
  };

  // ─── Submit handlers — all hit /onboarding (singular) ─────────────────────
  const submitSingle = async () => {
    const email = singleEmail.trim().toLowerCase();
    if (!EMAIL_RE.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    setLoading(true); setError(""); setSuccess(""); setResultDetails(null);
    try {
      const res = await fetch(`${apiUrl}/onboarding/invite`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
          Accept: "*/*",
        },
        body: JSON.stringify({
          simulationId,
          email,
          inviteMessage: inviteMessage.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to send invite.");
      setSuccess(data.message || `Invite sent to ${email}`);
      setSingleEmail(""); setInviteMessage("");
      onSuccess?.();
    } catch (e) {
      setError(e.message || "Network error.");
    } finally {
      setLoading(false);
    }
  };

  const submitBulk = async () => {
    const { valid, invalid } = parseEmails(bulkText);
    if (valid.length === 0) {
      setError("Please enter at least one valid email address.");
      return;
    }
    setLoading(true); setError(""); setSuccess(""); setResultDetails(null);
    try {
      const res = await fetch(`${apiUrl}/onboarding/bulk-invite`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          "Content-Type": "application/json",
          Accept: "*/*",
        },
        body: JSON.stringify({
          simulationId,
          emails: valid,
          inviteMessage: inviteMessage.trim() || undefined,
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to send invites.");
      const summary = data.summary || {};
      setSuccess(
        `${summary.successCount || 0} of ${summary.total || valid.length} invites sent successfully.`,
      );
      setResultDetails({
        successful: data.successful || [],
        failed: data.failed || [],
        clientInvalid: invalid,
      });
      if ((summary.successCount || 0) > 0) {
        setBulkText("");
        setInviteMessage("");
        onSuccess?.();
      }
    } catch (e) {
      setError(e.message || "Network error.");
    } finally {
      setLoading(false);
    }
  };

  const submitExcel = async () => {
    if (!excelFile) {
      setError("Please choose an Excel file to upload.");
      return;
    }
    setLoading(true); setError(""); setSuccess(""); setResultDetails(null);
    try {
      const fd = new FormData();
      fd.append("file", excelFile);
      fd.append("simulationId", simulationId);
      if (inviteMessage.trim()) fd.append("inviteMessage", inviteMessage.trim());

      const res = await fetch(`${apiUrl}/onboarding/import-excel`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${getToken()}`,
          Accept: "*/*",
        },
        body: fd,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.message || "Failed to import Excel.");
      const summary = data.summary || {};
      setSuccess(
        `${summary.successCount || 0} of ${summary.total || 0} rows imported successfully.`,
      );
      setResultDetails({
        successful: data.successful || [],
        failed: data.failed || [],
        bulkImportId: data.bulkImportId,
      });
      if ((summary.successCount || 0) > 0) {
        setExcelFile(null);
        setInviteMessage("");
        if (fileInputRef.current) fileInputRef.current.value = "";
        onSuccess?.();
      }
    } catch (e) {
      setError(e.message || "Network error.");
    } finally {
      setLoading(false);
    }
  };

  // Template endpoint is GET, not POST. Backend streams an xlsx blob.
  const downloadTemplate = async () => {
    try {
      const res = await fetch(`${apiUrl}/onboarding/download-template`, {
        method: "GET",
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) throw new Error("Failed to download template.");
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "student-invites-template.xlsx";
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (e) {
      setError(e.message || "Could not download template.");
    }
  };

  const submit = () => {
    if (tab === "single") submitSingle();
    else if (tab === "bulk") submitBulk();
    else submitExcel();
  };

  // ─── Styles ─────────────────────────────────────────────────────────────────
  const inputStyle = {
    width: "100%", boxSizing: "border-box",
    padding: compact ? "8px 11px" : "9px 12px",
    borderRadius: 8,
    border: `1px solid ${t.border || t.inputBorder}`,
    background: t.bgSurface || t.inputBg,
    color: t.textPrimary,
    fontSize: compact ? 13 : 14,
    outline: "none", transition: "border-color 0.15s",
    fontFamily: "inherit",
  };
  const labelStyle = {
    display: "block", fontSize: 12, fontWeight: 600,
    color: t.textPrimary, marginBottom: 6,
  };
  const hintStyle = { fontSize: 11, color: t.textMuted, marginTop: 5, lineHeight: 1.5 };
  const tabStyle = (active) => ({
    flex: 1,
    padding: "9px 14px",
    fontSize: 13, fontWeight: 600,
    background: active ? (t.accentLight || t.bgElevated) : "transparent",
    color: active ? t.accent : t.textMuted,
    border: "none",
    borderBottom: `2px solid ${active ? t.accent : "transparent"}`,
    cursor: "pointer",
    transition: "all 0.15s",
    display: "flex", alignItems: "center", justifyContent: "center", gap: 6,
  });

  const canSubmit = !loading && (
    (tab === "single" && singleEmail.trim().length > 0) ||
    (tab === "bulk"   && bulkParsed.valid.length > 0) ||
    (tab === "excel"  && excelFile != null)
  );

  // ─── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: compact ? 14 : 16 }}>

      {/* Tabs */}
      <div style={{
        display: "flex",
        background: t.bgElevated,
        borderRadius: 10,
        padding: 3,
        border: `1px solid ${t.border}`,
      }}>
        {[
          { id: "single", label: "Single", icon: "👤" },
          { id: "bulk",   label: "Bulk",   icon: "📋" },
          { id: "excel",  label: "Excel",  icon: "📊" },
        ].map(({ id, label, icon }) => (
          <button
            key={id}
            type="button"
            onClick={() => { setTab(id); reset(); }}
            style={{
              ...tabStyle(tab === id),
              borderRadius: 8,
              borderBottom: "none",
            }}
          >
            <span style={{ fontSize: 14 }}>{icon}</span> {label}
          </button>
        ))}
      </div>

      {/* Single tab */}
      {tab === "single" && (
        <div>
          <label style={labelStyle}>Student Email</label>
          <input
            type="email"
            style={inputStyle}
            placeholder="student@university.edu"
            value={singleEmail}
            onChange={(e) => setSingleEmail(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && canSubmit && submit()}
            autoFocus
          />
          <p style={hintStyle}>
            They'll receive an email with a link to join. The invite expires in 30 days.
          </p>
        </div>
      )}

      {/* Bulk tab */}
      {tab === "bulk" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Email Addresses</label>
            {bulkText.trim().length > 0 && (
              <div style={{ display: "flex", gap: 6, fontSize: 11, fontWeight: 600 }}>
                <span style={{
                  padding: "2px 8px", borderRadius: 999,
                  background: t.greenBg, color: t.green,
                  border: `1px solid ${t.greenBorder || "transparent"}`,
                }}>
                  {bulkParsed.valid.length} valid
                </span>
                {bulkParsed.invalid.length > 0 && (
                  <span style={{
                    padding: "2px 8px", borderRadius: 999,
                    background: t.redBg, color: t.red,
                    border: `1px solid ${t.redBorder || "transparent"}`,
                  }}>
                    {bulkParsed.invalid.length} invalid
                  </span>
                )}
              </div>
            )}
          </div>
          <textarea
            style={{ ...inputStyle, minHeight: 110, resize: "vertical", lineHeight: 1.6, fontFamily: "'SF Mono','Consolas',monospace", fontSize: 12 }}
            placeholder={"alice@uni.edu\nbob@uni.edu, charlie@uni.edu\ndana@uni.edu"}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
          />
          <p style={hintStyle}>
            Separate emails with commas, spaces, or newlines. Duplicates are removed automatically.
          </p>
          {bulkParsed.invalid.length > 0 && (
            <div style={{
              marginTop: 8, padding: "8px 10px", borderRadius: 6,
              background: t.redBg, border: `1px solid ${t.redBorder || t.red}`,
              fontSize: 11, color: t.red, lineHeight: 1.5,
            }}>
              <strong>Skipped (invalid format):</strong>{" "}
              {bulkParsed.invalid.slice(0, 5).join(", ")}
              {bulkParsed.invalid.length > 5 && ` +${bulkParsed.invalid.length - 5} more`}
            </div>
          )}
        </div>
      )}

      {/* Excel tab */}
      {tab === "excel" && (
        <div>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
            <label style={{ ...labelStyle, marginBottom: 0 }}>Excel File</label>
            <button
              type="button"
              onClick={downloadTemplate}
              style={{
                background: "none", border: "none", cursor: "pointer",
                color: t.accent, fontSize: 11, fontWeight: 600,
                display: "flex", alignItems: "center", gap: 4,
                padding: 0,
              }}
            >
              <svg width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 15V3"/>
              </svg>
              Download template
            </button>
          </div>

          <label style={{
            display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
            padding: "20px 16px",
            border: `1.5px dashed ${excelFile ? t.green : t.borderStrong || t.border}`,
            borderRadius: 10,
            background: excelFile ? t.greenBg : t.bgElevated,
            cursor: "pointer",
            transition: "all 0.15s",
            textAlign: "center",
          }}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
              onChange={(e) => setExcelFile(e.target.files?.[0] || null)}
              style={{ display: "none" }}
            />
            {excelFile ? (
              <>
                <div style={{ fontSize: 22, marginBottom: 6 }}>📄</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.green, marginBottom: 2 }}>
                  {excelFile.name}
                </div>
                <div style={{ fontSize: 11, color: t.textMuted }}>
                  {(excelFile.size / 1024).toFixed(1)} KB — click to choose a different file
                </div>
              </>
            ) : (
              <>
                <div style={{ fontSize: 22, marginBottom: 6 }}>📊</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: t.textPrimary, marginBottom: 4 }}>
                  Click to upload Excel file
                </div>
                <div style={{ fontSize: 11, color: t.textMuted }}>
                  .xlsx or .xls — must include an Email column
                </div>
              </>
            )}
          </label>
          <p style={hintStyle}>
            Use the template if you're not sure of the format. Rows with invalid emails will be skipped and reported.
          </p>
        </div>
      )}

      {/* Optional invite message */}
      <div>
        <label style={labelStyle}>
          Invite Message <span style={{ color: t.textMuted, fontWeight: 500 }}>(optional)</span>
        </label>
        <textarea
          style={{ ...inputStyle, minHeight: 60, resize: "vertical", lineHeight: 1.5 }}
          placeholder="Add a personal note that students will see in the invitation email…"
          value={inviteMessage}
          onChange={(e) => setInviteMessage(e.target.value)}
          maxLength={500}
        />
      </div>

      {/* Error / success */}
      {error && (
        <div style={{
          padding: "10px 12px", borderRadius: 8,
          background: t.redBg, border: `1px solid ${t.redBorder || t.red}`,
          color: t.red, fontSize: 13, lineHeight: 1.5,
        }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{
          padding: "10px 12px", borderRadius: 8,
          background: t.greenBg, border: `1px solid ${t.greenBorder || t.green}`,
          color: t.green, fontSize: 13, lineHeight: 1.5, fontWeight: 600,
        }}>
          ✓ {success}
        </div>
      )}

      {/* Result breakdown */}
      {resultDetails && (resultDetails.failed?.length > 0 || resultDetails.clientInvalid?.length > 0) && (
        <div style={{
          padding: "10px 12px", borderRadius: 8,
          background: t.amberBg || t.bgElevated,
          border: `1px solid ${t.amberBorder || t.border}`,
          fontSize: 12, color: t.textPrimary, lineHeight: 1.6,
        }}>
          <div style={{ fontWeight: 700, marginBottom: 6, color: t.amber }}>
            Some entries were not sent:
          </div>
          <ul style={{ margin: 0, paddingLeft: 18, color: t.textSec || t.textPrimary, maxHeight: 140, overflowY: "auto" }}>
            {resultDetails.clientInvalid?.map((e, i) => (
              <li key={`ci-${i}`}><code style={{ fontSize: 11 }}>{e}</code> — invalid email format</li>
            ))}
            {resultDetails.failed?.map((f, i) => (
              <li key={`f-${i}`}>
                <code style={{ fontSize: 11 }}>{f.email || `Row ${f.rowNumber}`}</code> — {f.reason}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Submit */}
      <div style={{ display: "flex", justifyContent: "flex-end" }}>
        <button
          onClick={submit}
          disabled={!canSubmit}
          style={{
            padding: "9px 22px", borderRadius: 9,
            fontSize: 13, fontWeight: 700,
            background: canSubmit ? t.accent : (t.textDisabled || t.textSubtle || t.textMuted),
            color: "#fff", border: "none",
            cursor: canSubmit ? "pointer" : "not-allowed",
            transition: "background 0.15s, transform 0.15s",
            opacity: canSubmit ? 1 : 0.7,
          }}
        >
          {loading ? "Sending…"
            : tab === "single" ? "Send Invite"
            : tab === "bulk"   ? `Send ${bulkParsed.valid.length || ""} Invite${bulkParsed.valid.length === 1 ? "" : "s"}`.trim()
            : "Import & Send"}
        </button>
      </div>
    </div>
  );
}