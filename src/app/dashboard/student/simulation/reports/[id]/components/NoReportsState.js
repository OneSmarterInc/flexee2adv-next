import Link from "next/link";

export function NoReportsState({ isDark }) {
  return (
    <div className={`${isDark ? "bg-gray-800/30 border-gray-700/50" : "bg-gray-50 border-gray-200"} border rounded-xl p-12 text-center`}>
      <div className="text-4xl mb-3">📊</div>
      <h2 className="text-xl font-semibold mb-2">
        No Reports Available
      </h2>
      <p className={`mb-4 ${isDark ? "text-gray-400" : "text-gray-600"}`}>
        Reports will appear as the simulation progresses.
      </p>
      <Link
        href="/dashboard/student"
        className="inline-block px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition"
      >
        Back to Dashboard
      </Link>
    </div>
  );
}
