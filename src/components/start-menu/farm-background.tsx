"use client"

import { motion } from "framer-motion"
import { Cloud, Sun, Bird } from "lucide-react"

export default function FarmBackground() {
  return (
    <>
      {/* Sky gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-500 to-sky-300 z-0" />

      {/* Sun */}
      <motion.div
        className="absolute top-10 right-20 z-0"
        animate={{
          y: [0, -10, 0],
          scale: [1, 1.05, 1],
        }}
        transition={{
          duration: 10,
          repeat: Number.POSITIVE_INFINITY,
          repeatType: "reverse",
        }}
      >
        <Sun className="h-24 w-24 text-yellow-300" />
        <motion.div
          className="absolute inset-0 text-yellow-200 opacity-70"
          animate={{
            scale: [1, 1.3, 1],
            opacity: [0.5, 0.8, 0.5],
          }}
          transition={{
            duration: 3,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "reverse",
          }}
        >
          <Sun className="h-24 w-24" />
        </motion.div>
      </motion.div>

      {/* Clouds */}
      {[...Array(5)].map((_, i) => (
        <motion.div
          key={`cloud-${i}`}
          className="absolute z-0"
          style={{
            top: `${10 + i * 8}%`,
            left: `${i * 20 - 10}%`,
          }}
          animate={{
            x: [0, 100, 0],
          }}
          transition={{
            duration: 120 - i * 10,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            ease: "linear",
          }}
        >
          <Cloud className={`h-${12 + i * 2} w-${12 + i * 2} text-white opacity-${70 - i * 10}`} />
        </motion.div>
      ))}

      {/* Birds */}
      {[...Array(3)].map((_, i) => (
        <motion.div
          key={`bird-${i}`}
          className="absolute z-0"
          style={{
            top: `${15 + i * 5}%`,
            left: "-5%",
          }}
          animate={{
            x: [0, window.innerWidth + 100],
            y: [0, Math.sin(i) * 50],
          }}
          transition={{
            duration: 30 + i * 10,
            repeat: Number.POSITIVE_INFINITY,
            repeatType: "loop",
            ease: "linear",
            delay: i * 5,
          }}
        >
          <Bird className="h-6 w-6 text-gray-800" />
        </motion.div>
      ))}

      {/* Farm field - soil rows */}
      <div className="absolute bottom-0 left-0 right-0 h-1/2 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-green-800 to-amber-800" />

        {/* Garden rows */}
        {[...Array(12)].map((_, i) => (
          <motion.div
            key={`row-${i}`}
            className="absolute left-0 right-0 h-8 bg-amber-900"
            style={{
              bottom: `${i * 40}px`,
              height: "20px",
              backgroundImage:
                "linear-gradient(90deg, rgba(120,53,15,1) 0%, rgba(180,83,9,1) 50%, rgba(120,53,15,1) 100%)",
            }}
            initial={{ opacity: 0.8 }}
          />
        ))}

        {/* Crops/plants */}
        {[...Array(40)].map((_, i) => {
          const left = Math.random() * 100
          const bottom = Math.random() * 40 + 5
          const size = Math.random() * 30 + 20
          const delay = Math.random() * 2

          return (
            <motion.div
              key={`plant-${i}`}
              className="absolute z-1"
              style={{
                left: `${left}%`,
                bottom: `${bottom}%`,
              }}
              initial={{ opacity: 0, y: 20, scale: 0 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{
                duration: 1,
                delay: delay,
              }}
            >
              <motion.div
                className="origin-bottom"
                animate={{
                  rotate: [0, Math.random() > 0.5 ? 5 : -5, 0],
                }}
                transition={{
                  duration: 2 + Math.random() * 2,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              >
                <div className="w-1 bg-green-800 rounded-full" style={{ height: `${size * 0.8}px` }} />
                <div
                  className={`absolute top-0 left-50 transform -translate-x-1/2 w-${Math.floor(size / 10)}
                  h-${Math.floor(size / 10)} rounded-full`}
                  style={{
                    width: `${size}px`,
                    height: `${size}px`,
                    backgroundColor: Math.random() > 0.3 ? "#FCD34D" : "#4ADE80",
                    borderRadius: "50%",
                  }}
                />
              </motion.div>
            </motion.div>
          )
        })}

        {/* Fence */}
        <div className="absolute left-0 right-0 bottom-[45%] h-12 flex items-end">
          {[...Array(30)].map((_, i) => (
            <div key={`fence-${i}`} className="flex flex-col items-center">
              <div className="w-2 h-16 bg-amber-700 rounded-t-sm" />
              <div className="w-4 h-3 bg-amber-800 rounded-t-sm -mt-1" />
            </div>
          ))}
          <div className="absolute left-0 right-0 bottom-6 h-2 bg-amber-700" />
          <div className="absolute left-0 right-0 bottom-10 h-2 bg-amber-700" />
        </div>

        {/* Barn in the distance */}
        <div className="absolute bottom-[50%] left-[15%] z-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            <div className="w-32 h-24 bg-red-700 relative">
              <div
                className="absolute top-0 left-0 right-0 h-16 bg-red-800 transform -translate-y-full"
                style={{
                  clipPath: "polygon(0 100%, 50% 0, 100% 100%)",
                }}
              />
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-8 h-10 bg-amber-200">
                <div
                  className="absolute top-0 left-0 right-0 h-full bg-amber-900"
                  style={{
                    clipPath: "polygon(0 0, 50% 0, 50% 100%, 0 100%)",
                    width: "50%",
                  }}
                />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Windmill in the distance */}
        <div className="absolute bottom-[55%] right-[20%] z-1">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.8 }}
          >
            <div className="w-8 h-40 bg-amber-200 relative">
              <motion.div
                className="absolute top-5 left-1/2 transform -translate-x-1/2 origin-center"
                animate={{ rotate: [0, 360] }}
                transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
              >
                <div className="relative w-40 h-40">
                  {[0, 90, 180, 270].map((deg) => (
                    <div
                      key={`blade-${deg}`}
                      className="absolute top-1/2 left-1/2 w-20 h-4 bg-amber-900"
                      style={{
                        transform: `translate(-50%, -50%) rotate(${deg}deg)`,
                        transformOrigin: "center",
                      }}
                    />
                  ))}
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Butterflies */}
      {[...Array(5)].map((_, i) => {
        const left = Math.random() * 100
        const top = Math.random() * 60 + 20
        const size = Math.random() * 5 + 5

        return (
          <motion.div
            key={`butterfly-${i}`}
            className="absolute z-1"
            style={{
              left: `${left}%`,
              top: `${top}%`,
            }}
            animate={{
              x: [0, Math.random() * 100 - 50],
              y: [0, Math.random() * 100 - 50],
            }}
            transition={{
              duration: 10 + Math.random() * 10,
              repeat: Number.POSITIVE_INFINITY,
              repeatType: "reverse",
              ease: "easeInOut",
            }}
          >
            <motion.div
              animate={{
                rotate: [-10, 10, -10],
              }}
              transition={{
                duration: 2,
                repeat: Number.POSITIVE_INFINITY,
                repeatType: "reverse",
              }}
            >
              <div className="relative">
                <motion.div
                  animate={{ rotateY: [0, 80, 0] }}
                  transition={{
                    duration: 0.3,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                  className="absolute top-0 left-0"
                  style={{ width: `${size}px`, height: `${size}px` }}
                >
                  <div
                    className="w-full h-full rounded-full"
                    style={{
                      background: Math.random() > 0.5 ? "#FB923C" : "#C084FC",
                      clipPath: "polygon(0 50%, 100% 0, 100% 100%)",
                    }}
                  />
                </motion.div>
                <motion.div
                  animate={{ rotateY: [0, -80, 0] }}
                  transition={{
                    duration: 0.3,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                  }}
                  className="absolute top-0 right-0"
                  style={{ width: `${size}px`, height: `${size}px` }}
                >
                  <div
                    className="w-full h-full rounded-full"
                    style={{
                      background: Math.random() > 0.5 ? "#FB923C" : "#C084FC",
                      clipPath: "polygon(100% 50%, 0 0, 0 100%)",
                    }}
                  />
                </motion.div>
                <div
                  className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-yellow-900 rounded-full"
                  style={{ width: `${size / 4}px`, height: `${size}px` }}
                />
              </div>
            </motion.div>
          </motion.div>
        )
      })}
    </>
  )
}
