"use client"

import { motion } from "framer-motion"
import { Cloud, Sun, Bird, Leaf, Flower, Star, Sprout } from "lucide-react"

interface FloatingElementsProps {
  elements: string[]
}

export default function FloatingElements({ elements }: FloatingElementsProps) {
  const getElementComponent = (type: string, index: number) => {
    const size = Math.random() * 20 + 15
    const opacity = Math.random() * 0.3 + 0.1
    const xPos = Math.random() * 100
    const yPos = Math.random() * 100
    const duration = Math.random() * 20 + 10
    const delay = Math.random() * 5

    const commonProps = {
      className: `absolute text-white opacity-${opacity * 100}`,
      style: {
        left: `${xPos}%`,
        top: `${yPos}%`,
        width: `${size}px`,
        height: `${size}px`,
      },
      animate: {
        x: [0, Math.random() * 30 - 15],
        y: [0, Math.random() * 30 - 15],
        rotate: [0, Math.random() * 40 - 20],
      },
      transition: {
        duration,
        repeat: Number.POSITIVE_INFINITY,
        repeatType: "reverse" as const,
        delay,
      },
    }

    switch (type) {
      case "cloud":
        return (
          <motion.div key={`${type}-${index}`} {...commonProps}>
            <Cloud />
          </motion.div>
        )
      case "sun":
        return (
          <motion.div
            key={`${type}-${index}`}
            {...commonProps}
            animate={{
              ...commonProps.animate,
              scale: [1, 1.2, 1],
              opacity: [opacity, opacity * 2, opacity],
            }}
          >
            <Sun className="text-yellow-300" />
          </motion.div>
        )
      case "bird":
        return (
          <motion.div
            key={`${type}-${index}`}
            {...commonProps}
            animate={{
              x: [0, 100],
              y: [0, Math.random() * 20 - 10],
            }}
            transition={{
              duration: duration * 0.5,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
              delay,
            }}
          >
            <Bird />
          </motion.div>
        )
      case "leaf":
        return (
          <motion.div
            key={`${type}-${index}`}
            {...commonProps}
            animate={{
              x: [0, Math.random() * 50 - 25],
              y: [0, Math.random() * 50 + 20],
              rotate: [0, Math.random() * 360],
            }}
            transition={{
              duration: duration * 0.7,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
              delay,
            }}
          >
            <Leaf className="text-green-200" />
          </motion.div>
        )
      case "butterfly":
        return (
          <motion.div
            key={`${type}-${index}`}
            {...commonProps}
            animate={{
              x: [0, Math.random() * 80 - 40],
              y: [0, Math.random() * 80 - 40],
              rotate: [0, Math.random() * 40 - 20],
            }}
            transition={{
              duration: duration * 0.6,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "mirror",
              delay,
            }}
          >
            <div className="relative">
              <motion.div
                animate={{ rotate: [0, 30, 0, -30, 0] }}
                transition={{ duration: 0.8, repeat: Number.POSITIVE_INFINITY }}
                className="absolute left-0 top-0 w-full h-full text-purple-200"
              >
                <Flower />
              </motion.div>
            </div>
          </motion.div>
        )
      case "star":
        return (
          <motion.div
            key={`${type}-${index}`}
            {...commonProps}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [opacity, opacity * 3, opacity],
            }}
            transition={{
              duration: duration * 0.4,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              delay,
            }}
          >
            <Star className="text-yellow-200" />
          </motion.div>
        )
      case "dust":
        return (
          <motion.div
            key={`${type}-${index}`}
            className="absolute bg-white rounded-full"
            style={{
              left: `${xPos}%`,
              top: `${yPos}%`,
              width: `${size / 5}px`,
              height: `${size / 5}px`,
              opacity: opacity * 2,
            }}
            animate={{
              y: [0, 50],
              opacity: [opacity * 2, 0],
            }}
            transition={{
              duration: duration * 0.3,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
              delay,
            }}
          />
        )
      case "sprout":
        return (
          <motion.div
            key={`${type}-${index}`}
            {...commonProps}
            animate={{
              scale: [0, 1],
              y: [20, 0],
              opacity: [0, opacity * 2],
            }}
            transition={{
              duration: duration * 0.4,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "loop",
              delay,
            }}
          >
            <Sprout className="text-green-200" />
          </motion.div>
        )
      default:
        return null
    }
  }

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-10">
      {elements.flatMap((element, i) => Array.from({ length: 5 }, (_, j) => getElementComponent(element, i * 5 + j)))}
    </div>
  )
}
