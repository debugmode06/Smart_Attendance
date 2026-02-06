export default function UserSelector({ type, selected, onClick }) {
  return (
    <div
      onClick={() => onClick(type)}
      className={`flex-1 p-3 text-center cursor-pointer transition-all duration-200 rounded-lg shadow-sm font-semibold
        ${
          selected === type
            ? "bg-blue-600 text-white ring-2 ring-blue-800"
            : "bg-gray-100 text-gray-700 hover:bg-gray-200"
        }`}
    >
      {type}
    </div>
  );
}

