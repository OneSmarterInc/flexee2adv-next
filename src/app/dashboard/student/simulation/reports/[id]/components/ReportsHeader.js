import Link from "next/link";

export function ReportsHeader({
  firm,
  simulation,
  isDark,
  onToggleTheme,
  onLogout,
}) {
  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 border-b ${isDark ? "bg-gray-900 border-gray-800" : "bg-white border-gray-200"}`}
    >
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        <div className={`text-sm flex items-center gap-2 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
          <Link
            href="/dashboard/student"
            className={`p-1.5 rounded transition ${isDark ? "hover:bg-gray-800" : "hover:bg-gray-100"}`}
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12a9 9 0 1 0 18 0 9 9 0 0 0-18 0Z"
              />
            </svg>
          </Link>
          <Link
            href="/dashboard/student"
            className={`hover:opacity-80 transition`}
          >
            Dashboard
          </Link>
          <span className={isDark ? "text-gray-600" : "text-gray-400"}>
            /
          </span>
          <span className={isDark ? "text-gray-400" : "text-gray-600"}>
            {simulation?.name}
          </span>
          <span className={isDark ? "text-gray-600" : "text-gray-400"}>
            /
          </span>
          <span className="font-medium">Reports</span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleTheme}
            className={`p-2 rounded-lg ${isDark ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-200 hover:bg-gray-300"} transition`}
          >
            <span className="text-lg">{isDark ? "🌙" : "☀️"}</span>
          </button>
          <button
            onClick={onLogout}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg font-medium transition text-sm"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
