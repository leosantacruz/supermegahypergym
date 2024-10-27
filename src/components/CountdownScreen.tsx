import React, { useState, useEffect, useRef } from "react";
import { Play, Pause, X } from "lucide-react";
import { Exercise } from "../types";
import confetti from "canvas-confetti";

interface CountdownScreenProps {
  exercises: Exercise[];
  stopActivity: () => void;
}

const CountdownScreen: React.FC<CountdownScreenProps> = ({
  exercises,
  stopActivity,
}) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [timeLeft, setTimeLeft] = useState(exercises[0].duration);
  const [isPaused, setIsPaused] = useState(false);
  const [showCongrats, setShowCongrats] = useState(false);
  const intervalRef = useRef<number | null>(null);
  const animationRef = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (!isPaused && !showCongrats) {
      startTimeRef.current = Date.now();
      const animate = () => {
        const now = Date.now();
        const elapsed = (now - (startTimeRef.current || now)) / 1000;
        const newTimeLeft = Math.max(
          0,
          exercises[currentExerciseIndex].duration - elapsed
        );
        setTimeLeft(newTimeLeft);

        if (newTimeLeft > 0) {
          animationRef.current = requestAnimationFrame(animate);
        } else if (currentExerciseIndex < exercises.length - 1) {
          setCurrentExerciseIndex((prevIndex) => prevIndex + 1);
          startTimeRef.current = now;
        } else {
          setShowCongrats(true);
          confetti();
        }
      };
      animationRef.current = requestAnimationFrame(animate);
    }
    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [isPaused, currentExerciseIndex, exercises, showCongrats]);

  useEffect(() => {
    if (!isFirstRender.current && exercises[currentExerciseIndex]) {
      const utterance = new SpeechSynthesisUtterance(
        exercises[currentExerciseIndex].name
      );
      speechSynthesis.speak(utterance);
    } else {
      isFirstRender.current = false;
    }
  }, [currentExerciseIndex, exercises]);

  const togglePause = () => {
    setIsPaused(!isPaused);
    if (isPaused) {
      startTimeRef.current =
        Date.now() -
        (exercises[currentExerciseIndex].duration - timeLeft) * 1000;
    }
  };

  const progress = 1 - timeLeft / exercises[currentExerciseIndex].duration;

  return (
    <div className="w-full max-w-md p-6 text-white rounded-lg text-center">
      {showCongrats ? (
        <div>
          <h2 className="text-3xl font-bold mb-4">Lo lograste bro!</h2>
          <p className="mb-4">El triunfo ya es tuyo!</p>
          <button
            onClick={stopActivity}
            className="bg-[#fe1c34] text-white px-4 py-2 rounded hover:bg-[#fe1c34]/60"
          >
            Volver al sillón
          </button>
        </div>
      ) : (
        <>
          <h2 className="text-4xl font-semibold my-10">
            {exercises[currentExerciseIndex].name}
          </h2>
          {exercises[currentExerciseIndex + 1] && (
            <div className="border-2 p-3 rounded-xl border-white/30 bg-white/5">
              <div className="text-2xl">Próximo ejercicio:</div>
              <h2 className="text-4xl font-semibold my-4 mt-0 opacity-70">
                {exercises[currentExerciseIndex + 1]?.name}
              </h2>
            </div>
          )}
          <div className="relative w-64 h-64 mx-auto my-5">
            <svg className="w-full h-full" viewBox="0 0 100 100">
              <circle
                className="text-[#fe1c34]/20 stroke-current"
                strokeWidth="10"
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
              ></circle>
              <circle
                className="text-[#fe1c34] progress-ring stroke-current"
                strokeWidth="10"
                strokeLinecap="round"
                cx="50"
                cy="50"
                r="40"
                fill="transparent"
                strokeDasharray="251.2"
                strokeDashoffset={251.2 * (1 - progress)}
                transform="rotate(-90 50 50)"
              ></circle>
              <text
                x="50"
                y="50"
                fontFamily="Verdana"
                fontSize="12"
                textAnchor="middle"
                alignmentBaseline="middle"
                fill="white"
                className="font-bold text-xl"
              >
                {`${currentExerciseIndex + 1}/${exercises.length}`}
              </text>
            </svg>
          </div>
          <div className="text-4xl font-bold mb-6">{Math.ceil(timeLeft)}s</div>
          <div className="flex justify-center space-x-4">
            <button
              onClick={togglePause}
              className="bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600"
            >
              {isPaused ? <Play size={24} /> : <Pause size={24} />}
            </button>
            <button
              onClick={stopActivity}
              className="bg-[#fe1c34] text-white p-2 rounded-full hover:bg-red-600"
            >
              <X size={24} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CountdownScreen;
