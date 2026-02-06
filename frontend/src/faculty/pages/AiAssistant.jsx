import { useState } from "react";

export default function AiAssistantFaculty() {
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hello! How may I assist you, Teacher?" }
  ]);
  const [input, setInput] = useState("");

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    setMessages([...messages, { sender: "teacher", text: input }]);
    setInput("");

    setTimeout(() => {
      setMessages((prev) => [
        ...prev,
        { sender: "ai", text: "Sure! I will help you with that." },
      ]);
    }, 800);
  };

  return (
    <div className="space-y-6">
      <h2 className="text-3xl font-bold text-blue-700">AI Teaching Assistant</h2>

      <div className="bg-white rounded-xl shadow p-6 h-[500px] flex flex-col">
        <div className="flex-1 overflow-y-auto space-y-3">
          {messages.map((m, i) => (
            <div
              key={i}
              className={`p-3 rounded-lg max-w-xs ${
                m.sender === "teacher"
                  ? "ml-auto bg-blue-600 text-white"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              {m.text}
            </div>
          ))}
        </div>

        <form onSubmit={sendMessage} className="flex mt-4 space-x-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full p-3 border rounded-lg"
            placeholder="Ask AI assistant..."
          />
          <button className="bg-blue-600 text-white px-4 rounded-lg hover:bg-blue-700">
            Send
          </button>
        </form>
      </div>
    </div>
  );
}

