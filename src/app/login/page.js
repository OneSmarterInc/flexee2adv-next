"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "@/context/ThemeContext";

// ─── THEME TOKENS (inline, no Tailwind) ───────────────────────────────────────
const LIGHT = {
  bgPage: "#F3F4F6",
  bgSurface: "#FFFFFF",
  bgElevated: "#F9FAFB",
  border: "#E5E7EB",
  textPrimary: "#111827",
  textMuted: "#6B7280",
  accent: "#1D4ED8",
  accentHover: "#1E40AF",
  red: "#991B1B",
  redBg: "#FEE2E2",
  redBorder: "#FECACA",
  shadow: "0 1px 3px rgba(0,0,0,0.08)",
};
const DARK = {
  bgPage: "#0D1117",
  bgSurface: "#161B22",
  bgElevated: "#1C2128",
  border: "#30363D",
  textPrimary: "#E6EDF3",
  textMuted: "#545D68",
  accent: "#4493F8",
  accentHover: "#79C0FF",
  red: "#F85149",
  redBg: "rgba(248,81,73,0.10)",
  redBorder: "rgba(248,81,73,0.30)",
  shadow: "0 1px 3px rgba(0,0,0,0.30)",
};

export default function Login() {
  const { isDark, toggleTheme } = useTheme();
  const theme = isDark ? DARK : LIGHT;
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("student");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;

      const response = await fetch(`${apiUrl}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          accept: "*/*",
        },
        body: JSON.stringify({
          email: email,
          password: password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || "Login failed. Please try again.");
        setLoading(false);
        return;
      }

      // Store tokens and user info from response
      if (data.access_token) {
        localStorage.setItem("access_token", data.access_token);
      }

      if (data.refresh_token) {
        localStorage.setItem("refresh_token", data.refresh_token);
      }

      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
        localStorage.setItem("userRole", data.user.role.toLowerCase());
        localStorage.setItem("userName", data.user.displayName);
        localStorage.setItem("userEmail", data.user.email);
        localStorage.setItem("userId", data.user._id);
      }

      setSuccess("Login successful! Redirecting...");

      // Redirect based on user role from API response
      setTimeout(() => {
        const userRole = data.user.role.toLowerCase();
        if (userRole === "student") {
          router.push("/dashboard/student");
        } else if (userRole === "faculty") {
          router.push("/dashboard/faculty");
        } else if (userRole === "admin") {
          router.push("/dashboard/admin");
        } else {
          router.push("/dashboard");
        }
      }, 1500);
    } catch (err) {
      setError(
        err.message || "An error occurred during login. Please try again."
      );
      setLoading(false);
    }
  };

  const handleUserTypeChange = (newUserType) => {
    setError("");
    setSuccess("");
    setUserType(newUserType);

    if (newUserType === "admin") {
      setEmail("admin@flexee.com");
      setPassword("Admin@123456");
    } else if (newUserType === "faculty") {
      setEmail("faculty1@flexee.com");
      setPassword("Faculty@123456");
    } else {
      setEmail("student1@flexee.com");
      setPassword("Student@123456");
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: theme.bgPage,
      color: theme.textPrimary,
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "24px",
      fontFamily: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontSize: "14px",
      position: "relative",
    }}>
      {/* Theme toggle button */}
      <button
        onClick={toggleTheme}
        style={{
          position: "fixed",
          top: "24px",
          right: "24px",
          zIndex: 50,
          padding: "12px",
          borderRadius: "9999px",
          background: isDark ? "#30363D" : "#F3F4F6",
          border: `1px solid ${theme.border}`,
          cursor: "pointer",
          transition: "all 0.3s ease",
          fontSize: "20px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          width: "48px",
          height: "48px",
        }}
        title="Toggle theme"
        onMouseEnter={(e) => e.target.style.transform = "scale(1.1)"}
        onMouseLeave={(e) => e.target.style.transform = "scale(1)"}
      >
        {isDark ? "🌙" : "☀️"}
      </button>

      {/* Login Card */}
      <div style={{
        width: "100%",
        maxWidth: "448px",
        background: theme.bgSurface,
        border: `1px solid ${theme.border}`,
        borderRadius: "16px",
        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
        padding: "32px",
      }}>
        {/* Logo */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <Link href="/" style={{ textDecoration: "none" }}>
            <h1 style={{
              fontSize: "28px",
              fontWeight: "bold",
              letterSpacing: "-0.02em",
              color: theme.textPrimary,
              cursor: "pointer",
              transition: "opacity 0.3s",
              margin: 0,
            }}
              onMouseEnter={(e) => e.target.style.opacity = "0.8"}
              onMouseLeave={(e) => e.target.style.opacity = "1"}
            >
              FLEXEE <span style={{ color: theme.accent }}>2.0</span>
            </h1>
          </Link>
          <p style={{
            color: theme.textMuted,
            marginTop: "8px",
            marginBottom: 0,
            fontSize: "13px",
          }}>
            Supply Chain Management Simulation
          </p>
        </div>

        {/* User Type Toggle */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "24px" }}>
          {["student", "faculty", "admin"].map((type) => (
            <button
              key={type}
              onClick={() => handleUserTypeChange(type)}
              disabled={loading}
              style={{
                flex: 1,
                padding: "8px 12px",
                borderRadius: "8px",
                fontWeight: "600",
                fontSize: "13px",
                border: "none",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.3s",
                background: userType === type ? theme.accent : theme.bgElevated,
                color: userType === type ? "#FFFFFF" : theme.textPrimary,
                opacity: loading ? 0.5 : 1,
              }}
              onMouseEnter={(e) => {
                if (!loading && userType !== type) {
                  e.target.style.background = isDark ? "rgba(68, 147, 248, 0.2)" : "rgba(29, 78, 216, 0.1)";
                }
              }}
              onMouseLeave={(e) => {
                if (!loading && userType !== type) {
                  e.target.style.background = theme.bgElevated;
                }
              }}
            >
              {type.charAt(0).toUpperCase() + type.slice(1)}
            </button>
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            marginBottom: "16px",
            padding: "12px",
            background: isDark ? "rgba(248, 81, 73, 0.10)" : "#FEE2E2",
            border: `1px solid ${isDark ? "rgba(248, 81, 73, 0.30)" : "#FECACA"}`,
            borderRadius: "8px",
          }}>
            <p style={{ color: isDark ? "#F85149" : "#991B1B", fontSize: "13px", margin: 0 }}>
              {error}
            </p>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div style={{
            marginBottom: "16px",
            padding: "12px",
            background: "rgba(34, 197, 94, 0.10)",
            border: "1px solid rgba(34, 197, 94, 0.30)",
            borderRadius: "8px",
          }}>
            <p style={{ color: "#22C55E", fontSize: "13px", margin: 0 }}>
              {success}
            </p>
          </div>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "500",
              marginBottom: "8px",
              color: theme.textPrimary,
            }}>
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "8px",
                border: `1px solid ${theme.border}`,
                background: theme.bgElevated,
                color: theme.textPrimary,
                fontSize: "14px",
                outline: "none",
                transition: "all 0.3s",
                boxSizing: "border-box",
                opacity: loading ? 0.5 : 1,
                cursor: loading ? "not-allowed" : "text",
              }}
              placeholder={userType === "admin" ? "admin@institution.edu" : "john@example.com"}
              required
              onFocus={(e) => {
                e.target.style.borderColor = theme.accent;
                e.target.style.boxShadow = `0 0 0 3px ${isDark ? "rgba(68, 147, 248, 0.1)" : "rgba(29, 78, 216, 0.1)"}`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = theme.border;
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div>
            <label style={{
              display: "block",
              fontSize: "13px",
              fontWeight: "500",
              marginBottom: "8px",
              color: theme.textPrimary,
            }}>
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
              style={{
                width: "100%",
                padding: "12px 16px",
                borderRadius: "8px",
                border: `1px solid ${theme.border}`,
                background: theme.bgElevated,
                color: theme.textPrimary,
                fontSize: "14px",
                outline: "none",
                transition: "all 0.3s",
                boxSizing: "border-box",
                opacity: loading ? 0.5 : 1,
                cursor: loading ? "not-allowed" : "text",
              }}
              placeholder="••••••••"
              required
              onFocus={(e) => {
                e.target.style.borderColor = theme.accent;
                e.target.style.boxShadow = `0 0 0 3px ${isDark ? "rgba(68, 147, 248, 0.1)" : "rgba(29, 78, 216, 0.1)"}`;
              }}
              onBlur={(e) => {
                e.target.style.borderColor = theme.border;
                e.target.style.boxShadow = "none";
              }}
            />
          </div>

          <div style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}>
            <label style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              cursor: "pointer",
              opacity: loading ? 0.5 : 1,
            }}>
              <input
                type="checkbox"
                disabled={loading}
                style={{
                  width: "16px",
                  height: "16px",
                  borderRadius: "4px",
                  accentColor: theme.accent,
                  cursor: loading ? "not-allowed" : "pointer",
                }}
              />
              <span style={{ fontSize: "13px", color: theme.textMuted }}>
                Remember me
              </span>
            </label>
            <a
              href="#"
              style={{
                fontSize: "13px",
                color: theme.accent,
                textDecoration: "none",
                transition: "opacity 0.3s",
                opacity: loading ? 0.5 : 1,
                cursor: loading ? "not-allowed" : "pointer",
                pointerEvents: loading ? "none" : "auto",
              }}
              onMouseEnter={(e) => !loading && (e.target.style.opacity = "0.7")}
              onMouseLeave={(e) => !loading && (e.target.style.opacity = "1")}
            >
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: "12px 16px",
              background: theme.accent,
              color: "#FFFFFF",
              border: "none",
              borderRadius: "8px",
              fontWeight: "600",
              fontSize: "14px",
              transition: "all 0.3s",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transform: "scale(1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
            }}
            onMouseEnter={(e) => !loading && (e.target.style.background = theme.accentHover)}
            onMouseLeave={(e) => !loading && (e.target.style.background = theme.accent)}
          >
            {loading ? (
              <>
                <span style={{ animation: "spin 0.75s linear infinite" }}>⏳</span>
                Signing in...
              </>
            ) : (
              `Sign In as ${userType.charAt(0).toUpperCase() + userType.slice(1)}`
            )}
          </button>
        </form>

        {/* Divider */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: "16px",
          margin: "24px 0",
        }}>
          <div style={{
            flex: 1,
            height: "1px",
            background: theme.border,
          }}></div>
          <span style={{ fontSize: "13px", color: theme.textMuted }}>OR</span>
          <div style={{
            flex: 1,
            height: "1px",
            background: theme.border,
          }}></div>
        </div>

        {/* Sign Up Link */}
        <div style={{ textAlign: "center" }}>
          <p style={{ color: theme.textMuted, margin: 0 }}>
            {userType === "admin" ? (
              <>
                Need admin access?{" "}
                <a
                  href="#"
                  style={{
                    color: theme.accent,
                    textDecoration: "none",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "opacity 0.3s",
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = "0.7"}
                  onMouseLeave={(e) => e.target.style.opacity = "1"}
                >
                  Contact support
                </a>
              </>
            ) : (
              <>
                Don't have an account?{" "}
                <a
                  href="#"
                  style={{
                    color: theme.accent,
                    textDecoration: "none",
                    fontWeight: "600",
                    cursor: "pointer",
                    transition: "opacity 0.3s",
                  }}
                  onMouseEnter={(e) => e.target.style.opacity = "0.7"}
                  onMouseLeave={(e) => e.target.style.opacity = "1"}
                >
                  Contact your institution
                </a>
              </>
            )}
          </p>
        </div>

        {/* Back to Home */}
        <div style={{ textAlign: "center", marginTop: "24px" }}>
          <Link
            href="/"
            style={{
              fontSize: "13px",
              color: theme.textMuted,
              textDecoration: "none",
              transition: "opacity 0.3s",
              opacity: loading ? 0.5 : 1,
              pointerEvents: loading ? "none" : "auto",
              display: "inline-block",
            }}
            onMouseEnter={(e) => !loading && (e.target.style.opacity = "0.7")}
            onMouseLeave={(e) => !loading && (e.target.style.opacity = "1")}
          >
            ← Back to Home
          </Link>
        </div>
      </div>

      {/* Background Decoration */}
      <div style={{
        position: "fixed",
        inset: 0,
        zIndex: -1,
        overflow: "hidden",
        pointerEvents: "none",
      }}>
        <div style={{
          position: "absolute",
          top: "80px",
          left: "40px",
          width: "288px",
          height: "288px",
          borderRadius: "50%",
          filter: "blur(64px)",
          opacity: 0.15,
          background: isDark ? "#4493F8" : "#1D4ED8",
        }}></div>
        <div style={{
          position: "absolute",
          bottom: "80px",
          right: "40px",
          width: "384px",
          height: "384px",
          borderRadius: "50%",
          filter: "blur(64px)",
          opacity: 0.15,
          background: isDark ? "#0EA5E9" : "#3B82F6",
        }}></div>
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}