import { useState, useEffect } from "react";
import {
  DndContext,
  closestCenter,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Code2, CheckCircle2, XCircle } from "lucide-react";

function SortableCodeBlock({ id, text }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <pre
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`px-3 py-2 rounded-lg border text-xs font-mono mb-2 cursor-grab overflow-x-auto ${
        isDragging
          ? "bg-slate-900 text-green-300 border-slate-500 shadow-lg"
          : "bg-slate-950 text-green-200 border-slate-700"
      }`}
    >
      {text}
    </pre>
  );
}

export default function CodeBlocksStep({ step, onNext }) {
  const [blocks, setBlocks] = useState([]);
  const [status, setStatus] = useState(null);

  useEffect(() => {
    const baseBlocks = Array.isArray(step.blocks) ? step.blocks : [];
    setBlocks([...baseBlocks]);
    setStatus(null);
  }, [step]);

  if (!blocks.length) {
    return <p className="text-sm text-gray-500">No code blocks provided.</p>;
  }

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setBlocks((prev) => {
      const oldIndex = prev.indexOf(active.id);
      const newIndex = prev.indexOf(over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const checkOrder = () => {
    const originalBlocks = step.blocks || [];
    const correctOrder =
      Array.isArray(step.correctOrder) &&
      step.correctOrder.length === originalBlocks.length
        ? step.correctOrder
        : originalBlocks.map((_, idx) => idx);

    const expected = correctOrder.map((idx) => originalBlocks[idx]);

    const isCorrect =
      expected.length === blocks.length &&
      expected.every((val, idx) => val === blocks[idx]);

    if (isCorrect) {
      setStatus("correct");
      onNext();
    } else {
      setStatus("wrong");
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-slate-900 flex items-center justify-center">
          <Code2 className="w-4 h-4 text-green-300" />
        </div>
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wide">
            Build the code logic
          </p>
          <h4 className="text-sm font-bold text-gray-100">
            {step.title || "Arrange the code in correct order"}
          </h4>
          <p className="text-[11px] text-gray-400">
            Language: {step.language || "general"}
          </p>
        </div>
      </div>

      <p className="text-xs text-gray-400">
        Drag the code blocks to form a working flow. Focus on input → processing → output.
      </p>

      <div className="bg-slate-950 rounded-2xl p-3 border border-slate-700">
        <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={blocks} strategy={verticalListSortingStrategy}>
            {blocks.map((block) => (
              <SortableCodeBlock key={block} id={block} text={block} />
            ))}
          </SortableContext>
        </DndContext>
      </div>

      <button
        onClick={checkOrder}
        className="inline-flex items-center px-3 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-green-200 hover:bg-slate-700 border border-slate-600"
      >
        Check code flow →
      </button>

      {status === "correct" && (
        <div className="flex items-center gap-2 text-xs text-green-500 mt-1">
          <CheckCircle2 className="w-4 h-4" />
          <span>Nice! This code order makes sense.</span>
        </div>
      )}

      {status === "wrong" && (
        <div className="flex items-center gap-2 text-xs text-red-400 mt-1">
          <XCircle className="w-4 h-4" />
          <span>Something is off. Try to imagine how the program runs.</span>
        </div>
      )}

      {step.explanation && status === "correct" && (
        <p className="mt-2 text-xs text-gray-300 bg-slate-900 border border-slate-700 rounded-xl p-2">
          {step.explanation}
        </p>
      )}
    </div>
  );
}

