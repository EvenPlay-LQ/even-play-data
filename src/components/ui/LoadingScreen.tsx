import { motion } from "framer-motion";
import logo from "@/assets/logo.jpg"; // Assuming logo exists based on LandingPage.tsx

export const LoadingScreen = () => {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-background">
      <motion.div
        initial={{ opacity: 0.5, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          repeatType: "reverse",
          ease: "easeInOut",
        }}
        className="flex flex-col items-center gap-4"
      >
        <div className="relative h-24 w-24">
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl"></div>
          <img src={logo} alt="Even Playground Logo" className="relative h-full w-full rounded-2xl object-cover shadow-2xl" />
        </div>
        <div className="text-xl font-display font-semibold text-foreground/80 tracking-widest uppercase">
          Loading
        </div>
      </motion.div>
    </div>
  );
};

export default LoadingScreen;
