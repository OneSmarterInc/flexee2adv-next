// src/app/dashboard/faculty/simulations/[id]/constants.js

export const STATUS_CONFIG = {
  CREATED: {
    color: "text-yellow-400",
    bg: "bg-yellow-500/10",
    border: "border-yellow-500/30",
    label: "Created",
  },
  INITIALIZED: {
    color: "text-blue-400",
    bg: "bg-blue-500/10",
    border: "border-blue-500/30",
    label: "Initialized",
  },
  IN_PROGRESS: {
    color: "text-green-400",
    bg: "bg-green-500/10",
    border: "border-green-500/30",
    label: "In Progress",
  },
  PAUSED: {
    color: "text-orange-400",
    bg: "bg-orange-500/10",
    border: "border-orange-500/30",
    label: "Paused",
  },
  COMPLETED: {
    color: "text-purple-400",
    bg: "bg-purple-500/10",
    border: "border-purple-500/30",
    label: "Completed",
  },
};

export const SEASON_CONFIG = {
  1: { name: "Q1 Post-Holiday", icon: "❄️", color: "text-blue-400" },
  2: { name: "Q2 Spring", icon: "🌸", color: "text-pink-400" },
  3: { name: "Q3 Summer", icon: "☀️", color: "text-yellow-400" },
  4: { name: "Q4 Holiday", icon: "🎄", color: "text-green-400" },
};

export const ADVANCED_MODULES = {
  capacityExpansion: {
    label: "Capacity Expansion",
    icon: "🏭",
    desc: "Production line expansion",
  },
  regionalDCs: {
    label: "Regional DCs",
    icon: "📦",
    desc: "Distribution centers",
  },
  multiCarrierSelection: {
    label: "Multi-Carrier",
    icon: "🚛",
    desc: "Carrier selection",
  },
  returnsGreenScore: {
    label: "Green Score",
    icon: "♻️",
    desc: "Sustainability tracking",
  },
  intelligenceCenter: {
    label: "Intelligence",
    icon: "📊",
    desc: "Market reports",
  },
  vmi: { label: "VMI", icon: "🤝", desc: "Vendor managed inventory" },
  analyticsMode: { label: "Analytics", icon: "📈", desc: "Advanced analytics" },
};

export const CORE_FEATURES = {
  seasonality: { label: "Seasonality", icon: "📅" },
  randomEvents: { label: "Random Events", icon: "⚡" },
  customerChurn: { label: "Customer Churn", icon: "👥" },
  retailerBrain: { label: "Retailer Brain", icon: "🧠" },
  regionalCompetition: { label: "Regional Competition", icon: "🌍" },
  demandForecasting: { label: "Demand Forecasting", icon: "🔮" },
  perfectOrderTracking: { label: "Perfect Order", icon: "✅" },
  technologyInvestments: { label: "Technology", icon: "💻" },
  qualityControl: { label: "Quality Control", icon: "🔍" },
  transportLogistics: { label: "Transport", icon: "🚚" },
};

export const EVENT_TYPES = [
  {
    type: "SUPPLY_DISRUPTION",
    label: "Supply Disruption",
    icon: "🚚",
    desc: "Parts delivery delayed",
    color: "red",
  },
  {
    type: "DEMAND_SURGE",
    label: "Demand Surge",
    icon: "📈",
    desc: "Viral demand spike",
    color: "green",
  },
  {
    type: "ECONOMIC_DOWNTURN",
    label: "Economic Downturn",
    icon: "📉",
    desc: "Market slowdown",
    color: "orange",
  },
  {
    type: "COMPETITOR_STUMBLE",
    label: "Competitor Crisis",
    icon: "💥",
    desc: "Competitor PR crisis",
    color: "purple",
  },
  {
    type: "RAW_MATERIAL_SPIKE",
    label: "Cost Spike",
    icon: "💸",
    desc: "Material cost increase",
    color: "yellow",
  },
];

export const TAB_CONFIG = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "firms", label: "Firms", icon: "🏢" },
  { id: "leaderboard", label: "Leaderboard", icon: "🏆" },
  { id: "demand", label: "Demand", icon: "📈" },
  { id: "features", label: "Features", icon: "⚙️" },
  { id: "events", label: "Events", icon: "⚡" },
  { id: "credit", label: "Credit", icon: "💳" },
  { id: "green-score", label: "Green Score", icon: "♻️", feature: "returnsGreenScore" },
  { id: "capacity-expansion", label: "Capacity Expansion", icon: "🏭", feature: "capacityExpansion" },
  { id: "logistics", label: "Logistics", icon: "🚛", feature: "regionalDCs" },
  { id: "intelligence", label: "Intelligence", icon: "📊", feature: "intelligenceCenter" },
  { id: "scrm", label: "SCRM", icon: "⚠️" },
];