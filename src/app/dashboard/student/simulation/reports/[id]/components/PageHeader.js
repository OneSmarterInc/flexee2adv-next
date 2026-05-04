import Link from "next/link";

export function PageHeader({ firm, simulation, isDark }) {
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
      <div className="flex items-center gap-3">
        <Link
          href="/dashboard/student"
          className={`p-2 rounded-lg transition ${isDark ? "bg-gray-800 hover:bg-gray-700" : "bg-gray-200 hover:bg-gray-300"}`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 19l-7-7 7-7"
            />
          </svg>
        </Link>
        <div>
          <h1 className="text-2xl font-bold">Reports Center</h1>
          <p className={`text-sm ${isDark ? "text-gray-400" : "text-gray-600"}`}>
            {firm?.name} • {simulation?.name}
          </p>
        </div>
      </div>
    </div>
  );
}
