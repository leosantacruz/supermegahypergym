import React, { useState, useEffect } from "react";
import AdminScreen from "./components/AdminScreen";
import CountdownScreen from "./components/CountdownScreen";
import { Exercise } from "./types";
import { exercisesTemplate } from "./exercisesTemplate";

function App() {
  const [exercises, setExercises] = useState<Exercise[]>(() => {
    const savedExercises = localStorage.getItem("exercises");
    return savedExercises ? JSON.parse(savedExercises) : exercisesTemplate;
  });
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem("exercises", JSON.stringify(exercises));
    } catch (err) {
      console.error("Error saving to localStorage:", err);
      setError("Error al guardar los ejercicios. Probá de nuevo, campeón.");
    }
  }, [exercises]);

  const startActivity = () => {
    if (exercises.length > 0) {
      setIsActive(true);
    } else {
      setError(
        "¡Eh, pará un poco! Agregá al menos un ejercicio antes de empezar."
      );
    }
  };

  const stopActivity = () => {
    setIsActive(false);
  };

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-[#fe1c34]">
        {error}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#00142c] flex items-center justify-center">
      {!isActive ? (
        <AdminScreen
          exercises={exercises}
          setExercises={setExercises}
          startActivity={startActivity}
        />
      ) : (
        <CountdownScreen exercises={exercises} stopActivity={stopActivity} />
      )}
    </div>
  );
}

export default App;
