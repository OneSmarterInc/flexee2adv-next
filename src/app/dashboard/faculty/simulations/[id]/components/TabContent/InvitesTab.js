// src/app/dashboard/faculty/simulations/[id]/components/TabContent/InvitesTab.js

import InviteManagementPanel from "../InviteManagementPanel";

export default function InvitesTab({
  theme,
  isDark,
  simulation,
}) {
  if (!simulation?._id) {
    return (
      <div style={{
        padding: "40px 24px",
        textAlign: "center",
        color: theme?.textMuted || "#6B7280",
      }}>
        <p style={{ margin: 0, fontSize: 13 }}>No simulation selected.</p>
      </div>
    );
  }

  return (
    <InviteManagementPanel
      simulationId={simulation._id}
      theme={theme}
      isDark={isDark}
    />
  );
}
