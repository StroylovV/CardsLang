"use client";

import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function Flashcard({ front, back }: any) {
  const [flipped, setFlipped] = useState(false);

  useEffect(() => {
    setFlipped(false);
  }, [front]);

  return (
    <motion.div
      key={front}
      initial={{ opacity: 0, scale: 0.8, rotate: -10 }}
      animate={{ opacity: 1, scale: 1, rotate: 0 }}
      exit={{ opacity: 0, scale: 0.8, rotate: 10 }}
      transition={{ duration: 0.3 }}
      onClick={() => setFlipped(!flipped)}
      className="cursor-pointer"
      style={{ perspective: "1000px" }}
    >
      <motion.div
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
        className="w-80 h-96 relative"
        style={{ transformStyle: "preserve-3d" }}
      >
        {/* Передняя сторона */}
        <div
          className="absolute w-full h-full bg-gradient-to-br from-white to-gray-100 rounded-2xl shadow-xl flex items-center justify-center text-2xl font-medium p-6 text-center"
          style={{
            backfaceVisibility: "hidden",
            border: "1px solid rgba(0,0,0,0.05)",
          }}
        >
          {front}
        </div>

        {/* Задняя сторона */}
        <div
          className="absolute w-full h-full bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-2xl shadow-xl flex items-center justify-center text-2xl font-medium p-6 text-center"
          style={{
            transform: "rotateY(180deg)",
            backfaceVisibility: "hidden",
          }}
        >
          {back}
        </div>
      </motion.div>
    </motion.div>
  );
}