import { motion } from "framer-motion";

export const Loading = () => {
  const appName = "Couverto";

  return (
    <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-background overflow-hidden">
      {/* Ambient Background Glow */}
      <motion.div
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.5, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
        className="absolute w-[500px] h-[500px] rounded-full blur-[100px] bg-primary/20 pointer-events-none"
      />

      <div className="relative z-10 flex flex-col items-center gap-8">
        {/* Animated Logo Container */}
        <div className="relative flex items-center justify-center w-24 h-24">
          {/* Pulsing Rings */}
          {[0, 1, 2].map((index) => (
            <motion.div
              key={index}
              className="absolute inset-0 rounded-2xl border-2 border-primary/30"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{
                opacity: [0, 1, 0],
                scale: [0.8, 1.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: index * 0.4,
                ease: "easeOut",
              }}
            />
          ))}

          {/* Core Logo */}
          <motion.div
            initial={{ scale: 0.5, opacity: 0, rotate: -10 }}
            animate={{ scale: 1, opacity: 1, rotate: 0 }}
            transition={{ duration: 0.5, ease: "backOut" }}
            className="relative flex items-center justify-center w-20 h-20 bg-gradient-to-br from-secondary to-secondary/80 rounded-2xl shadow-xl shadow-secondary/20"
          >
            <img src="/logos/logo.svg" alt="Logo" className="w-12 h-12" />
          </motion.div>
        </div>

        {/* Text Animation */}
        <div className="flex flex-col items-center gap-2">
          {appName ? (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
              <span className="text-4xl font-bold text-primary font-logo tracking-tight">Couverto</span>
            </motion.div>
          ) : (
            <div className="h-8 w-32 bg-muted/50 rounded animate-pulse" />
          )}

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.6 }}
            transition={{ delay: 0.6 }}
            className="text-sm font-medium text-muted-foreground flex items-center gap-1"
          >
            <span>Chargement</span>
            <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, repeatDelay: 0.1 }}>
              .
            </motion.span>
            <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.2, repeatDelay: 0.1 }}>
              .
            </motion.span>
            <motion.span animate={{ opacity: [0, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, delay: 0.4, repeatDelay: 0.1 }}>
              .
            </motion.span>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
