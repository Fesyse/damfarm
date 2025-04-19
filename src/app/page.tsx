"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import StartButton from "@/components/start-menu/start-button";
import Cutscene from "@/components/start-menu/cutscene";
import FarmBackground from "@/components/start-menu/farm-background";
import { useRouter } from "next/navigation";

export default function Home() {
  const [showCutscene, setShowCutscene] = useState(false);
  const router = useRouter();

  const handleStart = () => {
    setShowCutscene(true);
  };

  return (
    <main className="flex min-h-screen flex-col items-center justify-center relative overflow-hidden">
      <FarmBackground />

      <AnimatePresence mode="wait">
        {!showCutscene ? (
          <motion.div
            key="start-screen"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.8 } }}
            className="flex flex-col items-center justify-center gap-8 z-10"
          >
            <motion.div
              className="relative"
              initial={{ y: -50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2, duration: 0.8, type: "spring" }}
            >
              <motion.h1
                className="text-4xl md:text-7xl font-bold text-white text-center drop-shadow-lg"
                animate={{
                  textShadow: [
                    "0 0 5px rgba(255,255,255,0.5)",
                    "0 0 20px rgba(255,255,255,0.8)",
                    "0 0 5px rgba(255,255,255,0.5)",
                  ],
                }}
                transition={{
                  duration: 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              >
                Sunflower Valley
              </motion.h1>
              <motion.div
                className="absolute -z-10 inset-0 bg-amber-500 rounded-full blur-3xl opacity-20"
                animate={{
                  scale: [1, 1.2, 1],
                  opacity: [0.1, 0.3, 0.1],
                }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              />
            </motion.div>

            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.5, duration: 0.8, type: "spring" }}
            >
              <StartButton onClick={handleStart} />
            </motion.div>
          </motion.div>
        ) : (
          <motion.div
            key="cutscene"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="z-10 w-full max-w-5xl px-4"
          >
            <Cutscene onComplete={() => router.push("/app")} />
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
