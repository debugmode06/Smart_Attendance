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
import { ArrowUpDown, CheckCircle2, XCircle } from "lucide-react";

function SortableItem({ id, text }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={`px-3 py-2 rounded-lg border text-sm flex items-center justify-between mb-2 cursor-grab ${
        isDragging ? "bg-blue-100 border-blue-400 shadow-lg" : "bg-white"
      }`}
    >
      <span className="truncate">{text}</span>
      <span className="text-xs text-gray-400">
        <ArrowUpDown className="w-3 h-3" />
      </span>
    </div>
  );
}

export default function DragOrderStep({ step, onNext }) {
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState(null); // "correct" | "wrong"

  useEffect(() => {
    const baseItems = Array.isArray(step.items) ? step.items : [];
    setItems([...baseItems]);
    setStatus(null);
  }, [step]);

  if (!items.length) {
    return <p className="text-sm text-gray-500">No items to arrange.</p>;
  }

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setItems((prev) => {
      const oldIndex = prev.indexOf(active.id);
      const newIndex = prev.indexOf(over.id);
      return arrayMove(prev, oldIndex, newIndex);
    });
  };

  const checkOrder = () => {
    const originalItems = step.items || [];
    const correctOrder =
      Array.isArray(step.correctOrder) &&
      step.correctOrder.length === originalItems.length
        ? step.correctOrder
        : originalItems.map((_, idx) => idx);

    const expected = correctOrder.map((idx) => originalItems[idx]);

    const isCorrect =
      expected.length === items.length &&
      expected.every((val, idx) => val === items[idx]);

    if (isCorrect) {
      setStatus("correct");
      onNext();
    } else {
      setStatus("wrong");
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <p className="text-[11px] font-semibold text-blue-600 uppercase tracking-wide">
          Arrange in correct order
        </p>
        <h4 className="text-sm font-bold text-gray-900">
          {step.title || "Put the steps in logical sequence"}
        </h4>
        <p className="text-xs text-gray-500 mt-1">
          Drag each item to form the correct flow. This builds your process thinking.
        </p>
      </div>

      <DndContext collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          {items.map((item) => (
            <SortableItem key={item} id={item} text={item} />
          ))}
        </SortableContext>
      </DndContext>

      <button
        onClick={checkOrder}
        className="inline-flex items-center px-3 py-2 rounded-xl text-xs font-semibold bg-blue-600 text-white hover:bg-blue-700"
      >
        Check order →
      </button>

      {status === "correct" && (
        <div className="flex items-center gap-2 text-xs text-green-600 mt-1">
          <CheckCircle2 className="w-4 h-4" />
          <span>Perfect! This is the right sequence.</span>
        </div>
      )}

      {status === "wrong" && (
        <div className="flex items-center gap-2 text-xs text-red-500 mt-1">
          <XCircle className="w-4 h-4" />
          <span>Not yet. Think about what logically comes first and next.</span>
        </div>
      )}

      {step.explanation && status === "correct" && (
        <p className="mt-2 text-xs text-gray-600 bg-blue-50 border border-blue-100 rounded-xl p-2">
          {step.explanation}
        </p>
      )}
    </div>
  );
}

