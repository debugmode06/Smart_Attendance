export default function Behaviour() {
  const logs = [
    { name: "Aarav Sharma", issue: "Late to Class", action: "Warning" },
    { name: "Kavya Singh", issue: "Excellent Participation", action: "Appreciation" },
  ];

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-blue-700">Student Behaviour Log</h2>

      {/* Add Behaviour Entry */}
      <div className="bg-white p-6 rounded-xl shadow space-y-4">
        <h3 className="text-xl font-semibold">Add Behaviour Entry</h3>

        <input type="text" placeholder="Student Name" className="p-3 border rounded-lg w-full" />
        <input type="text" placeholder="Issue / Positive Note" className="p-3 border rounded-lg w-full" />
        <input type="text" placeholder="Action Taken" className="p-3 border rounded-lg w-full" />

        <button className="w-full bg-green-600 text-white p-3 rounded-lg">
          Save Entry
        </button>
      </div>

      {/* Behaviour List */}
      <div className="bg-white p-6 rounded-xl shadow">
        {logs.map((l, i) => (
          <div key={i} className="p-4 border rounded-lg mb-2">
            <p className="font-semibold">{l.name}</p>
            <p className="text-sm text-gray-700">Issue: {l.issue}</p>
            <p className="text-sm text-gray-700">Action: {l.action}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

