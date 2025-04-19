"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sun, ArrowRight, Leaf, Home, Sprout } from "lucide-react";
import TypewriterText from "./typewriter-text";
import FloatingElements from "./floating-elements";

interface CutsceneProps {
  onComplete: () => void;
}

export default function Cutscene({ onComplete }: CutsceneProps) {
  const [currentPage, setCurrentPage] = useState(0);
  const [showContinue, setShowContinue] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const storyPages = [
    {
      text: "После долгих лет работы в шумном городе, вы решили оставить всё позади и начать новую жизнь в тихой деревне 'Солнечная Долина'.",
      background: "from-blue-600 via-blue-500 to-sky-400",
      icon: <Sun className="h-20 w-20 text-yellow-300" />,
      elements: ["cloud", "bird", "sun"],
    },
    {
      text: "Вы унаследовали старую ферму от вашего дедушки. Годы запустения превратили её в заброшенное место, но вы видите в ней огромный потенциал.",
      background: "from-amber-800 via-amber-700 to-amber-500",
      icon: <Home className="h-20 w-20 text-amber-200" />,
      elements: ["leaf", "dust", "butterfly"],
    },
    {
      text: "С небольшой суммой денег и огромным энтузиазмом, вы готовы превратить эту заброшенную землю в процветающую ферму своей мечты.",
      background: "from-green-800 via-green-700 to-green-500",
      icon: <Sprout className="h-20 w-20 text-green-200" />,
      elements: ["sprout", "butterfly", "leaf"],
    },
    {
      text: "Выращивайте урожай, разводите животных, знакомьтесь с местными жителями и раскройте все секреты Солнечной Долины. Ваше приключение начинается сейчас!",
      background: "from-purple-800 via-purple-700 to-purple-500",
      icon: <Leaf className="h-20 w-20 text-purple-200" />,
      elements: ["star", "leaf", "butterfly"],
    },
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setShowContinue(true);
    }, 5000); // Show continue button after text animation completes

    return () => clearTimeout(timer);
  }, [currentPage]);

  const handleNext = () => {
    if (isTransitioning) return;

    setIsTransitioning(true);
    setShowContinue(false);

    setTimeout(() => {
      if (currentPage < storyPages.length - 1) {
        setCurrentPage(currentPage + 1);
      } else {
        onComplete();
      }
      setIsTransitioning(false);
    }, 800);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.8 }}
      className="w-full min-h-[70vh] rounded-2xl overflow-hidden  relative"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={`page-${currentPage}`}
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -100 }}
          transition={{ duration: 0.8 }}
          className={`w-full h-full bg-gradient-to-br ${storyPages[currentPage].background} p-8 md:p-12 flex flex-col items-center justify-center relative overflow-hidden`}
        >
          {/* Farm-themed background elements */}
          <div className="absolute inset-0 z-0 opacity-20">
            <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-amber-900">
              {/* Garden rows */}
              {[...Array(6)].map((_, i) => (
                <div
                  key={`soil-row-${i}`}
                  className="absolute left-0 right-0 h-2 bg-amber-800"
                  style={{ bottom: `${i * 12 + 5}px` }}
                />
              ))}
            </div>

            {/* Fence silhouette */}
            <div className="absolute bottom-1/3 left-0 right-0 h-8 flex justify-between">
              {[...Array(20)].map((_, i) => (
                <div key={`fence-post-${i}`} className="w-1 h-8 bg-amber-950" />
              ))}
              <div className="absolute left-0 right-0 bottom-3 h-1 bg-amber-950" />
              <div className="absolute left-0 right-0 bottom-6 h-1 bg-amber-950" />
            </div>
          </div>

          {/* Background light effect */}
          <motion.div
            className="absolute top-0 left-0 w-full h-full opacity-30 z-0"
            style={{
              background:
                "radial-gradient(circle at 50% 50%, rgba(255,255,255,0.8) 0%, transparent 70%)",
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.2, 0.4, 0.2],
            }}
            transition={{
              duration: 8,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
            }}
          />

          <FloatingElements elements={storyPages[currentPage].elements} />

          <motion.div
            initial={{ y: -30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 1, delay: 0.3 }}
            className="mb-10 relative z-10"
          >
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
                y: [0, -5, 5, 0],
              }}
              transition={{
                duration: 6,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            >
              {storyPages[currentPage].icon}
            </motion.div>

            {/* Icon glow effect */}
            <motion.div
              className="absolute inset-0 rounded-full blur-xl opacity-70"
              style={{
                background: "rgba(255,255,255,0.5)",
              }}
              animate={{
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.7, 0.3],
              }}
              transition={{
                duration: 3,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            />
          </motion.div>

          <motion.div
            className="text-white text-xl md:text-2xl text-center font-medium leading-relaxed mb-16 w-full max-w-4xl mx-auto relative z-10"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <TypewriterText text={storyPages[currentPage].text} />
          </motion.div>

          <AnimatePresence>
            {showContinue && (
              <motion.button
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                onClick={handleNext}
                className="absolute bottom-8 right-8  bg-opacity-20 hover:bg-opacity-30 text-white px-6 py-3 rounded-full flex items-center gap-2 transition-all backdrop-blur-sm shadow-lg z-20"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <span className="font-medium">
                  {currentPage < storyPages.length - 1
                    ? "Продолжить"
                    : "Начать игру"}
                </span>
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{
                    duration: 1.5,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "loop",
                  }}
                >
                  <ArrowRight className="h-5 w-5" />
                </motion.div>
              </motion.button>
            )}
          </AnimatePresence>

          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 flex gap-3 z-20">
            {storyPages.map((_, index) => (
              <motion.div
                key={index}
                className={`h-2.5 w-2.5 rounded-full ${
                  index === currentPage ? "bg-white" : "bg-white bg-opacity-30"
                }`}
                animate={
                  index === currentPage
                    ? {
                        scale: [1, 1.3, 1],
                      }
                    : {}
                }
                transition={{
                  duration: 1.5,
                  repeat: index === currentPage ? Number.POSITIVE_INFINITY : 0,
                  repeatType: "reverse",
                }}
              />
            ))}
          </div>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  );
}
