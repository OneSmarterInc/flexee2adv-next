// src/app/dashboard/faculty/simulations/[id]/components/modals/EnrollModal.js

import { getEnrolledStudentIds } from "../../utils";

export default function EnrollModal({
  showEnrollModal,
  setShowEnrollModal,
  theme,
  isDark,
  simulation,
  enrollForm,
  setEnrollForm,
  students,
  handleEnrollStudents,
  actionLoading,
}) {
  if (!showEnrollModal) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className={`${theme.card} border rounded-xl w-full max-w-lg`}>
        <div
          className={`px-5 py-4 border-b ${
            isDark ? "border-gray-700" : "border-gray-200"
          } flex justify-between items-center`}
        >
          <h3 className="font-semibold">Enroll Students</h3>
          <button
            onClick={() => setShowEnrollModal(false)}
            className={`p-2 rounded-lg ${theme.secondaryBg}`}
          >
            ✕
          </button>
        </div>
        <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Firm
            </label>
            <div className="grid grid-cols-3 gap-2">
              {simulation.firms?.map((firm) => (
                <button
                  key={firm.id}
                  onClick={() =>
                    setEnrollForm({ ...enrollForm, firmId: firm.id })
                  }
                  className={`p-3 rounded-lg border transition ${
                    enrollForm.firmId === firm.id
                      ? "border-blue-500 bg-blue-500/10"
                      : `${theme.cardInner} border-transparent`
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-lg mx-auto mb-2 flex items-center justify-center text-white font-bold"
                    style={{ backgroundColor: firm.color }}
                  >
                    {firm.firmNumber}
                  </div>
                  <p className="text-xs font-medium truncate">
                    {firm.name}
                  </p>
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Team Name (Optional)
            </label>
            <input
              type="text"
              value={enrollForm.teamName}
              onChange={(e) =>
                setEnrollForm({ ...enrollForm, teamName: e.target.value })
              }
              className={`w-full px-4 py-2.5 rounded-lg border ${theme.input}`}
              placeholder="e.g., Team Alpha"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">
              Select Students
            </label>
            <div
              className={`border rounded-lg ${theme.input} max-h-48 overflow-y-auto`}
            >
              {(() => {
                const enrolledIds = getEnrolledStudentIds(simulation);
                const availableStudents = students.filter(
                  (student) => !enrolledIds.has(student._id)
                );
                return availableStudents.length > 0 ? (
                  <div className="p-2 space-y-1">
                    {availableStudents.map((student) => (
                      <label
                        key={student._id}
                        className={`flex items-center gap-3 p-2 rounded cursor-pointer ${
                          enrollForm.studentIds.includes(student._id)
                            ? "bg-blue-500/10"
                            : "hover:bg-gray-700/50"
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={enrollForm.studentIds.includes(
                            student._id
                          )}
                          onChange={() => {
                            setEnrollForm((prev) => ({
                              ...prev,
                              studentIds: prev.studentIds.includes(
                                student._id
                              )
                                ? prev.studentIds.filter(
                                    (id) => id !== student._id
                                  )
                                : [...prev.studentIds, student._id],
                            }));
                          }}
                          className="w-4 h-4 rounded"
                        />
                        <div className="min-w-0 flex-1">
                          <p className="font-medium text-sm truncate">
                            {student.displayName || student.email}
                          </p>
                          <p
                            className={`text-xs ${theme.textMuted} truncate`}
                          >
                            {student.email}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p
                    className={`p-4 text-sm ${theme.textMuted} text-center`}
                  >
                    All students are already enrolled in this simulation
                  </p>
                );
              })()}
            </div>
            {enrollForm.studentIds.length > 0 && (
              <p className={`text-xs ${theme.textMuted} mt-2`}>
                {enrollForm.studentIds.length} student(s) selected
              </p>
            )}
          </div>
        </div>
        <div
          className={`px-5 py-4 border-t ${
            isDark ? "border-gray-700" : "border-gray-200"
          } flex gap-3`}
        >
          <button
            onClick={() => setShowEnrollModal(false)}
            className={`flex-1 px-4 py-2.5 ${theme.secondaryBg} rounded-lg font-medium`}
          >
            Cancel
          </button>
          <button
            onClick={handleEnrollStudents}
            disabled={
              !enrollForm.firmId ||
              enrollForm.studentIds.length === 0 ||
              actionLoading
            }
            className={`flex-1 px-4 py-2.5 ${theme.accentBg} text-white rounded-lg font-medium disabled:opacity-50`}
          >
            {actionLoading ? "Enrolling..." : "Enroll Students"}
          </button>
        </div>
      </div>
    </div>
  );
}