import React from "react";
import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { GripVertical, Edit, Trash2 } from "lucide-react";
import { Exercise } from "../types";

interface SortableItemProps {
  id: string;
  exercise: Exercise;
  onEdit: () => void;
  onRemove: () => void;
}

const SortableItem: React.FC<SortableItemProps> = ({
  id,
  exercise,
  onEdit,
  onRemove,
}) => {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id: id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <li
      ref={setNodeRef}
      style={style}
      {...attributes}
      className="grid grid-cols-[1fr,auto] gap-5 w-full bg-gray-700 p-3 mb-2 rounded"
    >
      <div className="flex items-center">
        <span {...listeners}>
          <GripVertical size={20} className="mr-2 text-gray-400 cursor-move" />
        </span>
        <span>
          {exercise.name} - {exercise.duration}s
        </span>
      </div>
      <div>
        <button
          onClick={onEdit}
          className="text-yellow-500  hover:text-yellow-700 mr-2"
        >
          <Edit size={24} />
        </button>
        <button
          onClick={onRemove}
          className="text-[#fe1c34] hover:text-red-700"
        >
          <Trash2 size={24} />
        </button>
      </div>
    </li>
  );
};

export default SortableItem;
