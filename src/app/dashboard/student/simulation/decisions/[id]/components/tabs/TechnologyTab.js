// src/app/dashboard/student/decisions/[id]/components/tabs/TechnologyTab.js

export default function TechnologyTab({
  theme,
  decisions,
  setDecisions,
  technologies = [],
  ownedTech = [],
  isSubmitted,
  formatCurrency,
  textMuted
}) {
  const techTypeToKey = {
    ERP: "erp",
    CONTROL_TOWER: "controlTower",
    APS: "aps",
    DEMAND_SENSING: "demandSensing",
    WMS: "wms",
    TMS: "tms",
    OMS: "oms",
    ANALYTICS: "analytics",
  };

  const isTechOwned = (techType) => {
    return ownedTech.some((t) => t.type === techType);
  };

  const selectedPurchaseCost = Object.entries(decisions.techPurchases || {}).reduce((sum, [key, purchased]) => {
    if (!purchased) return sum;
    const techType = Object.entries(techTypeToKey).find(([, k]) => k === key)?.[0];
    const tech = technologies.find((t) => t.type === techType);
    return sum + (tech?.cost || 0);
  }, 0);

  return (
    <div className={`${theme.card} border rounded-xl p-6`}>
      <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
        <span>💻</span> Technology Investments
      </h3>
      <p className={`${theme.textMuted} mb-6`}>
        Invest in technology to gain competitive advantages. One-time purchase.
      </p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {technologies.map((tech) => {
          const owned = isTechOwned(tech.type);
          const techKey = techTypeToKey[tech.type];
          const selected = techKey && decisions.techPurchases?.[techKey];

          return (
            <button
              key={tech.type}
              onClick={() => {
                if (isSubmitted || owned || !techKey) return;
                setDecisions((prev) => ({
                  ...prev,
                  techPurchases: {
                    ...prev.techPurchases,
                    [techKey]: !prev.techPurchases[techKey],
                  },
                }));
              }}
              disabled={isSubmitted || owned}
              className={`p-4 rounded-lg border transition text-left ${
                owned
                  ? "border-green-500 bg-green-500/10 opacity-75"
                  : selected
                  ? "border-blue-500 bg-blue-500/10"
                  : `${theme.cardInner} border-transparent hover:border-gray-500`
              } ${isSubmitted ? "cursor-not-allowed" : ""}`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium">{tech.name}</span>
                {owned && <span className="text-green-400 text-xs">✓ Owned</span>}
              </div>
              <p className={`text-sm ${theme.textMuted} mb-2`}>{tech.benefit}</p>
              <p className="text-sm font-medium">{formatCurrency(tech.cost)}</p>
              <span className={`text-xs px-2 py-0.5 rounded ${theme.cardInner}`}>{tech.category}</span>
            </button>
          );
        })}
      </div>

      {selectedPurchaseCost > 0 && (
        <div className={`mt-6 p-4 rounded-lg ${theme.cardInner}`}>
          <div className="flex justify-between items-center">
            <span className="font-medium">Selected Purchases</span>
            <span className="font-bold">{formatCurrency(selectedPurchaseCost)}</span>
          </div>
        </div>
      )}
    </div>
  );
}