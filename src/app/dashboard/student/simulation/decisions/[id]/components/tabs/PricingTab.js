// src/app/dashboard/student/decisions/[id]/components/tabs/PricingTab.js

export default function PricingTab({
  theme,
  decisions,
  setDecisions,
  priceConstraints = {},
  isSubmitted,
  textMuted
}) {
  const minP1 = priceConstraints.minPrice?.P1 || 250;
  const maxP1 = priceConstraints.maxPrice?.P1 || 1000;
  const minP2 = priceConstraints.minPrice?.P2 || 425;
  const maxP2 = priceConstraints.maxPrice?.P2 || 1500;

  return (
    <div className={`${theme.card} border rounded-xl p-6`}>
      <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
        <span>💰</span> Pricing
      </h3>
      <p className={`${theme.textMuted} mb-6`}>
        Set prices for each product. Higher prices mean higher margins but may reduce demand.
      </p>

      {/* Price Constraints */}
      <div className={`p-4 rounded-lg ${theme.cardInner} mb-6`}>
        <p className={`text-sm font-medium mb-3`}>Price Constraints</p>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className={`text-xs ${theme.textMuted}`}>Product 1 Range</p>
            <p className="font-bold">${minP1} - ${maxP1}</p>
          </div>
          <div>
            <p className={`text-xs ${theme.textMuted}`}>Product 2 Range</p>
            <p className="font-bold">${minP2} - ${maxP2}</p>
          </div>
        </div>
      </div>

      {/* Price Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <label className="block">
          <span className="text-sm font-medium">Product 1 (Standard) Price</span>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              type="number"
              value={decisions.priceP1}
              onChange={(e) => setDecisions({ ...decisions, priceP1: parseInt(e.target.value) || 0 })}
              disabled={isSubmitted}
              className={`w-full pl-8 pr-4 py-3 rounded-lg border ${theme.input} disabled:opacity-50`}
              min={minP1}
              max={maxP1}
              step="10"
            />
          </div>
        </label>
        <label className="block">
          <span className="text-sm font-medium">Product 2 (Premium) Price</span>
          <div className="relative mt-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">$</span>
            <input
              type="number"
              value={decisions.priceP2}
              onChange={(e) => setDecisions({ ...decisions, priceP2: parseInt(e.target.value) || 0 })}
              disabled={isSubmitted}
              className={`w-full pl-8 pr-4 py-3 rounded-lg border ${theme.input} disabled:opacity-50`}
              min={minP2}
              max={maxP2}
              step="10"
            />
          </div>
        </label>
      </div>
    </div>
  );
}