// src/app/onboarding/accept/page.js
// Corporate Edition — accept-invite landing page.
//
// Same state machine and validation as the Analytics version. What changed:
//   - Palette swapped to Corporate's blue (#1D4ED8) on neutral grey
//   - Edition tag: "ANALYTICS EDITION" → "CORPORATE EDITION"
//   - Wordmark: "FLEXEE Analytics" → "FLEXEE Corporate"
//   - Three-step pitch rewritten to match Corporate's quarterly-decision flow
//     instead of the bring-your-own-tools analytics flow
//   - "About FLEXEE" footer copy rewritten for Corporate

"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const T = {
  bgPage:       "#F3F4F6",
  bgSurface:    "#FFFFFF",
  bgElevated:   "#F9FAFB",
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
};

const STATE = {
  LOADING:   "LOADING",
  READY:     "READY",
  EXPIRED:   "EXPIRED",
  ACCEPTED:  "ACCEPTED",
  INVALID:   "INVALID",
  ACCEPTING: "ACCEPTING",
  SUCCESS:   "SUCCESS",
  ERROR:     "ERROR",
};


// useSearchParams() forces client-side rendering, which breaks static
// prerendering unless the component sits inside a Suspense boundary. Without
// this the whole production build fails on this page.
export default function AcceptInvitePage() {
  return (
    <Suspense fallback={null}>
      <AcceptInviteContent />
    </Suspense>
  );
}

function AcceptInviteContent() {
  const router = useRouter();
  const params = useSearchParams();
  const token = params.get("token");
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;

  const [state, setState] = useState(STATE.LOADING);
  const [invite, setInvite] = useState(null);
  const [accepted, setAccepted] = useState(null);
  const [error, setError] = useState("");

  const [firstName, setFirstName] = useState("");
  const [lastName,  setLastName]  = useState("");
  const [password,  setPassword]  = useState("");
  const [confirmPwd, setConfirmPwd] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ─── Fetch invite details on mount ──────────────────────────────────────────
  // Endpoint matches the deployed /onboarding controller (singular).
  useEffect(() => {
    if (!token) {
      setState(STATE.INVALID);
      setError("No invite token in URL.");
      return;
    }

    (async () => {
      try {
        const res = await fetch(`${apiUrl}/onboarding/invite/${token}`);
        if (res.status === 404) {
          setState(STATE.INVALID);
          setError("This invite link doesn't exist or has been revoked.");
          return;
        }
        if (!res.ok) {
          setState(STATE.ERROR);
          setError("Couldn't load invite details. Please try again.");
          return;
        }
        const data = await res.json();
        setInvite(data);

        if (data.isExpired) {
          setState(STATE.EXPIRED);
        } else if (data.status === "ACCEPTED") {
          setState(STATE.ACCEPTED);
        } else {
          setState(STATE.READY);
        }
      } catch {
        setState(STATE.ERROR);
        setError("Network error. Please check your connection and refresh.");
      }
    })();
  }, [token, apiUrl]);

  // Defensive: if backend doesn't yet return userExists, default to "needs setup"
  // so we never silently create a user without a name.
  const needsAccountSetup = !!invite && !invite.userExists;

  // ─── Accept handler ────────────────────────────────────────────────────────
  const handleAccept = async () => {
    setState(STATE.ACCEPTING);
    setError("");

    try {
      const body = needsAccountSetup
        ? {
            inviteToken: token,
            password,
            firstName: firstName.trim(),
            lastName:  lastName.trim(),
          }
        : { inviteToken: token };

      const res = await fetch(`${apiUrl}/onboarding/accept`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "*/*" },
        body: JSON.stringify(body),
      });

      const data = await res.json().catch(() => ({}));

      if (res.ok) {
        setAccepted(data);
        setState(STATE.SUCCESS);
        return;
      }

      setState(STATE.READY);

      if (res.status === 404) {
        setState(STATE.INVALID);
        setError(data.message || "Invite not found, expired, or already used.");
        return;
      }

      setError(data.message || "Couldn't accept invite. Please try again.");
    } catch {
      setState(STATE.READY);
      setError("Network error. Please try again.");
    }
  };

  const passwordOk = password.length >= 8 && password === confirmPwd;
  const namesOk    = firstName.trim().length > 0 && lastName.trim().length > 0;
  const formValid  = needsAccountSetup ? (passwordOk && namesOk) : true;
  const canAccept  = state === STATE.READY && formValid;


  return (
    <div style={pageWrap}>
      <style>{globalCss}</style>

      <div style={brandStrip}>
        <div style={brandWordmark}>
          FLEXEE <span style={{ color: T.accent }}>Corporate</span>
        </div>
        <div style={editionPill}>
          <span style={pillDot} />
          CORPORATE EDITION
        </div>
      </div>

      <div style={card}>
        {state === STATE.LOADING && <LoadingView />}

        {state === STATE.INVALID && (
          <ErrorView
            title="Invalid invite link"
            body={error || "This link doesn't exist or has been revoked. If you got this from your instructor, double-check that you copied the full URL — including the token after =."}
            tone="red"
          />
        )}

        {state === STATE.EXPIRED && (
          <ErrorView
            title="This invite has expired"
            body={`The invite to ${invite?.email || "you"} expired on ${formatDate(invite?.expiresAt)}. Reach out to your instructor to ask for a new one.`}
            tone="amber"
          />
        )}

        {state === STATE.ACCEPTED && (
          <ErrorView
            title="You've already accepted this invite"
            body="Looks like you've joined this simulation before. Sign in to continue."
            tone="green"
            cta={{ label: "Go to sign in", onClick: () => router.push("/login") }}
          />
        )}

        {state === STATE.ERROR && (
          <ErrorView
            title="Something went wrong"
            body={error}
            tone="red"
            cta={{ label: "Refresh", onClick: () => window.location.reload() }}
          />
        )}

        {(state === STATE.READY || state === STATE.ACCEPTING) && invite && (
          <ReadyView
            invite={invite}
            accepting={state === STATE.ACCEPTING}
            needsAccountSetup={needsAccountSetup}
            firstName={firstName} setFirstName={setFirstName}
            lastName={lastName}   setLastName={setLastName}
            password={password}   setPassword={setPassword}
            confirmPwd={confirmPwd} setConfirmPwd={setConfirmPwd}
            showPassword={showPassword} setShowPassword={setShowPassword}
            error={error}
            onAccept={handleAccept}
            canAccept={canAccept}
          />
        )}

        {state === STATE.SUCCESS && accepted && (
          <SuccessView
            accepted={accepted}
            onContinue={() => router.push("/login")}
          />
        )}
      </div>

      <div style={footer}>
        Trouble joining? Forward this email to your instructor or write to support@flexee.app
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// SUB-VIEWS
// ═══════════════════════════════════════════════════════════════════════════

function LoadingView() {
  return (
    <div style={{ padding: "60px 24px", textAlign: "center" }}>
      <div className="spinner" style={spinnerStyle} />
      <p style={{ color: T.textMuted, fontSize: 14, marginTop: 18 }}>
        Looking up your invite…
      </p>
    </div>
  );
}


function ReadyView({
  invite, accepting, needsAccountSetup,
  firstName, setFirstName, lastName, setLastName,
  password, setPassword, confirmPwd, setConfirmPwd,
  showPassword, setShowPassword,
  error, onAccept, canAccept,
}) {
  // Pre-assigned firm context, if the invite carries it
  const firmLabel = invite.firmName
    ? invite.firmName
    : invite.firmNumber
    ? `Firm ${invite.firmNumber}`
    : null;

  return (
    <>
      {/* Heading block */}
      <div style={{ padding: "28px 32px 24px", borderBottom: `1px solid ${T.border}` }}>
        <p style={{ fontSize: 12, fontWeight: 700, color: T.accent, letterSpacing: "0.08em", marginBottom: 8 }}>
          YOU'RE INVITED TO
        </p>
        <h1 style={{ fontSize: 26, fontWeight: 800, color: T.textPrimary, letterSpacing: "-0.02em", marginBottom: 12, lineHeight: 1.2 }}>
          {invite.simulation.name}
        </h1>
        <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.6 }}>
          Your instructor has added <strong style={{ color: T.textPrimary }}>{invite.email}</strong> to a FLEXEE supply chain simulation.{" "}
          {firmLabel
            ? <>You'll be running <strong style={{ color: T.textPrimary }}>{firmLabel}</strong> with your team.</>
            : <>You'll pick a firm after accepting.</>}
        </p>
      </div>

      {/* How the simulation works */}
      <div style={{ padding: "24px 32px", background: T.bgElevated }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, letterSpacing: "0.08em", marginBottom: 16 }}>
          HOW THE SIMULATION WORKS
        </p>
        <div style={{ display: "grid", gap: 14 }}>
          <Step n="1" title="Make your decisions" body="Forecast, produce, price, market — every quarter" />
          <Step n="2" title="Submit before the deadline" body="Quarters close on a schedule set by your instructor" />
          <Step n="3" title="See where you stand" body="Live leaderboard vs. the other firms in your cohort" />
        </div>
      </div>

      {/* Account-setup form (only for new users) */}
      {needsAccountSetup && (
        <div style={{ padding: "22px 32px", borderTop: `1px solid ${T.border}` }}>
          <p style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, letterSpacing: "0.08em", marginBottom: 14 }}>
            CREATE YOUR ACCOUNT
          </p>

          <p style={{ fontSize: 13, color: T.textSec, marginBottom: 16, lineHeight: 1.5 }}>
            We don't see an account for <strong>{invite.email}</strong> yet. Tell us your name and set a password to get started.
          </p>

          {/* Name row */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 12 }}>
            <div>
              <label style={labelStyle}>First name</label>
              <input
                type="text"
                placeholder="First"
                value={firstName}
                onChange={e => setFirstName(e.target.value)}
                style={inputStyle}
                autoFocus
                maxLength={60}
              />
            </div>
            <div>
              <label style={labelStyle}>Last name</label>
              <input
                type="text"
                placeholder="Last"
                value={lastName}
                onChange={e => setLastName(e.target.value)}
                style={inputStyle}
                maxLength={60}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: 12 }}>
            <label style={labelStyle}>Password</label>
            <div style={{ position: "relative" }}>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="At least 8 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{ ...inputStyle, paddingRight: 64 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(s => !s)}
                style={pwToggle}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {password && password.length < 8 && (
              <p style={{ fontSize: 12, color: T.amber, marginTop: 6 }}>
                Password must be at least 8 characters.
              </p>
            )}
          </div>

          <div>
            <label style={labelStyle}>Confirm password</label>
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Re-enter password"
              value={confirmPwd}
              onChange={e => setConfirmPwd(e.target.value)}
              style={inputStyle}
            />
            {confirmPwd && password !== confirmPwd && (
              <p style={{ fontSize: 12, color: T.red, marginTop: 6 }}>
                Passwords don't match.
              </p>
            )}
          </div>
        </div>
      )}

      {/* Error banner */}
      {error && (
        <div style={{
          margin: "0 32px", marginTop: needsAccountSetup ? 0 : 16,
          padding: "10px 14px",
          background: T.redBg, border: `1px solid ${T.redBorder}`,
          borderRadius: 8, color: T.red, fontSize: 13,
        }}>
          {error}
        </div>
      )}

      {/* Accept button */}
      <div style={{ padding: "20px 32px 24px" }}>
        <button
          onClick={onAccept}
          disabled={!canAccept || accepting}
          style={{
            width: "100%",
            padding: "13px 20px",
            borderRadius: 10,
            border: "none",
            background: canAccept && !accepting ? T.accent : T.textDisabled,
            color: "#fff",
            fontSize: 14, fontWeight: 700,
            cursor: canAccept && !accepting ? "pointer" : "not-allowed",
            transition: "background 0.15s",
            letterSpacing: "-0.01em",
          }}
          onMouseEnter={e => { if (canAccept && !accepting) e.currentTarget.style.background = T.accentHover; }}
          onMouseLeave={e => { if (canAccept && !accepting) e.currentTarget.style.background = T.accent; }}
        >
          {accepting ? "Accepting…" : needsAccountSetup ? "Create account & accept" : "Accept invitation"}
        </button>

        {/* About FLEXEE blurb */}
        <p style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.6, marginTop: 16, textAlign: "center" }}>
          <strong style={{ color: T.textSec }}>About FLEXEE Corporate.</strong> A multi-quarter supply chain simulation where you compete against other firms in the same market. Advanced modules unlock as the simulation progresses — VMI, regional DCs, multi-carrier shipping, product innovation — adding new decisions on top of the ones you already manage.
        </p>
      </div>
    </>
  );
}


function SuccessView({ accepted, onContinue }) {
  const userName = (accepted.user.firstName || "").trim();
  return (
    <div style={{ padding: "44px 32px", textAlign: "center" }}>
      <div style={successCheck}>
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke={T.green} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      </div>

      <h2 style={{ fontSize: 24, fontWeight: 800, color: T.textPrimary, letterSpacing: "-0.02em", marginBottom: 10 }}>
        {userName ? `You're in, ${userName}.` : "You're in."}
      </h2>
      <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.6, maxWidth: 380, margin: "0 auto 24px" }}>
        You've joined <strong>{accepted.simulation.name}</strong>. Your instructor will assign you to a firm shortly — once that happens, you'll be able to access your team's cockpit.
      </p>

      <div style={{
        background: T.bgElevated, border: `1px solid ${T.border}`,
        borderRadius: 10, padding: "16px 18px", marginBottom: 22,
        textAlign: "left",
      }}>
        <p style={{ fontSize: 11, fontWeight: 700, color: T.textMuted, letterSpacing: "0.08em", marginBottom: 12 }}>
          WHAT HAPPENS NEXT
        </p>
        <ol style={{ margin: 0, paddingLeft: 18, fontSize: 13, color: T.textSec, lineHeight: 1.7 }}>
          <li>Faculty assigns you to a firm with your teammates.</li>
          <li>You sign in, open your firm's cockpit, and review Q1–Q3 history.</li>
          <li>Make Q4 decisions before the deadline — and watch how your firm stacks up against the rest.</li>
        </ol>
      </div>

      <button
        onClick={onContinue}
        style={{
          width: "100%", padding: "12px 20px", borderRadius: 10,
          border: "none", background: T.accent, color: "#fff",
          fontSize: 14, fontWeight: 700, cursor: "pointer",
          transition: "background 0.15s", letterSpacing: "-0.01em",
        }}
        onMouseEnter={e => e.currentTarget.style.background = T.accentHover}
        onMouseLeave={e => e.currentTarget.style.background = T.accent}
      >
        Continue to sign in
      </button>
    </div>
  );
}


function ErrorView({ title, body, tone, cta }) {
  const tint = tone === "red"   ? { bg: T.redBg,   border: T.redBorder,   color: T.red }
            : tone === "amber" ? { bg: T.amberBg, border: T.amberBorder, color: T.amber }
            : tone === "green" ? { bg: T.greenBg, border: T.greenBorder, color: T.green }
            : { bg: T.bgElevated, border: T.border, color: T.textMuted };

  return (
    <div style={{ padding: "44px 32px", textAlign: "center" }}>
      <div style={{
        width: 56, height: 56, borderRadius: 14, margin: "0 auto 18px",
        background: tint.bg, border: `1px solid ${tint.border}`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color: tint.color,
      }}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
          {tone === "green" ? (
            <polyline points="20 6 9 17 4 12" />
          ) : (
            <>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </>
          )}
        </svg>
      </div>
      <h2 style={{ fontSize: 20, fontWeight: 800, color: T.textPrimary, letterSpacing: "-0.02em", marginBottom: 10 }}>
        {title}
      </h2>
      <p style={{ fontSize: 14, color: T.textSec, lineHeight: 1.6, maxWidth: 380, margin: "0 auto 22px" }}>
        {body}
      </p>
      {cta && (
        <button
          onClick={cta.onClick}
          style={{
            padding: "10px 22px", borderRadius: 8,
            border: "none", background: T.accent, color: "#fff",
            fontSize: 13, fontWeight: 700, cursor: "pointer",
          }}
        >
          {cta.label}
        </button>
      )}
    </div>
  );
}


function Step({ n, title, body }) {
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div style={stepNumber}>{n}</div>
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: T.textPrimary, marginBottom: 2 }}>
          {title}
        </p>
        <p style={{ fontSize: 12, color: T.textMuted, lineHeight: 1.5 }}>
          {body}
        </p>
      </div>
    </div>
  );
}


// ═══════════════════════════════════════════════════════════════════════════
// HELPERS + STYLES
// ═══════════════════════════════════════════════════════════════════════════

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleDateString(undefined, {
      year: "numeric", month: "short", day: "numeric",
    });
  } catch { return "—"; }
}

const pageWrap = {
  minHeight: "100vh", background: T.bgPage,
  display: "flex", flexDirection: "column", alignItems: "center",
  padding: "24px 16px", boxSizing: "border-box",
  fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const brandStrip = {
  display: "flex", alignItems: "center", justifyContent: "space-between",
  width: "100%", maxWidth: 480, marginBottom: 18,
};
const brandWordmark = {
  fontSize: 17, fontWeight: 800, letterSpacing: "-0.02em", color: T.textPrimary,
};
const editionPill = {
  display: "inline-flex", alignItems: "center", gap: 6,
  padding: "4px 10px", borderRadius: 999,
  background: T.accentLight, border: `1px solid ${T.accentBorder}`,
  fontSize: 10, fontWeight: 700, color: T.accent, letterSpacing: "0.08em",
};
const pillDot = {
  width: 5, height: 5, borderRadius: "50%", background: T.accent,
};

const card = {
  width: "100%", maxWidth: 480,
  background: T.bgSurface, border: `1px solid ${T.border}`,
  borderRadius: 14,
  boxShadow: "0 10px 30px -12px rgba(0,0,0,0.15)",
  overflow: "hidden",
};

const stepNumber = {
  width: 26, height: 26, borderRadius: 7, flexShrink: 0,
  background: T.accentLight, border: `1px solid ${T.accentBorder}`,
  display: "flex", alignItems: "center", justifyContent: "center",
  fontSize: 12, fontWeight: 800, color: T.accent,
};

const successCheck = {
  width: 64, height: 64, borderRadius: 16, margin: "0 auto 16px",
  background: T.greenBg, border: `1px solid ${T.greenBorder}`,
  display: "flex", alignItems: "center", justifyContent: "center",
};

const inputStyle = {
  width: "100%", boxSizing: "border-box",
  padding: "10px 12px", borderRadius: 8,
  border: `1px solid ${T.borderStrong}`, background: T.bgSurface,
  color: T.textPrimary, fontSize: 14, fontFamily: "inherit",
  outline: "none", transition: "border-color 0.15s, box-shadow 0.15s",
};
const labelStyle = {
  display: "block", fontSize: 12, fontWeight: 600,
  color: T.textPrimary, marginBottom: 6,
};
const pwToggle = {
  position: "absolute", right: 8, top: "50%", transform: "translateY(-50%)",
  background: "none", border: "none", color: T.textMuted,
  fontSize: 12, fontWeight: 600, cursor: "pointer", padding: "4px 8px",
};

const footer = {
  marginTop: 24, fontSize: 12, color: T.textMuted, textAlign: "center", maxWidth: 480,
};

const spinnerStyle = {
  width: 36, height: 36, borderRadius: "50%",
  border: `3px solid ${T.border}`, borderTopColor: T.accent,
  margin: "0 auto",
};

const globalCss = `
  @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { font-family: 'Inter', -apple-system, sans-serif; }
  @keyframes spin { to { transform: rotate(360deg); } }
  .spinner { animation: spin 0.8s linear infinite; }
  input:focus {
    border-color: ${T.accent} !important;
    box-shadow: 0 0 0 3px rgba(29,78,216,0.12);
  }
`;