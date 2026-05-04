// src/app/dashboard/faculty/simulations/[id]/components/LoadingScreen.js

export default function LoadingScreen({ theme }) {
  return (
    <div
      className={`min-h-screen ${theme.bg} ${theme.text} flex items-center justify-center`}
    >
      <div className="text-center space-y-4">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
        <p className={theme.textMuted}>Loading simulation...</p>
      </div>
    </div>
  );
}