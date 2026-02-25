import React, { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, Easing } from 'framer-motion';

interface AmazingLoaderProps {
  onComplete: () => void;
}

const AmazingLoader: React.FC<AmazingLoaderProps> = ({ onComplete }) => {
  const [phase, setPhase] = useState(0);
  const [progress, setProgress] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Enhanced progress tracking
  const progressValue = useMotionValue(0);
  const progressOpacity = useTransform(progressValue, [0, 50, 100], [0.5, 1, 0.8]);

  useEffect(() => {
    progressValue.set(progress);
  }, [progress, progressValue]);

  useEffect(() => {
    const phases = [
      () => setTimeout(() => setPhase(1), 800),
      () => setTimeout(() => setPhase(2), 1800),
      () => setTimeout(() => setPhase(3), 2800),
      () => setTimeout(() => setPhase(4), 3800),
      () => setTimeout(() => setPhase(5), 4800),
      () => setTimeout(onComplete, 5800),
    ];

    if (phase < phases.length) {
      phases[phase]?.();
    }
  }, [phase, onComplete]);

  // Debounced progress update for smoother performance
  const updateProgress = useCallback(() => {
    setProgress(prev => Math.min(prev + Math.random() * 8 + 2, 100));
  }, []);

  useEffect(() => {
    const interval = setInterval(updateProgress, 150);
    return () => clearInterval(interval);
  }, [updateProgress]);

  // Memoized animation variants for performance
  const containerVariants = useMemo(() => ({
    initial: { opacity: 0, scale: 0.9 },
    animate: {
      opacity: 1,
      scale: 1,
      transition: { duration: 0.8, ease: "easeOut" as Easing }
    },
    exit: {
      opacity: 0,
      scale: 1.1,
      transition: { duration: 0.5 }
    }
  }), []);

  const particleVariants = useMemo(() => ({
    initial: { opacity: 0, scale: 0 },
    animate: {
      opacity: [0, 1, 0],
      scale: [0, 1.5, 0],
      x: [0, Math.random() * 200 - 100, Math.random() * 200 - 100],
      y: [0, Math.random() * 200 - 100, Math.random() * 200 - 100],
      transition: {
        duration: 4,
        repeat: Infinity,
        delay: Math.random() * 2
      }
    }
  }), []);

  return (
    <AnimatePresence>
      <motion.div
        ref={containerRef}
        variants={containerVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        className="fixed inset-0 z-[9999] overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
      >
        {/* Enhanced Animated Background */}
        <div className="absolute inset-0">
          {/* Morphing gradient orbs with more sophistication */}
          {[...Array(6)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full blur-3xl"
              style={{
                background: `radial-gradient(circle, ${[
                  '#f7d77a', '#d4af37', '#b8860b', '#8b4513', '#654321', '#daa520'
                ][i % 6]}50, transparent)`,
                width: `${250 + i * 150}px`,
                height: `${250 + i * 150}px`,
                left: `${15 + i * 12}%`,
                top: `${8 + i * 10}%`,
              }}
              animate={{
                x: [0, 120, -80, 0],
                y: [0, -100, 80, 0],
                scale: [1, 1.3, 0.7, 1],
                opacity: [0.4, 0.7, 0.2, 0.4],
                rotate: [0, 180, 360],
              }}
              transition={{
                duration: 12 + i * 3,
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
              }}
            />
          ))}

          {/* Rotating conic gradient with animation */}
          <motion.div
            className="absolute inset-0"
            animate={{ rotate: 360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            style={{
              background: `conic-gradient(from 0deg, transparent, rgba(212, 175, 55, 0.15), rgba(247, 215, 122, 0.1), transparent)`,
            }}
          />

          {/* Enhanced particle field */}
          {[...Array(60)].map((_, i) => (
            <motion.div
              key={i}
              variants={particleVariants}
              initial="initial"
              animate="animate"
              className="absolute w-1.5 h-1.5 bg-gradient-to-r from-yellow-300 to-yellow-600 rounded-full shadow-lg"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
            />
          ))}

          {/* Floating geometric shapes */}
          {[...Array(8)].map((_, i) => (
            <motion.div
              key={`shape-${i}`}
              className="absolute border-2 border-yellow-400/30"
              style={{
                width: `${20 + i * 10}px`,
                height: `${20 + i * 10}px`,
                left: `${10 + i * 10}%`,
                top: `${20 + i * 8}%`,
                clipPath: i % 2 === 0 ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'polygon(50% 100%, 0% 0%, 100% 0%)',
              }}
              animate={{
                rotate: [0, 360],
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 8 + i,
                repeat: Infinity,
                delay: i * 0.5,
              }}
            />
          ))}
        </div>

        {/* Main Content */}
        <div className="relative z-10 flex flex-col items-center justify-center min-h-screen space-y-16 px-4">

          {/* Phase 1: Enhanced Logo Introduction */}
          <AnimatePresence>
            {phase >= 0 && (
              <motion.div
                initial={{ scale: 0, rotate: -180, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, opacity: 1 }}
                exit={{ scale: 0, rotate: 180, opacity: 0 }}
                transition={{ duration: 1.2, ease: "easeInOut" }}
                className="relative"
              >
                <motion.div
                  className="relative flex items-center justify-center w-56 h-40 bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-2xl shadow-2xl border border-yellow-300/50"
                  animate={{
                    boxShadow: [
                      "0 0 20px rgba(247, 215, 122, 0.5)",
                      "0 0 40px rgba(212, 175, 55, 0.8)",
                      "0 0 20px rgba(247, 215, 122, 0.5)",
                    ],
                  }}
                  transition={{ duration: 3, repeat: Infinity }}
                >
                  <span className="text-white font-black text-2xl tracking-wider drop-shadow-lg">
                    CHRISTIANO
                  </span>
                </motion.div>

                {/* Enhanced pulsing rings */}
                {phase >= 1 && [...Array(4)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute inset-0 border-2 border-yellow-400 rounded-2xl"
                    initial={{ scale: 1, opacity: 1 }}
                    animate={{ scale: 1.8 + i * 0.3, opacity: 0 }}
                    transition={{
                      duration: 3,
                      delay: i * 0.4,
                      repeat: Infinity,
                      repeatDelay: 1.5,
                    }}
                  />
                ))}

                {/* Floating sparkles */}
                {phase >= 1 && [...Array(12)].map((_, i) => (
                  <motion.div
                    key={`sparkle-${i}`}
                    className="absolute w-2 h-2 bg-yellow-300 rounded-full"
                    initial={{
                      x: Math.random() * 200 - 100,
                      y: Math.random() * 200 - 100,
                      opacity: 0,
                      scale: 0,
                    }}
                    animate={{
                      opacity: [0, 1, 0],
                      scale: [0, 1, 0],
                      x: Math.random() * 200 - 100,
                      y: Math.random() * 200 - 100,
                    }}
                    transition={{
                      duration: 2,
                      delay: Math.random() * 2,
                      repeat: Infinity,
                      repeatDelay: Math.random() * 3,
                    }}
                  />
                ))}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phase 2: Enhanced Loading Text */}
          <AnimatePresence>
            {phase >= 2 && (
              <motion.div
                initial={{ y: 60, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -60, opacity: 0 }}
                className="text-center space-y-6"
              >
                <motion.h1
                  className="text-5xl md:text-7xl font-black text-white tracking-wider"
                  animate={{
                    textShadow: [
                      "0 0 20px #f7d77a",
                      "0 0 40px #d4af37",
                      "0 0 60px #b8860b",
                      "0 0 20px #f7d77a",
                    ],
                  }}
                  transition={{ duration: 4, repeat: Infinity }}
                >
                  CHRISTIANO
                </motion.h1>
                <motion.p
                  className="text-xl md:text-2xl text-gray-200 font-light"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.8 }}
                >
                  Luxury Property Management Excellence
                </motion.p>
                <motion.div
                  className="text-sm text-yellow-300 font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1.2 }}
                >
                  Curating Extraordinary Experiences
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phase 3: Advanced Progress Indicators */}
          <AnimatePresence>
            {phase >= 3 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                className="space-y-8 w-full max-w-lg"
              >
                {/* Enhanced Circular Progress */}
                <div className="relative w-40 h-40 mx-auto">
                  <svg className="w-full h-full transform -rotate-90 drop-shadow-xl">
                    <circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="rgba(255,255,255,0.1)"
                      strokeWidth="12"
                    />
                    <motion.circle
                      cx="80"
                      cy="80"
                      r="70"
                      fill="none"
                      stroke="url(#progressGradient)"
                      strokeWidth="12"
                      strokeLinecap="round"
                      strokeDasharray={`${2 * Math.PI * 70}`}
                      strokeDashoffset={2 * Math.PI * 70 * (1 - progress / 100)}
                      initial={{ strokeDashoffset: 2 * Math.PI * 70 }}
                      animate={{ strokeDashoffset: 2 * Math.PI * 70 * (1 - progress / 100) }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                    />
                  </svg>
                  <defs>
                    <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#f7d77a" />
                      <stop offset="50%" stopColor="#d4af37" />
                      <stop offset="100%" stopColor="#b8860b" />
                    </linearGradient>
                  </defs>
                  <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    style={{ opacity: progressOpacity }}
                  >
                    <span className="text-3xl font-black text-white drop-shadow-lg">
                      {Math.round(progress)}%
                    </span>
                  </motion.div>
                </div>

                {/* Enhanced Linear Progress Bar */}
                <div className="space-y-4">
                  <motion.div
                    className="h-3 bg-gray-800 rounded-full overflow-hidden shadow-inner"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                  >
                    <motion.div
                      className="h-full bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600 rounded-full shadow-lg"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.8, ease: "easeInOut" }}
                      style={{
                        boxShadow: "0 0 20px rgba(212, 175, 55, 0.8)",
                      }}
                    />
                  </motion.div>
                  <motion.div
                    className="flex justify-between text-sm text-gray-300"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                  >
                    <span>Loading Assets</span>
                    <span>Initializing Services</span>
                    <span>Preparing Experience</span>
                  </motion.div>
                </div>

                <motion.p
                  className="text-center text-white font-medium text-lg"
                  initial={{ opacity: 0 }}
                  animate={{
                    opacity: 1,
                    textShadow: [
                      "0 0 10px rgba(255,255,255,0.5)",
                      "0 0 20px rgba(255,255,255,0.8)",
                      "0 0 10px rgba(255,255,255,0.5)",
                    ],
                  }}
                  transition={{
                    opacity: { delay: 1.5 },
                    textShadow: { duration: 2, repeat: Infinity }
                  }}
                >
                  Crafting Luxury Experiences...
                </motion.p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phase 4: Welcome Animation */}
          <AnimatePresence>
            {phase >= 4 && (
              <motion.div
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                className="text-center space-y-4"
              >
                <motion.div
                  className="text-7xl md:text-9xl font-black text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-yellow-500 to-yellow-600"
                  animate={{
                    backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"],
                  }}
                  transition={{
                    duration: 4,
                    repeat: Infinity,
                  }}
                  style={{
                    backgroundSize: "200% 200%",
                  }}
                >
                  WELCOME
                </motion.div>
                <motion.p
                  className="text-xl md:text-2xl text-gray-300 font-light"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  Your extraordinary journey begins now
                </motion.p>
                <motion.div
                  className="text-sm text-yellow-400 font-medium"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 1 }}
                >
                  ✨ Premium Service • Unparalleled Quality • Timeless Elegance ✨
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Phase 5: Final Celebration */}
          <AnimatePresence>
            {phase >= 5 && (
              <motion.div
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm"
              >
                <motion.div
                  animate={{
                    rotate: [0, 360],
                    scale: [1, 1.2, 1],
                    opacity: [0.8, 1, 0.8],
                  }}
                  transition={{
                    duration: 3,
                    repeat: Infinity,
                  }}
                  className="text-9xl"
                >
                  ✨
                </motion.div>
                <motion.div
                  className="absolute text-center text-white"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                >
                  <div className="text-2xl font-bold mb-2">Experience Loaded</div>
                  <div className="text-lg">Welcome to Luxury</div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export { AmazingLoader };
