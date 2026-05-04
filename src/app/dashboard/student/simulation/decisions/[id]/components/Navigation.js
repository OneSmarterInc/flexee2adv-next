import Link from "next/link";

export function Navigation({ simulation, isDark, theme, onThemeToggle, onLogout }) {
  return (
    <nav className={`fixed w-full top-0 z-40 border-b ${theme.nav} backdrop-blur-md`}>
      <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <Link href="/">
            <h1 className="text-2xl font-bold tracking-tight cursor-pointer hover:opacity-80">
              FLEXEE <span className={theme.accentText}>2.0</span>
            </h1>
          </Link>
          <div className={`hidden md:flex items-center gap-2 pl-4 border-l ${isDark ? "border-gray-600" : "border-gray-300"}`}>
            <Link href="/dashboard/student" className={`text-sm ${theme.textMuted}`}>
              Dashboard
            </Link>
            <span className={theme.textMuted}>/</span>
            <span className="text-sm font-medium truncate max-w-[150px]">{simulation?.name}</span>
            <span className={theme.textMuted}>/</span>
            <span className="text-sm font-medium">Decisions</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button onClick={onThemeToggle} className={`p-2 rounded-lg transition ${theme.secondaryBg}`}>
            <span className="text-lg">{isDark ? "🌙" : "☀️"}</span>
          </button>
          <button onClick={onLogout} className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition text-white text-sm">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}