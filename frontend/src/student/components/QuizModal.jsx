import { useState } from "react";
import { X } from "lucide-react";

export default function QuizModal({ quiz, onClose }) {
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);

  const score = quiz.filter((q, i) => answers[i] === q.correct).length;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">

      <div className="
        bg-white 
        w-full max-w-md 
        rounded-2xl shadow-xl relative 
        max-h-[80vh] overflow-y-auto p-6
      ">

        {/* CLOSE BUTTON */}
        <button onClick={onClose} className="absolute right-3 top-3">
          <X className="w-5 h-5 text-gray-600 hover:text-gray-800" />
        </button>

        <h2 className="text-xl font-bold text-blue-700">Quick Quiz</h2>

        {/* QUIZ SECTION */}
        {!submitted ? (
          <div className="space-y-4 mt-4">
            {quiz.map((q, i) => (
              <div key={i} className="bg-gray-50 border p-4 rounded-xl">
                <p className="font-medium mb-2">{i + 1}. {q.question}</p>

                {q.options.map((op, idx) => (
                  <label
                    key={idx}
                    className="block text-sm mt-1 p-2 border rounded-lg cursor-pointer hover:bg-gray-100"
                  >
                    <input
                      type="radio"
                      name={`q-${i}`}
                      className="mr-2"
                      onChange={() =>
                        setAnswers({ ...answers, [i]: idx })
                      }
                    />
                    {op}
                  </label>
                ))}
              </div>
            ))}

            <button
              onClick={() => setSubmitted(true)}
              className="w-full bg-blue-600 text-white py-2 rounded-xl mt-2 hover:bg-blue-700"
            >
              Submit Quiz
            </button>
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-5xl font-bold text-green-600">{score}/{quiz.length}</p>
            <p className="text-gray-700 mt-2 text-lg">Your Score</p>
          </div>
        )}

      </div>
    </div>
  );
}

