import React, { useState } from "react";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Plus, Trash2, GripVertical, Edit } from "lucide-react";
import { Exercise } from "../types";
import SortableItem from "./SortableItem";
interface AdminScreenProps {
  exercises: Exercise[];
  setExercises: React.Dispatch<React.SetStateAction<Exercise[]>>;
  startActivity: () => void;
}

const AdminScreen: React.FC<AdminScreenProps> = ({
  exercises,
  setExercises,
  startActivity,
}) => {
  const [newExercise, setNewExercise] = useState({ name: "", duration: "" });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showJSONModal, setShowJSONModal] = useState(false);
  const [jsonContent, setJsonContent] = useState(exercises);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const addExercise = () => {
    if (newExercise.name && newExercise.duration) {
      setExercises([
        ...exercises,
        {
          id: Date.now().toString(),
          ...newExercise,
          duration: parseInt(newExercise.duration),
        },
      ]);
      setNewExercise({ name: "", duration: "" });
    }
  };

  const removeExercise = (id: string) => {
    setExercises(exercises.filter((exercise) => exercise.id !== id));
  };

  const editExercise = (id: string) => {
    setEditingId(id);
    const exercise = exercises.find((ex) => ex.id === id);
    if (exercise) {
      setNewExercise({
        name: exercise.name,
        duration: exercise.duration.toString(),
      });
    }
  };

  const updateExercise = () => {
    if (editingId && newExercise.name && newExercise.duration) {
      setExercises(
        exercises.map((ex) =>
          ex.id === editingId
            ? {
                ...ex,
                name: newExercise.name,
                duration: parseInt(newExercise.duration),
              }
            : ex
        )
      );
      setEditingId(null);
      setNewExercise({ name: "", duration: "" });
    }
  };

  const handleDragEnd = (event: any) => {
    console.log("is dragging");
    const { active, over } = event;

    if (active.id !== over.id) {
      setExercises((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        return arrayMove(items, oldIndex, newIndex);
      });
    }
  };

  const handleImportJSON = () => {
    try {
      const importedExercises = JSON.parse(jsonContent);
      if (
        Array.isArray(importedExercises) &&
        importedExercises.every(
          (exercise) =>
            typeof exercise.name === "string" &&
            typeof exercise.duration === "number" &&
            (typeof exercise.description === "string" ||
              exercise.description === undefined)
        )
      ) {
        const exercisesWithId = importedExercises.map((exercise) => ({
          ...exercise,
          id:
            Date.now().toString() + Math.random().toString(36).substring(2, 9),
        }));
        setExercises(exercisesWithId);
        setShowJSONModal(false);
      } else {
        alert("El JSON no tiene el formato correcto.");
      }
    } catch (error) {
      alert("JSON inválido.");
    }
  };

  return (
    <div className="w-full max-w-4xl p-6  text-white relative">
      <div className="flex flex-col items-center justify-center">
        <img src="/logo.webp" className="max-w-[300px]" />
        <h1 className="text-3xl font-bold mb-6 text-center mt-3 text-[#fe1c34]">
          ¡Armá tu rutina, bro!
        </h1>
      </div>
      <div className="mb-6 flex flex-col lg:grid lg:grid-cols-[1fr,150px,auto] gap-3 w-full">
        <input
          type="text"
          placeholder="Nombre del ejercicio"
          className=" p-2 border rounded bg-black/20 text-white"
          value={newExercise.name}
          onChange={(e) =>
            setNewExercise({ ...newExercise, name: e.target.value })
          }
        />
        <input
          type="number"
          placeholder="Segundos"
          className=" p-2 border rounded bg-black/20 text-white"
          value={newExercise.duration}
          onChange={(e) =>
            setNewExercise({ ...newExercise, duration: e.target.value })
          }
        />
        <button
          onClick={editingId ? updateExercise : addExercise}
          className={`${
            editingId
              ? "bg-yellow-500 hover:bg-yellow-600"
              : "bg-[#fe1c34] hover:bg-red-600"
          } text-white p-2 rounded`}
        >
          {editingId ? <Edit size={24} /> : <Plus size={24} />}
        </button>
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={exercises}
          strategy={verticalListSortingStrategy}
        >
          <ul className="mb-6">
            {exercises.map((exercise) => (
              <SortableItem
                key={exercise.id}
                id={exercise.id}
                exercise={exercise}
                onEdit={() => editExercise(exercise.id)}
                onRemove={() => removeExercise(exercise.id)}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      <button
        onClick={startActivity}
        className="w-full bg-gradient-to-r from-[#fe1c34] to-red-700 text-white p-3 rounded text-lg font-semibold hover:from-red-600 hover:to-red-800"
      >
        ¡Dale que va!
      </button>
      <button
        onClick={() => {
          // Generar una copia de los ejercicios sin el campo 'id' y agregar 'description'
          const exercisesWithoutId = exercises.map(({ id, ...rest }) => ({
            ...rest,
            description: rest.description || "",
          }));
          setJsonContent(JSON.stringify(exercisesWithoutId, null, 2));
          setShowJSONModal(true);
        }}
        className="w-full bg-gradient-to-r from-gray-500 to-gray-700 text-white p-3 rounded text-lg font-semibold hover:from-gray-600 hover:to-gray-800 mt-4"
      >
        Importar/Exportar JSON
      </button>

      {showJSONModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-11/12 max-w-lg">
            <h2 className="text-xl font-bold mb-4 text-gray-900">
              Importar/Exportar Rutina
            </h2>
            <textarea
              className="w-full h-64 p-2 border rounded bg-gray-200 text-gray-900"
              value={jsonContent}
              onChange={(e) => setJsonContent(e.target.value)}
            ></textarea>
            <div className="mt-4 flex justify-end">
              <button
                onClick={() => setShowJSONModal(false)}
                className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded mr-2"
              >
                Cancelar
              </button>
              <button
                onClick={handleImportJSON}
                className="bg-[#fe1c34] hover:bg-red-600 text-white p-2 rounded"
              >
                Importar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminScreen;
