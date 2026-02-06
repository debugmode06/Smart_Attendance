export default function StatCard({ title, value, icon: Icon, colorClass = "text-blue-600", unit = "" }) {
  return (
    <div className="bg-white p-5 rounded-xl shadow-lg border border-gray-100 flex items-center justify-between">
      <div>
        <p className="text-sm font-medium text-gray-500">{title}</p>
        <p className="text-3xl font-bold mt-1">
          {value}
          <span className="text-base font-normal ml-1">{unit}</span>
        </p>
      </div>
      <Icon className={`w-8 h-8 ${colorClass}`} />
    </div>
  );
}

