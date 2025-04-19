"use client"

import { motion } from "framer-motion"
import { Sparkles } from "lucide-react"

interface StartButtonProps {
  onClick: () => void
}

export default function StartButton({ onClick }: StartButtonProps) {
  const isGameExist = localStorage.getItem("damfarm-game-storage")

  return (
    <motion.button
      onClick={onClick}
      className='relative px-10 py-5 bg-gradient-to-r from-amber-500 to-amber-600 text-white rounded-full font-bold text-xl shadow-[0_0_15px_rgba(251,191,36,0.5)] hover:shadow-[0_0_25px_rgba(251,191,36,0.7)] transition-all overflow-hidden group'
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      <motion.span className='absolute inset-0 bg-gradient-to-r from-amber-400 to-amber-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300' />

      <motion.span
        className='flex items-center gap-3 relative z-10'
        whileHover={{ x: [0, 5, 0] }}
        transition={{ duration: 0.5 }}
      >
        <motion.div
          animate={{
            rotate: [0, 360],
          }}
          transition={{
            duration: 5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        >
          <Sparkles className='h-6 w-6' />
        </motion.div>
        {isGameExist ? "Продолжить игру" : "Начать игру"}
      </motion.span>

      {/* Pulsing effect */}
      <motion.div
        className='absolute inset-0 rounded-full bg-white opacity-20'
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0, 0.2, 0],
        }}
        transition={{
          duration: 2,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "loop",
        }}
      />

      {/* Sparkle particles */}
      {Array.from({ length: 8 }).map((_, i) => (
        <motion.div
          key={i}
          className='absolute h-1 w-1 bg-white rounded-full'
          initial={{
            x: "50%",
            y: "50%",
            opacity: 0,
          }}
          animate={{
            x: [0, (i % 2 === 0 ? -100 : 100) * Math.random()],
            y: [0, -100 * Math.random() - 50],
            opacity: [0, 1, 0],
          }}
          transition={{
            duration: 1 + Math.random() * 2,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            delay: Math.random() * 2,
          }}
        />
      ))}
    </motion.button>
  )
}
